# 初始化 inject

inject 和 provide 通常是成对出现的，我们使用  Vue.js 开发应用时很少用到它们。这里先简单介绍它们的作用

## provide / inject 的使用方式

------

说明   provide 和 inject 主要为高阶插件/组件库提供用例，并不推荐直接用于程序代码中。

------

inject 和 provide 选项需要一起使用，它们允许祖先组件向其所有子孙后代注入依赖，并在其上下游关系成立的时间里始终生效 (不论组件层次有多深 )。如果你熟悉 React ，会发现这与它的上下文特性很相似。



provide 选项应该是一个对象或返回一个对象的函数。该对象包含可注入其子孙的属性，你可以使用 ES2015 Symbol 作为 key，但是这只在原生支持 Symbol 和 Reflect.ownKeys 的环境下可工作。



inject 选项应该是一个字符串数组或对象，其中对象的 key 是本地的绑定名， value 是一个 key ( 字符串或 Symbol ) 或对象，用来在可用的注入内容中搜索。



如果是对象，那么它有如下两个属性：

- name：它是在可用的注入内容中用来搜索的  key ( 字符串或 Symbol )

- default: 它是在降级的情况下使用的  value。

------

说明： 可用的注入内容指的是祖先组件通过 provide 注入了内容，子孙组件可以通过 inject 获取祖先组件注入的内容。

------

示例入下：

```javascript
var Provider = {
  provide: {
    foo: 'bar'
  }
  // .......
}

var Child = {
  inject: ['foo'],
  created (){
    console.log(this.foo)  //  => "bar"
  }
  // .......
}
```

如果使用 ES2015 Symbol 作为 key，则 provide 函数和 inject 对象如下表示：

```javascript
const s = Symbol
const Provider = {
  provide (){
    return {
      [s]: 'foo'
    }
  }
}

const Child = {
  inject: { s },
  // .......
}
```

并且可以在 data/props 中访问注入的值。例如，使用一个注入的值作为  props 的默认值：

```javascript
const Child = {
  inject : ['foo'],
  props: {
    bar: {
      default (){
        return this.foo
      }
    }
  }
}
```

或者使用一个注入的值作为数据入口：

```javascript
const Child = {
  inject: ['foo'],
  data (){
    return {
      bar: this.foo
    }
  }
}
```

在 Vue.js 2.5.0+ 版本中，可以通过设置 inject 的默认值使其变成可选项“

```javascript
const Child = {
  inject: {
    foo: {
      default: 'foo'
    }
  }
}
```

如果它需要从一个不同名字的属性注入，则使用 from 来表示其源属性：

```javascript
const Child = {
  inject: {
    foo: {
      from: 'bar',
      default: 'foo'
    }
  }
}
```

上面代码表示祖先组件注入的名字是  bar，子组件将内容注入到  foo 中，在子组件中可以通过  `this.foo`  来访问内容。



inject 的默认值与 props 的默认值类似，我们需要对非原始值使用一个工厂方法：

```javascript
const Child = {
  inject: {
    foo: {
      from : 'bar'
      default: () => [1, 2, 3]
    }
  }
}
```

## inject 的内部原理

我相信你现在已经大概了解了  inject  和 provide 的作用，接下来将详细介绍  inject  的内部实现原理。

虽然 inject 和 provide 是成对出现的，但是二者在内部的实现是分开处理的，先处理 inject 后处理 provide。从图 14-2 中也可以看出，inject 在 data/props 之前初始化，而 provide 在 data/props 后面初始化。这样做的目的是让用户可以在  data/props 中使用  inject 所注入的内容。也就是说，可以让  data/props 依赖 inject ，所以需要将初始化 inject 放在初始化  data/props  的前面。



通过前面的介绍我们得知，通过 provide 注入的内容可以被所有子孙组件通过 inject 得到。



很明显，初始化 inject ，就是使用 inject 配置的  key  从当前组件读取内容，读不到则读取它的父组件，以此类推。它是一个自底向上获取内容的过程，最终将找到的内容保存到实例  ( this ) 中，这样就可以直接在  this  上读取通过  inject  导入的注入内容。



从图  14-2 中可以看出初始化  inject 的方法叫做  initInjections ，其代码如下：

```javascript
export function initInjections (vm){
  const result = resolveInject(vm.$options.inject, vm)
  if(result){
    observerState.shouldConver = false
    Object.keys(result).forEach(key => {
      defineReactive(vm, key, result[key])
    })
    
    observerState.shouldConvert = true
  }
}
```

其中，resolveInject 函数的作用是通过用户配置的  inject ，自底向上搜索可用的注入内容，并将搜索结果返回。上面的代码将注入结果保存到  result  变量中。



接下来，循环  result  并依次调用  defineReactive  函数 ( 该函数在第二章中介绍过 ) 将它们设置到  Vue.js  实例上。



代码中有一个细节需要注意，在循环注入内容前，有一行代码是：

```javascript
oberserState.shouldConvert = false
```

其作用是通知 defineReactive 函数不要将内容转换成响应式。其原理也很简单，在将值转换成响应式之前，判断 observerState.shouldConvert 属性即可，这里不再详细介绍。



接下来，我们主要看  resolveInject  的实现原理，它是如何自底向上搜索可用的注入内容的呢？



事实上，实现这个功能的主要思想是： 读出用户在当前组件中设置的  inject  的  key ，然后循环  key ，并将每一个  key  从当前组件起，不断向父组件查找是否有值，找到了就停止循环，最终将所有 key 对应的值一起返回即可。



按照上面的思想， resolveInject  函数最初的代码是下面这样的：

```javascript
export function resolveInject (inject, vm){
  if( inject ) {
    const result = Object.create(null)
    //做些什么
    return result
  }
}
```

第一步要做的事情是获取  inject  的 key 。 provide/injec 可以支持 Symbol ，但它只在原生支持  Symbol 和 Reflect.ownKeys 的环境下才可以工作，所以获取  key 需要考虑到  Symbol	的情况，此时代码如下：

```javascript
export function resolveInject (inject, vm){
  if( inject ){
    const result = Object.create(null)
    const keys = hasSymbol
    ? Reflect.ownKeys(inject).filter( key => {
      return Object.getOwnPropertyDescriptor( inject, key ).enumerable
    })
    
    : Object.keys(inject)
  }
  return result
}
```

如果浏览器原生支持  Symbol ，那么使用 Reflect.ownKeys 读取出 inject 的所有 key；如果浏览器原生不支持  Symbol ，那么使用 Object.keys 获取  key。其区别是 Reflect.ownKeys 可以读取  Symbol 类型的属性，而 Object.keys 读不出来。由于通过 Reflect.ownKeys 读出的 key 包括不可枚举的属性，所以代码中需要使用  filter 将不可枚举的属性过滤掉。



Reflect.ownKeys 有一个特点，他可以返回所有自有属性的键名，其中字符串类型和 Symbol 类型都包含在内。而 Object.getOwnPropertyNames 和 Objec.keys 返回的结果不会包含  Symbol 类型的属性名， Object.getOwnPropertySymbols 方法又只返回 Symbol 类型的属性。



所以，如果浏览器原生支持  Symbol，那么 Reflect.ownKeys 是比较符合我们目标的一个  API。它的返回值会包含所有类型的属性名，我们唯一需要做的事就是使用  filter 将不可枚举的属性过滤掉。



如果浏览器元素不支持  Symbol，那么 Object.keys 是比较符合目标的  API，因为它仅返回自身可枚举的全部属性名，而 Object.getOwnPropertyNames 会把不可枚举的属性名也返回。



得到了用户设置的 inject 的所有属性名之后，就可以循环这些属性名，自底向上搜索值，这可以使用 while 循环实现，其代码如下：

```javascript
export function resolveInject (inject, vm){
  if( inject ){
    const result = Object.create(null)
    const keys = hasSymbol ? Reflect.ownKeys(inject).filter( key => {
      return Object.getOwnPropertyDescriptor(inject, key).enumable
    })
    : Object.keys(inject)
    
    
    for(let i = 0; i< keys.length; i++){
      const key = keys[i]
      const provideKey = inject[key].from
      let source = vm
      while (source){
        if(source._provided && provideKey in source.provided){
          result[key] = source._provided[provideKey]
          break
        }
        source = source.$parent
      }
    }
    return result
  }
}
```

在上述代码中，最外层使用 for 循环  key ，在循环体内可以得到每一次 key 值，并通过  from 属性得到  provide 源属性。然后通过源属性使用 while 循环来搜索内容。最开始 source 等于当前组件实例，如果原始属性在 source 的 `_provide` 中能找到对应的值，那么将其设置到 result 中，并使用 break 跳出循环。否则，将 source 设置为父组件实例进行下一轮循环，以此类推。

------

注意： 当使用 provide 注入内容时，其实是将内容注入到当前组件实例的 _provide 中，所以 inject 可以从父组件实例的 _provide 中获取注入的内容。

通过这样的方式，最终会在祖先组件中搜索到 inject 中设置的所有属性的内容。

------

细心的同学会发现，inject 其实还支持数组的形式，如果用户将 inject 的值设置为数组，那么 inject 中是没有 from 属性的，此时这个逻辑是不是有问题？



其实是没问题的，因为当 Vue.js 被实例化时，会在上下文 ( this ) 中添加 `$options`  属性，这会把用户提供的数据规格化，其中就包括  inject



也就是说， Vue.js 在实例化的第一步是规格化用户传入的数据，如果  inject 传递的内容是数组，那么数组会被规格化成对象并存放在  from 属性中。



例如，用户设置的  inject 是这样的：

```javascript
{
  inject: [foo]
}
```

它被规格化之后是下面这样的：

```javascript
{
  inject: {
    foo: {
      from: 'foo'
    }
  }
}
```

不论是数组形式还是对象中使用 from 属性的形式，本质上其实是让用户设置原属性名与当前组件中的属性名。如果用户设置的是数组，那么就认为用户是让两个属性名保持一致。



现在，我们就可以搜索所有祖先组件注入的内容了。但是通过前面的介绍，我们知道  inject  是支持默认值的。也就是说，在所有祖先组件实例中都搜索不到注入内容时，如果用户设置了默认值，那么将使用默认值。



要实现这个功能，我们只需要在 while 循环结束时，判断 source 是否为 false ，相关代码如下：

```javascript
export function resolveInject (inject, vm){
  if( inject ){
    const result = Object.create( null )
    const keys = hasSymbol ? Reflect.ownKeys(inject).filter( key => {
      return Object.getOwnPropertyDescriptor(inject, key).enumable
    })
    : Object.keys(inject)
    
    for( let i =0 ;i<keys.length;i++){
      const key = keys[i]
      const provideKey = inject[key].from
      let source = vm
      while (source){
        if (source._provided && provideKey in source._provided){
          result[key] = source._provided[provideKey]
          break
        }
        source = source.$parent
      }
      
      if( !source){
        if('default' in inject[key]){
          const provideDefault = inject[key].default
          result[key] = typeof provideDefault === 'function' ?
            provideDefault.call(vm)
          : provideDefault
        } else if ( process.env.NODE_env !=== 'production' ){
          warn(`Injection "${key}" not found`, vm)
        }
      }
    }
    return result
  }
}
```

上面的代码新增了默认值相关的逻辑，如果 `!source` 为 true，那么判断  inject[key]  中是否存在  default 属性。如果存在，则当前  key  的结果是默认值。这里有一个细节需要注意，那就是默认值支持函数，所以需要判断默认值的类型是不是函数，是则执行函数，将函数的返回值设置给 result[key]。



如果 inject[key] 中不存在 default 属性，那么会在非生产环境下的控制台中打印警告。