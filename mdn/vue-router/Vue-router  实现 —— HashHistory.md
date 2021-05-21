# Vue-router  实现 —— HashHistory

因为我们用的比较多的是 Vue 的 HashHistory。下面我们首先来介绍一下 HashHistory。我们知道，通过 `mode`  来确定使用  `history`  的方式，如果当前 `mode='hash'`  ，则会执行：

```js
this.history = new  HashHistory( this, options.base, this.fallback )
```

  `this.fallback`  是用来判断当前  `mode='hash'`  是不是通过降级处理的：

```js
this.fallback = mode === 'history' && !supportsPushState && options.fallback !== false
```

接下来我们看看  `HashHistory`  的内部实现，首先是看一下  `new  HashHistory()`  的时候，实例化做了哪些事：

## constructor 

```js
// 继承 History 基类
export class HashHistory  extends  History {
  constructor ( router: VueRouter, base: ?string, fallback: boolean ) {
    // 调用基类构造器
    super( router， base )
    
    // 如果是从 history 模式降级来的
    // 需要做降级检查
    if( fallback && this.checkFallback ){
      // 如果降级 且 做了降级处理  则什么也不需要做
      return
    }
    
    // 保证 hash 是以 / 开头
    ensureSlash()
    //....
  }
}

function  checkFallback (base) {
  // 得到除去 base 的真正的 location 值
  const  location = getLocation( this.base )
  if( !/^\/#/.test( location ) ) {
    // 如果说此时的地址不是以  /#  开头的
    // 需要做一次降级处理  降级为  hash  模式下应有的  /#  开头
    window.location.replace(
    	cleanPath( this.base + '/#' + location )
    )
    return true
  }
}

// 保证  hash  以  /  开头
function  ensureSlash () : boolean {
  // 得到 hash 值
  const path = getHash()
  // 如果说是以  /  开头的   直接返回即可
  if( path.charAt(0) === '/' ){
    return  true
  }
  // 不是的话  需要手工保证一次  替换  hash  的值
  replaceHash('/' + path )
  return  false
}

export function getHash () : string {
  // 因为兼容性问题 这里没有直接使用 window.location.hash
  // 因为 Firefox decode hash 值
  const href = window.location.href
  const index = href.indexOf('#')
  // 如果此时没有 # 则返回 ''
  // 否则 取得 # 后的所有内容
  return index === -1 ? '' : href.slice(index + 1)
}


```

 可以看到在实例化的过程中主要做两件事情：针对不支持  `history  api ` 的降级处理，以及保证默认进入的时候对应的  hash  值是以  /  开头的，如果不是则替换。

如果细心点，可以发现这里并没有对  `hashchange `  事件做处理。主要是因为这个问题：[beforeEnter fire twice on root path ('/') after async next call](https://github.com/vuejs/vue-router/issues/725)。

简单来说就是说如果在 `beforeEnter `  这样的钩子函数中是异步的话，`beforeEnter`  钩子就会被触发两次，原因是因为在初始化的时候如果此时的  hash  值不是以  /  开头的话就会补上  #/ ，这个过程会触发  `hashchange`  事件，所以会再走一次生命周期钩子，也就意味着会再次调用  `beforeEnter `    钩子函数。

## transitionTo

还记得  `init `  的时候，有这样的动作：

```js
if ( history  instanceof HTML5History ){
  history.transitionTo( history.getCurrentLocation() )
} else if ( history instanceof HashHistory ){
  const  setupHashListener = () => {
    history.setupListeners()
  }
  history.transitionTo(
  	history.getCurrentLocation(),
    setupHashListener,
    setupHashListener
  )
}
```

如果  `history`  是  `HashHistory`  的实例。则调用  `history `  的  `transitionTo`  方法。调用  `transitionTo`  的时候传入了 3个参数，第一个是 `history.getCurrentLocation()`  ，后面的都是   `setupHashListener`  。先来看一下  `getCurrentLocation`  ：

```js
getCurrentLocation () {
	return  getHash() 
}
```

  也就是返回了当前路径。接着是  `setupHashListener`  函数，其内部定义了  `history.setupListeners()`   的执行。后面我们在具体分析他所做的工作，我们现在只需要明白这几个参数的含义。

接下来我们来看一下  `transitionTo`  的实现：

```js
transitionTo ( location: RawLocation, onComplete?: Funtion, onAbort?: Function ) {
  const route = this.router.match( location, this.current )
  this.confirmTransition( route, () => {
    this.updateRoute( route )
    onComplete && onComplete ( route )
    this.ensureURL()
    
    // fire  ready  cbs  once
    if( !this.ready ){
      this.ready = true
      this.readyCbs.forEach( cb => { cb(route) })
    }
  }, err => {
    if( onAbort ){
      onAbort( err )
    }
    if( err && !this.ready ){
      this.ready = true
      this.readyErrorCbs.forEach( cb => { cb( err ) })
    }
  })
}
```

该函数执行的时候，先去定义了 `route`  变量：

```js
const route = this.router.match( location, this.current )
```

我们知道  `location`  代表了当前的  hash  路径。那么  `this.current`  又是什么呢？不要着急，我们找到  `this.current`  的定义：

```js
export function createRoute (
  record: ?RouteRecord,
  location: Location,
  redirectedFrom?: ?Location,
  router?: VueRouter
): Route {
  const stringifyQuery = router && router.options.stringifyQuery

  let query: any = location.query || {}
  try {
    // 一个深拷贝
    query = clone(query)
  } catch (e) {}

  const route: Route = {
    name: location.name || (record && record.name),
    meta: (record && record.meta) || {},
    path: location.path || '/',
    hash: location.hash || '',
    query,
    params: location.params || {},
    fullPath: getFullPath(location, stringifyQuery),
    matched: record ? formatMatch(record) : []
  }
  if (redirectedFrom) {
    route.redirectedFrom = getFullPath(redirectedFrom, stringifyQuery)
  }
  return Object.freeze(route)
}

export const START = createRoute(null, {
  path: '/'
})

this.current = START
```

`this.current`  就是 ` START`  ，通过 `createRoute`  来创建返回。注意返回的是通过 `Object.freeze`  定义的只读对象 route  。可以简单看一下大致返回的内容可能是这样的：

接着，我们会调用  `this.router.match `  方法，来获取  `route`  对象。来看一下  `match`

方法：

```js
this.matcher = createMatcher( options.routes || [], this )
match(
	raw: RawLocation,
  current?: Route,
  redirectedFrom?: Location
): Route {
  return this.matcher.match( raw, current, redirectedFrom )
}
```



```js
function match ( 
	raw: RawLocation, // 目标 url
  currentRoute?: Route, // 当前 url 对应的  route 对象
  redirectedFrom?: Location  //重定向
): Route {
  // 解析当前 url ，得到  hash、 path、query 和 name  等信息
  const  location = normalizeLocation( raw, currentRoute, false, router)
  const  { name } = location
  // 如果是命名路由
  if( name ){
    // 得到路由记录
    const record = nameMap[name]
    // 不存在记录  返回
    if(!record) return  _createRoute( null, location )
    const paramNames = record.regex.keys.filter( key => !key.optional ).map( key => key.name )
  }
    
  if( typeof location.params !== 'object' ) {
    location.params = {}
  }
    
  // 复制  currentRoute.params 到  location.params
  if( currentRoute && typeof  currentRoute.params === 'object' ){
    for( const key in currentRoute.params ){
      if( !(key in location.params) &&  paramNames.indexOf(key) > -1 ) {
        location.params[key] = currentRoute.params[key]
      }
    }
  }
    
  // 如果存在  record  记录
  if ( record ) {
    location.path = fillParams ( record.path, location.params, `named route "${name}"`)
    return _createRoute( record, location, redirectedFrom )
  }
} else if ( location.path ) {
	// 处理非命名路由
  location.params = {}
  // 这里会遍历  pathList，找到合适的 record ，因此命名路由的 record 查找效率更高。
  for (let i = 0; i < pathList.length; i++ ){
		const path = pathList[i]
    const record = pathMap[path]
    if( matchRoute( record.regex, location.path, location.params )) {
      return _createRoute( record, location, redirectedFrom )
    }
  }
  
  // 没有匹配到的情况
  return _createRoute( null, location )
}
```

这里可能需要理解下  `pathList`  、`pathMap`  、`nameMap`   这几个变量。他们是通过  `createRouteMap`  来创建的几个对象：

```js
const { pathList, pathMap, nameMap } = createRouteMap( routes )
```

routes 使我们定义的路由数组，可能是这样的：

```js
const  router = new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/foo', name: 'foo', component: Foo },
    { path: '/bar/:id', name: 'bar', component: Bar },
  ]
})
```

而 `createRouteMap `   主要作用便是处理传入的  ` routes `  属性，整理成 3 个对象：

### 1、nameMap

![](http://cdn.yuyiqiushui.cn/vuerouter-nameMap.png)

### 2、pathList

![](http://cdn.yuyiqiushui.cn/vuerouter-pathList.png)

### 3、pathMap

![](http://cdn.yuyiqiushui.cn/vuerouter-pathMap.png)

所以 `match`  的主要功能是通过目标路径匹配定义的  route 数据，根据匹配到的记录，来进行 `_createRoute`  操作。而 `_createRoute `  会根据  RouteRecord  执行相关的路由操作，，最后返回  Route  对象：

```js
function _createRoute (
	record: ?RouteRecord,
  location: Location,
  redirectedFrom?: Location
) : Route {
  // 重定向
  if ( record && record.redirect ) {
    return redirect( record, redirectedFrom || location )
  }
  // 别名
  if( record && record.matchAs) {
    return  alias( record, location, record.matchAs )
  }
    
  // 普通路由
  return  createRoute( record, location, redirectedFrom, router )
}
```

现在我们知道了  ` this.matcher.match `  最终返回的就是  ` Route `  对象。到这里，我们再回到之前所说的  `transitionTo`  方法：

```js
transitionTo ( location: RawLocation, onComplete?: Function, onAbort?: Function ) {
  // 匹配目标 url 的 route 对象
  const route = this.router.match( location, this.current )
  // 调用 this.confirmTransition， 执行路由转换
  this.confirmTransition( route, () => {
    // ... 跳转完成
    this.updateRoute( route )
    onComplete && onComplete( route )
    this.ensureURL()
    // fire  ready  cbs  once
    if ( !this.ready ) {
      this.ready = true
      this.readyCbs.forEach( cb => { cb(route) })
    }
  }, err => {
    // ...处理异常
  })
}
```

得到正确的路有对象 ` route ` 后，我们开始跳转动作 ` confirmTransition `  。接下来看看  ` confirmTransition `  的主要操作：

##  confirmTransition 

```js
confirmTransition ( route: Route, onComplete: Function, onAbort?: Function ) {
	const  current = this.current
  // 定义中断处理
  const abort = err => {
    // ...
    onAbort && onAbort( err )
  }
  
  // 同路由且  matched.length 相同
  if (
  	isSameRoute( route, current ) && 
    // in the case the route map has been dynamically appended to
    route.matched.length === current.matched.length
  ) {
    this.ensureURL()
    return abort()
  }
  
  const { updated, deactivated, activated } = resolveQueue( this.current.matched, route.matched )
  
  // 整个切换周期的队列
  const queue: Array <?NavigationGuard> = [].concat(
  	// 得到即将被销毁组件的  beforeRouteLeave 钩子函数
    extractLeaveGuard( deactivated ),
    // 全局 router  before  hooks
    this.router.beforeHooks,
    // 得到组件  updated 钩子
    extractUpdateHooks( updated ),
    // 将要更新的路由的 beforeEnter  钩子
    activated.map( m => m.beforeEnter ),
    // 异步组件
    resolveAsyncComponents( activated )
  )
  
  this.pending = route
  // 每一个队列执行的 iterator 函数
  const iterator = ( hook : NavigationGuard , next ) => {
    // ...
  }
  
  // 执行队列  leave  和  beforeEnter  相关钩子
  runQueue( queue, iterator, () => {
    // ...
  })
}
```

这里有一个很关键的路由对象的  matched  实例，从上次大的分析中可以知道它就是匹配到的路由记录的合集；这里从执行顺序上来看有这些  ` resolveQueue `  、` extractLeaveGuards `  、` extractUpdateHooks` 、 ` resolveAsyncComponents`  、 ` runQueue `  关键方法。我们先来看看 `resolveQueue`  方法：

### 1、resolveQueue

```js
function resolveQueue (
  current: Array<RouteRecord>,
  next: Array<RouteRecord>
): {
  updated: Array<RouteRecord>,
  activated: Array<RouteRecord>,
  deactivated: Array<RouteRecord>
} {
  let i
  // 取得最大深度
  const max = Math.max(current.length, next.length)
  for (i = 0; i < max; i++) {
    // 如果记录不一样则停止
    if (current[i] !== next[i]) {
      break
    }
  }

  // 分别返回哪些需要更新，哪些需要激活，哪些需要卸载
  return {
    updated: next.slice(0, i),
    activated: next.slice(i),
    deactivated: current.slice(i)
  }
}
```

可以看出 ` resolveQueue `  就是交叉比对当前路由的路由记录和现在的这个路由的路由记录来确定出哪些组件需要更新，哪些需要激活，哪些组件被卸载。再执行其中的对应钩子函数。

### 2、extractLeaveGuards/extractUpdateHooks

```js
function extractLeaveGuards (deactivated: Array<RouteRecord>): Array<?Function> {
  return extractGuards(deactivated, 'beforeRouteLeave', bindGuard, true)
}

function extractGuards (
  records: Array<RouteRecord>,
  name: string,
  bind: Function,
  reverse?: boolean
): Array<?Function> {
  const guards = flatMapComponents(records, (def, instance, match, key) => {
    // 获取组建的 beforeRouteLeave 钩子函数
    const guard = extractGuard(def, name)
    if (guard) {
      return Array.isArray(guard)
        ? guard.map(guard => bind(guard, instance, match, key))
        : bind(guard, instance, match, key)
    }
  })
  return flatten(reverse ? guards.reverse() : guards)
}

function extractGuard (
  def: Object | Function,
  key: string
): NavigationGuard | Array<NavigationGuard> {
  if (typeof def !== 'function') {
    // extend now so that global mixins are applied.
    def = _Vue.extend(def)
  }
  return def.options[key]
}

export function flatMapComponents (
  matched: Array<RouteRecord>,
  fn: Function
): Array<?Function> {
  return flatten(matched.map(m => {
    // 遍历得到组建的 template, instance, macth，和组件名
    return Object.keys(m.components).map(key => fn(
      m.components[key],
      m.instances[key],
      m, key
    ))
  }))
}

// 抹平数组得到一个一维数组
export function flatten (arr: Array<any>): Array<any> {
  return Array.prototype.concat.apply([], arr)
}

```

总的来说， ` extractLeaveGuards `  的功能就是找到即将被销毁的路由组件的 `beforeRouteLeave `  钩子函数。处理成一个由深到浅的顺序组合的数组。接下来的 ` extractUpdateHooks ` 函数功能也是类似，主要是处理  ` beforeRouteUpdate `  钩子函数。这里不再过多介绍了。

```js
function extractUpdateHooks (updated: Array<RouteRecord>): Array<?Function> {
  return extractGuards(updated, 'beforeRouteUpdate', bindGuard)
}
```

### 3、resolveAsyncComponents

```js
export function resolveAsyncComponents (matched: Array<RouteRecord>): Function {
  // 返回“异步”钩子函数
  return (to, from, next) => {
    let hasAsync = false
    let pending = 0
    let error = null

    flatMapComponents(matched, (def, _, match, key) => {
      // 这里假定说路由上定义的组件 是函数 但是没有 options
      // 就认为他是一个异步组件。
      // 这里并没有使用 Vue 默认的异步机制的原因是我们希望在得到真正的异步组件之前
      // 整个的路由导航是一直处于挂起状态
      if (typeof def === 'function' && def.cid === undefined) {
        hasAsync = true
        // ...
        
      }
    })

    if (!hasAsync) next()
  }
}
```

这里主要是用来处理异步组件的问题，通过判断路由上定义的组件是函数 且 没有 options  来确定异步组件，然后在得到真正的异步组件之前将其路由挂起。

### 4、runQueue

```js
export function runQueue (queue: Array<?NavigationGuard>, fn: Function, cb: Function) {
  const step = index => {
    // 如果全部执行完成则执行回调函数 cb
    if (index >= queue.length) {
      cb()
    } else {
      // 如果存在对应的函数
      if (queue[index]) {
        // 这里的 fn 传过来的是个 iterator 函数
        fn(queue[index], () => {
          // 执行队列中的下一个元素
          step(index + 1)
        })
      } else {
        // 执行队列中的下一个元素
        step(index + 1)
      }
    }
  }
  // 默认执行钩子队列中的第一个数据
  step(0)
}
```

我们知道在 ` confirmTransition `  中通过这样的方式来调度队列的执行：

```js
runQueue( queue, iterator, () => { })
```

为 ` runQueue ` 函数 fn 参数传入一个  `iterator `  函数。接下来我们看看  `iterator`  函数的执行：

```js
this.pending = route
const iterator = (hook: NavigationGuard, next) => {
  // 如果当前处理的路由，已经不等于 route 则终止处理
  if (this.pending !== route) {
    return abort()
  }
  try {
    // hook 是queue 中的钩子函数，在这里执行
    hook(route, current, (to: any) => {
      // 钩子函数外部执行的 next 方法
      // next(false): 中断当前的导航。
      // 如果浏览器的 URL 改变了 (可能是用户手动或者浏览器后退按钮)
      // 那么 URL 地址会重置到 from 路由对应的地址。
      if (to === false || isError(to)) {
        this.ensureURL(true)
        abort(to)
      } else if (
        // next('/') 或者 next({ path: '/' }): 跳转到一个不同的地址。
        // 当前的导航被中断，然后进行一个新的导航。
        typeof to === 'string' ||
        (typeof to === 'object' && (
          typeof to.path === 'string' ||
          typeof to.name === 'string'
        ))
      ) {
        // next('/') or next({ path: '/' }) -> redirect
        abort()
        if (typeof to === 'object' && to.replace) {
          this.replace(to)
        } else {
          this.push(to)
        }
      } else {
        // 当前钩子执行完成，移交给下一个钩子函数
        // 注意这里的 next 指的是 runQueue 中传过的执行队列下一个方法函数: step(index + 1)
        next(to)
      }
    })
  } catch (e) {
    abort(e)
  }
}
```

我们来屡屡现在的主要流程：

1、执行 ` transitionTo `  函数，先得到需要跳转路由的 match 对象  ` route`  

2、执行 ` confirmTransition `  函数

3、` confirmTransition`  函数内部判断是否是需要跳转，如果不需要跳转，则直接中断返回

4、 ` confrimTransition `  判断如果是需要跳转，则先得到钩子函数的任务队列  queue

5、通过  ` runQueue `  函数来批次执行任务队列中的每个方法。

6、在执行 queue 的钩子函数的时候，通过  ` iterator `  来构造迭代器由用户传入  ` next `  方法，确定执行的过程

7、一直到整个队列执行完毕后，开始处理完成后的回调函数。

大致流程便是这样，我们接下来看处理完整个钩子函数队列之后将要执行的回调式什么样的：

```js
runQueue ( queue, iterator, () => {
  const postEnterCbs = []
	const isValid = () => this.current === route
  // 获取 beforeRouterEnter  钩子函数
  const enterGuards = extractEnterGuards( activated, postEnterCbs, isValid )
  // 获取  beforeResolve 钩子函数，并合成生成另一个  queue
  const queue = enterGuards.concat( this.router.resolveHooks )
  runQueue ( queue, iterator, () => {
    // 处理完，就不需要再次执行
    if( this.pending !== route ) {
      return abort()
    }
    
    // 清空
    this.pending = null
    // 调用 onComplete 函数
    onComplete( route )
    if( this.router.app ){
      // nextTick 执行 postEnterCbs 所有回调
      this.router.app.$nextTick( () => {
        postEnterCbs.forEach( cb => { cb() })
      })
    }
  })
})
```

可以看到，处理完整个钩子函数队列之后将要执行的回调主要是接入路由组件后期的钩子函数 ` beforeRouteEnter `  和  ` beforeResolve `  ，并进行队列执行，一切处理完 后，开始执行  `transitionTo `  的回调函数 `onComplete ` :

```js
this.confirmTransition( route, () => {
  // 更新 route
  this.updateRoute( route )
  // 执行 onComplete
  onComplete && onComplete( route )
  // 更新浏览器 url 
  this.ensureURL()
  
  // 调用 ready 的回调
  if ( !this.ready ){
    this.ready = true
    this.readyCbs.forEach( cb => { cb( route ) })
  }
}, err => {
  // ...
})

updateRoute ( route: Route ) {
  const prev = this.current
  // 当前路由更新
  this.current = route
  // cb 执行
  this.cb && this.cb( route )
  // 调用 afterEach 钩子
  this.router.afterHooks.forEach( hook => {
    hook && hook( route, prev )
  })
}
```

可以看到，到这里，已经完成了对当前 route 的更新动作。我们之前已经分析了，在 ` install `  函数中设置了对 `route `  的数据劫持。此时会触发页面的重新渲染过程。还有一点需要注意，在完成路由的更新后，同时执行了  `onComplete && onComplete( route )`  。而这个便是在我们之前的篇幅中介绍的 `setupHashListener`:

```js
const setupHashListener = () => {
  history.setupListeners()
}

history.transitionTo (
	history.getCurrentLocation(),
  setupHashListener,
  setupHashListener
)

setupListeners () {
  const router = this.router
  //处理滚动
  const expectScroll = router.options.scrollBehavior
  const supportScroll = supportsPushState &&  expectScroll
  if ( supportsScroll ){
    setupScroll()
  }
  // 通过 supportsPushState 判断监听 popstate 还是 hashchange
  window.addEventListener( supportsPushStatus ? 'popstate' : 'hashchange', () => {
    const current = this.current
    // 判断路由格式
    if( !ensureSlash() ){
      return 
    }
    
    this.transitionTo( getHash(), route => {
      if( supportsScroll ) {
        handleScroll( this.router, route, current, true )
      }
      // 如果不支持 history 模式，则换成 hash 模式
      if( !supportsPushState ){
        replaceHash( route.fullPath )
      }
    })
  })
}
```

可以看到 `setupListeners`  这里主要做了  2  件事情，一个是敌对路由切换滚动位置的处理，具体的可以参考这里 [滚动行为](https://router.vuejs.org/zh/guide/advanced/scroll-behavior.html#异步滚动)。另一个是对路由变动做了一次监听  ` window.addEvnetListener(supportsPushState? 'popstate' : 'hashchange', () => {} )` 。

## 总结

到这里， ` hash`  模式下的主要操作便差不多介绍完成了，接下来我们会去介绍  ` history`  模式。