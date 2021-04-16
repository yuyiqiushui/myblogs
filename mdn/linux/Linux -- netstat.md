# Linux -- netstat

## netstat 命令 — 显示网络状态

> 语法格式： netstat 【 参数 】

常用参数：

| -a   | 显示所有连线中的 Socket                    |
| ---- | ------------------------------------------ |
| -p   | 显示正在使用 Socket 的程序识别码和程序名称 |
| -u   | 显示 UDP 传输协议的连线状况                |
| -i   | 显示网络界面信息表单                       |
| -n   | 直接使用 IP 地址，不通过域名服务器         |



参考实例：

```
# 显示详细的网络状况
netstat  -a

# 显示当前户籍 UDP 连接状况
netstat  -nu

# 显示 UDP 端口号的使用情况
netstat  -apu
输出：Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address  Foreign Address  State  PID/Program name    
udp        0      0 0.0.0.0:bootpc          0.0.0.0:*      4000/dhclient       
udp        0      0 localhost:323           0.0.0.0:*      3725/chronyd        
udp6       0      0 localhost:323           [::]:*         3725/chronyd 

# 显示网卡列表
netstat  -i
输出：Kernel Interface table 
Iface MTU Met  RX-OK  RX-ERR  RX-DRP RX-OVR  TX-OK TX-ERR TX-DRP TX-OVR Flg 
eth0 1500   0  181864   0      0       0     141278   0     0     0    BMRU 
lo   16436  0   3362    0      0       0     3362     0     0     0    LRU

# 显示组播组的关系
netstat  -g
输出：IPv6/IPv4 Group Memberships Interface    
RefCnt Group 
--------------- ------ --------------------- 
lo        1   ALL-SYSTEMS.MCAST.NET 
eth0      1   ALL-SYSTEMS.MCAST.NET lo       1   ff02::1 
eth0      1   ff02::1:ff0a:b0c eth0          1   ff02::1

```

