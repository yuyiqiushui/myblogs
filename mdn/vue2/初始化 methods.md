# 初始化 methods

初始化 methods 时，只需要循环选项中的 methods 对象，并将每个属性依次挂载到 vm 上即可，相关代码如下：

```javascript
function initMethods (vm, methods){
  const props = vm.$options.props
  for(const key in methods){
    if(process.env.NODE_ENV !== 'production'){
      if(methods[key] == null){
        warn(`Method "${key}" has an undefined value in the component definition` + `Did you reference the function correctly?`,  vm)
      }
      if(props && hasOwn(props, key)){
        warn(`Method "${key}" conflicts with an existing Vue instance method.` + `Avoid defining component methods that start with _ or $.`)
      }
    }
    
    vm[key] = methods[key] == null? noop : bind(methods[key], vm)
  }
}
```

这里先声明一个变量 props，用来判断 methods 中的方法是否和 props 发生了重复，然后使用 for ... in 语句循环 methods 对象。

在循环中，主要逻辑分为两部分：

> 校验方法是否合法：
>
> 将方法挂载到  vm  中。

1、校验方法是否合法

在循环中会判断执行环境，在非生产环境下需要校验 methods  并在控制台发出警告。



当 methods 的某个方法只有 key 没有 value 时，会在控制台发出警告，如果 methods 中的某个方法已经在 props 中声明过了，会在控制台发出警告。如果  methods 中的方法已经存在于 vm 中，并且方法名是以  $ 或 _ 开头的，也会在控制台发出警告。

这里 isReserved  函数的作用是判断字符串是否以  $ 或 _  开头。

2、将方法挂载到 vm 中

将方法赋值到  vm 中很简单，详见  initMethods  方法的最后一行代码。其中会判断方法  ( methods[key] )是否存在：如果不存在，则将  noop 赋值到  vm[key] 中；如果存在，则将该方法通过 bind  改写它的  this  后，再赋值到 vm[key]  中。



这样，我们就可以通过  vm.x  访问到  methods 中的  x  方法了。

