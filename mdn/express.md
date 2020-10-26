# express

express主要集成了web的http服务器的创建、静态文件管理、服务器URL请求处理、GET和POST请求分发、Session处理等功能。

### Socket.io

是一个基于node的项目，起作用主要是将WebSocket协议应用到所有的浏览器。该模块主要用于实时的长链接多请求项目中，如在线联网游戏、实时聊天、实时股票查看、二维码扫描登陆等。

### forever



### request---40

### Formidable

Formidable解决文件的上传

### npm发包

创建package.json和readme.md，

运行`npm link`或`sudo npm link` ---> 忽略node_modules/ >> .gitignore

运行`npm adduser` 添加用户，输入相关用户信息

运行`npm publish` 发布包

## 2.3、Node.js设计模式

### 	2.3.1、模块与类

### 	2.3.2、Node.js中的继承

### 	2.3.3、单例模式

​	single_class.js

```javascript
var _instance = null;//定义初始化_instance
module.exports = functon(time){  //定义单例类
	function Class(time){  //创建类
		this.name = 'danhuang';
		this.book = 'Node.js';
		this.time = time;
	}
	Class.prototype = {   //创建方法
		constructor:Class,
		show:function(){
			console.log(this.book + ' is write by' + this.name + ',time is ' + 						this.time);
		}
	}
	
	this.getInstance = function(){ //获取单例对象接口
		if(_instance === null){
			_instance = new Class(time);
		}
		return _instance;
	}
}
```

### 2.3.4、适配器模式

Target.js

```javascript
module.exports = function(){
	this.request = function(){
		console.log('Target::request');
	}
}
```

Adapter.js

```javascript
var util = require("util");
var Target = require("./target");
var Adaptee = require("./adaptee");

/**
 *
 *@desc 定义Adaptee 函数类
 */
function Adapter(){
	Target.call(this);
	this.request = function(){
		var adapteeOBJ = new Adaptee();
		adapteeOBJ.specialRequest();
	}
}

/*设置Adapter 继承Target 类 */
util.inherits(Adapter, Target);
module.exports = Adapter;
```

Adaptee.js

```javascript
module.exports = function(){
	this.specialRequest = function(){
		console.log('Adaptee::specialRequest');
	}
}
```

Client.js

```javascript
var Adapter = require("./adapter");

var target = new Adapter();
target.request();

//运行client.js--->. node client.js ---->.   //Adaptee::specialRequest
```



### 2.3.4、装饰模式

![](/Users/chenyanliang/Desktop/node实战/屏幕快照 2019-11-12 上午11.47.44.png)

### 	2.3.5、工厂模式

