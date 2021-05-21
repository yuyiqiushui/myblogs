# Vue-router 源码分析 - history

## 初始化 Router

通过整体流程可以知道在路由实例化大的时候会根据当前  mode  模式来选择实例化对应的 History 类，这里再来回顾下，在 src/index.js 中：

```js
// ...
import { HashHistory, getHash } from './history/hash'
import { HTML5History, getLocation } from './history/html5'
import { AbstractHistory } from './history/abstract'
// ...
export default class VueRouter {
// ...
  constructor (options: RouterOptions = {}) {
// ...
    // 默认模式是 hash
    let mode = options.mode || 'hash'
    // 如果设置的是 history 但是如果浏览器不支持的话 
    // 强制退回到 hash
    this.fallback = mode === 'history' && !supportsHistory
    if (this.fallback) {
      mode = 'hash'
    }
    // 不在浏览器中 强制 abstract 模式
    if (!inBrowser) {
      mode = 'abstract'
    }
    this.mode = mode
    // 根据不同模式选择实例化对应的 History 类
    switch (mode) {
      case 'history':
        this.history = new HTML5History(this, options.base)
        break
      case 'hash':
        // 细节 传入了 fallback
        this.history = new HashHistory(this, options.base, this.fallback)
        break
      case 'abstract':
        this.history = new AbstractHistory(this)
        break
      default:
        assert(false, `invalid mode: ${mode}`)
    }
  }
// ...
```

可以看到 vue-router 提供了三种模式： hash ( 默认 )、history 以及 abstract 模式，还不了解具体区别的可以在 **[文档](https://link.zhihu.com/?target=http%3A//Router%2520%25E6%259E%2584%25E9%2580%25A0%25E9%2585%258D%25E7%25BD%25AE%2520%25C2%25B7%2520GitBook)**  中查看，有很详细的解释。下面就这三种模式 初始化一一来进行分析。

## HashHistory

首先就看默认的 hash 模式，也应该是用的最多的模式，对应的源码在 src/history/hash.js 中：

```js
// ...
import { History } from './base'
import { getLocation } from './html5'
import { cleanPath } from '../util/path'

// 继承 History 基类
export class HashHistory extends History {
  constructor (router: VueRouter, base: ?string, fallback: boolean) {
    // 调用基类构造器
    super(router, base)

    // 如果说是从 history 模式降级来的
    // 需要做降级检查
    if (fallback && this.checkFallback()) {
      // 如果降级 且 做了降级处理 则什么也不需要做
      return
    }
    // 保证 hash 是以 / 开头
    ensureSlash()
  }

  checkFallback () {
    // 得到除去 base 的真正的 location 值
    const location = getLocation(this.base)
    if (!/^\/#/.test(location)) {
      // 如果说此时的地址不是以 /# 开头的
      // 需要做一次降级处理 降级为 hash 模式下应有的 /# 开头
      window.location.replace(
        cleanPath(this.base + '/#' + location)
      )
      return true
    }
  }
// ...
}

// 保证 hash 以 / 开头
function ensureSlash (): boolean {
  // 得到 hash 值
  const path = getHash()
  // 如果说是以 / 开头的 直接返回即可
  if (path.charAt(0) === '/') {
    return true
  }
  // 不是的话 需要手工保证一次 替换 hash 值
  replaceHash('/' + path)
  return false
}

export function getHash (): string {
  // 因为兼容性问题 这里没有直接使用 window.location.hash
  // 因为 Firefox decode hash 值
  const href = window.location.href
  const index = href.indexOf('#')
  // 如果此时没有 # 则返回 ''
  // 否则 取得 # 后的所有内容
  return index === -1 ? '' : href.slice(index + 1)
}
```

可以看到在实例化过程中主要做两件事情：针对于不支持 history  api 的降级处理，以及保证默认进入的时候对应的 hash 值是以  /  开头，如果不是则替换。值得注意的是这里并没有监听 hashchange 事件来响应对应的逻辑，这部分逻辑在 **[上篇](https://link.zhihu.com/?target=http%3A//vue-router%25E6%25BA%2590%25E7%25A0%2581%25E5%2588%2586%25E6%259E%2590-%25E6%2595%25B4%25E4%25BD%2593%25E6%25B5%2581%25E7%25A8%258B%2520%25C2%25B7%2520Issue%2520%239%2520%25C2%25B7%2520DDFE/DDFE-blog)** 的  router.init  中包含的，主要是为了解决 [beforeEnter fire twice on root path (‘/‘) after async next call · Issue #725 · vuejs/vue-router](https://link.zhihu.com/?target=http%3A//beforeEnter%20fire%20twice%20on%20root%20path%20('/') after async next call · Issue #725 · vuejs/vue-router)，在对应的回调中则调用了 onHashChange 方法，后边具体分析。

## 友善高级的 HTML5History

HTML5History  则是利用  history.pushState/replaceState   API  来完成  URL  跳转而无须重新加载页面，页面地址和正常地址无异；源码在  src/history/html5.js 中：

```js
// ...
import { cleanPath } from '../util/path'
import { History } from './base'
// 记录滚动位置工具函数
import {
  saveScrollPosition,
  getScrollPosition,
  isValidPosition,
  normalizePosition,
  getElementPosition
} from '../util/scroll-position'

// 生成唯一 key 作为位置相关缓存 key
const genKey = () => String(Date.now())
let _key: string = genKey()

export class HTML5History extends History {
  constructor (router: VueRouter, base: ?string) {
    // 基类构造函数
    super(router, base)

    // 定义滚动行为 option
    const expectScroll = router.options.scrollBehavior
    // 监听 popstate 事件 也就是
    // 浏览器历史记录发生改变的时候（点击浏览器前进后退 或者调用 history api ）
    window.addEventListener('popstate', e => {
// ...
    })

    if (expectScroll) {
      // 需要记录滚动行为 监听滚动事件 记录位置
      window.addEventListener('scroll', () => {
        saveScrollPosition(_key)
      })
    }
  }
// ...
}
// ...
```

可以看到在这种模式下，初始化的工作相比 hash 模式少了很多，只是调用基类构造函数以及初始化监听事件，不需要再做额外的工作。

## AbstractHistory

理论上来说这种模式是用于 Node.js 环境的，一般场景也就是在做测试的时候。但是在实际项目中其实还可以使用的，利用这种特性还是可以很方便的做很多事情的。由于它和浏览器无关，所以代码上来说也是最简单的，在 src/history/abstract.js 中：

```js
// ...
import { History } from './base'

export class AbstractHistory extends History {
  index: number;
  stack: Array<Route>;

  constructor (router: VueRouter) {
    super(router)
    // 初始化模拟记录栈
    this.stack = []
    // 当前活动的栈的位置
    this.index = -1
  }
// ...
}
```

可以看到在抽象模式下，所做的仅仅是用一个数组当作栈来模拟浏览器历史记录，拿一个变量来表示当前处于哪个位置。

三种模式的初始化的部分已经完成了，但是这只是刚刚开始，继续往后看。

## history  改变

history  改变可以有两种，一种是用户点击链接元素，一种是更新浏览器本身的前进后退导航来更新。

先说浏览器导航发生变化的时候会触发对应的事件：对于  hash  模式而言触发  window  的  hashchange  事件，对于  history  模式而言则触发  window  的    popstate  事件

先说  hash  模式，当触发改变的时候会调用  HashHistory  实例的  onHashChange ：

```js
  onHashChange () {
    // 不是 / 开头
    if (!ensureSlash()) {
      return
    }
    // 调用 transitionTo
    this.transitionTo(getHash(), route => {
      // 替换 hash
      replaceHash(route.fullPath)
    })
  }
```

对于 history  模式则是：

```js
window.addEventListener('popstate', e => {
  // 取得 state 中保存的 key
  _key = e.state && e.state.key
  // 保存当前的先
  const current = this.current
  // 调用 transitionTo
  this.transitionTo(getLocation(this.base), next => {
    if (expectScroll) {
      // 处理滚动
      this.handleScroll(next, current, true)
    }
  })
})
```

上边的  transitionTo 以及  replaceHash 、getLocation、 handleScroll 后边统一分析。

再看用户点击链接交互，即点击了  <router-link>   ,  回顾下这个组件在渲染的时候做的事情：

```js
// ...
  render (h: Function) {
// ...

    // 事件绑定
    const on = {
      click: (e) => {
        // 忽略带有功能键的点击
        if (e.metaKey || e.ctrlKey || e.shiftKey) return
        // 已阻止的返回
        if (e.defaultPrevented) return
        // 右击
        if (e.button !== 0) return
        // `target="_blank"` 忽略
        const target = e.target.getAttribute('target')
        if (/\b_blank\b/i.test(target)) return
        // 阻止默认行为 防止跳转
        e.preventDefault()
        if (this.replace) {
          // replace 逻辑
          router.replace(to)
        } else {
          // push 逻辑
          router.push(to)
        }
      }
    }
    // 创建元素需要附加的数据们
    const data: any = {
      class: classes
    }

    if (this.tag === 'a') {
      data.on = on
      data.attrs = { href }
    } else {
      // 找到第一个 <a> 给予这个元素事件绑定和href属性
      const a = findAnchor(this.$slots.default)
      if (a) {
        // in case the <a> is a static node
        a.isStatic = false
        const extend = _Vue.util.extend
        const aData = a.data = extend({}, a.data)
        aData.on = on
        const aAttrs = a.data.attrs = extend({}, a.data.attrs)
        aAttrs.href = href
      } else {
        // 没有 <a> 的话就给当前元素自身绑定时间
        data.on = on
      }
    }
    // 创建元素
    return h(this.tag, data, this.$slots.default)
  }
// ...
```

这里一个关键就是绑定了元素的  click  事件，当用户触发后，会调用  router  的  push  或  replace  方法来更新路由。下边就来看看这两个方法定义，在  src/index.js  中：

```js
push (location: RawLocation) {
  this.history.push(location)
}

replace (location: RawLocation) {
  this.history.replace(location)
}
```

可以看到其实他们只是代理而已，真正做事情的还是  history  来做，下面就分别把  history  的三种模式下的这两个方法进行分析。

## HashHistory

直接看代码：

```js
// ...
  push (location: RawLocation) {
    // 调用 transitionTo
    this.transitionTo(location, route => {
// ...
    })
  }

  replace (location: RawLocation) {
    // 调用 transitionTo
    this.transitionTo(location, route => {
// ...
    })
  }
// ...
```

操作是类似的，主要就是调用基类的  transitionTo  方法来过渡这次历史的变化，在完成后更新当前浏览器的  hash  值。 **[上篇](https://link.zhihu.com/?target=http%3A//vue-router%25E6%25BA%2590%25E7%25A0%2581%25E5%2588%2586%25E6%259E%2590-%25E6%2595%25B4%25E4%25BD%2593%25E6%25B5%2581%25E7%25A8%258B%2520%25C2%25B7%2520Issue%2520%239%2520%25C2%25B7%2520DDFE/DDFE-blog)** 中大概分析了  transitionTo 方法，但是一些细节并没细说，这里来看下遗漏的细节：

```js
tansitionTo ( location: RawLocation, cb?: Function ) {
  // 调用  match 得到匹配的 route 对象
  const  route  =  this.router.match( location, this.current )
  // 确认过渡
  this.confirmTransition( route, () => {
		// 更新当前  route  对象
    this.updateRoute( route )
    cb && cb( route )
    // 子类实现的更新  url  地址
    // 对于  hash  模式的话  就是更新  hash 的值
    // 对于  history  模式的话  就是利用  pushstate  /  replacestate 来更新
    // 浏览器地址
    this.ensureURL()
  })
}

// 	确认过渡
confirmTransition ( route: Route, cb: Function ) {
  const  current = this.current
  // 如果是相同，直接返回
  if( isSameRoute( route, current )){
    this.ensureURL()
    return
  }
  const { deactivated, activated } = resolveQueue( this.current.matched,  route.matched )
  
  // 整个切换周期队列
  const  queue: Array<? NavigationGuard> = [].concat(
  	// leave 的钩子
    extractLeaveGuards(deactivated),
    // 全局 router before hooks
    this.router.beforeHooks,
    // 将要更新的路由的 beforeEnter 钩子
    activated.map(m => m.beforeEnter),
    // 异步组件
    resolveAsyncComponents(activated)
  )
  this.pending = route
  // 每一个队列执行的  iterator 函数
  const iterator = ( hook: NavigationGuard, next ) => {
    // ...
  }
  // 执行队列 leave 和  beforeEnter 相关钩子
  run
}
```

