# 使用Node.js实现一个 express框架

## express基本语法

```javascript
const express = require("express");
const app = express();

app.get("/test", (req, res, next) => {
  console.log("会所技师到位*1");
//   res.end("会所技师开始服务1");
  next();
});

app.get("/test", (req, res, next) => {
  console.log("会所技师到位*2");
  res.end("会所技师开始服务2");
});

app.listen(8888, (err) => {
  !err && console.log("会所里面有大保健吗?");
});
```

当我访问 localhost:8888/test 时候，返回了： 会所技师开始服务 2，服务端打印了

```
会所技师到位*1
会所技师到位*2
```

- 从上面可以看到什么？
  - app.listen 会启动进程监听端口
  - 每次收到请求，对应的 url 和 method 会触发相应挂载在 app 上对应的回调函数
  - 调用 next 方法，会触发下一个
  - express 默认引入调用后返回一个 app 对象

## 一起来实现一个简单的 express 框架

- 定义我们的 express 文件入口，这里使用 class 来实现

  ```javascript
  class express {
  
  }
  module.exports = express;
  ```

- 需要原生的模块 http ，常见进程监听端口

  ```javascript
  const { createServer } = require('http');
  ```

- 给 class 定义 listen 方法，监听端口

  ```javascript
  class express {
    listen(...args) {
      createServer(cb).listen(...args);
    }
  }
  ```

- 这样可以通过调用 class 的 listen 去调用 http 模块的 listen 了，这里的 cb 我们可以先不管，你要知道每次接受到请求，必然会调用 cb 函数，这个是 createServer 原生模块帮我们封装好的

## 实现接收到请求触发

- 实现 app.get   、  app.post  等方法

  - 目前我们接收到响应，就会触发 cb 这个回调函数，我们打印下，看看是什么参数？

    ```javascript
    class express {
      cb() {
        return (req, res) => {
          console.log(res, res, "来客人了");
        };
      }
      listen(...args) {
        createServer(this.cb()).listen(...args);
      }
    }
    
    
    
    ```

- 发现此时的 req 和 res 正是我们想要的可读流和可写流![](http://cdn.yuyiqiushui.cn/exrpess01.png)

- 开始编写 get 和 post 方法

  - 这里注意，有路由是 '/' 的，这种是不管任何路由都会触发一次

    ```javascript
    cosntructor(){
    	this.routers = {
    		get: [],
    		post: [],
    	};
    }
    
    get(path, handle){
    	this.routers.get.push({
    		path,
    		handle,
    	});
    }
    
    post(path,handle){
    	this.routers.post.push({
    			path,
    			handle,
    	})
    }
    ```

- 初始化时候定义 get、 post 的数组储存对应的 path 和 handle

- 需要触发路由回调的时候，首先要找到对应的请求方式下对应的 URL 的 handle 方法，然后触发回调。

- 如何找到对应请求方式下的 URL 对应的 handle 方法？在接收到请求时候就要遍历一次

  - 这里要考虑匹配多个路由，意味着，我们可能遇到像最开始一样，有两个 get 方式的 test 路由

  ```javascript
    cb() {
      return (req, res) => {
        const method = req.method.toLowerCase();
        console.log(this.routers[method], ",method");
        const url = req.url;
        this.routers[method].forEach((item) => {
          item.path === url && item.handle(req, res);
        });
      };
    }
    listen(...args) {
      createServer(this.cb()).listen(...args);
    }
  ```

- 上面根据 method 找到对应的数组，遍历找到请求的路由，触发回调，此时已经能正常返回数据了

  ```javascript
  [ { method: 'get', path: '/test', handle: [Function] } ] ,method
  ```

- 此时最简单的 express 已经完成了，但是我们好想忘记了最重要的中间件



## 完成最重要的中间件功能

- 首先要知道， express 中间件分两种，一种带路由的，那就是根据路由决定是否触发

- 另外一种就是不带路由的，像静态资源这种，是用户访问任何路由都要触发一次的

- 那我们需要一个 all 数组储存这种在任意路由都需要匹配触发的

  ```javascript
  constructor() {
      this.routers = {
        get: [],
        post: [],
        all: [],
      };
    }
  
  ```

- 之前的直接通过 push 方式是太粗暴，如果用户需要中间件功能，不传路由，那就是要做特殊处理，这里通过一个中间函数处理下

- 改造 get、 post 方法，定义 handleAddRouter 方法

  ```javascript
   handleAddRouter(path, handle) {
      let router = {};
      if (typeof path === "string") {
        router = {
          path,
          handle,
        };
      } else {
        router = {
          path: "/",
          handle: path,
        };
      }
      return router;
    }
  
    get(path, handle) {
      const router = this.handleAddRouter(path, handle);
      this.routers.get.push(router);
    }
  
    post(path, handle) {
      const router = this.handleAddRouter(path, handle);
      this.routers.post.push(router);
    }
  
    use(path, handle) {
      const router = this.handleAddRouter(path, handle);
      this.routers.all.push(router);
    }
  ```

- 每次添加之前，先触发一次 handleAddRouter ，如果是 path 为空的中间件，直接传入函数的，那么 path 帮它设置成 '/'

- 我们还遗留了一个点， next 的实现，因为我们现在加了 all 这个数组后，意味着可能有多个中间件，那么可能一次请求打过来，就要触发多个路由

  > “这里要注意。promise.then  源码实现和 express 的 next、以及 Koa 的洋葱圈、redux  的中间件实现，有着一丁点相似，当你能真的领悟前后端框架源码时候，发现大都相似”

- 阅读我的文章，足以击破所有前后端源码，并且可以手写出来，我们只学最核心的，抓重点学习，野蛮生长

## 实现next

- 思路：

  - 首先要找到所有匹配路由
  - 然后逐个执行（看 next  的调用 ）

- 定义 search 方法，找到所有匹配的路由

  ```javascript
    search(method, url) {
      const matchedList = [];
      [...this.routers[method], ...this.routers.all].forEach((item) => {
        item.path === url && matchedList.push(item.handle);
      });
      return matchedList;
    }
  
    cb() {
      return (req, res) => {
        const method = req.method.toLowerCase();
        const url = req.url;
        const matchedList = this.search(method, url);
      };
    }
  ```

- matchedList 就是我们想要找到的所有路由

- 为了完成 next ，我们要将 req,  res,  matchedList 存入闭包中，定义 handle 方法

  ```javascript
  handle(req, res, matchedList){
  	const next = ()=> {
  		const midlleware = matchedList.shift();
  		if(midlleware){
  			midlleware(req, res, next);
  		}
  	};
  	next();
  }
  
  cb(){
  	return (req, res) => {
  		const method = req.method.toLowerCase();
  		const url = req.url;
  		const matchedList = this.search(method, url);
  		this.handle(req, res, metchedList);
  	}
  }
  ```

  ![](http://cdn.yuyiqiushui.cn/express02.png)

- 这样我们就完成了 next 方法，只要动手调用 next ，就会调用下一个匹配到的路由回调函数

  ![](http://cdn.yuyiqiushui.cn/express03.png)

- 不到一百行代码，就完成了这个简单的 express 框架

