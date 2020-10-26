# vm.$set

在 vue.js中，vm.$set 也是一个比较常用的 API，我们先简单回顾一下它的用法

## 1、用法

vm.$set 的用法如下

```javascript
vm.$set(target, key, value)
```

> 参数：
>
> { Object | Array }  target
>
> { string | number } key
>
> { any } value
>
> 返回值： 
>
> { Function } unwatch
>
> 用法：
>
> 在 object 上设置一个属性，如果 object 是响应式的，vue.js 会保证属性被创建后也是响应式的，并且触发视图更新。这个方法主要用来避开 Vue.js 不能侦测属性被添加的限制

------

注意：  target 不能是 Vue.js 实例或者 Vue.js 实例的根数据对象。

------

前面我们介绍了变化侦测的原理，所以对于追踪变化的方式，大家应该已经很熟了。只有已经存在的属性的变化会被追踪到，新增的属性无法被追踪到。因为在 ES6 之前，Javascript 并没有提供元编程的能力，所以根本无法侦测 object 什么时候被添加了一个新属性。



而 vm.$set 就是为了解决这个问题而出现的。使用它，可以为 object 新增属性，然后 Vue.js 就可以将这个新增属性转换成响应式的。



举个例子：

```javascript
var vm = new Vue({
	el: '#el',
	template: '#demo-template',
	data: {
		obj: {}
	}
})
```

在上述代码中，data 中有一个 obj 对象。如果直接给 obj 设置一个属性，例如：

```javascript
var vm = new Vue({
	el:'#el',
	template: '#demo-template',
	methods: {
		action () {
			this.obj.name = 'berwin'
		}
	},
	data: {
		obj: {}
	}
})
```

当 action 方法被调用时，会为 obj 新增一个 name 属性，而 Vue.js 并不会得到任何通知。新增的这个属性也不是响应式的，Vue.js 根本不知道这个 obj 新增了属性，就好像 Vue.js 无法知道我们使用 array.length = 清空了数组一样。



vm.$set 就可以解决这个事情。

我们来看看 vm.$set 是如何实现的：

```javascript
import { set } from '../observe/index'
Vue.prototype.$set = set
```

这里我们在 Vue.js 的原型上设置  $set 属性。

其实我们使用的所有以 vm.$ 开头的方法都是在 Vue.js 的原型上设置的。

vm.$set 的具体实现其实是在 observer 中抛出的 set 方法。



所以，我们先创建一个 set 方法：

```javascript
export function set (target, key, val){
	//做点什么
}
```



## 2、Array的处理

上面我们创建了 set 方法并且规定它接收 3 个参数，这 3 个参数与 vm.$set API 规定的需要传递的参数一致。



接下来，我们需要对 target 是数组的情况进行处理：

```javascript
export function set (target, key, val){
	if( Array.isArray(target) && isValidArrayIndex(key) ){
		target.length = Math.max(target.length, key)
		target.splice(key, 1, val)
		return val
	}
}
```

在上面的代码中，如果 target 是数组并且 key 是一个有效的索引值，就先设置 length 属性。这样如果我们传递的索引值大于当前数组的 length ，就需要让 target 的 length 等于索引值。



接下来，通过 splice 方法把 val 设置到 target 中的指定位置 ( 参数中提供的索引值的位置 )。当我们使用 splice 方法把 val 值设置到 target 中的时候，数组拦截器会侦测到 target 发生了变化，并且会自动帮助我们把这个新增的 val 转换成响应式的。 

## 3、key已经存在于 target 中

接下来，需要处理参数中的 key 已经存在于 target 中的情况：

```javascript
export function set (target, key, val) {
 if( Array.isArray(target) && isValidArrayIndex(key) ){
 		target.length = Math.max(target.length, key)
 		target.splice(key, 1, val)
 		return val
 }
 
 //新增
 if( key in target && !(key in Object.prototype)){
 		target[key] = val
 		return val
 }
}
```

由于 key 已经存在于 target 中，所以其实这个 key 已经侦测了变化。也就是说，这种情况属于修改数据，直接用 key 和 val 改数据就好了。修改数据的动作会被 Vue.js 侦测到，所以数据发生变化后，会自动向依赖发送通知。

## 4、处理新增的属性

终于到了重头戏，现在来处理在 target 上新增的 key:

```javascript
export function set (target, key, val) {
	if( Array.isArray(target) && isValidArrayIndex(key) ){
		target.length = Math.max(target.length, key)
		target.splice(key, 1, val)
		return val
	}
	
	if(key in target && !(key in Object.prototype) ){
		target[key] = val
		return val
	} 
	
	//新增
	const ob = target.__ob__
	if(target._isVue || (ob && ob.vmCount)){
		process.env.NODE_ENV !== 'production' && warn(
			'Avoid adding reactive properties to a Vue instance or its root $data' + 'at runtime -declare it upfront in the data option.'
		)
		return val
	}
	
	if(!ob){
		target[key] = val
		return val
	}
	
	defineReactive(ob.value, key, val)
	ob.dep.notify()
	
	return val
}
```

在上面的代码中，我们最先做的事情是获取 target 的 __ ob __ 属性

然后要处理文档中所说的 "target  不能是 Vue.js 实例或 Vue.js 实例的根数据对象" 的情况



实现这个功能并不难，只需要使用 target._isVue 来判断 target 是不是 Vue.js 实例，使用 ob.vmCount 来判断它是不是根数据就行了。



那么，什么是根数据？ this.$data 就是根数据。



接下来，我们处理 target 不是响应式的情况。 如果 target 身上没有 __ ob __ 属性，说明它并不是响应式的，并不需要做什么特殊处理，只需要通过 key 和 val 在 target 上设置就行了。



如果前面的所有判断条件都不满足，那么说明用户是在响应式数据上新增了一个属性，这种情况下需要追踪这个新增属性的变化， 即使用 defineReactive  将新增属性转换为  getter/setter  的形式即可。



最后，向 target 的依赖触发变化通知，并返回 val。