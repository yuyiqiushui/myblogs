# 初始化 data

提到 data，那么相信大家都不陌生，我们在使用 Vue.js 开发项目的过程中经常会用它来保存一些数据。那么，data 内部究竟是怎样的呢？



简单来说，data 中的数据最终会保存到  vm._data 中。

然后在 vm 上设置一个代理，使得通过 vm.x 可以访问到 vm._data 中的 x 属性。最后由于这些数据并不是响应式数据，所以需要调用 observe 函数将 data 转换成 响应式数据。于是，data 就完成了初始化。



但在真正的代码中，需要增加一些条件，如果发现  data 的使用方式不正确，那么会在控制台打印出警告。初始化 data 的代码如下：

```javascript
function initData (vm){
  let data = vm.$options.data
  data = vm._data = typeof data === 'function'
 	? getData(data, vm) : data || {}
  
  if( !isPlainObject(data)){
    data = {}
    process.env.NODE_ENV !== 'production' && warn('data functions should return an object:\n' + 'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
    vm                                             
    )
  }
  
  //将 data 代理到 Vue.js 实例上。
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods
  
  let i = keys.length
  while(i--){
    const key = keys[i]
    if(process.env.NODE_ENV !== 'production'){
      if(methods && hasOwn(methods, key)){
        warn(`Method "${key}" has already been defined as a data property.`)
      }
    }
    
    if(props && hasOwn(props, key)){
      process.env.NODE_ENV !== 'production' && warn(`The data property "${key}" is already declared as a prop.` + `Use prop default value instead.`,
      vm                                             
      )
    } else if ( !isReserved(key) ){
      proxy(vm, `_data`, key)
    }
  }
  
  // 观察数据
  observe(data, true, /* asRootData */)
}
```

在上述代码中，我们首先从选项中得到 data ，并将其保存在 data 变量中。然后需要判断 data 的类型，如果是函数，则需要执行函数并将返回值赋值给变量  data 和 vm._data 。这里我们并没有见到函数  data 被执行，而是看到了函数 getData 被执行。其实，函数  getData 中的逻辑也是调用 data  函数并将值返回，只不过  getData 中有一些细节处理，比如 try ... catch 语句捕获  data  函数中有可能发生的错误等。



最终得到的 data 值应该是  Object 类型，否则就走非生产环境下在控制台打印出警告，并为 data 设置默认值，也就是空对象。



接下来要做的事情是将 data 代理到实例上。代码中首先声明了 3 个 变量： keys 、props 与 methods。接着循环 data ，其中先判断当前执行环境，如果不是生产环境，那么判断当前 循环的 key 是否存在于  methods 中，如果存在，那么说明数据重复了，在控制台打印警告。



然后以同样的方式判断  props 中是否存在某个属性与 key 相同，如果发现确实有相同的属性，那么在非生产环境下在控制台打印警告。



只有 props 中不存在当前与 key 相同的属性时，才会将属性代理到实例上，前提是属性名不能以  $  或  _  开头。



如果 data 中的 某个 key 与 methods 发生了重复，依然会将 data 代理到实例中，但如果与 props 发生了重复，则不会将 data 代理到实例中。



代码中调用了 proxy 函数实现代理功能。该函数的作用是在第一个参数上设置一个属性名为第三个参数的属性。这个属性的修改和获取操作实际上针对的是与第二个参数相同属性名的属性。proxy的代码如下：



```javascript
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

export function proxy (target, sourceKey, key){
  sharedPropertyDefinition.get = function proxyGetter (){
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val){
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
```

这里先声明了一个变量 sharedPropertyDefinition 作为默认属性描述符。



接下来声明了 proxy 函数，此函数接收 3 个参数： target、sourceKey  和 key。随后在代码中设置了 get  和  set  属性，相当于给属性提供了  getter  和  setter 方法。在  getter 方法中读取了  `this[sourceKey][key]`  ，在  setter  方法中设置了  `this[sourceKey][key]`  属性。最后，使用  object.defineProperty  方法为  target  定义一个属性，属性名为  key  ，属性描述符为  sharedPropertyDefinition。



通过这样的方式将  vm._data  中的方法代理到  vm  上。所有属性都代理后，执行 observe  函数将数据转换成响应式的。关于如何将数据转换成响应式数据，我们在第 2 章中介绍过。