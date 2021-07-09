##### 从零开始实现React：JSX 和 虚拟 DOM

前言

React 是前端最受欢迎的框架之一，解读其源码的文章非常多，但是从另一个角度去解读React: 从零开始实现一个React，从API 层面实现React 的大部分功能，在这个过程中去探索为什么有虚拟 DOM、DIFF、为什么 setState 这样设计等问题。

提起React , 总是免不了和 VUE 做一番对比

Vue 的 API 设计非常简洁，但是其实现方式却让人感觉是“魔法”， 开发者虽然能马上上手，但其原理却很难说清楚。

相比之下  React  的设计哲学非常简单，虽然有很多需要自己处理的细节问题，但它没有引入任何新的概念，相对更加的干净和简单。



关于JSX

在开始之前，我们有必要搞清楚一些概念。

我们来看一下这样的一段代码：

```react
const title = <h1 className="title">Hello, world!</h1>;
```

这段代码并不是合法的  js 代码，它是一种被称为  jsx 的语法扩展，通过它我们就可以很方便的在  js  代码中书写  html  片段。

本质上， jsx 是语法糖，上面这段代码会被  babel  转换成如下代码：

```react
const title = React.createElement(
    'h1',
    { className: 'title' },
    'Hello, world!'
);
```

你可以在babel 官网提供在线的转译测试  jsx 转换后的代码，这里有一个[稍微复杂一点的例子](https://babeljs.io/repl/#?babili=false&browsers=&build=&builtIns=false&code_lz=DwEwlgbgBAxgNgQwM5IHIILYFMC8AiGAewDsAXBMYrAJzwD4AoKKYACwEYpSxS5c9WWOHEJ5YiFOmz4E9QcMLAA9B0bM27OgHdC1OCGWqGy8BDpA&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&lineWrap=true&presets=es2015%2Creact%2Cstage-0&prettier=false&targets=&version=6.26.0&envVersion=)

准备工作