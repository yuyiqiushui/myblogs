Linux -- ssh

ssh 命令 — 安全连接客户端

> 语法格式：ssh 【 参数 】【 远程主机 】

常用参数：

| -1            | 强制使用 ssh 协议版本1                                       |
| ------------- | ------------------------------------------------------------ |
| -2            | 强制使用 ssh 协议版本 2                                      |
| -4            | 强制使用 IPv4 地址                                           |
| -6            | 强制使用 IPv6 地址                                           |
| -A            | 开启认证代理连接转发功能                                     |
| -a            | 开启认证代理连接转发功能                                     |
| -b <IP地址>   | 使用本机指定大的地址作为对位连接的源 IP 地址                 |
| -C            | 请求压缩所有数据                                             |
| -F <配置文件> | 指定 ssh 指令的配置文件，默认的配置文件为 "/etc/shh/ssh_config" |
| -f            | 后台执行 ssh 命令                                            |
| -g            | 允许远程主机连接本机的转发端口                               |
| -i <身份文件> | 指定身份文件 ( 即私钥文件 )                                  |
| -I <登录名>   | 指定连接远程服务器的登录用户名                               |
| -N            | 不执行远程命令                                               |
| -o<选项>      | 指定配置选项                                                 |
| -p<端口>      | 指定远程服务器上的端口                                       |
| -q            | 静默模式，所有的警告和诊断信息被禁止输出                     |
| -X            | 开启 X11 转发功能                                            |
| -x            | 关闭 X11 转发功能                                            |
| -y            | 开启信任 X11 转发功能                                        |



参考实例：

```
# 登录远程服务器
ssh 202.102.240.88

# 用 test 用户连接远程服务器
ssh -l test 202.102.220.88

#查看分区列表：
ssh 202.102.220.88  /sbin/fdisk  -l

#强制使用 ssh 协议版本1:
ssh -1

#开启认证代理连接转发功能：
ssh  -A

```

与该功能相关的 Linux 命令：

- ipvsadm 命令  ——  linux 虚拟服务器管理
- usernetctl 命令 —— 操作指定的网络接口
- ifconfig 命令 —— 显示或设置网络设备
- mingetty 命令 —— 登入程序
- ctlinnd 命令 —— 设置 INN 新闻组服务器
- arping 命令 —— 向邻近主机发送 ARP请求报文
- host 命令 —— 域名查询
- nslookup 命令 —— 域名查询
- dig 命令 —— 查询域名 DNS 信息
- tcpdump 命令 —— 监听网络流量