# 从零开始实现一个React（二）：组件和生命周期 

前言

## 组件

React 定义组件的方式可以分为： 函数 和 类，函数定义可以看做是类定义的一种简单形式。

**createElement 的变化**

```js
function createElement ( tag, attractive, ...children ) {
	return {
    tag,
    attr,
    children
  }
}
```

这种实现我们前面暂时只用来渲染原生 DOM 元素，而对于组件， **createElement**  得到的参数略有不同：

如果 JSX 片段中的某个元素，那么 **createElement**  的第一个参数 `tag`  将会是一个方法，而不是字符串。

> 区分组件和原生DOM的工作，是`babel-plugin-transform-react-jsx`帮我们做的

例如在处理  `<Welcome  name="Sara" /> `  时，`createElement `  方法的第一个参数 `tag `  ，实际上就是我们定义  `Welcome `  的方法：

```js
function Welcome ( props ){
  render() {
    return  <h1> Hello, { this.props.name } </h1>
  }
}
```

我们不需要对 `createElement` 做修改，只需要知道如果渲染的是组件，tag的值将是一个函数

## 组件基类React.Component

通过类的方式定义组件，我们需要继承  `React.Component`：

```js
class Welcome extends React.Component {
    render() {
        return <h1>Hello, {this.props.name}</h1>;
    }
}
```

所以我们就需要先来实现 React.Component 这个类：

## Component

React.Component包含了一些预先定义好的变量和方法，我们来一步一步地实现它：
先定义一个`Component`类：

```js
class Component {}
```

**state & props**

通过继承`React.Component`定义的组件有自己的私有状态`state`，可以通过`this.state`获取到。同时也能通过`this.props`来获取传入的数据。
所以在构造函数中，我们需要初始化`state`和`props`

```js
// React.Component
class Component {
  constructor( props = {} ) {
        this.state = {};
        this.props = props;
    }
}
```

**setState**

组件内部的`state`和渲染结果相关，当`state`改变时通常会触发渲染，为了让React知道我们改变了`state`，我们只能通过`setState`方法去修改数据。我们可以通过`Object.assign`来做一个简单的实现。
在每次更新`state`后，我们需要调用`renderComponent`方法来重新渲染组件，`renderComponent`方法的实现后文会讲到。

```js
import { renderComponent } from '../react-dom/render'
class Component {
    constructor( props = {} ) {
        // ...
    }

    setState( stateChange ) {
        // 将修改合并到state
        Object.assign( this.state, stateChange );
        renderComponent( this );
    }
}

```

你可能听说过 React 的 setState 是异步的，同时它有很多优化手段，这里我们暂时不去管它，在以后会有一篇文章专门来讲 setState 方法。

## render

上一篇文章中实现的render方法只支持渲染原生DOM元素，我们需要修改`ReactDOM.render`方法，让其支持渲染组件。
修改之前我们先来回顾一下上一篇文章中我们对`ReactDOM.render`的实现：

```react
function render( vnode, container ) {
    return container.appendChild( _render( vnode ) );
}

function _render( vnode ) {

    if ( vnode === undefined || vnode === null || typeof vnode === 'boolean' ) vnode = '';

    if ( typeof vnode === 'number' ) vnode = String( vnode );

    if ( typeof vnode === 'string' ) {
        let textNode = document.createTextNode( vnode );
        return textNode;
    }

    const dom = document.createElement( vnode.tag );

    if ( vnode.attrs ) {
        Object.keys( vnode.attrs ).forEach( key => {
            const value = vnode.attrs[ key ];
            setAttribute( dom, key, value );
        } );
    }

    vnode.children.forEach( child => render( child, dom ) );    // 递归渲染子节点

    return dom; 
}
```

我们需要在其中加一段用来渲染组件的代码：

```react
function _render( vnode ) {

    // ...

    if ( typeof vnode.tag === 'function' ) {

        const component = createComponent( vnode.tag, vnode.attrs );

        setComponentProps( component, vnode.attrs );

        return component.base;
    }
    
    // ...
}
```

## 组件渲染和生命周期

在上面的方法中用到了 ` createComponent `  和  `setComponentProps `  两个方法，组件的生命周期方法也会在这里面实现。

> 生命周期方法是一些在特殊时机执行的函数，例如  componentDidMount 方法会在组件挂载后执行

`createComponent`方法用来创建组件实例，并且将函数定义组件扩展为类定义组件进行处理，以免其他地方需要区分不同定义方式。

```react
// 创建组件
function createComponent( component, props ) {
  let inst;
  //  如果是类定义组件，则直接返回实例
  if( component.prototype && component.prototype.render ){
    inst = new component( props );
    // 如果是函数定义组件，则将其扩展为类定义组件
  } else {
    inst = new Component( props )
    inst.constructor = component
    inst.render = function() {
      return this.constructor( props )
    }
  }
  return inst
}
```

` se`





Script、

service  worker、web  socket  socket.io   、express  koa  
