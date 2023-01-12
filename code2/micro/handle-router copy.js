// 处理路由变化的
import { getApps} from '.'
import { importHTML } from "./import-html";

export const handleRouter = async () => {

    // 卸载上一个应用


    // 加载下一个应用

<<<<<<< HEAD
=======



>>>>>>> 63459442b8af5594b46316d812c2b1bfa59aa1df
    console.log('handleRouter');
    // 2、匹配子应用
    // 2.1 获取到当前的路由路径
    console.log(window.location.pathname);
    // 2.2 去 apps 里面查找
    const apps = getApps()

    const app = apps.find(item => window.location.pathname.startsWith(item.activeRule))

    if (!app) {
        return
    }

    // 3、加载子应用
    // const html = await fetch(app.entry).then(res => res.text())
    const { template, getExternalScripts, exexScript } = await importHTML(app.entry)
    const container = document.querySelector(app.container)
    container.appendChild(template)

    // 配置全局环境变量
    window.__POWERED_BY_QIANKUN__ = true

    const appExports = await exexScript()

    console.log(appExports);

    getExternalScripts().then((scripts) => {
        console.log(scripts);
    })
    // 请求获取子应用的资源： HTML、CSS、JS
    // const html = await fetch(app.entry).then(res => res.text())
    // 1、客户端渲染需要通过执行 JavaScript 来生成内容
    // 2、浏览器出于安全考虑，innerHTML 中的 JavaScript 不会加载执行
    // container.innerHTML = html

    // 手动加载子应用的 script
    // 执行 script 中的代码

    // 4、渲染子应用

    async function bootstrap(app) {
        app.bootstrap && (await app.bootstrap())
    }

    async function mount(app) {
        app.mount && (app.mount({
            container: document.querySelector(app.container)
        }))
    }

    async function unmount(app) {
        app.unmount && ( await app.unmount())
    }
}