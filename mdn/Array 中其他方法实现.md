## map方法：

- 特点：

1. 循环遍历数组，并返回一个新数组
2. 回调函数一共接收3个参数，分别是：「正在处理的当前元素的值、正在处理的当前元素的索引、正在遍历的集合对象」

- 用法：

```js
let array = [1, 2, 3].map((item) => {
  return item * 2;
});

console.log(array);  // [2, 4, 6]
```

- 实现：

```js
Array.prototype.map = function(fn) {
  let arr = [];
  for(let i = 0; i < this.length; i++) {
    arr.push(fn(this[i], i, this));
  }
  return arr;
};
```

## filter方法：

- 特点：

1. 该方法返回一个由通过测试的元素组成的新数组，如果没有通过测试的元素，则返回一个空数组
2. 回调函数一共接收3个参数，同 map 方法一样。分别是：「正在处理的当前元素的值、正在处理的当前元素的索引、正在遍历的集合对象」

- 用法：

```js
let array = [1, 2, 3].filter((item) => {
  return item > 2;
});

console.log(array); // [3]
```

- 实现：

```js
Array.prototype.filter = function(fn) {
  let arr = [];
  for(let i = 0; i < this.length; i++) {
    fn(this[i]) && arr.push(this[i]);
  }
  return arr;
};
```

## some方法：

- 特点：

1. 在数组中查找元素，如果找到一个符合条件的元素就返回true，如果所有元素都不符合条件就返回 false；
2. 回调函数一共接收3个参数，同 map 方法一样。分别是：「正在处理的当前元素的值、正在处理的当前元素的索引、正在遍历的集合对象」。

- 用法：

```js
let flag = [1, 2, 3].some((item) => {
  return item > 1;
});

console.log(flag); // true
```

- 实现：

```js
Array.prototype.some = function(fn) {
  for(let i = 0; i < this.length; i++) {
    if (fn(this[i])) {
      return true;
    }
  }
  return false;
};
```

## every方法：

- 特点：

1. 检测一个数组中的元素是否都能符合条件，都符合条件返回true，有一个不符合则返回 false
2. 如果收到一个空数组，此方法在任何情况下都会返回 true
3. 回调函数一共接收3个参数，同 map 方法一样。分别是：「正在处理的当前元素的值、正在处理的当前元素的索引、正在遍历的集合对象」

- 用法：

```text
let flag = [1, 2, 3].every((item) => {
  return item > 1;
});

console.log(flag); // false
```

- 实现：

```js
Array.prototype.every = function(fn) {
  for(let i = 0; i < this.length; i++) {
    if(!fn(this[i])) {
      return false
    }
  }
  return true;
};
```

## forEach方法：

- 特点：

1. 循环遍历数组，该方法没有返回值
2. 回调函数一共接收3个参数，同 map 方法一样。分别是：「正在处理的当前元素的值、正在处理的当前元素的索引、正在遍历的集合对象」

- 用法：

```js
[1, 2, 3].forEach((item, index, array) => {
  // 1 0 [1, 2, 3]
  // 2 1 [1, 2, 3]
  // 3 2 [1, 2, 3]
  console.log(item, index, array)  
});
```

- 实现：

```js
Array.prototype.forEach = function(fn) {
  for(let i = 0; i < this.length; i++) {
    fn(this[i], i, this);
  }
};
```

## reduce方法：

- 特点：

  1、初始值不传时的特殊处理：会默认用数组中的第一个元素；

  2、函数的返回结果会作为下一次循环的 prev；

  3、回调函数3一共接收4个参数，分别是「上一次调用回调时返回的值、正在处理的元素、正在处理的元素的索引，正在遍历的集合对象」

  - 用法：

  ```js
  let total = [1, 2, 3].reduce((prev, next, currentIndex, array) => {
    return prev + next;
  }, 0);
  
  console.log(total); // 6
  ```

  - 实现：

  ```js
  Array.prototype.reduce = function(fn, prev) {
    for(let i = 0; i < this.length; i++) {
      // 初始值不传时的处理
      if (typeof prev === 'undefined') {
        // 明确回调函数的参数都有哪些
        prev = fn(this[i], this[i+1], i+1, this);
        ++i;
      } else {
        prev = fn(prev, this[i], i, this)
      }
    }
    // 函数的返回结果会作为下一次循环的 prev
    return prev;
  };
  ```

## Object.create:

- 特点：

  创建一个新对象，使用现有的对象来提供新创建的对象的__proto__

  ```text
  let demo = {
      c : '123'
  };
  let cc = Object.create(demo);
  console.log(cc.c); // 123
  ```

- 实现：

  ```js
  function create(proto) {
  	function Fn() {};
    Fn.prototype = proto;  // 将 Fn 的原型指向传入的  proto
    Fn.prototype.constructor = Fn;
    return  new Fn();
  }
  ```

  



## 比较两个对象是否相等

```js
function isObjectEqual ( a = {}, b = {} ): boolean {
  // handle null value #1566
  if( !a || !b ) return a === b
  const  aKeys = Object.keys(a).sort()
  const  bKeys = Object.keys(b).sort()
  if(aKyes.length !== bKeys.length) {
    return false
  }
  return  aKeys.every( (key, i) => {
    const aVal = a[key]
    const bKey = bKeys[i]
    if( bKey !== key ) return false
    const  bVal = b[key]
    // query values  can  be  null  and  undefined
    if( typeof aVal === 'object' && typeof bVal === 'object' ){
      return isObjectEqual(aVal, bVal)
    }
    return String(aVal) === String(bVal)
  })
}
```

## 深拷贝

```js
function clone (value) {
  if( Array.isArray(value) ){
    return value.map(clone)
  } else if ( value && typeof value === 'object'){
    const res = {}
    for ( const key in value ){
			res[key] = clone(value[key])
    }
    return res
  } else {
    return value
  }
}
```

