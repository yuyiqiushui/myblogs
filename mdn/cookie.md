cookie属于文档对象模型DOM树根节点document、而sessionStorage、localStorage属于浏览器对象模型BOM的对象window



其中sessioStorage 和localStorage s是 HTML5 Web Storage API提供的

- sessionStorage:为每一个给定的源（given origin ）维持一个独立的存储区域，该存储区域在页面会话期间可用（即只要浏览器处于打开状态，包括页面重新加载和恢复）
- localStorage: 同样的功能，但是在浏览器关闭，然后重新打开后数据仍然存在。



1、cookie

H5之前，存储主要用cookie，缺点是在请求头上带着数据，导致流量增加，大小限制4K

```javascript
document.cookie = "username=John Doe; expires=Thu, 18 Dec 2013 12:00:00 GMT; path=/"    // 设置cookie
document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 GMT"    // 删除cookie
```

设置cookie的方法比较简单，其中有几个参数可以添加：

expires：过期时间，当过了到期日期时，浏览器会自动删除该cookie，如果想删除一个cookie，只需要把它的过期时间设置成过去时间即可。



path：路径，值可以是一个目录，或者是一个路径

如果cc.com/test/index.html建立了一个cookie，那么cc.com/test/目录里的所有页面，以及该目录下面任何子目录里的页面都可以访问这个cookie。因此在cc.com/test/test2/test3里的任何页面都可以访问cc.com/test/index.html建立的cookie。若cc.com/test/想访问cc.com/test/index.html设置的cookies，需要把cookie的path属性设置成“/”



domain：主机名，是指同一个域名下的不同主机,例如：www.biadu.com和map.baidu.com就是两个不同的主机名。默认情况下，一个主机中创建的cookie在另一个主机下是不能被访问的，但可以通过domain参数来实现对其的控制。

```javascript
document.cookie = "name=value;domain=.baidu.com"
```

这样，所有*.baidu.com的主机都可以访问该cookie

## 2、localStorage

以键值对（key—value）的方式存储，永久存储，永不失效，除非手动删除。IE8+支持，每个域名限制5M，打开同域的新页面也能访问得到。

操作方式：

```javascript
window.localStorage.username = 'hehe' //设置
window.localStorage.setItem('username','hehe') //设置
window.localStorage.getItem('username') //读取
window.localStorage.removeItem('username') //删除
window.localStorage.key(1)  //读取索引为1 的值
window.localStorage.clear()  //清除所有
```

可以存储数组、数字、对象等可以被序列化为字符串的内容

## 3、sessionStorage

sessionStorage操作的方法与localStorage是一样的，区别在于sessionStorage在关闭页面后即被清空，而localStorage则会一直保存。很多时候数据只需要在用户浏览一组页面期间使用，关闭窗口后数据就可以丢弃了，这种情况使用sessioStorage就比较方便。

注意：刷新页面sessionStorage不会清楚，但是打开同域新页面访问不到。



## 4、cookie、sessionStorage、localStorage之间的区别

1、cookie数据始终在同源的http请求中携带（即使不需要），即cookie在浏览器和服务器间来回传递。而sessionStorage和localStorage不会把数据发给服务器，仅在本地保存，cookie数据还有路径（path）的概念，可以限制cookie只属于某个路径下。

2、存储大小限制不同，cookie数据不能超过4k,同时因为每次请求都会携带cookie，所以cookie只适合保存很小的数据，如会话标识。sessionStorage和localStorage虽然也有大小的限制，但比cookie大得多，可以达到5M或更大。

3、数据有效期不同，sessionStorage:仅在当前浏览器窗口关闭前有效，自然也就不可能持久保持；localStorage：始终有效，窗口或浏览器关闭也一直保存，因此用作持久数据；cookie只在设置的cookie过期时间之前一直有效，即使窗口或浏览器关闭。

4、作用域不同：sessionStorage不在不同的浏览器页面中共享，即使是同一个页面；localStorage在所有同源窗口中都是共享的；cookie也是在所有同源窗口中都是共享的。

5、Web  Storage 支持事件通知机制，可以将数据更新的通知发送给监听者。

6、Web  Storage 的API 接口使用方便，cookie的原生接口不友好，需要自己封装。

## 5、安全性

需要注意的是，不是什么数据都适合放在啊cookie、localStorage、sessioStorage中的，因为它们保存在本地容易被篡改，使用它们的时候，时刻要注意是否有代码存在XSS注入的风险。所以千万不要用它们存储系统中敏感数据。