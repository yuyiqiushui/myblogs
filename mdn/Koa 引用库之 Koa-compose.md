Koa 引用库之 Koa-compose

概述

compose 是一个工具函数，koa.js 的中间件通过这个工具函数组合后， 按 app.use() 的顺序同步执行，也就是形成了洋葱圈式的调用。

这个函数的源代码不长，不到50行，地址：https://link.zhihu.com/?target=https%3A//github.com/koajs/compose

利用递归实现了 Promise 的链式执行，不管中间件中是同步还是异步都通过 Promise 转换成 异步链式执行。

源码解读：

```javascript
function compose (middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }
  ...
} 
```

函数开头对参数做了类型的判断，确保输入的正确性。middleware 必须是一个数组，数组中的元素必须是 function

```javascript
function compose (middleware) {
    return function (context, next) {
        // last called middleware
        let index = -1
        return dispatch(0)
        function dispatch (i) {
            if ( i <= index ) return Promise.reject( new Error('next() called multiple times'))
            index = 1
            let fn = middleware[i]
            if (i === middleware.length ) fn = next
            if (!fn) return Promise.resolve()
            try {
                return Promise.resolve( fn( context, function next () {
                    return dispatch( i + 1 )
                }))
            } catch ( err ) {
                return Promise.reject( err )
            }
        }
    }
}
```

接下来，是返回了一个函数，接受两个参数， context 和  next  。 next 是 koa 中 的 ctx ， next 是所有中间件执完后，框架使用者来最后处理请求和返回的回调函数。同时函数是一个闭包函数，存储了所有的中间件，通过递归的方式不断运行中间件。



通过代码可以看到，作为中间件同样必须接受两个参数， context 和 next 。如果某个中间件没有调用 next() , 后面的这个中间件是不会执行的。这是非常常见的将多个异步函数转为同步的处理方式。



Middleware 函数的写法：

直接看代码：

```javascript
const compose = require('./compose')
function mw1 ( context, next ) {
    console.log('====middleware 1=====')
    console.log( context )
    setTimeout( () => {
		console.log(`inner: ${ context }`)
        next()
    }, 1000 )
}

function mw2 (context, next) {
    console.log('===== middleware 2=====')
    console.log( context )
    next()
}

function mw3 ( context, next ) {
    console.log('===== middleware 3 =====')
    console.log( context )
    setTimeout( () => {
		console.log(`inner: ${ context }`)
    }, 1000 )
    next()
}

const run = compose( [mw1, mw2, mw3] )
run('context', function () {
    console.log('all middleware done!')
})
```

输出结果是：

```javascript
===== middleware 1 =====
context
inner: context
===== middleware 2 =====
context
===== middleware 3 =====
context
all middleware done!
inner: context
```

第三个中间件中，故意把 next() 写在了异步的外面，会导致中间件还没完成就直接进入下一个中间件的运行了 ( 这里是所有的中间件运行完成后的回调函数 )。 compose（）生成的函数 是 thenable 函数，我们改一下最后的运行部分。

```javascript
run('context').then( () => {
    console.log(' all middleware done! ')
})
```

结果是：

```javascript
===== middleware 1 =====
context
all middleware done!
inner: context
===== middleware 2 =====
context
===== middleware 3 =====
context
inner: context
```

看起来结果不符合我们的预期，这是因为在 **compose** 源代码中，中间件执行完后返回的是一个 Promise 对象，如果我们在 Promise 中再使用异步函数并且不使用then 来处理异步流程，显然是不合理的，我们可以改一下上面的中间件代码。

```JavaScript
function mw1 (context, next) {
  console.log('===== middleware 1 =====')
  console.log(context)
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`inner: ${context}`)
      resolve()
    }, 1000)
  }).then(() => {
    return next ()
  })
}

function mw2 (context, next) {
  console.log('===== middleware 2 =====')
  console.log(context)
  return next()
}

function mw3 (context, next) {
  console.log('===== middleware 3 =====')
  console.log(context)
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`inner: ${context}`)
      resolve()
    }, 1000)
  }).then(() => {
    return next ()
  })
}
```

输出

```JavaScript
===== middleware 1 =====
context
inner: context
===== middleware 2 =====
context
===== middleware 3 =====
context
inner: context
all middleware done!
```

这下没问题了，每一个中间件都会返回一个 **thenable** 的 Promise 对象。

既然是在研究Koa.js 那么我们就把上面的代码再改改，使用 async/await 改写一下，把异步函数改成一个 **thenable** 函数。

```javascript
async function sleep (context) {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`inner: ${context}`)
      resolve()
    }, 1000)
  })
}

async function mw1 (context, next) {
  console.log('===== middleware 1 =====')
  console.log(context)
  await sleep(context)
  await next()  
}

async function mw2 (context, next) {
  console.log('===== middleware 2 =====')
  console.log(context)
  return next()
}

async function mw3 (context, next) {
  console.log('===== middleware 3 =====')
  console.log(context)
  await sleep(context)
  await next ()
}
```

应用场景

在日常的开发中，Node 后台一般是作为微服务架构中的一个面向终端的 API Gateway。 现在有这样一个场景：**我们从三个其他微服务中获取数据再聚合成一个 HTTP API**，如果三个服务提供的 service 没有依赖的话，这种情况比较简单，用 Promise.all() 就可以实现，代码如下：

```javascript
function service1 () {
  return new Promise((resolve, reject) => {
    resolve(1)
  })
}

function service2 () {
  return new Promise((resolve, reject) => {
    resolve(2)
  })
}

function service3 () {
  return new Promise((resolve, reject) => {
    resolve(3)
  })
}

Promise.all([service1(), service2(), service3()])
  .then(res => {
    console.log(res)
  })
```

那如果 service2 的请求参数依赖 service1 返回的结果， service3 的请求参数又依赖于 Service2 返回的结果，那就得将一系列的异步请求转成同步请求，**compose** 就可以发挥其作用了，当然用 **Promise** 的链式调用也是可以实现的，但是代码耦合度高，不利于后期维护和代码修改，如果 1、2、3 的顺序调换一下，代码改动就比较大了，另外耦合度太高的代码不利于单元测试，这里有一个[文章](https://link.zhihu.com/?target=https%3A//blog.risingstack.com/dependency-injection-in-node-js/)是通过依赖注入的方式解耦模块，保持模块的独立性，便于模块的单元测试。

## 总结

**Compose** 是一种基于 Promise 的流程控制方式，可以通过这种方式对异步流程同步化，解决之前的嵌套回调和 **Promise** 链式耦合。

**Promise** 的流程控制有很多种，下篇文章再来写不同应用场景中分别运用的方法。