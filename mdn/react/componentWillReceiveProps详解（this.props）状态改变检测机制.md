# componentWillReceiveProps详解（this.props）状态改变检测机制

![](http://cdn.yuyiqiushui.cn/react-circle.jpg)

- getDefaultProps

  `object getDefaultProps()`

  执行一次后，被创建的类会有缓存，映射的值会存在  `this.props` ，前提是这个  prop 不是父组件指定的这个方法在对象被创建之前执行，因此不能在方法内调用  `this.props` , 另外，注意任何  `getDefaultProps()`  返回的对象在实例中共享，不是复制

- getInitialState

  `object getInitialState()`

  控件加载之前执行，返回值会被用于  state  的初始化值

- componentWillMount

  `void  ccomponentWillMount`

  执行一次，在初始化  `render`  之前执行，如果在这个方法内调用 `setState`, `render()` 知道 state 发生变化，并且只执行一次

- render

  render的时候会调用 `render()` 会被调用

  调用 `render` 方法时，首先检查 `this.props`  和  `this.state`  返回一个子元素，子元素可以是 DOM 组件或者其他自定义复合控件的虚拟实现

  如果不想渲染可以返回 null 或者 false，这种场景下， react 渲染一个 <noscript> 标签，当返回 null 或者 false 时， `ReactDOM.findDOMNode(this)`  返回 null，`render`  方法是很纯净的，这就意味着不要在这个方法里初始化组件的 state，每次执行时返回相同的值，不会读写 DOM 或者与服务器交互，如果必须与服务器交互，在 componentDidMount() 方法中实现或者其他生命周期的方法中实现，保持  `render()` 方法纯净使得服务器更准确，组件更简单。

- componentDidMount

  `void componentDidMount`

  组件更新结束之后执行，在初始化 `render`  时不执行

- componentWillReceiveProps

  当 `props`  发生变化时执行，初始化 `render`  时不执行，在这个回调函数里面，你可以根据属性的变化，通过调用 `this.setState()`  来更新你的组件状态，旧的属性还是可以通过 `this.props` 来获取，这里调用更新状态是安全的，并不会触发额外的 `render`  调用。

- componentWillUnmount

  `void componentWillUnmount`

  当组件要被从界面上移除的时候，就会调用 `componentWillUnmount` ，这个函数中，可以做一些组件相关的清理工作，例如取消计时器、网络请求等。

