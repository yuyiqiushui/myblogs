Linux -- startx

startx 命令 —— 初始化 X-windows

> 语法格式： startx 【 参数 】

常用参数：

| -d   | 指定在启动过程中传递给客户机的 X 服务器的显示名称 |
| ---- | ------------------------------------------------- |
| -m   | 当未找到启动脚本时，启动窗口管理器                |
| -r   | 当未找到启动脚本时，装入资源文件                  |
| -w   | 强制启动                                          |
| -x   | 使用 startup 脚本启动 X-windows 会话              |



参考实例：

```
# 已默认方式启动 X-windows 系统
startx

# 以 16 位颜色深度启动 X-windows 系统
startx  --  -depth  16

#强制启动 X-windows 系统
startx  -w
```

