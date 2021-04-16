# 实现 call 和 apply

apply:  传入两个参数，第一个参数就是 this 的指向，第二参数就是函数参数组成的数组；

call: 	传入多个参数，第一个参数也是 this 的指向，之后的参数都是函数的参数；

## 思路整理

## call

我们先看一个 call 的例子：

```javascript
var  person = {
  fullName: function(txt) {
    console.log(txt + this.firstName + " " + this.lastName )
  }
}

var person1 = {
  firstName: 'John',
  lastName: 'Doe'
}

person.fullName.call(person1, 'Hello, ')
```

上面的 call 做了这几件事情，分为三步：

1、person.fullName.call ( person1 ) 这个函数调用时候的 this  指向变了，如果只是使用 person.fullName( ) 的话，是隐式绑定， this  应该指向  person 。但是使用  person.fullName.call ( person1 ) 之后变成了显示绑定， this 绑定传入的第一个参数，即 person1。

2、从 call 函数传入的第二个参数开始，作为 person.fullName 的参数传入。

3、不更改 person 和 person1 的任何属性和方法。person 这一边，如果你再次调用  person.fullName ( )，不会打印任何和  person1 相关的信息；而 person1 这一边，并没有增加或者更改它自身的任何方法。



### 第一步

我们在调用 person.fullName.call( person1 ) 的时候， this 应该指向  person1 。解决办法就是在  person1 上添加一个方法，让这个方法等于  person.fullName。我们来写一下：

```javascript
Function.prototype.myOwnCall = function (context) {
	context.fn = this;
  context.fn();
}
```

调用一下 person.fullName.myOwnCall ( person1, "Hello, " )

输出结果是： undefined  John  Doe

这里，我们的  context  就是  person1 ，this  就是  person.fullName 这个函数的定义，我们在  context  上添加了一个  fn 方法，让他等于  fullName  这个函数，然后调用这个函数。



另外，如果看 call 的文档可以发现，如果第一参数传入的是  null 的情况下， this  会指向  window ，那么我们需要在 函数刚开始的时候，让：

```javascript
context = context  ||  window
```

等等，如果 fullName 有返回值怎么办？比如，我们把  person 的 fullName 改成

```javascript
fullName: function (txt) {
  return txt + this.firstName + " " + this.lastName
}
```

这太容易了，直接把 fn 执行结果保存下来，直接返回就可以了。

很好，尽管参数还没有传进去，但完成了第一步的要求，代码如下：

```javascript
Function.prototype.myOwnCall = function (context) {
	context = context || window
  context.fn = this
  var result = context.fn()
  return result;
}
```

### 第二步

从 call 函数传入的第二个参数开始，作为  person.fullName 的参数传入。从第二个参数开始，分别可以用 arguments[1]，arguments[2]。。。表示。有多少个 arguments 我们提前并不知道。怎么把它们传入 fn() 呢？

熟悉 ES6 的朋友知道，我直接传人 ...Array.from( arguments ).slice(1) 不就可以了么。可以是可以，不过如果面试官不让你用 新特性怎么办？



这里就要用到  eval  函数。 eval 函数可以计算传入的字符串，然后执行其中的  JS  代码，使用  eval 之后，代码如下：

```javascript
Function.prototype.myOwnCall = function( context ) {
	context = context || window;
  context.fn = this;
  
  var args = []
  for(var i = 1; i < arguments.length; i++ ){
    args.push("arguments[" + i + "]")
  }
  
  var result = eval("context.fn(" + args + ")");
  return  result;
}
```

### 第三步

不更改  person  和  person1 的任何属性和方法。

对于  person  来说，我们的代码并没有更改任何属性或者方法。但对于  person1，我们增加了一个  fn  方法，因此，要把这个方法在运行之后删掉：

```javascript
delete  context.fn;
```

但是，又出现了一个问题，如果  person1 本身就有一个方法叫做  fn 怎么办？那不是调用  call  之后，就会把它本身这个方法删掉了么？有的朋友会说，那起一个复杂点的函数名，保证其他人不会起这么少见的名称不就完了吗？不行，这也不能保证万无一失。



怎么办？我们可以利用 Math.random() 随机生成一个 id，如果这个 id 已经存在于  person1 上，那么再生成一个 id。好了，最终的程序是这样的：

```javascript
Function.prototype.myOwnCall = function(context) {
  context = context || window;
  var uniqueID = "00" + Math.random();
  while (context.hasOwnProperty(uniqueID)) {
    uniqueID = "00" + Math.random();
  }
  context[uniqueID] = this;

  var args = [];
  for (var i = 1; i < arguments.length; i++) {  
    args.push("arguments[" + i + "]");
  }
  var result = eval("context[uniqueID](" + args + ")");
  delete context[uniqueID];
  return result;
}
```

## Apply

而apply则十分类似，过程不再赘述，只需要注意一下，第二个参数是否存在就可以：

```javascript
Function.prototype.myOwnApply = function(context, arr) {
  context = context || window
  var uniqueID = "00" + Math.random();
  while (context.hasOwnProperty(uniqueID)) {
    uniqueID = "00" + Math.random();
  }
  context[uniqueID] = this;

  var args = [];
  var result = null;
 
  if (!arr) {
    result = context[uniqueID]();
  } else {
    for (var i = 0; i < arr.length; i++) { 
      args.push("arr[" + i + "]");
    }
    result = eval("context[uniqueID](" + args + ")");
  }
  delete context[uniqueID];
  return result;

}
```

