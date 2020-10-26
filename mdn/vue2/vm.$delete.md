# vm.$delete

vm.$delete 的作用是删除数据中的某个属性。由于 Vue.js 的变化侦测是使用 Object.defineProperty 实现的，所以如果数据是使用 delete 关键字删除的，那么无法发现数据发生了变化。

为了解决这个问题， Vue.js 提供了  vm.$delete 方法来删除数据中的某个属性，并且此时 Vue.js 可以侦测到数据发生了变化。

## 1、用法

vm.$delete 的用法如下

```javascript
vm.$delete( target, key )
```

> 参数：
>
> { Object | Array }  target
>
> { string | number } key/index

------

说明：仅在 2.2.0+ 版本中支持 Array + index 的用法

------

> 用法：
>
> 删除对象的属性。如果对象是响应式的，需要确保删除能触发更新视图，这个方法主要用于避开 Vue.js 不能检测到属性被删除的限制，但是你应该很少会使用它。

在 2.2.0+ 中，同样支持在数组上工作。

------

注意：目标对象不能是 Vue.js 实例 或 Vue.js 实例的根数据对象。

------



## 2、实现原理 

vm.$delete方法也是为了解决变化侦测的缺陷。在 ES6 之前，JavaScript 并没有办法侦测到一个属性在 object 中被删除，所以如果使用 delete 来删除一个属性，Vue.js 根本不知道这个属性被删除了。



那么，怎么样才能让 Vue.js 知道我们删除了一个属性或者从数组中删除了一个元素呢？答案是使用 vm.$delete 。它帮助我们在删除属性后自动向依赖发送消息。通知 Watcher 数据发生了变化。



如果你非要使用  delete 来删除属性，那么我告诉你一个特别取巧的方法，虽然我并不推荐你这么做：

```javascript
delete this.obj.name
this.obj.__ ob __.dep.notify()  //手动向依赖发送变化通知
```



使用 delete 删除属性后， Vue.js 虽然不知道属性被删除了，但是我们知道，我们替 Vue.js 触发了消息。



我强烈不推荐这样写代码，这里主要是为了讲解 vm.$delete 的原理



其实，vm.$delete 内部的实现原理 和上面例子中写的代码非常类似，就是删除属性后向依赖发消息：

```javascript
import {del} from '../observer/index'
Vue.prototype.$delete = del
```

上面的代码先在  Vue.js 的原型上挂载 $.delete 方法。而 del 函数的定义如下：

```javascript
export function del (target, key) {
	const ob = target.__ ob __
	delete target[key]
	ob.dep.notify()
}
```

这里先从 target 中将属性 key 删除，然后向依赖发送消息。

接下来，要处理数组的情况：

```javascript
export function  del (target, key){
	//新增
	if(Array.isArray(target) && isValidArrayIndex(key)){
		target.splice(key,1)
		return 
	}
	const ob = (target).__ ob __
	delete target[key]
	ob.dep.notify()
}
```

数组的处理逻辑 和 vm.$set 中差不多，不过没那么复杂。因为只需要处理删除的情况，所以只需要使用 splice 将参数 key 所指定的索引位置的元素删除即可。因为使用了 splice方法，数组拦截器会自动向依赖发送通知。

 

与 vm.$set 一样;

Vm.$delete 也不可以在 Vue.js 实例或者 Vue.js 实例的根数据对象上使用。



因此，我们需要对这种情况进行判断：

```javascript
export function del (target, key){
	if(Array.isArray(target) && isValidArrayIndex(key)){
		target.splice(key,1)
		return
	}
	const ob = (target).__ ob __
  
  //新增
  if(target.isVue || (ob && ob.vmCount)){
    process.env.NODE_ENV !== 'production' && warn(
    	'Avoid deleting properties on a Vue instance or its root $data ' + '- just set it to null.'
    )
  }
	delete target[key]
	ob.dep.notify()
}
```

上面的代码中新增了判断逻辑：如果 target 上有 _isVue 属性 (target 是 Vue.js 实例)或者 ob.vmCount 数量大于 1 (target 是根数据)，则直接返回，终止程序继续执行，并且如果是开发环境，会在控制台中发出警告。



如果删除的这个 key 不是 target 自身的属性，就什么都不做，直接退出程序执行：

```javascript
export function del (target, key){
	if(Array.isArray(target) && isValidArrayIndex(key)){
		target.splice(key, 1)
		return
	}
	
	const ob = target.__ ob __
	if(target.isVue || (ob && ob.vmCount)){
		process.env.NODE_ENV !== 'production' && warn(
			'Avoid deleting properties on a Vue instance or its root $data' + '- just set it to null.'
		)
		return
	}
	
	//如果 key 不是 target 自身的属性，则终止程序继续执行
	if( !hasOwn(target, key)){
		return
	}
	delete target[key]
	ob.dep.notify()
}
```

如果删除的这个 key 在target中根本不存在，那么其实并不需要删除操作，也不需要向依赖发送通知。



最后，还要判断 target 是不是一个响应式数据，也就是说压迫判断 target 身上存不存在 __ ob __ 属性。只有响应式数据才需要发送通知，非响应式数据只需要执行删除操作即可。



下面这段代码新增了判断条件，如果数据不是响应式的，则使用 return 语句阻止执行发送通知的语句：



```javascript
export function del (target, key){
	if(Array.isArray(target) && isValidArrayIndex(key)){
		target.splice(key, 1)
		return
	}
	const ob = target.__ ob __
	if(target._isVue || (ob && ob.vmCount)){
		process.env.NODE_ENV !== 'production' && warn(
			'Avoid deleting properties on a Vue instance or its root $data' + '- just set it to null'	
		)
		return
	}
	
	//如果 key 不是 target 自身的属性，则终止程序继续执行
	if(!hasOwn(target, key)){
		return 
	}
	delete target[key]
	ob.dep.notify()
}

```

如果删除的这个 这个 key 在 target 中根本不存在，那么其实并不需要进行删除操作，也不需要向依赖发送通知。

最后，还要判断 target 是不是一个响应式数据，也就是说要判断 target 身上存不存在 __ ob __ 属性。只有响应式数据才需要发送通知，非响应式数据只需要执行删除操作即可。



下面这段代码新增了判断条件，如果数据不是响应式的，则使用 return 语句阻止执行发送通知的语句：

```javascript
export function del (target, key){
	if(Array.isArray(target) && isValidArrayIndex(key)){
		target.splice(key, 1)
		return 
	}
	const ob = target.__ ob __
	if(target._isVue || (ob && ob.vmCount)){
		process.env.NODE_ENV !== 'production' && warn(
			'Avoid deleting properties on a Vue instance its root $data' + '- just set it to null.'
		)
		return
	}
	
	if(!hasOwn(target, key)){
		return 
	}
	delete target[key]
	
	//如果 ob 不存在，则直接终止程序
	if(!ob){
		return
	}
	ob.dep.notify()
}
```

在上面的代码中，我们在删除属性后判断 ob 是否存在，如果不存在，则直接终止程序，继续执行下面发送变化通知的代码。



## 总结

本章中，我们详细介绍了变化侦测相关 API 的内部实现相关原理。



我们先介绍了 vm.$watch 的内部实现及其相关参数的实现原理，包括 deep、immediate和 unwatchable。



随后介绍了 vm.$set 的内部实现。这里介绍了几种情况，分别为 Array 的处理逻辑，key 已经存在的处理逻辑，以及最重要的新增属性的 处理逻辑。



最后，介绍了 vm.$delete 的内部实现原理。