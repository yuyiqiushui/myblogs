# throttle-debounce

## throttle(delay, noTrailing, callback, debounceMode)

> return  funtion

限制函数的执行，尤其适用于限制事件处理程序的执行速度，如调整大小和滚动。

- delay   type  Number

  以毫秒为单位的零或更大的延迟，对于事件回调，值在 100 或 250 (甚至更高左右有用)

- noTrailing

  可选，默认为 false。如果 Trailing 为真，那么在调用 throttle 函数时，回调将只执行每一毫秒的延迟。如果 noTrailing 为 false 或未指定，将在最后一次 throttle 函数调用之后执行最后一次回调。(在未未延迟毫秒调用 throttle 函数后，内部计数器被重置 )

- callback  type  function

  延迟毫秒后执行的函数，在 执行 throttle 函数时，此上下文和所有的参数将按原样传递给回调。

- debounceMode   type  boolean

  如果 debounceMode 为 真 ( at begin ) ，调度 clear  在delay  ms 后执行，如果 debounceMode 为假 ( at end )，调度 callback  在 delay  ms 后执行。

## debounce(delay,  atBegin, callback)

return  function

终止函数的执行，与节流不同，公开保证一个函数只执行一次，要么在一系列调用开始，要么在最后。

- delay   type  Number

  以毫秒为单位的零或更大的延迟，对于事件回调，值在 100 或 250 ( 甚至更高 ) 左右最有用

- atBegin  type  Boolean

  可选，默认为 false。如果 atBegin 为 false 或 未指定，回调将在最后一次 防抖 函数调用之后的几毫秒执行。 如果 atBegin 为真，回调将只在第一次被调用的函数时执行，( 在未为延迟毫秒调用 throttle 函数后，内部计数器被重置 )

- callback  type  function

  延迟毫秒后执行的函数，这个上下文和所有的参数在执行  debounce  函数时按原样传递给回调。

## example

### 函数防抖和节流

函数防抖和节流是优化高频率执行  js  代码的一种手段， js 中的一些事件如浏览器的 resize、scroll，鼠标的 mousemove、mouseover，input 输入框的 keypress 等事件在触发时。会不断的调用绑定在事件上的回调函数，极大地浪费资源，降低前端性能。为了优化体验，需要对这类事件进行调用次数的限制。

### 函数防抖

> 在事件被触发 n 秒后再执行回调，如果在这 n 秒内又被触发，则重新计时

```javascript
//根据函数防抖思路设计出第一版的最简单的防抖代码：
let timer;  //维护同一个  timer
function debounce (fn, delay){
	clearTimeout( timer )
	timer = setTimeout( function (){
		fn();
	},delay)
}
```

```javascript
//用 onmousemove 测试一下防抖函数：
function testDebounce (){
	console.log('test');
}
document.onmousemove = () => {
	debounce(testDebounce, 1000)
}
```

上面的例子中的 debounce 就是防抖函数，在 document 中鼠标移动的时候，会在 onmousemove 最后触发的  1s 后执行回调函数 testDebounce ；如果我们一直在浏览器中移动鼠标 ( 比如 10s )，会发现会在 10 + 1s 后才会执行  testDebounce 函数 ( 因为 clearTimeout(timer)，每次移动还没来得及执行 timer 就再次触发  debounce 然后  clearTimeout(timer) ) ，这个就是函数防抖。



在上面的代码中，会出现一个问题，let timer 只能在 setTimeout 的父级作用域中，这样才是同一个 timer ，并且为了方便防抖函数的调用和回调函数  fn 的传参问题，我们应该用闭包解决这些问题。



优化后的代码：

```javascript
function debounce ( fn, delay ){
	let timer;  // 维护一个 timer
	return function ( ){
		let _this = this;  //取 debounce 执行作用域的 this
		let args = arguments
		if(timer){
			clearTimeout( timer );
		}
		
		// timer = setTimeout( function (){
		// fn.apply(_this, args) ;  //用 apply 指向调用 debounce 的对象。相当于 _this.fn( args );
			 	
		}, delay)
		
		timer = setTimeout ( () => {
			fn.apply(this, args);  //用 apply 指向调用 debounce 的对象，相当于 this.fn(args)
		}, delay)
	}
}
```

测试用例：

```javascript
//test
function testDebounce (e, content) {
	console.log(e,content)
}

var testDebounceFn = debounce(testDebounce, 1000) ; //防抖函数
document.onmousemove = function (e){
	testDebounce(e, 'debounce') //给防抖函数传参
}
```

如下图：鼠标一直不动，则不输出，若停止移动，则 1s 后输出一次

![ ](http://cdn.yuyiqiushui.cn/debounce1.png)

### 函数节流

> 每隔一段时间，只执行一次函数

#### 定时器实现节流函数

注意和防抖代码的差异

```javascript
function throttle (fn, delay){
  let timer;
  return function (){
    let _this = this;
    let args = arguments;
    if(timer){
      return;
    }
    timer = setTimeout (function (){
      fn.apply(_this, args)
      timer = null;  //在 delay 后执行完 fn 之后清空 timer， 此时 timer 为 假， throttle 触发可以进入计时器
    }， delay)
  }
}
```

测试用例：( 几乎和防抖的用例一样 )

```javascript
function testThrottle(e, content){
  console.log(e, content);
}

let testThrottleFn = throttle(testThrottle, 1000); //节流函数
document.onmousemove = function (e){
  testThrottleFn(e, 'throttle'); //给节流函数传参
}

```

![](http://cdn.yuyiqiushui.cn/debounce2.png)

如上，若一直在浏览器中移动鼠标 ( 比如 10 s )，则在这 10s 内会每隔 1 s 执行一次 testThrottle



函数节流的目的，是为了限制函数一段时间内只能执行一次。因此，定时器实现节流函数通过使用定时任务，延时方法执行。在延时的事件内，方法若被触发，则直接退出方法。从而，实现函数一段时间内只执行一次。



#### 时间戳实现节流函数

```javascript
function throttle (fn, delay){
  let previous = 0;
  return function (){
    let _this = this;
    let args = arguments;
    let now = new Date();
    if( noew - previous > delay) {
      fn.apply(_this, args);
      previous = now;
    }
  }
}

// test
function testThrottle (e, content){
  console.log(e, content)
}

let testThrottleFn = throttle(testThrottle, 1000); //节流函数
document.onmousemove = function (e){
  testThrottle(e, 'throttle') //给节流函数传参
}
```

![](http://cdn.yuyiqiushui.cn/debounce3.png)

原理：通过比对上一次执行时间与本次执行时间的时间差与间隔时间的大小关系，来判断是否执行函数。若时间差大于间隔时间，则立刻执行一次函数。并更新上一次执行时间。



#### 函数防抖与节流的比较

相同点：

- 都可以通过使用 setTimeout 实现
- 目的都是，降低回调执行频率。节省计算资源。

不同点：

- 函数防抖，在一段连续操作结束后，处理回调，利用 clearTimeout  和  setTimeout 实现。函数节流，在一段连续操作中，每一段时间只执行一次，频率较高的事件中使用来提高性能。
- 函数防抖关注一定时间连续触发的事件只在最后执行一次，而函数节流侧重于一段时间内只执行一次。



#### 应用场景：

##### 函数防抖的应用场景：

连续的事件，只需触发一次回调的场景有：

- 搜索框搜索输入。只需用户最后一次输入完，再发送请求
- 手机号、邮箱验证输入检测
- 窗口大小 resize。只需窗口调整完成后，计算窗口大小，防止重复渲染。

##### 函数节流的应用场景

间隔一段时间执行一次回调的场景有：

- 滚动加载，加载更多或滚到底部监听
- 谷歌搜索框，搜索联想功能
- 高频点击提交，表单重复提交