# 初始化 provide

如图 14-2 所示，状态初始化的下一步是初始化 provide ，本节中我们将介绍 provide 的内部原理。



provide 选项应该是一个对象或者是返回一个对象的函数。该对象包含可注入其子孙的属性。在该对象中，你可以使用 ES2015  Symbol 作为 key，但是它只在原生支持 Symbol  和  Reflect.ownKeys 的环境下工作。



14.6.1节详细介绍了 provide/inject 的使用方式，本节将不再重复介绍。

初始化 provide 时，只需要将 provide 选项添加到 vm._provide 即可，相关代码如下：

```javascript
export function initProvide (vm){
  const provide = vm.$options.provide
  if(provide){
    vm._provided = typeof provide === 'function' ? provide.call(vm) : provide
  }
}
```

这里首先判断 provide 的类型是否是函数，如果是，则执行函数，将返回值赋值给 `vm._provided`，否则直接将变量 provide 赋值给 ` vm._provide`