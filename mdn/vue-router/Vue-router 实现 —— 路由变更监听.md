## Vue-router 实现 —— 路由变更监听

对于 Vue SPA 页面，改变可以有两种：一种是用户点击链接元素，一种是更新浏览器本身的前进后退导航来更新。

## 用户点击链接元素

用户点击链接元素，即点击了 `<router-link>`  ，这个组件是在  `install`  的时候被注册的。我们来看一下这个组件的核心内容：

```js
 props: {
    // ...
    // 标签名，默认是 <a></a>
    tag: {
      type: String,
      default: 'a'
    },
    // 绑定的事件
    event: {
      type: eventTypes,
      default: 'click'
    }
  },
  render (h: Function) {
    // ...
    const handler = e => {
      if (guardEvent(e)) {
        if (this.replace) {
          router.replace(location)
        } else {
          router.push(location)
        }
      }
    }

    const on = { click: guardEvent }
    if (Array.isArray(this.event)) {
      this.event.forEach(e => { on[e] = handler })
    } else {
      // 事件绑定处理函数
      on[this.event] = handler
    } 
    // ...
    return h(this.tag, data, this.$slots.default)   
  }
  // ....
```

该组件主要是通过 `render `  函数，默认创建一个  `a`  标签，同时为标签绑定 `click`  事件。在绑定事件的函数中，有这样一个方法值得注意  `guardEvent`  。我们来看看他所做的工作：

```js
function guardEvent (e) {
  // 忽略带有功能键的点击
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return
  // 调用preventDefault时不重定向
  if (e.defaultPrevented) return
  // 忽略右击
  if (e.button !== undefined && e.button !== 0) return
  // 如果 `target="_blank"` 也不进行
  if (e.currentTarget && e.currentTarget.getAttribute) {
    const target = e.currentTarget.getAttribute('target')
    if (/\b_blank\b/i.test(target)) return
  }
  // 判断是否存在`e.preventDefault`，在 weex 中没有这个方法
  if (e.preventDefault) {
    e.preventDefault()
  }
  return true
}
```

可以看到，这里主要对是否跳转进行了一些判断。那么我们再看看点击事件的处理函数：

```js
const handler = e => {
  if (guardEvent(e)) {
    if (this.replace) {
      router.replace(location)
    } else {
      router.push(location)
    }
  }
}
```

可以看到其实他们只是代理而已，真正做事情的还是  ` history`  来做：

## 浏览器本身的跳转动作

对于这种情况，我们之前的文章也简单分析过，先来看看  `hash ` 的方式，当发生改变的时候会判断当前浏览器环境是否支持  `supportsPushState`  来选择监听  `popstate`  还是  `hashchange ` :

```js
window.addEventListener(supportsPushState ? 'popstate' : 'hashchange', () => {
  const current = this.current
  if (!ensureSlash()) {
    return
  }
  this.transitionTo(getHash(), route => {
    if (supportsScroll) {
      handleScroll(this.router, route, current, true)
    }
    if (!supportsPushState) {
      replaceHash(route.fullPath)
    }
  })
})
```

对应的  `history `  其实也是差不多。只不过既然是  `history `  模式了，默认也就只用监听 `popstate`  就好了：

```js
window.addEventListener('popstate', e => {
  const current = this.current

  // Avoiding first `popstate` event dispatched in some browsers but first
  // history route not updated since async guard at the same time.
  const location = getLocation(this.base)
  if (this.current === START && location === initLocation) {
    return
  }

  this.transitionTo(location, route => {
    if (supportsScroll) {
      handleScroll(router, route, current, true)
    }
  })
})

```

到这里其实 `vue-router`  实现已经介绍的差不多了。相信能看到这里的小伙伴也能对 `vue-router`  有个清晰的认识。