## 1、什么是Vnode?

我们知道，浏览器中真实的DOM节点对象上的属性和方法比较多，如果每次都生成新的DOM对象，对性能是一种浪费，在这种情况下，Virtual Dom出现了，而Vnode是用来模拟真实DOM节点，即把真实的DOM树抽象成用Javascript对象构成的抽象树，从而可以对这棵抽象树进行创建节点、删除节点以及修改节点等操作，在这过程中都不需要操作真实DOM，只需要操作Javascript对象，当数据发生改变时，在改变真实DOM节点之前，会先比较相应的Vnode的数据，如果需要改变，才更新真实DOM，大大提升了性能。同时Vnode不依赖平台。

## 2、mounted过程都发生了什么？

在了解patch过程之前，先来大概了解下mounted过程，我们知道，Vue最终会调用$mounted方法来进行挂载。一般来说，Vue有两条渲染路径，分别对应生命周期中的mounted和updated两个钩子函数，分别如下：

### 1）组件实例初始化创建生成的DOM

在该过程时，初时的Vnode为一个真实的DOM节点或者undefined（创建组建）

> $mounted => mountedComponent => updateComponent => _render => _update =>patch =>createElm =>nodeOps.insert =>removeVnodes

### 2)组件数据更新时更新DOM

在该过程，初始化Vnode为之前的preVnode,不是真实的DOM节点

> flushSchedulerQueue => watcher.run => watcher.get => updateComponent => _render => _update => patch => patchVnode => updateChildren

其中，`_render`函数内部则是调用createElement方法将渲染函数转为Vnode,而`_update`函数则是在内部调用patch方法将Vnode转化为真实的DOM节点。



`createElement`和`patch`过程是一个深度遍历过程，也就是“先子后父”，即先调用子类的`mounted`或`updated`钩子方法，再调用父类的该钩子。



附图：$mounted流程图

![16a013435687ce35](/Users/chenyanliang/Desktop/mdn/patch/16a013435687ce35.png)

## 3、patch原理分析

patch过程也是一个深度遍历过程，比较只会在同层级进行，不会跨层级比较，借用一篇相当经典的文章[React's diff algorithm](https://calendar.perfplanet.com/2013/diff/)的图，图能很好的解释该过程，如下

![](/Users/chenyanliang/Desktop/mdn/patch/16a01365b0f9bb31.png)

patch接受6个参数，其中两个主要参数是`vnode`和`oldVnode`，也就是新旧两个虚拟节点，下面详细介绍下patch过程

### 1、patch逻辑

1、如果`vnode`不存在，而`oldVnode`存在，则调用`invodeDestoryHook`进行销毁旧的节点。

2、如果`oldVnode`不存在，而`vnode`存在，则调用`createElm`创建新的节点。

3、如果`oldVnode`和`vnode`都存在

​		1)、如果`oldvnode`不是真实节点且和`vnode`是相同节点（调用sameVnode比较)，则调用`patchvnode`进行`patch`

​		2)、如果`oldVnode`是真实节点，则先把真实DOM节点转为Vnode，再调用`createElm`创建新的DOM节点，并插入到真实的父节点中，同时调用`removeVnodes`将旧的节点从父节点中移除。

### 2、patchVnode逻辑

1、如果`vnode`和`oldVnode`完全一致，则什么都不做处理，直接返回。

2、如果`oldVnode`和`vnode`都是静态节点，且具有相同的`key`，并且当`vnode`是克隆节点或是`v-once`指令控制的节点时，只需要把`oldVnode`的`elm`和`oldVnode.children`都复制到`vnode`上即可。

3、如果`vnode`不是文本节点或注释节点

​		1）如果`vnode`的`children`和`oldVnode`的`children`都存在，且不完全相等，则调用`updateChildren`更新子节点。

​		2）如果只有`vnode`存在子节点，则调用`addVnodes`添加这些子节点。

​		3）如果只有`oldVnode`存在子节点，则调用`removeVnodes`移除这些子节点。

​		4)、如果`oldVnode`和`vnode`都不存在子节点，但是oldVnode为文本节点或注释节点，则把oldVnode.elm的文本内容置为空。



4、如果`vnode`是文本节点或注释节点，并且`vnode.text`和`oldVnode.text`不相等，则更新`oldVnode`的文本内容为`vnode.text`。

### 3、updateChildren逻辑

updateChildren方法主要通过while循环去对比2棵树的子节点来更新dom,通过对比新的来改变旧的，以达到新旧统一的目的。

1、如果oldStartVnode不存在，则将oldStartVnode设置为下一个节点。

2、如果oldEndVnode不存在，则将oldEndVnode设置为上一个节点。

3、如果oldStartVnode和newStartVnode是同一个节点（sameVnode）,则调用patchVnode进行patch重复流程，同时将oldEndVnode和newStartVnode设置为下一个节点。

4、如果oldEndVnode和newEndVnode是同一个节点（sameVnode）,则调用patchVnode进行patch重复流程，同时将oldEndVnode和newEndVnode设置为上一个节点。

5、如果oldStartVnode和newEndVnode是同一个节点（sameVnode）,则调用patchVnode进行patch重复流程，同时将oldStartVnode设置为下一个节点，newEndVnode设置为上一个节点，需要对DOM进行移动。

6、如果oldEndVnode和newStartVnode是同一个节点（sameVnode）,则调用patchVnode进行patch重复流程，同时将oldEndVnode设置为上一个节点，newStartVnode设置为下一个节点，需要对DOM进行移动。

7、否则，尝试在oldChildren中查找与newStartVnode具有相同key的节点：

​		1）如果没有找到，则说明newStartVnode是一个新节点，则调用createElem创建一个新节点，同时将newStartVnode设置为下一个节点。

​		2）如果找到了具有相同key的节点

​				（1）、如果找到的节点与newStartVnode是同一个节点（sameVnode）,则调用patchVnode进行patch重复流程，同时把newStartVnode.elm移动到oldStartVnode.elm之前，并把newStartVnode设置为下一个节点，需要对DOM进行移动。

​				（2）、否则，调用createElm创建一个新的节点，同时把newStartVnode设置为下一个节点。

上述过程中，如果oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx,即oldChildren和newChildren节点在遍历过程中任意一个的开始索引和结束索引重合，则表明遍历结束。



遍历结束后，还需针对oldChildren和newChildren没有遍历的节点进行处理，分为以下两种情况：

1）、如果oldStartIdx 大于 oldEndIdx,说明newChildren可能还未遍历完，则需要调用addVnodes添加 newStartIdx 到 newEndIdx 之间的节点。

2）、如果 newStartIdx 大于 newEndIdx, 说明oldChildren 可能还未遍历完，则需要调用removevnodes 移除 oldStartIdx 到 oldEndIdx 之间的节点。



![16a0139c44921379](/Users/chenyanliang/Desktop/mdn/patch/16a0139c44921379.png)

**情况一：oldStartVnode和newStartVnode是相同节点**

![情况一](/Users/chenyanliang/Desktop/mdn/patch/情况一.png)



**情况二：oldEndVnode和newEndVnode是相同节点**

![情况二](/Users/chenyanliang/Desktop/mdn/patch/情况二.png)



**情况三：oldStartVnode和newEndVnode是相同节点**

![情况三](/Users/chenyanliang/Desktop/mdn/patch/情况三.png)



**情况四：oldEndVnode和newStartVnode是相同节点**

![情况四](/Users/chenyanliang/Desktop/mdn/patch/情况四.png)



**情况五：oldStartVnode、oldEndVnode、newStartVnode和newEndVnode都不是相同节点**

![情况五](/Users/chenyanliang/Desktop/mdn/patch/情况五.png)



**总图**

![总图](/Users/chenyanliang/Desktop/mdn/patch/总图.png)



## 4、小结

1、不设key，newCh和oldCh只会进行头尾两端的相互比较，设key后，除了头尾两端的比较外，还会从用key生成的对象oldKeyToIdx中查找匹配的节点，所以为节点设置key可以更高效利用dom。



2、diff遍历过程中，只要是对dom进行的操作都调用`nodeOps.insertBefore`,

`nodeOps.insertBefore`只是对原生的`insertBefore`进行简单封装。

比较分为两种，一种是有vnode.key的，一种是没有的。但这两种比较对真实dom的操作是一致的。



3、对于`sameVnode(oldStartVnode, newStartVnode)`和`sameVnode(oldEndVnode, newEndVnode)`为true 的情况，不需要对dom进行移动。