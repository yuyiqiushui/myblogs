# Vue-router  实现  --  new  VueRouter( options )

为了构造出  `router`  对象，我们还需要对  `VueRouter`  进行实例化的操作，比如这样：

```js
const  router = new  VueRouter({
  mode: 'history',
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/foo', name: 'foo', component: Foo },
    { path: '/bar/:id', name: 'bar', component: Bar },
  ]
})
```

## constrctor

我们来看下在 `VueRouter`  内部的源码定义：

```js
export  default  class  VueRouter {
  // ...
  constructor ( options: RouterOptions = {}) {
    this.app = null
    this.apps = []
    this.options = options
    this.beforeHooks = []
    this.resolveHooks = []
    this.afterHooks = []
    this.matcher = createMatcher( options.routes || [], this )
    
    let mode = options.mode  ||  'hash'
    this.fallback = mode === 'history' && !supportsPushState && options.fallback  !== false
    
    if( this.fallback ){
      mode = 'hash'
    }
    if ( !inBrowser ){
      mode = 'abstracct'
    }
    this.mode = mode
    
    switch (mode) {
      case 'history': 
        this.history = new HTML5History( this, options.base )
        break
      case 'hash':
        this.history = new HashHistory( this, potions.base, this.fallback)
        break
      case 'abstract':
        this.history = new AbstractHistory( this, options.base )
        break
      default:
        if ( process.env.NODE_ENV !== 'production') {
          assert( false, `invalid mode: ${mode}`)
        }
    }
  }

	match ( 
    raw: RawLocation ,
    current?: Route,
    redirectedFrom?: Location
  ): Route {
    return this.matcher.match( raw,  current,  redirectedFrom )
  }

	get  currentRoute () : ?Route {
		return this.history  &&  this.history.current
  }

	init () {}
	beforeEach () {}
	afterEach () {}
	onReady () {} onError () {}
  push () {}
  replace () { }
  go () {}
  back () { }
  forward () { }
  getMatchedComponents () { }
  resolve ( ) { }
  addRoutes () { }
}
```

这里我们忽略了大部分的函数实现，后面我么再展开来看。先来看一下`constructor`实例化的时候将会做的处理：通过`new VueRouter({...})`我们创建了一个` VueRouter` 的实例。VueRouter中通过参数`mode`来指定路由模式，前面已经简单的了解了一下前端路由的2种模式。通过上面的代码，我们可以看出来 `VueRouter`对不同模式的实现大致是这样的：

1. 首先根据`mode`来确定所选的模式，如果当前环境不支持`history`模式，会强制切换到hash模式；
2. 如果当前环境不是浏览器环境，会切换到`abstract`模式下。然后再根据不同模式来生成不同的history操作对象。

由于上篇文章已经介绍了在 install 的过程中，会执行改对象的 init 函数。我们接下来的主要任务就是分析init 的实现。

## init

```js
init ( app : any /* Vue component instance */ ) {
  // ...
  this.apps.push( app )
  // main  app  already initialized
  if( this.app ){
    return 
  }
  this.app = app
  const  history = this.history
  if( history instanceof HTML5History ){
    history.transitionTo( history.getCurrentLocation() )
  } else if ( history instanceof HashHistory ) {
    const setupHashListener = () => {
      history.setupListeners()
    }
    history.transitionTo(
    	history.getCurrentLocation(),
      setupHashListener,
      setupHashListener
    )
  }
  
  history.listen(route => {
    this.apps.forEach( (app) => {
      app._route = route
    })
  })
}
```

回顾一下在 inistall 的 beforCreate 钩子内，我们通过这种方式调用了实例的`init`方法：

```js
this._router.init(this)
```

然后我们来分析一下执行的大致过程：init 方法内的 `app`变量便是存储的当前的vue实例的`this`。然后将 app 存入数组`apps`中。通过`this.app`判断是实例否已经被初始化。然后通过`history`来确定不同路由的切换动作动作` history.transitionTo`。最后通过` history.listen`来注册路由变化的响应回调。
接下来我们就要了解一下 `history.transitionTo`的主要流程以及 `history.listen`的实现。当然最基础的是先明白`history`是个什么东西。接下来我们会分别介绍不同`mode`下的 history 的实现。