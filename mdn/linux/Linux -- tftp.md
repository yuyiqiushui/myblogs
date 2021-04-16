# Linux -- tftp

## tftp 命令 —— 上传及下载文件

> 语法格式： tftp  【 参数 】

常用参数：

| connect | 连接到远程 tftp 服务器 |
| ------- | ---------------------- |
| mode    | 文件传输模式           |
| put     | 上传文件               |
| get     | 下载文件               |
| quit    | 退出                   |
| verbose | 显示详细的处理信息     |
| trace   | 显示包路径             |
| status  | 显示当前的状态信息     |
| binary  | 二进制传输模式         |
| ascii   | ascii 传输模式         |
| rexmt   | 设置包传输的超时时间   |
| timeout | 设置重传的超时时间     |
| help    | 帮助信息               |
| ？      | 帮助信息               |



参考实例

```
# 连接远程服务器
tftp  218.28.188.288


# 远程下载 file 文件
tftp>  get  file


# 退出 tftp
tftp>  quit
```



与该功能相关的 Linux 命令：

- uupick 命令 — 处理传送进来的文件
- rsync 命令 — 远程数据同步工具
- curl 命令 — 文件传输工具
- uuto 命令 — 将文件传送到远端的 UUCP 主机
- ftp 命令 — 文件传输协议客户端
- bye 命令 — 中断 FTP 连线并结束程序
- lpr 命令 — 将文件放入打印队列等待打印
- symlinks 命令 — 维护符号连接的工具程序
- lftp 命令 — 优秀的命令行 FTP 客户端
- ftpcount 命令 — 显示当前登录的 FTP 人数