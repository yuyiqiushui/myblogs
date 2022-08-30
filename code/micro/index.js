// const { rewriteRouter } = './rewrite-router'
import { handleRouter } from './handle-router'
import { rewriteRouter } from './rewrite-router'

export const start = () => {
    // 微前端运行原理
    // 1、监听路由的变化
    //      hash 路由： window.onhashchange
    //      history路由: 
    //          history.go、history.back、history.forward 使用 popstate 事件： window.onpopstate
    //          pushState、replaceState 需要通过函数重写的方式进行劫持

    rewriteRouter()
    handleRouter()
    // window.addEventListener('popstate', () => {
    //     console.log('popstate');
    // })

    // const rawPushState = window.history.pushState
    // window.history.pushState = (...args) => {
    //     rawPushState.apply(window.history, args)
    //     console.log('监视到 pushState 变化了');
    
    // }
    // const rawReplaceState = window.history.replaceState
    // window.history.rawReplaceState = (...args) => {
    //     rawReplaceState.apply(window.history, args)
    //     console.log('监视到 replaceState 变化了');
    // }


    // 2、匹配子应用

    // 3、加载子应用

    // 4、渲染子应用
}