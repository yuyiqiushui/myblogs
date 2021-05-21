实现 bind

bind:  方法创建一个新的函数，在 bind( ) 被调用时，这个新函数的 this 被 bind 的第一个参数指定，其余的参数将作为新函数的参数供调用使用。

例子：

```javascript
var obj = {name:"Smiley"};
var greeting = function(str, lang){
    this.value = 'greetingValue';
    console.log("Welcome "+this.name+" to "+str+" in "+lang);
};
var objGreeting = greeting.bind(obj, 'the world'); 

objGreeting('JS')
```

在这个例子当中，以及对 MDN 对 bind  的描述中， bind 一共做了四件事情：

1、bind 改变了 greeting 当中 this 的指向，使得 this 指向了 obj ，因此， this.name 的内容是 Smiley。最后， bind 会返回一个函数。

2、我们可以在调用 bind 的时候，就可以开始给 greeting 传递参数。

3、我们在调用 objGreeting 这个函数的时候，再传入剩余的参数。上例中，第二个参数的 "JS" 作为第二个参数 lang

4、这个是 MDN 中提到的： "bind（）函数会创建一个新绑定函数 ( bound function, BF )。绑定函数也可以使用 new 运算符构造，提供的 this 值会被忽略，但前置参数仍会提供给模拟函数"。有点晦涩，这也是 bind 实现中最复杂的一步，使用 new 关键字这种情况我们一会再分析。

第一步

```javascript
Function.prototype.myBind = function () {
  var thatFuc = this;
  var thatArg = arguments[0];
  return function() {
    return thatFunc.apply(thatArg);
  }
}
```

首先，在 bind 的函数中， this 的指向是 greeting （隐式调用）。我们把 this 保存在 thatFuc ，否则如果在返回的函数中直接使用 this 的话， this 的指向会随着场景的不同发生变化，而不是一直指向 greeting。

这里的 arguments 中第一个元素就是我们调用 bind 时候传入的第一个参数 obj，使用 apply 这个函数，调用了 greeting ，并把 greeting 中的 this 指向了 obj。另外 greeting 可能有返回值，因此我们需要 return  thatFunc.apply( thatArg )

由于 bind 函数并不是立即执行，而是要返回一个函数，所以需要把 return  thatFunc.apply( thatArg )  包装在一个函数当中进行返回。

这样，我们就完成了 this 指向的改变。并返回一个函数。另外，我们还需要判断一下， thatFunc 是不是一个 function, 如果不是的话，就报错，目前代码如下所示：

```javascript
Function.prototype.myBind = function() {
	var thatFunc = this;
  var thatArg = arguments[0];
  if(typeof thatFunc !== 'function') {
    throw new TypeError('Function.prototype.bind - ' +
             'what is trying to be bound is not callable');
  }
  return function() {
		return thatFunc.apply(thatArg);
  }
}
```

第二步

我们需要把调用 bind 时传入的函数参数，继续传入到返回函数中；

```javascript
Function.prototype.myBind = function(){
	var thatFunc = this;
  var thatArg = arguments[0];
  var args = Array.prototype.slice.call(arguments, 1)
  if (typeof thatFunc !== 'function') {
        throw new TypeError('Function.prototype.bind - ' +
             'what is trying to be bound is not callable');
    }
  return function(){
		return thatFunc.apply(thatArg, args)
  }
}
```

由于 arguments 是类数组，并没有 slice 这个方法，因此，我们通过使用 call 这个函数，让 arguments 也可以使用 slice 这个方法，从而通过 slice(1) 获取第二个参数以及以后的参数。( 如果 Array.prototype.slice.call( arguments，1 ) 理解起来比较吃力的话，你可以把它当做 arguments.slice(1)。当然，这只是帮助理解，如果你直接使用的话，肯定会报错的。

之后，把得到的 args 传入 apply 函数，作为第二个参数。

如果这时，我们跑一下我们最开始的例子，会得到’ Welcome Smiley to bind in undefined’，这是正确的，因为我们 lang 这个参数还没有传入。

第三步

我们需要把调用 objGreeting 时候的参数，传入 apply 的第二个参数当中，补全参数列表。

实际上，我们调用 objGreeting 的时候，执行的是这个函数：

```javascript
function () {
	return thatFunc.apply(thatArg, args)
}
```

因此，我们只需要把这个函数接受到的 arguments ，和之前 args 拼在一起成为一个数组就可以了，如下所示：

```javascript
var funcArgs = args.concat( Array.prototype.slice.call( arguments ))
```

很简单吧，我们代码现在如下：

```javascript
Function.prototype.myBind = function() {
    var thatFunc = this,
        thatArg = arguments[0];
    var args = Array.prototype.slice.call(arguments, 1);
    if (typeof thatFunc !== 'function') {
throw new TypeError('Function.prototype.bind - ' +
             'what is trying to be bound is not callable');
    }

    return function(){
    	var funcArgs = args.concat(Array.prototype.slice.call(arguments));
      	return thatFunc.apply(thatArg, funcArgs);
    };
}
```

第四步

"bind()  函数会创建一个新绑定函数 ( bound function , BF ) 。绑定函数也可以使用 new 运算符构造，提供的 this 值会被忽略，但前置参数仍会提供给模拟函数" 。这是什么意思呢？

我们把最开始使用 bind 的例子改一点，使用 new 来调用 objGreeting:

```javascript
var obj = {name:"Smiley"};
var greeting = function(str, lang){
    this.value = 'greetingValue';
    console.log("Welcome "+this.name+" to "+str+" in "+lang);
};
var objGreeting = greeting.myBind(obj, 'the world'); 
var newObj = new objGreeting('JS');
console.log(newObj.value);
```

我们运行一下，打印出来的结果是：

```javascript
Welcome Smiley to the world in JS
Undefined
```

而如果我们把 greeting.myBind  改为  greeting.bind ，即，使用我们要模拟的原生  bind  方法，打印出来的却是：

```javascript
Welcome undefined to the world in JS
greetingValue
```

我们的结果和真正的 bind 出来的结果区别在哪里呢？主要有两点：

1、调用 greeting 的时候， this 应该指向  newObj，这就是因为 MDN 提到的 " 绑定函数也可以使用 new 运算符构造，提供的 this 值会被忽略"。新的 this 指向就应该是 new 运算符构造出来的 this 指向，即 newObj 。而在我们的 myBind 中，返回的匿名函数中， this 却还是指向 obj。

2、newObj.value 应该打印出 greeting 的 value 属性，因为 newObj 应该 "继承" 自 greeting 。而我们的 myBind ，因为内部没有对 prototype 进行任何更新，那么 newObj 默认继承自 myBind 返回的匿名函数的原型对象，即 Object，Object 上没有 value，当然打印出来的就是    undefined  。

怎么办呢？我们先把代码放上，然后一点一点分析：

```javascript
Function.prototype.myBind = function() {
    var thatFunc = this, 
        thatArg = arguments[0];
    var args = Array.prototype.slice.call(arguments, 1)
    if (typeof thatFunc !== 'function') {
        throw new TypeError('Function.prototype.bind - ' +
             'what is trying to be bound is not callable');
    }
    var fBound  = function() {
        return thatFunc.apply(this instanceof fBound
                 ? this
                 : thatArg,
                 args.concat(Array.prototype.slice.call(arguments)));
        };
    fBound.prototype = thatFunc.prototype;
    return fBound;
} 
```

this instanced fBound  这句话中的  this  ，如果是在  new  关键字调用情况下，会指向  newObj，而  newObj  就是 fBound  的实例， this  instanceof  fBound  就是  true，我们不再使用  thatArg 作为  greeting 的  this ，而是直接使用  newObj 作为  greeting  的  this 。而当作普通函数调用的时候， this  instanceof  fBound  就是  false，greeting 中的  this  依然指向  thatArg。

我们已经满足的区别的第一点，区别的第二点就是通过  fBound.prototype = thatFunc.prototype  ；来实现。如果没有这句话，在  new  关键字调用下，newObj '继承' 自   

Object ；加上这句话后，我们把  fBound  的  prototype  修改为  绑定函数的  prototype ，这样  newObj  就可以  "继承" 自  greeting 了。

不过，上述代码还有一个问题，如果我们修改了 fBound 的 prototype，greeting 的  prototype 也会被修改。因此，我们需要一个中间变量 fNOP，让他等于一个空函数，通过 fNOP 来维护原型关系，并让 fBound,prototype 与 thatFunc.prototype 不再指向同一个原型函数。

```javascript
Function.prototype.myBind = function() {
    var thatFunc = this, 
        thatArg = arguments[0];
    var args = Array.prototype.slice.call(arguments, 1)
    if (typeof thatFunc !== 'function') {
        throw new TypeError('Function.prototype.bind - ' +
             'what is trying to be bound is not callable');
    }
    var fBound  = function() {
        return thatFunc.apply(this instanceof fBound
                 ? this
                 : thatArg,
                 args.concat(Array.prototype.slice.call(arguments)));
        };
    var fNOP = function() {};
    if (thatFunc.prototype) {
      fNOP.prototype = thatFunc.prototype; 
    }
    fBound.prototype = new fNOP();
    return fBound;
}
```

 fNOP 和 greeting 使用同一个 prototype ，而  fBound.prototype 实际上是  fNOP 的一个实例，而这个实例的 `__proto__` 才指向的是 greeting.prototype。因此，直接修改  fBound.prototype 并不会修改  greeting 的  prototype。

