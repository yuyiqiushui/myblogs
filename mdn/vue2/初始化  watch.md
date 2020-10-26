# 初始化  watch

初始化状态的最后一步是初始化 watch 。在  initState 函数的最后，有这样一行代码：

```javascript
if ( opts.watch && opts.watch !== nativeWatch ){
	initWatch (vm, opts.watch)
}
```

只有当用户设置了 watch 选项并且 watch 选项不等于浏览器原生的  watch 时，才进行初始化  watch 操作。



之所以使用这样的语句 (opts.watch !== nativeWatch ) 判断，是因为 Firefox 浏览器中的 Object.prptotype 上有一个 watch 方法。当用户没有设置 watch 时， 在 Firefox 浏览器下的 opts.watch 将是 Object.prototype.watch 函数，所以通过这样的语句可以避免这种问题。



代码中通过调用 initWatch 函数并传递两个参数 vm 和 opts.watch 来初始化 watch 选项。这里我们先简单回顾  watch 的使用方式。

> 类型：{ [key: string] : string | Function | Object | Array }
>
> 介绍： 一个对象，其中键是需要观察的表达式，值是对应的回调函数，也可以是方法名或者包含选项的对象。Vue.js 实例将会在实例化时调用  vm.$watch( )  遍历  watch 对象的每一个属性。
>
> 示例：

```javascript
var vm = new Vue ({
  data: {
    a: 1,
    b: 2,
    c: 3,
    d: 4,
    e: {
      f: {
        g: 5
      }
    }
  },
  
  watch : {
    a: function (val, oldVal) {
      console.log('new :%s, old: %s', val, oldVal)
    },
    
    //方法名：
    b: 'someMethod',
    //深度 watcher
    c: {
      handler:function (val, oldVal){ /* ... */},
      deep: true
    }
    // 该回调将会在侦听开始之后被立即调用
    d: {
    	handler: function (val, oldVal) {/* ... */},
      immediate: true
  	},
  	e: [
      function handler1 (val, oldVal) {/* ... */},
      function handler2 (val, oldVal) {/* ... */}
    ],
    
    //watch vm.e.f's  value : {g: 5}
    'e.f': function (val, oldVal) {/* ... */}
  }
})

vm.a = 2;     //   => new : 2, old : 1
```

初始化 watch 选项的实现思路并不复杂，前面也略微提到了。watch 选项的功能和 vm.$watch (其内部原理可以参见 4.1 节) 是相同的，所以只需要循环 watch 选项.

将对象中的每一项依次调用  vm.$watch 方法来观察表达式或 computed 在 Vue.js 实例上的变化即可。



由于  watch 选项的值同时支持字符串、函数、对象和数组类型，不同的类型有不同的用法，所以在调用  vm.$watch 之前需要对这些类型做一些适配。initWatch 函数的代码如下：

```javascript
function initWatch (vm, watch){
  for (const key in watch){
    const handler = watch[key]
    if( Array.isArray(handler)){
      for(let i = 0; i < handler.length; i++){
        createWatcher(vm, key, handler[i])
      }
    }else {
      createWatcher(vm, key, handler)
    }
  }
}
```

它接收两个参数 vm 和 watch ，后者是用户设置的 watch 对象。随后使用 for ... in 循环遍历 watch 对象，通过 key 得到 watch 对象的值并赋值给变量 handler。



此时变量 handler 的类型是不确定的， watch 选项的值其实可以大致分为两类：数组和其他。数组中的每一项可以是其他任意类型，所以代码中先处理数组的情况。如果 handler 的类型是数组，那么遍历数组并将数组中的每一项依次调用 createWatcher 函数来创建 Watcher。如果不是数组，那么直接调用 createWatcher 函数创建一个 Watcher。



createWatcher 函数主要负责处理其他类型的 handler 并调用 vm.$watch 创建 Watcher 观察表达式，其代码如下：

```javascript
function createWatcher (vm, expOrFn, handler, options){
	if(isPlainObject(handler)){
		options = handler
		handler = handler.handler
	}
  if( typeof handler === 'string'){
    handler = vm[handler]
  }
  return vm.$watch(expOrFn, handler, options)
}
```

它接收四个参数：

> vm :  Vue.js 实例上下文 ( this )。
>
> expOrFn:  表达式或计算属性函数。
>
> handler: 	watch 对象的值。
>
> options：	用于传递给  vm.$watch 的选项对象。

执行 createWatcher 函数时，handler 的类型有三种可能： 字符串、函数 和 对象。如果 handler 的类型是函数，那么不用特殊处理，直接把它传递给  vm.$watch 即可。如果是对象，那么说明用户设置了一个包含选项的对象，因此将 options 的值设置为 handler，并且将变量  handler 将它赋值给 handler 变量即可。



针对不同类型的值处理完毕后，handler 变量是回调函数， options 为 vm.$watch 的选项，

所以接下来只需要调用 vm.$Watch 即可完成初始化 watch 的任务