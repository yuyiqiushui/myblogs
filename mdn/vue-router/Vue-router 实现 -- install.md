Vue-router 实现 -- install

Vue 通过 use 方法，加载  VueRouter 中的  install 方法。install 完成  Vue  实例对  VueRouter   

的挂载过程。下面我们来分析一下具体的执行过程。

```js
export function install (Vue) {
  //混入 beforeCreate 钩子
  Vue.mixin({
    beforeCreate (){
      // 在 option 上面存在  router 则代表根组件
      if( isDef(this.$options.router) ){
				this._routerRoot = this
        this._router = this.$options.router
        //执行 _router 实例的 init 方法
        this._router.init( this )
        // 为 Vue 实例定义数据劫持
        Vue.util.defineReactive( this, '_route', this._router.history.current )
      } else {
        // 非根组件则直接从父组件中获取
        this._routerRoot = ( this.$parent && this.$parent._routerRoot ) || this;
      }
      registerInstance( this, this )
    }
    
    destroyed () {
			registerInstance( this )
  	}
  })
  
  // 设置代理，当访问 this.$router 的时候，代理到 this._routerRoot._router
  Object.defineProperty( Vue.prototype, '$router', {
    get () {
      return this._routerRoot._router
    }
  })

 //设置代理，当访问 this.$route 的时候，代理到 this._routerRoot._route
	Object.defineProperty( Vue.prototype, '$route', {
    get () {
      return this._routerRoot._route
    }
  })

	// 注册 router-view 和 router-link 组件
 	Vue.component('RouterView' , View )
	Vue.component('RouterLink' , Link )

	// Vue 钩子合并策略
  const  strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
  // ...
}
```

在构造 `Vue` 实例的时候，我们会传入 `router`  对象：

```js
new  Vue({
  router
})
```

此时的 `router`  会被挂载到 Vue 的根组件 `this.$options`  选项中。在  option 上面存在  router  则代表是根组件。如果存在  `this`  , 则对  `_routerRoot`  和 `_router`  进行赋值操作，之后执行  `_router.init()`  方法。



为了让  _router  的变化能及时响应页面的更新，所以又接着又调用了了  `Vue.util.defineReactive`  方法来进行  `get`  和  `set`  的响应式数据定义。



然后通过  `registerInstance( this, this )` 这个方法来实现对  `router-view`  的挂载操作：

```js
// 执行 vm.$options._parentVnode.data.registerRouteInstance  渲染 router-view 组件
const  registerInstance = ( vm, callVal ) => {
	let i = vm.$options._parentVnode
  if( isDef(i) && isDef( i = i.data ) && isDef( i = i.registerRouteInstance)) {
    i( vm, callVal )
  }
}
```

因为只有 router-view 组件定义了  `data.registerRouteInstance`  函数。 `data.registerRouteInstance `  主要用来执行  render  的操作，创建  router-view 组件的  V node:

```js
data.registerRouterInstance = ( vm, val )  => {
  // ...
  return  h( component, data, children )
}
```

后续步骤便是为  Vue  全局实例注册 2 个属性分 `$router`  和  `$route`  ; 以及组件  `RouterView`  和  `RouterLink` 。

关于`Vue.config.optionMergeStrategies` 参考 [自定义选项合并策略](https://cn.vuejs.org/v2/guide/mixins.html#自定义选项合并策略)。下一篇我们会接着介绍一下 VueRouter 实例化的过程
有兴趣可以移步[vue-router 实现 -- new VueRouter(options)](https://github.com/muwoo/blogs/issues/24)

