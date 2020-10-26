# pm2

## 安装

```javascript
npm install pm2@latest -g
#or
yarn global add pm2
```

## 启动

启动、守护和监视应用程序的最简单方法是使用以下命令行：

```javascript
pm2 start app.js
#其他应用程序
pm2 start bashscript.sh
pm2 start setup.py --watch
pm2 start binary-file -- --poort 1520
```

## 配置项

```
--name <app_name>
#当文件改变的时候监听并重启应用程序
--watch

#设置应用程序重新加载内存或阈值
--max-memory-restart <200MB>

#指定log文件
--log <log_path>

#向脚本传递额外的参数
-- arg1 arg2 arg3

#延时多长时间自动重启
--restart-delay <delay in ms>

#带有时间前缀的日志
--time

#不自动重启应用
--no-autorestart

#指定计算机计时程序强制重启应用
--cron <cron_pattern>

#附加到应用程序日志
--no-daemon



```

管理进程状态

```
pm2 restart "app_name" | all | "process_id"
pm2 reload "app_name" | all | "process_id"
pm2 stop "app_name" | all | "process_id"
pm2 delete "app_name" | all | "process_id"
```

列出所有由PM2管理的应用程序状态

```
pm2 [list | ls | status]
```

实时显示日志

```
pm2 logs
```

To dig in older logs

```
pm2 logs --lines 200
```

