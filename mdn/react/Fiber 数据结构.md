# Fiber

```javascript
// Fiber 对应一个组件需要被处理或者已经处理了，一个组件可以有一个或者多个 Fiber
type Fiber = {|
	// 标记不同的组件类型
  tag: WorkTag,
              
  // ReactElement 里面的 key            
  key: null | string
              
  // ReactElement.type，也就是我们调用 `createElement` 的第一个参数
  elementType: any,
              
  // the resolved  function/class/  associated  width  this  fiber
  // 异步组件  resolved  之后返回的内容，一般是  `function` 或者  `class`
  type: any
              
  // the local state associated with this fiber
  //  跟当前 Fiber 相关本地状态 (比如浏览器环境就是 DOM 节点 )
  stateNode: any,
              
  // 指向他在 Fiber 节点树中的 `parent` ,用来在处理完这个节点之后向上返回
  return： Fiber ｜ null,
              
  // 单链表树结构
  // 指向自己的第一个节点
  child: Fiber | null,
   
  // 指向自己的兄弟结构
  // 兄弟节点的 return 指向同一个父节点
  sibling： Fiber ｜ null,
  index: number,
              
  // ref 属性
  ref: null | ((( handle: mixed) => void) & {_stringRef: ?string}) | RefObject,
    
  // 新的变动带来的新的 props
  pendingProps: any,
    
  // 上一次渲染完成之后的 props
  memoizedProps: any,
    
  // 该 Fiber 对应的组件产生的 Update 会存放在这个队列里面
 	updataQueue: UpdateQueue<any> | null,
    
  // 一个列表，存放这个 Fiber 依赖的 context
  firstContextDependency: ContextDependency<mixed> | null,
  
  // 用来描述当前 Fiber 和 他子树的 `Bitfield`
  //	共存的模式表示这个子树是否默认是异步渲染的
  // Fiber被创建的时候他会继承父 Fiber
  // 其他的标识也可以在创建的时候被设置
  // 但是在创建之后不应该再被修改，特别是他的子 Fiber 创建之前
  mode: TypeOfMode,
  
  // Effect
  // 用来记录 Side Effect
  nextEffect: Fiber | null,
    
  // 子树中第一个 side  effect
  firstEffect: Fiber | null,
  
  // 子树中最后一个 side  effect
  lastEffect: Fiber | null,
    
  // 代表任务在未来哪个时间点应该被完成
  // 不包括他的子树产生的任务
  expirationTime: ExpirationTime,
    
  // 快速确定子树中是否有不再等待的变化
  childExpirationTime: ExpirationTime,
    
  // 在 Fiber 树更新的过程中，每个 Fiber 都会有一个跟其对应的 Fiber
  // 我们称他为 `current <==> workInprogress`
  // 在渲染完成之后他们会交换位置
  alternate: Fiber | null,
    
  // 下面是调试相关的，收集每个 Fiber 和子树渲染时间的
  actualDuration?: number,
  
  // If the Fiber is currently active in the "render" phase,
  // this masks the time at which the work began
  // this field is only set when the enableProfilerTimer flag is enabled
  treeBaseDuration?: number,
    
  // Conceptual aliases
  // workInprogrss: Fiber -> alternate the alternate used for reuse happens
  // to be the same as work in progress.
  // __DEV__  only
 	_debugID?: number,
  _debugSource?: Source | null,
  _debugOwner?: Fiber | null,
  _debugIsCurrentlyTiming?: boolean,
|}
```

