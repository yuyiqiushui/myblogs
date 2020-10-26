# 我团队一年前端实现 Promise 所有方法

## **从零手写 Promise 完整版**

- 随着前端技术的不断发展，用户对戒面的要求也在不断变高，现在的前端不再是之前的 html + css，而是 html + css + js，但是想学好 js 首先要知道 js 的核心在于异步，说到异步，大部分人第一时间回想到 Promise。

- 那么接下来我们就来学习一下 Promise 是如何实现的吧

- 首先我们回顾一下 Promise 的基本使用

  ```javascript
  const p = new Promise((resolve, reject) => {
  	resolve("返回成功的值");
  	reject("返回失败的值");
  })
  p.then(value => {
  	console,log(value);  //返回成功的值
  })
  ```

  - new  Promise 构造函数内部的回调函数是同步执行的
  - then 的回调函数，是异步执行的
  - 调用 resolve/reject  后，状态已定，状态不能再改变
  - .then 每次返回的都是新的 Promise

## 接下来我们从零开始实现一个 Promise

- 先来实现明确一下基本的结构

  ```javascript
  (function(window){
  	//定义 Promise 构造函数
  	function MyPromise(excutor){
  		function resolve(value){
  		
  		}
  		
  		function reject(reason){
  		
  		}
  		executor(resolve, reject)
  	}
  
  	//MyPromise原型链上存在 then 方法
  
  	MyPromise.prototype.then = function(onResolved, onRejected){
  
  	}
  
  	//MyPromise 原型链上存在 catch 方法
  	MyPrototype.prototype.catch = function(onRejected){
  
  	}
  
  	//MyPromise 实例对象上存在 resolve 方法
  	MyPromise.resolve = function(value){
  
  	}
  
  	//MyPromise 实例对象上存在 reject 方法
  	MyPromise.reject = function(reason){
  
  	}
  
  	//MyPromise 实例对象上存在 all 方法
  	MyPromise.all = function(promises){
  
  	}
  
  	//MyPromise 实例对象上存在 race 方法
  	MyPromise.race = function(promises){
  
  	}
  	
  	window.MyPromise = MyPromise;
  	
  })(window)
  ```

- 明确了基本的结构后，接下来我们看看 MyPromise 的构造函数内需要做什么

- 1、定义 Promise 的初始状态、初始值、存放待执行异步函数的数组

  ```javascript
  (function(window){
  	const PENDDING = 'pendding';
  	const FULFILLED = 'fulfilled';
  	const REJECTED = 'rejected';
  	function MyPromise(executor){
  		const self = this;
  		self.status = PENDDING; //初始状态
  		self.data = undefined; //初始值
  		self.callbacks = [];  //待执行异步回调函数的数组
  		
  		function resolve(value){}
  		function reject(reason){}
  		executor(resolve, reject)
  	}
  	
  	window.MyPromise = MyPromise
  })(window)
  ```

- 2、根据 Promise 状态的不同，进行修改、赋值，以及立即执行回调函数

  ```javascript
  (function(window){
  	const PENDDING = 'pendding';
  	const FULFILLED = 'fulfilled';
  	const REJECTED = 'rejected';
  	function MyPromise(executor){
  		const self = this;
  		self.status = PENDDING; //初始状态
  		self.data = undefined; //初始值
  		self.callbacks = [];  //待执行异步回调函数的数组
  		
  		function resolve(value){
  			self.status = FULFILLED;
  			self.data = value;
  			//立即执行异步回调函数
  			setTimeout(()=>{
  				self.callbacks.forEach(callbacksObj => {
  					callbacksObj.onResolved(value)
  				})
  			})
  		}
  		function reject(reason){
  			self.status = REJECTED;
  			self.data = reason;
  			setTimeout(() => {
  				self.callbacks.forEach(callbacksObj => {
  					callbacksObj.onRejected(reason);
  				})
  			})
  		}
  		executor(resolve, reject)
  	}
  	
  	window.MyPromise = MyPromise
  })(window)
  ```

- 3、别忘了 Promise 的状态一旦改变就不能再修改了，所以在 resolve/reject 函数内部需要加一个判断

  ```javascript
  (function(window){
  	const PENDDING = 'pendding';
  	const FULFILLED = 'fulfilled';
  	const REJECTED = 'rejected';
  	function MyPromise(executor){
  		const self = this;
  		self.status = PENDDING; //初始状态
  		self.data = undefined; //初始值
  		self.callbacks = [];  //待执行异步回调函数的数组
  		
  		function resolve(value){
  		
  			if(self.status !== PENDDING) return;
  		
  			self.status = FULFILLED;
  			self.data = value;
  			//立即执行异步回调函数
  			setTimeout(()=>{
  				self.callbacks.forEach(callbacksObj => {
  					callbacksObj.onResolved(value)
  				})
  			})
  		}
  		function reject(reason){
  			
  			if(self.status !== PENDDING) return;	
  			
  			self.status = REJECTED;
  			self.data = reason;
  			setTimeout(() => {
  				self.callbacks.forEach(callbacksObj => {
  					callbacksObj.onRejected(reason);
  				})
  			})
  		}
  		executor(resolve, reject)
  	}
  	
  	window.MyPromise = MyPromise
  })(window)
  
  ```

- 4、Promise 原型链上的 then 方法，可以接收两个参数 ( 且是回调函数 )，成功/失败，并且每次返回的都是一个新的 Promise

  ```javascript
  //MyPromise 原型链上存在 then 方法
  MyPromise.prototype.then = function (onResolved, onRejected){
  	const self = this;
  	return new MyPromise((resolve, reject) => {
  		//每次返回一个新的 Promise 对象
  		//首先判断当前状态
  		
  		if(self.status === FULFILLED){
  			/*
  			1、返回的 Promise 的结果由 onResolved/onRejected 决定的
  			2、返回的是 Promise 对象 (根据执行结果决定 Promise 的返回结果 )
  			3、返回的不是 Promise 对象（ 该值就是 Promise 的返回结果 ）
  			4、抛出异常 异常的值为返回的结果
  			*/
  			setTimeout(() => {
  				try{
  					const result = onResovle(sele.data);
  					if( reject instanceof MyPromise){
  						result.then(value => {
  							resolve(value);
  						}, reason => {
  							reject(reason);
  						})
  					} else {
  						resolve(result);
  					}
  				} catch (error) {
  					reject(error)
  				}
  			})
  		} else if ( self.status === PENDDING ){
  			self.callbacks.push({
  				onResolved(){
  					try {
  						const result = onResolved(self.data);
  						if(  reject instanceof MyPromise ){
  							result.then(value => {
  								resolve(value);
  							}, reson => {
  								reject(reason);
  							})
  						} else {
  							resolve(result);
  						}
  					} ,
  					
  					onRejected(){
  						try {
  							const result = onRejected(self.data);
  							if(reject instanceof MyPromise ){
  								result.then(value => {
  									resolve(value);
  								}, reason => {
  									reject(reason)
  								})
  							}else {
  								resolve(result);
  							}
  						} catch ( error ){
  							reject( error );
  						}
  					}
  				}
  			})
  		}
  	})
  }
  ```

- 好的，停一下，一步一步讲解

- .then 每次都返回一个新的 Promise ，所以在 .then 方法里是 > return  new  MyPromise( ( resolve.reject ) ){}

- 每一种状态都存在返回值，并且都能是以下三种情况

  返回的是 Promise 对象

  返回的不是 Promise 对象

  抛出异常

- FULFILLED/REJECTED两种状态需要立即执行异步函数

- PENDDING 为什么没有立即执行异步函数，因为当状态为 PENDDING 时就执行 then ，会先往待执行回调函数的数组 ( callbacks )内存放这个回调，紧接着在回到 Promise 的执行其中执行  resolve/reject, 而上面也写过了，执行 resolve/reject 会去待执行回调函数的数组内遍历并赋值。

  ![](http://cdn.yuyiqiushui.cn/promise01.png)

- 好的继续，并且对上面重复的优化一下

  ```javascript
  //MyPromise 原型链上存在 then 方法
  MyPromise.prototype.then = function (onResolved, onRejected){
  	const self = this;
  	return new MyPromise((resolve, reject) => {
  		//每次都返回一个新的 Promise 对象
  		function handle (callback){
  			/*
  				1、返回的 Promise 的结果是由 onResolved/onRejected 决定的
  				2、返回的是 Promise 对象 (根据执行结果 Promise 的返回结果)
  				3、返回的不是 Promise 对象 ( 该值就是 Promise 的返回结果 )
  				4、抛出异常  异常的值为返回的结果
  			*/
  			try {
  				const result = callbacks(self.data);
  				if(reject instanceof MyPromise){
  					result.then(value => {
  						resolve(value);
  					}, reason => {
  						reject(reason);
  					})
  				} else {
  					resolve( result );
  				}
  			} catch (error) {
  				reject(error);
  			}
  		}
  		
  		首先判断当前状态
  		if(self.status === FULFILLED){
  			setTimeout(() => {
  				thandle(onResolved)
  			});
  		} else if (self.status === REJECTED){
  			setTimeout(() => {
  				thandle(onRejected)
  			});
  		} else if (self.status === PENDDING){
  			onResolve(){
  				handle(onResolved)
  			},
  			onRejected(){
  				handle(onRejected)
  			}
  		}
  	})
  }
  ```

- 防止不成功或者失败的回调函数，给成功和失败都给一个默认回调函数

  ```javascript
  MyPromise.prototype.then = function (onResolved, onRejected ){
  	const  self  =  this;
  	//定义默认回调
  	onResolved = typeof  onResolved === 'function' ? onResolved  :  value  =>  value;
  	
  	onRejected = typeof  onRejected === 'function' ? reason => {throw  reason};
  	
  	return new MyPromise((resolve, reject) => {
  		//每次都返回一个新的 Promise 对象
  		function handle (callback) {
  			/*
  				1、返回的 Promise 的结果是由 onResolved/onRejected 决定的
  				2、返回的 Promise 对象 (根据执行结果 Promise 的返回结果)
  				3、返回的不是 Promise 对象 （该值就是 Promise 的返回结果）
  				4、抛出异常，异常的值为返回的结果
  			*/
  			try {
  				const result = callback(self.data);
  				if(reject instanceof MyPromise){
  					result.then(value => {
  						resolve(value);
  					},reason => {
  						reject(reason);
  					})
  				} else {
  					resolve(result);
  				}
  			} catch (error) {
  				reject(error)
  			}
  		}
  		
  		//首先判断当前状态
  		if (self.status === FULFILLED){
  			setTImeout(() => {
  				thandle(onResolved);
  			})
  		} else if (self.status === REJECTED){
  			setTimeout(() => {
  				thandle(onRejected)
  			})
  		} else if( self.status === PENDDING){
  			self.callbacks.push({
  				onResolved(){
  					handle(onResolved)
  				},
  				onRejected(){
  					handle(onRejected)
  				}
  			})
  		}
  	})
  
  }
  ```

- 接着，我们看看catch，其实就是 Promise.prototype.then ( undefined, rejected)

- 或者，Promise.prototype.then( null, rejected)

  ```javascript
  //Mypromise 原型链上存在 catch 方法
  MyPromise.prototype.catch = function (onRejected){
  	return this.then(null, onRejected)
  }
  ```

- 接下来实现一下 Promise.resolve/Promise.reject

  ```javascript
  //MyPromise 实例对象上存在 resolve 方法
  MyPromise.resolve = function (value) {
  	if(value instanceof MyPromise) return value;
  	return new MyPromise(resolve => resolve(value))
  	//返回一个 resolve 状态的 Promise
  }
  
  //MyPromise 实例对象上存在 reject 方法
  MyPromise.reject = function(reason){
  	return new MyPromise((resolve, reject) => reject(reason));
  	//返回一个 reject 状态 Promise 对象
  }
  ```

- 接下来实现一下 Promise.all/Promise.race

  ```javascript
  //MyPromise 实例对象上存在 all 方法
  MyPromise.all = function (promises){
  	let promisesCount = 0;
  	let values = new Array(promise.length);
  	return new MyPromise((resolve, reject) => {
  		promises.forEach((promise, index) => {
  			promise.then(value => {
  				promisesCount++;
  				values[index] = value;
  				if( promisesCount === promises.length){
  					resolve(values);
  				}
  			}, reason => {
  				reject(reason);
  			})
  		})
  	})
  }
  ```

- 好的，我们来看看 Promise.all 实现的思路

  - Promise.all 传入的数组中任意一个对象返回错的结果，都会返回错误的结果
  - Promise.all 传入的数组中，每个 Promise 对象必须都正确才能返回正确的结果数组
  - Promise.all 返回的是一个数组
  - Promise.all 传入的是一个数组

- 好的，其实我们还少一个步骤就是 Promise.all 传入的数组的参数可以不是 Promise的实例，所以数组参数如果不是 Promise 实例，先调用 Promise.resolve

  ```javascript
  //MyPromise 实例对象上存在 all 方法
  MyPromise.all = function (promises){
  	let promisesCount = 0;
  	let values = new Array(promise.length);
  	return new MyPromise((resolve, reject) => {
  		MyPromise.resolve(promise).then(value => {
  			promisesCount++;
  			values[index] = value;
  			if(promisesCount === promises.length){
  				resolve(values);
  			}
  		}, reason => {
  			reject(reason);
  			
  		})
  	})
  }
  ```

- Promise.race 实现

  ```javascript
  //MyPromise 实例对象上存在 race 方法
  MyPromise.race = function (promises){
  	return new MyPromise((resolve, reject) => {
  		promsies.forEach(promise => {
  			MyPromise.forEach(promise => {
  				MyPromise.resolve(promise).then(value => {
  					resolve(value);
  				}, reason => {
  					reject(reason)
  				})
  			})
  		})
  	})
  }
  ```

- 好的，解释一下

  - 若传入的 Promise 执行内容不一致，有先后区分，则结果为执行的最快的一个
  - 传入的 Promise 执行内容相同的情况下， Promise.race 返回的结果为数组中的第一个值
  - Promise.race 传入的也是一个数组

- 至此，从零手写一个 Promise 完成了，其中包括

  - Promise.prototype.then
  - Promise.prototype.catch
  - Promise.resolve
  - Promise.reject
  - Promise.all
  - Promise.race

  ```javascript
  (function (window){
  	const PENDDING = 'pendding';
    const FULFILLED = 'fulfilled';
    const REJECTED = 'rejected';
    //定义 MyPromise
    function MyPromise(executor){
      const self = this;
      self.status = PENDDINg;
      self.data = undefined;
      self.callbacks = [];
      
      function resolve(value){
        if(self.status !=== PENDDING) return;
        self.status = FULFILLED;
        self.data = value;
        //立即执行异步回调函数
        setTimeout(() => {
          self.callbacks.forEach(callbacksObj => {
            callbacksOnj.onResolved(value);
          })
        })
      }
      
      function reject(reason){
        if(self.status !=== PENDDING) return ;
        self.status = REJECTED;
        self.data = reason;
        setTimeout(() => {
          self.callbacks.forEach(callbacksObj => {
            callbacksObj.onRejected(reason)
          })
        })
      }
      
      try {
        exrcutor(resolve, reject)
      }catch (error){
        reject(error)
      }
    }
    
    //MyPromise 原型链上存在 then 方法
    MyPromise.prototype.then = function (onResolved, onRejected){
  		const self = this;
      //定义默认回调
      onResolved = typeof onResolved === 'function'?onResolved: value => value;
      onRejected = typeof onRejected === 'function'?onRejected: reason => {
        throw reason;
      };
      
      return new MyPromise((resolve, reject) => {
        //每次都返回一个新的 Promise 对象
        function handle（callback）{
          /*
          	1、返回的 Promise 的结果是由 onResolved/onRejected 决定的
          	2、返回的 Promise 对象 ()
          */
        }
      })
    }
  })
  ```

  



