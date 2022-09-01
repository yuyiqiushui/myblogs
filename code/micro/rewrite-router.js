import { handleRouter } from "./handle-router";

let  prevRoute = ''
let  nextRoute = ''
export const getPrevRoute = () => prevRoute
export const getNextRoute = () => nextRoute

export const rewriteRouter = () => {
    window.addEventListener('popstate', () => {
        // popstate 触发的时候，路由已经完成导航了
        console.log('popstate');
        handleRouter()
    })

    const rawPushState = window.history.pushState
    window.history.pushState = (...args) => {
        // 导航前
        prevRoute = window.location.pathname

        rawPushState.apply(window.history, args)   // 这是在真正的改变历史记录
        console.log('监视到 pushState 变化了');

        nextRoute = window.location.pathname

        // 导航后
        handleRouter()
    
    }
    const rawReplaceState = window.history.replaceState
    window.history.rawReplaceState = (...args) => {
        // 导航前
        prevRoute = window.location.pathname

        rawReplaceState.apply(window.history, args)
        console.log('监视到 replaceState 变化了');

        nextRoute = window.location.pathname

        // 导航后
        handleRouter()
    }

}