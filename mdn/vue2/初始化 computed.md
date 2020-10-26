# 初始化 computed

大家肯定对计算属性 computed 不陌生，在实际项目中我们会经常用它。但对于刚入门的新手来说，它不是很好理解，它和 watch 到底有哪些不同呢？本节将详细介绍其内部原理。



简单来说，computed 是定义在 vm 上的一个特殊的 getter 方法。之所以说特殊，是因为在 vm 上定义 getter 方法时， get 并不是用户提供的函数，而是 Vue.js 内部的一个代理函数。在代理函数中可以结合 Watcher 实现缓存与收集依赖等功能。



我们知道计算属性的结果会被缓存，且只有在计算属性所依赖的响应式属性或者说 计算属性的返回值发生变化时才会重新计算。那么，如何知道计算属性的返回值是否发生了变化？这其实是结合 Watcher 的 dirty 属性来分辨的：

> 1、当 dirty 属性为 true 时，说明需要重新计算 "计算属性" 的返回值
>
> 2、当 dirty 属性为 false 时，说明计算属性的值并没有变，不需要重新计算



当计算属性中的内容发生变化后，计算属性的 Watcher 与组件的 Watcher 都会得到通知。计算属性的 Watcher 会将自己的 dirty 属性设置为 true，当下一次读取计算属性时，就会重新计算一次值。然后组件的 Watcher 也会得到通知，从而执行 render 函数进行重新渲染的操作。由于要重新执行 render 函数，所以会重新读取计算属性的值，这时候计算属性的 Watcher 已经把自己的 dirty 属性设置为 true，所以会重新计算一次计算属性的值，用于本次渲染。



简单来说，计算属性会通过 Watcher 来观察它所用到的所有属性的变化，当这些属性发生变化时，计算属性会将自身的 Watcher 的 dirty 属性设置为 true，说明自身的返回值变了。



图14-4给出了计算属性的内部原理。在模版中使用了一个数据渲染视图时，如果这个数据恰好是计算属性，那么读取数据这个操作其实会触发计算属性的 getter 方法( 初始化计算属性时在 vm 上设置的 getter 方法 )

![http://cdn.yuyiqiushui.cn/%E8%AE%A1%E7%AE%97%E5%B1%9E%E6%80%A7%E5%86%85%E9%83%A8%E5%8E%9F%E7%90%86.jpg](http://cdn.yuyiqiushui.cn/%E8%AE%A1%E7%AE%97%E5%B1%9E%E6%80%A7%E5%86%85%E9%83%A8%E5%8E%9F%E7%90%86.jpg)

​													14-4	计算属性的内部原理

 这个 getter 方法被触发时会做两件事。

> 1、计算当前属性的值，此时会使用 Watcher 去观察计算属性中用到的所有其他数据的变化。同时将计算属性的 Watcher 的 dirty 属性设置为 false，这样再次读取计算属性时将不再重新计算，除非计算属性所依赖的数据发生了变化。
>
> 2、当计算属性中用到的数据发生变化时，将得到通知从而进行重新渲染操作。

------

注意：如果是在模版中读取计算属性，那么使用组件的 Watcher 观察计算属性中用到的所有数据的变化。如果是用户自定义的 watch，那么其实是使用用户定义的 Watcher 观察计算属性中用到的所有数据的变化。其区别在于当计算属性函数中用到的数据发生变化时，向谁发送通知。

------

以上两件事做完之后，就可以实现当数据发生变化时计算属性清除缓存，组件收到通知去重新渲染视图。

------

说明：计算属性的一个特点是有缓存。计算属性函数所依赖的数据在没有发生变化的情况下，会反复读取计算属性，而计算属性函数并不会反复执行。

------

现在我们已经大致了解了计算属性的原理，接下来介绍初始化计算属性的具体实现：

```javascript
const computedWatcherOptions = { lazy: true }

function initComputed (vm, computed) {
	const watchers = vm._computedWatchers = Object.create(null)
	//计算属性在 SSR 环境中，只是一个普通的 getter 方法
	const isSSR = isServerRendering()
	
	for( const key in computed ){
		const userDef = computed[key]
		const getter = typeof userDef === 'function' ? userDef : userDef.get
    if(process.env.NODE_ENV !== 'production' && getter == null){
    	warn(`Getter is missing for computed property "${key}".`, vm)
    }
 		
    //在非 SSR 环境中，为计算属性创建内部观察器
    if( !isSSR ){
      watchers[key] = new Watcher( vm, getter || noop, noop, computedWatcherOptions)
    }
    
    if( !(key in vm) ){
      defineComputed(vm, key, userDef)
    }else if( process.env.NODE_ENV !== 'production' ){
      if( key in vm.$data ){
        warn(`The computed property "${key}" is already defined in data.`, vm) else if (vm.$options.props && key in vm.$options.props){
          warn(`The computed property "${key}" is already defined as a prop.`, vm)
        }
      }
    }
    
	}
}
```

在上述代码中，我们先声明了变量 computedWatcherOptions，其作用和它的名字相同，是一个 Watcher 选项。在实例化 Watcher 时，通过参数告诉 Watcher 类应该生成一个供计算属性使用的 watcher 实例。

initComputed 函数的作用是初始化计算属性，它接收如下两个参数。

> vm:	Vue.js 实例上下文 ( this )
>
> computed:	计算属性对象。

随后在 vm 上新增了 _computedWatchers 属性并且声明了变量 watchers ，其值为一个空的对象，而 _computedWatchers 属性用来保存所有计算属性的 watcher 实例。

------

说明： Object.create( null ) 创建出来的对象没有原型，它不存在 __ proto __ 属性。

------

随后声明变量 isSSR 用来判断当前运行环境是否是 SSR ( 服务端渲染 )。 isServerRendering 工具函数执行后，会返回一个布尔值用于判断是否是服务端渲染环境。



接下来，使用 for...in 循环 computed 对象，依次初始化每个计算属性。在循环中先声明变量 userDef 来保存用户设置的计算属性定义，然后通过 userDef 获取 getter 函数。这里只需要判断用户提供的计算属性是否是函数，如果是函数，则将这个函数当作 getter，否则默认将用户提供的计算属性当作对象处理，获取对象的 get 方法。这时如果用户传入的计算属性不合法，也就是说既不是函数也不是对象，或者提供了对象但没有提供  get  方法，就在非生产环境下在控制台打印警告以提示用户。



随后判断当前环境是否是服务端渲染环境，如果不是，就需要创建 watcher 实例。 Watcher 在整个计算属性内部原理中非常重要，后面我们会介绍它的作用。创建 watcher 实例时有一个细节需要注意，即第二个参数的 getter 其实就是用户设置的计算属性的 get 函数。



最后，判断当前循环到的计算属性的名字是否已经存在于 vm 中：如果存在，则在非生产环境下的控制台打印警告，如果不存在，则使用 defineComputed 函数在 vm 上设置一个计算属性。这里有一个细节需要注意，那就是当计算属性的名字已经存在于 vm 中时，说明已经有一个重名的 data 或 props，也有可能与 method 重名，这时候不会在 vm 上定义计算属性。



但在 Vue.js 中，只有 data 和 props 重名时，才会打印警告。如果与 methods 重名，并不会在控制台打印警告。所以如果与 methods 重名，计算属性会悄悄消失，我们在开发过程中应该尽量避免这种情况。



此外，还需要说明一下 defineComputed  函数，它有 3 个参数： vm、key、和 userDef。其完整代码如下：

```javascript
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

export function defineComputed (target, key, userDef){
  const shouldCache = !isServerRendering()
  if(typeof userDef === 'function'){
    sharedPropertyDefinition.get = shouldCache? createComputedGetter(key): userDef
    
    sharedPropertyDefinition.set = noop
  }else {
    sharedPropertyDefinition.get = userDef.get ? shouldCache && userDef.cache !== false ? createComputedGetter(key) : userDef.get
    : noop
    
    sharedPropertyDefinition.set = userDef.set ? userDef.set : noop
  }
  
  if( process.env.NODE_ENV !== 'production' && sharedPropertyDefinition.set === noop){
    sharedPropertyDefinition.set = function (){
      warn(`Computed property "${key}" was assigned to but it has no setter.`, this)
    }
  }
  
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
```

在上述代码中，先定义了变量 sharedPropertyDefinition，它的作用与 14.7.3节中介绍的 proxy 函数所使用的 sharedPropertyDefinition 变量相同。事实上，在源码中，这两个函数使用的其实是同一个变量，这个变量是一个默认的属性描述符，它经常与 Object.defineProperty 配合使用。



接着，函数 defineComputed 接收3个参数 target、key 和 userDef，其意思是在 target 上定义一个 key 属性，属性的 getter 和 setter 根据  userDef 的值来设置。



然后函数中声明了变量 shouldCache, 它的作用是判断 computed 是否应该有缓存。这里调用 isServerRendering 函数来判断当前环境是否是服务端渲染环境。因此，变量 shouldCache  只有在非服务端渲染环境下才为 true。也就是说，只有在非服务端渲染环境下，计算属性才有缓存。



接下来，判断 userDef 的类型。Vue.js 支持用户设置两种类型的计算属性：函数和对象。例如：

```javascript
var vm = new Vue({
	data: { a: 1 },
	computed: {
		//仅读取
		aDouble: function (){
		 return this.a *2
		},
		//读取和设置
		aPlus: {
			get: function (){
				return this.a + 1
			},
			set: function (v){
				this.a = v -1
			}
		}
	}
})
```

​	所以在定义计算属性时，需要判断 userDef 的类型是函数还是对象。如果是函数，则将函数理解为 getter 函数。如果是对象，则将对象的 get 方法作为 getter 方法， set 方法作为  setter 方法。



这里有一个细节需要注意，我们要通过判断 shouldCache 来选择将 get 设置成 userDef 这种普通的 getter 函数，还是设置为 计算属性的 getter 函数。其区别是如果将 sharedPropertyDefinition.get 设置为 userDef 函数，那么这个计算属性只是一个普通的 getter 方法，没有缓存。当计算属性中的所使用的数据发生变化时，计算属性的 Watcher 也不会得到任何通知，使用计算属性的 Watcher 也不会得到任何通知。它就是一个普通的 getter，每次读取操作都会执行一遍函数。这种情况通常在服务端渲染环境下生效，因为数据响应式的过程在服务器上是多余的。如果将 sharedPropertyDefinition.get 设置为计算属性的 getter，那么计算属性将具备缓存和观察计算属性依赖数据的变化等响应式功能。稍后，我们再介绍 createComputedGetter 的实现。



由于用户并没有设置 setter 函数，所以将sharedPropertyDefinition.set 设置为 noon，而 noon 是一个空函数。



如果 userDef 的类型不是函数，那么假设它是对象类型。在 else 语句中先设置 sharedPropertyDefinition.get ，后设置 sharedPropertyDefinition.set。设置 sharedPropertyDefinition.get 时需要判断 userDef.get 是否存在。如果不存在，则将 sharedPropertyDefinition.get 设置成 noon，如果存在，那么 逻辑和前面介绍的相同，如果 shouldCache 为 true 并且用户没有明确地将 userDef.cache 设置为 false，则调用 createComputedGetter 函数将 sharedPropertyDefinition.get 设置成计算属性的  getter 函数，否则将  sharedPropertyDefinition.get  设置成普通的  getter 函数 userDef.get。



设置完 getter 后设置 setter。这简单很多，只需要判断 userDef.set 是否存在，如果存在，则将 sharedPropertyDefinition.set  设置为 userDer.set,否则设置为  noop。



如果用户在没有设置 setter 的情况下对计算属性进行了修改操作， Vue.js 会在非生产环境下在控制台打印警告。其实现原理很简单，如果用户没有设置 setter 函数，那么为计算属性设置一个默认的  setter  函数，并且当函数执行时，打印出警告即可。



在 defineComputed 函数的最后，我们调用  Object.defineProperty 方法在target 对象上设置 key 属性，其中属性描述符为前面我们设置的  sharedPropertyDefinition  。计算属性就是这样被设置到  vm  上的。



通过前面的介绍，我们发现计算属性的缓存与响应式功能主要在于是否将 getter 方法设置为  createComputedGetter  函数执行后的返回结果。下面我们介绍  createComputedGetter  函数是如何实现缓存以及响应式功能的，其代码如下：

```javascript
function createComputedGetter (key){
	return function computedGetter (){
		const watcher = this._computedWatchers && this._computedWatchers[key]
		
		if(watcher){
			if(watcher.dirty){
				watcher.evaluate()
			}
			
			if(Dep.target){
				watcher.depend()
			}
			
			return watcher.value
		}
	}
}
```

这个函数是一个高阶函数，它接收一个参数 key 并返回另一个函数  computedGetter。



通过前面的介绍知道，最终被设置到  getter  方法中的函数其实是被返回的  computedGetter 函数。在非服务端渲染的环境中，每当计算属性被读取时， computedGetter 函数都会被执行。



在 computedGetter 函数中，先使用  key  从 this._computedWatchers 中读出  watcher 并赋值给变量  watcher。而 this._computedWatchers  属性保存了所有计算属性的 watcher 实例。



如果 watcher 存在，那么判断 watcher.dirty 是否为 true。前面我们介绍 watcher.dirty      属性用于 标识计算属性的返回值是否有变化，如果它为 true ，说明计算属性所依赖的状态发生了变化，它的返回值有可能也会有变化，所以需要重新计算得出最新的结果。



计算属性的缓存就是通过这个判断来实现的。每当计算属性所依赖的状态发生变化时，会将 watcher.dirty 设置为 true，这样当下一次读取计算属性时，会发现 watcher.dirty 为 true，此时会重新计算返回值，否则就直接使用之前的计算结果。



随后判断 Dep.target 是否存在，如果存在，则调用 watcher.depend 方法。这段代码的目的在于将读取计算属性的那个 Watcher 添加到计算属性所依赖的所有状态的依赖列表中。换句话说，就是让读取计算属性的那个 Watcher 持续观察计算属性所依赖的状态的变化。



使用计算属性的同学大多会有一个疑问：为什么我在模版里只使用了一个计算属性，但是把计算属性中用到的另一个状态改变了，模版会重新渲染，它是怎么知道自己需要重新渲染的呢？



这是因为组件的 Watcher 观察了计算属性中所依赖的所有状态的变化。当计算属性中所依赖的状态发生变化时，组件的 Watcher 会得到通知，然后就会执行重新渲染操作。



第二章介绍 Watcher 时，并没有介绍其 depend 与 evaluate 方法。事实上，其中定义了 depend 与 evaluate 方法专门用于实现计算属性相关的功能，代码如下：

```javascript
export default class Watcher {
  constructor (vm, expOrFn, cb, options){
    //隐藏无关代码
    if(options){
      this.lazy = !!options.lazy
    }else{
      this.lazy = false
    }
    
    this.dirty = this.lazy
    
    this.value = this.lazy? undefined : this.get()
  }
  
  evaluate () {
    this.value = this.get()
    this.dirty = false
  }
  
  depend () {
    let i = this.deps.length
    while(i--){
      this.deps[i].depend()
    }
  }
}
```

可以看到，evaluate 方法的逻辑很简单，就是执行 this.get 方法重新计算一下值， 然后将 this.dirty 设置为 false。



虽然 depend 方法的代码不到，但它的作用并不简单。从代码中可以看到， Watcher.depend 方法会遍历 this.deps 属性(该属性中保存了计算属性用到的所有状态的 dep 实例，而每个属性的 dep 实例中保存了它的所有依赖)，并依次执行 dep 实例的 depend 方法。



执行 dep 实例的 depend 方法可以将组件的 watcher 实例添加到 dep 实例的依赖列表中。换句话说，this.deps 是计算属性中用到的所有状态的 dep 实例，而依次执行了 dep 实例的 depend 方法就是将组件的 Watcher 依次加入到这些 dep 实例的依赖列表中，这就实现了让组件的 Watcher 观察计算属性中用到的所有状态的变化。当这些状态发生变化时，组件的 Watcher 会收到通知，从而进行重新渲染操作。



前面我们介绍的计算属性原理是 Vue.js 在 2.5.2 版本中的实现。Vue.js 在2.5.17版本中，对计算属性的实现方式做了一个改动，这个改动使得计算属性的原理有一些不太一样的地方，这是因为现有的计算属性存在着一个问题。



前面我们介绍组件的 Watcher 会观察计算属性中用到的所有数据的变化。这就导致一个问题：如果计算属性中用到的状态发生了变化，但最终的计算属性的返回值并没有变，这时计算属性依然会认为自己的返回值变了，组件也会重新走一遍渲染流程。只不过最终由于虚拟 DOM 的 Diff 中发现没有变化，所以在视觉上并不会发现 UI 有变化，其实渲染函数会被执行。



也就是说，计算属性只是观察它所用到的所有数据是否发生了变化，但并没有真正去校验它自身的返回值是否有变化，所以当它所使用的数据发生变化后，它就认为自己的返回值也会有变化，但事实并不总是这样。



有人在 Vue.js 的 GitHub Issues 里提出了这个问题，地址为 https：//github.com/vuejs/vue/issues/7767 。同时，他还给出了一个案例来演示这个问题，地址： https://jsfiddle.net/72gzmayL/。



为了解决这个问题，作者把计算属性的实现做了一些改动，改动后的逻辑是：组件的 Watcher 不再观察计算属性用到的数据变化，而是让计算属性的 Watcher 得到通知后，计算一次计算属性的值，如果发现这一次计算出来的值与上一次计算出来的值不一样，再去主动通知组件的 Watcher 进行重新渲染操作。这样就可以解决前面提到的问题，只有计算属性的返回值真的变了，才会重新执行渲染函数。



图14-5 给出了新版计算属性的内部原理。与之前最大的区别就是组件的 Watcher 不再观察数据的变化了，而是只观察计算属性的 Watcher (把组件的 Watcher 实例添加到计算属性的 watcher 实例的依赖列表中 )，然后计算属性主动通知组件是否需要进行渲染操作。

![](http://cdn.yuyiqiushui.cn/%E6%96%B0%E7%89%88%E8%AE%A1%E7%AE%97%E5%B1%9E%E6%80%A7%E5%86%85%E9%83%A8%E5%8E%9F%E7%90%86.png)

此时计算属性的 getter 被触发时做的 事情发生了变化，它会做下面两件事。

> 1、使用组件的 Watcher 观察计算属性的 Watcher ，也就是把组件的 Watcher 添加到计算属性的 Watcher 的依赖列表中，让计算属性的 Watcher 向组件的 Watcher 发送通知。
>
> 2、使用计算属性的 Watcher 观察计算属性函数中用到的 所有数据，当这些数据发生变化时，向计算属性的 Watcher 发送通知。

------

注意：如果是在 模版中读取计算属性，那么使用组件的 Watcher 观察计算属性的 Watcher；  如果是用户使用 vm.$watch 定义的 Watcher，那么其实是使用用户定义的 Watcher 观察计算属性的 Watcher。

其区别是当计算属性通过计算发现自己的返回值发生变化后，计算属性的 Watcher 向谁发送通知。

------

修复这个问题的 Pull Requests 地址为： https://github.com/vue/pull/7824。下面来看一下这个 Pull Requests 都有哪些修改。

首先 createComputedGetter 函数中的内容发生了变化，改动后的代码如下：

```javascript
function createComputedGetter (key){
	return function computedGetter (){
    const watcher = this._computedWatchers && this._computedWatchers[key]
    
    if(watcher){
      watcher.depend()
      return watcher.evaluate()
    }
  }
}
```

改动后的函数依然是一个高阶函数，依然返回 computedGetter 函数，但是 computedGetter 函数中的内容发生了变化。从代码上看，改动后的代码比改动前的代码少了很多。



computedGetter 函数依然是先使用  key 从 this._computedWatchers 中读出 watcher 并赋值给变量 watcher。随后判断 watcher 是否存在，如果存在，则执行 watcher.depend( ) 和 watcher.evaluate()，并将 watcher.evaluate() 的返回值当作计算属性函数的计算结果返回出去。



depend 方法被执行后，会将读取计算属性的那个 Watcher 添加到计算属性的 Watcher 的依赖列表中，这可以让计算属性的 Watcher 向使用计算属性的 Watcher 发送通知。



Watcher 的代码变成了下面的样子：

```javascript
export default class Watcher {
  constructor (vm, expOrFn, cb, options){
    //隐藏无关代码
    if(options){
      this.computed = !! options.computed
    }else{
      this.computed = false
    }
    
    this.dirty = this.computed
    
    if(this.computed){
      this.value = undefined
      this.dep = new Dep()
    }else{
      this.value = this.get()
    }
  }
  
  update (){
    if(this.computed){
      if(this.dep.subs.length === 0){
        this.dirty = true
      }else{
        this.getAndInvoke( () => {
          this.dep.notify()
        })
      }
    }
    //隐藏无关代码
  }
  
  getAndInvoke (cb){
    const value = this.get()
    if(	value !== this.value || isObject(value) || this.deep ){
      const oldValue = this.value
      this.value = value
      this.dirty = false
      if(this.user){
        try{
          cb.call( this.vm, value, oldValue )
        } catch (e) {
          handleError(e, this.vm, `callback for watcher "${this.expression}"`)
        }
      }else{
        cb.call( this.vm, value, oldValue)
      }
    }
  }
  
  evaluate (){
    if(this.dirty){
      this.value = this.get()
      this.dirty = false
    }
    return this.value
  }
  
  depend (){
    if( this.dep && Dep.target ){
      this.dep.depend()
    }
  }
}
```

 可以看到，evaluate 方法稍微有点改动，但并不是很大。先通过 dirty 属性判断返回值是否发生了变化，如果发生了变化，就执行 get 方法重新计算一次，然后将 dirty 属性设置为  false，表示数据已经是最新的，不需要重新计算，最后返回本次计算出来的结果。



depend 方法的改动有点大，这一次不再是将 Dep.target 添加到计算属性所用到的所有数据的依赖列表中，而是改成了将 Dep.target 添加到计算属性的依赖列表中。this.dep 用于在 实例化 Watcher 时进行判断，如果为计算属性用到的 Watcher，则实例化一个 dep 实例并将其放在  this.dep  属性上。



当计算属性中用到的数据发生变化时，计算属性的 Watcher 的 update 方法会被执行，此时会判断当前  Watcher 是不是计算属性的 Watcher，如果是，那么有两种模式，一种时主动发送通知，另一种是将 dirty 设置为 true。行业术语中，这两种方式分别叫做 activated 和 lazy。



从代码中可以看出，分辨这两种模式可以使用依赖的数量，activated 模式要求至少有一个依赖。其实也可以理解，如果没有任何依赖，那么主动去向谁发送通知呢？



大部分情况下都是有依赖的，这个依赖有可能是组件的 Watcher，这取决于谁读取了计算属性。



我们假设这个依赖是组件的 Watcher，那么当计算属性所使用的数据发生变化后，会执行计算属性的 Watcher 的 update 方法。随后可以看到，发送通知的代码是在 this.getAndInvoke 函数的回调中执行的。可以很明确地告诉你，这个函数的作用是对比计算属性的返回值。只有计算属性的返回值真的发生了变化，才会执行回调，从而主动发送通知让组件的 Watcher 去执行重新渲染逻辑。