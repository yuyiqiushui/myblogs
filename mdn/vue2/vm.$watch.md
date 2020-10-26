# vm.$watch

经常使用 Vue.js 的同学肯定对 $watch并不陌生，本节将探究它的内部是如何实现的

## 1、用法

在介绍 vm.$watch 的内部原理之前，先简单回顾一下它的用法

vm.$watch( expOrFn, callback, [option] )

> 参数：
>
> { string | Function } expOrFn
>
> { Function | Object }  callback
>
> { Object }  [ option ]
>
> ​	{ boolean }  deep
>
> ​	{ boolean }  immediate
>
> 返回值： { Function }  unwatch
>
> 用法：用于观察一个表达式或 computed 函数在 Vue.js实例上的变化，回调函数调用时，会从参数得到新数据 ( new value ) 和 旧数据 ( old value )。表达式只接受以点分割的路径，例如 a.b.c 。如果是一个比较复杂的表达式，可以用函数代替表达式。

例如：

```javascript
vm.$watch( 'a.b.c', function (newVal, oldVal) {
	//做点什么
})
```

vm.$watch 返回一个取消观察函数，用来停止触发回调

```javascript
var unwatch = vm.$watch( 'a', (newVal, oldVal) => {
	//之后取消观察
})
unwatch()
```

最后，简要介绍一下 [options] 的两个选项 deep 和 immediate.

- deep.  为了发现对象内部值的变化，可以在选项参数中指定 deep： true；

  ```javascript
  vm.$watch('someObject', callback, {
  	deep: true
  })
  vm.someObject.nestedValue = 123
  ```

  这里需要注意的是，监听数组的变动不需要这么做。

- immediate。 在选项参数中指定 immediate： true，将立即以表达式的当前值触发回调

  ```javascript
  vm.$watch('a', callback, {
  	immediate: true
  })
  //立即以 ‘a’ 的当前值触发回调
  ```

  

##  2、watch的内部原理

vm.$watch 其实是对 Watcher 的一种封装，Watcher 的原理在第二章中介绍过。通过 Watcher 完全可以实现 vm.$watch 的功能，但 vm.$watch 中的参数 deep 和 immediate 是 Watcher 中所没有的。下面我们来看一看 vm.$watch 到底是怎么实现的：

```javascript
Vue.prototype.$watch = function (expOrFn, cb, options) {
	const vm = this;
	options = option || {}
	const watcher = new Watcher (vm, expOrFn, cb, options)
	if(options.immediate){
		cb.call(vm, watcher.value)
	}
	
	return function unwatchFn (){
		watcher.teardown()
	}
}
```

​	

可以看到，代码不多，逻辑也不复杂，先执行 new Watcher 来实现 vm.$watch 的基本功能



这里有一个细节需要注意，expOrFn 是支持函数的，而我们在第2章中并没有加上，这里我们需要对 Watcher 进行一个简单的修改，具体如下：

```javascript
export default class Watcher {
	constructor (vm, expOrfn, cb) {
		this.vm = vm
		//expOrFn 参数支持函数
		if( typeof expOrFn === 'function'){
			this.getter = expOrFn
		} else {
			this.getter = parsePath( expOrFn )
		}
		this.cb = cb
		this.value = this.get()
	}
}
```

​	上面的代码新增了判断 expOrFn 类型的逻辑。如果 expOrFn 是函数，则直接将它赋值给 getter；如果不是函数，再使用 parsePath 函数来读取 keypath 中的数据。这里 keypath 指的是属性路径，例如 a.b.c.d 就是一个 keypath，说明从 vm.a.b.c.d 中读取数据



​	当 expOrFn 是函数时，会发生很神奇的事情。它不只可以动态返回数据，其中读取的所有数据也都会被 Watcher 观察。当 expOrFn 是字符串类型的 keypath 时，Watcher 会读取这个 keypath 所指向的数据并观察这个数据的变化。而当 expOrFn 是函数时，Watcher 会同时观察 expOrFn 函数中读取的所有 Vue.js 实例上的响应式数据。也就是说，如果函数从 Vue.js 实例上读取了两个数据，那么 Watcher 会同时观察这两个数据的变化，当其中任意一个发生变化时，Watcher 都会得到通知。

> 说明：
>
> 事实上， Vue.js 中计算属性 ( Computed ) 的实现原理与 expOrFn 支持函数有很大关系，我们会在后面的章节中详细介绍。



执行一次 new Watcher 后，代码会判断用户是否使用了 immediate 参数，如果使用了，则立即执行一次 cb.



最后，返回一个函数 unwatchFn。 顾名思义，它的作用是取消观察数据。

当用户执行这个函数时，实际上是执行了 watcher.teardown() 来取消观察数据，其本质是把 watcher 实例从当前正在观察的状态的依赖列表中移除。



前面介绍 Watcher 时并灭也介绍 teardown 方法，现在要在 Watcher 中添加该方法来实现 unwatch 的功能。



首先，需要在 Watcher中记录了自己都订阅了谁，也就是 Watcher 实例被收集进了哪些 Dep 里。然后当 Watcher 不想继续订阅这些 Dep 时，循环自己记录的订阅列表来通知它们 ( Dep ) 将自己从它们 ( Dep )的依赖列表中移除掉。



因此，我们要把收集依赖的那部分做一个小小的改动



先在 Watcher 中添加 addDep 方法，该方法作用是在 Watcher 中记录自己都订阅过哪些 Dep:

```javascript
export default class Watcher {
	constructor (vm, expOrFn, cb) {
		this.vm = vm
		this.deps = [] //新增
		this.depIds = new Set() //新增
		this.getter = parsePath( expOrFn )
		this.cb = cb
		this.value = this.get()
	}
	
	addDep (dep) {
		const id = dep.id
		if( !this.depIds.has(id) ){
			this.depIds.add(id)
			this.deps.push(dep)
			dep.addSub(this)
		}
	}
}
```

​	在上述代码中，我们使用 depIds 来判断当前 Watcher 已经订阅了该 Dep，则不会重复订阅。在第二章中，我们介绍过 Watcher 读取 value 时，会触发收集依赖的逻辑。当依赖发生变化时，会通知 Watcher 重新读取最新的数据。如果没有这个判断，就会发现每当数据发生变化，Watcher 都会读取最新的数据。而读取数据就会再次收集依赖，这就会导致 Dep 中的依赖有重复。这样当数据发生变化时，会同时通知多个 Watcher。为了避免这个问题，只有第一次 触发 getter 的时候才会收集依赖。



**接着，执行 this.depIds.add 来记录当前 Watcher 已经订阅了这个 Dep,**

**然后执行 this.deps.push( dep )记录自己都订阅了哪些 Dep,**

**最后，触发 dep.addSub( this ) 来将自己订阅到 Dep 中。**



在 Watcher 中新增 addDep 方法后，Dep 中收集依赖的逻辑也需要有所改变：

```javascript
let uid = 0 //新增
export default class Dep {
	constructor () {
		this.id = uid ++ //新增
		this.subs = []
	}
	
	depend () {
		if( window.target ){
			window.target.addDep(this)
		}
	}
}
```

​	此时，Dep会记录数据发生变化时，需要通知哪些 Watcher ，而 Watcher 中也同样记录了自己会被哪些 Dep 通知。它们其实是多对多的关系，如图 4-1 所示。

图





有些人可能会感到困惑，为什么是多对多的关系。Watcher 每次只读一个数据，不是应该只有一个 Dep 吗？



其实不是，如果 Watcher 中的参数是一个 表达式，那么肯定只收集一个 Dep，并且大部分都是这样。但凡是总有例外， expOrFn 可以是一个函数，此时如果该函数中使用了多个数据，那么这时 Watcher 就要收集多个 Dep 了，例如：

```javascript
this.$watch( function () {
	return this.name + this.age
}, function (newValue, oldValue) {
	console.log(newValue, oldValue)
})
```

​		

在上面这个例子中，我们的表达式是一个函数，并且在函数中访问了 name 和 age 两个数据，这种情况下 Watcher 内部会收集两个 Dep —— name  的 Dep 和 age 的 Dep，同时这两个 Dep 中也会收集 Watcher，这导致 age 和 name 中的任意一个数据发生变化时，Watcher 都会收到通知。



言归正传，当我们已经在 Watcher 中记录自己都订阅了哪些 Dep 之后，就可以在 Watcher 中新增 teardown方法来通知这些订阅的 Dep，让它们把自己从依赖列表中移除掉：

```javascript
/**
*	从所有依赖项的 Dep列表中将自己移除
*/

teardown (){
	let i = this.deps.length
	while (i--){
		this.deps[i].removeSub(this)
	}
}
```

​	上面做的事情很简单，只是循环订阅列表，然后分别执行它们的 removeSub方法，来把自己从它们的依赖列表中移除掉。接下来，看看 removeSub 中都发生了什么：

```javascript
export default class Dep {
	removeSub (sub) {
		const index = this.subs.indexOf( sub )
		if( index > -1 ){
			 return this.subs.splice(index, 1) 
		}
	}
}
```

​	上面的代码把 Watcher 从 sub 中删除掉，然后当数据发生变化时，将不再通知这个已经删除的 Watcher，这就是 unwatch 																																																																																																		

## 3、deep参数的实现原理

最后，我们说说 deep 参数的实现原理



在本书第一篇中，我们主要介绍的无非是收集依赖 和 触发依赖，Watcher 想监听某个数据，就会触发某个数据收集依赖的逻辑，将自己收集进去，然后当它发生变化时，就会通知 Watcher。要想实现 deep 的功能，其实就是除了要触发当前这个被监听数据的收集依赖的逻辑之外，还要把当前监听的这个值在内的所有子值都触发一边收集依赖逻辑。这就可以实现当前这个依赖的所有子数据发生变化时，通知当前 Watcher 了。

```javascript
export default class Watcher {
	constructor (vm, expOrFn, cb, options){
		this.vm = vm
		//新增
		if( options ){
			this.deep = !! options.deep
		}else {
			this.deep =false
		}
		
		this.deps = []
		this.depIds = new Set()
		this.getter = parsePath( expOrFn )
		this.cb = cb
		this.value = this,get()
	}
	
	get () {
		windwo.garget = this
		let value = this.getter.call(vm, vm)
		//新增
		if(this.deep){
			traverse(value)
		}
		window.target = undefined
		return value
	}
}
```



在上面的代码中，如果用户使用了  deep 参数，则在 window。target = undefined 之前调用 traverse 来处理 deep 的逻辑。



这里非常强调的一点是，一定要在 window.target = undefined 之前去触发子值的收集依赖逻辑，这样才能保证子集收集的依赖是当前这个 Watcher。如果在 window.target = undefined 之后去触发收集依赖的逻辑，那么其实当前的 Watcher 并不会被收集到 子值的依赖列表中，也就无法实现 deep 的功能。



接下来，要递归value 的所有子值来触发它们收集依赖的功能：

```javascript
const seenObjects = new Set()

export function traverse (val) {
	_traverse(val, seenObjects){
		seenObjects.clear()
	}
}

function _traverse (val, seen){
	let i, keys
	const isA = Array.isArray(val)
	if( (!isA && !isObeject(val)) || Object.isFrozen(val) ){
		return 
	}
	
	if(val.__ob__){
		const depId = val.__ob__.dep.id
		if(seen.has(depId)){
			return 
		}
		seen.add(depId)
	}
	
	if(isA){
		i = val.length
		while(i--) _traverse(val[i], seen )
	}else {
		keys = Object.keys(val)
		i = keys.length
		while (i--) _traverse(val[keys[i]], seen )
	}
}
```



这里我们先判断 val 的类型，如果它不是 Array 和 Object ，或者已经被冻结，那么直接返回，什么都不干。



然后拿到 val 的 dep.id ,用这个 id  来保证不会重复收集依赖数据。



如果是数组，则循环数组，将数组中的每一项递归调用 _traverse.



最后，重点来了，如果是 Object 类型的数据，则循环 Object 中所有的 key，然后执行一次读取操作，再递归子值：

```javascript
while(i--) _traverse(val[keys[i]],  seen )
```

其中 val[keys[i]] 会触发 getter，也就是说会触发收集依赖的操作，这时 window.target 还没有被清空，会将当前的 Watcher 收集进去。这也是前面我强调的一定要在 window.target = undefined 这个语句之前触发收集依赖的原因。



而 _traverse 函数其实是一个递归操作，所以这个 value 的子值会触发同样的逻辑，这样就可以实现通过 deep 参数来监听所有子值的变化。