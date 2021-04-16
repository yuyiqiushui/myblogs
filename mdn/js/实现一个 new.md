# 实现一个 new

## new一个函数，都会发生什么？

- 创建一个新对象
- 将构造函数的作用域赋给新对象 ( 因此 this 就指向了这个新对象 )
- 执行构造函数中的代码 ( 为这个新对象添加属性 )
- 返回新对象

## 第一步

创建一个新的空的对象，很简单，代码如下：

```javascript
function myNew() {
  var obj = new Object();
} 
```

## 第二步

所谓将构造函数的作用域赋给新对象，就是给这个新对象构造原型链，链接到构造函数的原型对象上，从而新对象就可以访问构造函数中的属性和方法。

构造函数就是我们传入的第一个参数。由于 arguments 是类数组，我们不能直接使用 shift 方法，我们可以使用 call 来调用 Array  上的  shift  方法，获取 constr；

```javascript
var  constr = Array.prototype.shift.call(arguments)
```

之后，我们把  obj 的原型指向构造函数的原型对象上：

```javascript
obj.__proto__ = constr.prototype
```

等等，从第一步到第二步，是不是有点奇怪，我们模拟 new ，但是在代码中又使用到  new  这个关键字？其实还有一种方法可以创建 Object 对象，那就是 Object.create()。



对于 var obj = new  Object() 来说，执行的时候  `obj.__proto__`  是指向  Object.prototype 的。如果使用 Object.create( object,  objectProps ) 这种方法，第一个参数就是要创建的对象的原型，如果赋值为 null ，则得到的 obj 没有任何原型；在我们的代码当中，我们想要新对象使用构造函数的原型，那么则需要：

```javascript
var obj = Object.create(constr.prototype)
```

我们现在的代码如下所示：

```javascript
function  myNew() {
  var constr = Array.prototype.shift.call(arguments);
  var obj = Object.create(constr.prototype)
}
```

好了，第二步也完成！

## 第三步

执行构造函数中的代码 ( 为这个新对象添加属性 )。很简单，如果了解 call 和 apply 如何使用，易如反掌 [前端面试题——自己实现call和apply](https://zhuanlan.zhihu.com/p/83523272)

```javascript
constr.apply(obj, arguments)
```

## 第四步

如果构造函数又返回值，则返回；否则，就会默认返回新对象。

首先，要获取这个返回值，我们让：

```javascript
var  result = constr.apply(obj, arguments);
```

但是， new 这个关键字，并不是所有返回值都原封不动返回的。如果返回的是 undefined， null 以及基本类型的时候，都会返回新的对象；而只有返回对象的时候，才会返回构造函数的返回值。

因此，我们要判断 result 是不是  object 类型，如果是 object 类型，那么就返回  result ，否则，返回  obj。

```javascript
return  result instanceof  Object? result : obj;
```

好啦，现在我们的完整程序如下：

```javascript
function  myNew() {
  var constr = Array.prototype.shift.call(arguments);
  var obj = Object.create(constr.prototype);
  var result = constr.apply(obj, arguments)；
  return result instanceof Object? result : obj
}
```

