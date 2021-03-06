Linux -- df 命令

df 命令 —— 显示磁盘空间使用情况

> 语法格式： df 【 参数 】【 指定文件 】

常用参数：

| -a                | 显示所有系统文件                       |
| ----------------- | -------------------------------------- |
| -B<块大小>        | 指定显示时的块大小                     |
| -h                | 以容易阅读的方式显示                   |
| -H                | 以 1000 字节为换算单位来显示           |
| -i                | 显示索引字节信息                       |
| -k                | 指定块大小为 1KB                       |
| -l                | 只显示本地文件系统                     |
| -t <文件系统类型> | 只显示指定类型大的文件系统             |
| -T                | 输出时显示文件系统类型                 |
| --  -sync         | 在取得磁盘使用信息前，先执行 sync 命令 |

参考实例：

```
# 显示磁盘分区使用情况
df
文件系统                             1K-块    已用     可用   已用% 挂载点
devtmpfs                           1980612       0  1980612    0% /dev
tmpfs                              1994756       0  1994756    0% /dev/shm
tmpfs                              1994756    1040  1993716    1% /run
tmpfs                              1994756       0  1994756    0% /sys/fs/cgroup
/dev/mapper/fedora_linuxhell-root 15718400 2040836 13677564   13% /
tmpfs                              1994756       4  1994752    1% /tmp
/dev/sda1                           999320  128264   802244   14% /boot
tmpfs                               398948       0   398948   0% /run/user/0


# 以容易阅读的方式显示磁盘分区的使用情况
df  -h
文件系统                           容量   已用   可用  已用% 挂载点
 devtmpfs                           1.9G     0  1.9G    0% /dev
 tmpfs                              2.0G     0  2.0G    0% /dev/shm
 tmpfs                              2.0G  1.1M  2.0G    1% /run
 tmpfs                              2.0G     0  2.0G    0% /sys/fs/cgroup
 /dev/mapper/fedora_linuxhell-root   15G  2.0G   14G   13% /
 tmpfs                              2.0G  4.0K  2.0G    1% /tmp
 /dev/sda1                          976M  126M  784M   14% /boot
 tmpfs                              390M     0  390M    0% /run/user/0
 
 
 # 显示指定文件所在分区的磁盘使用情况：
 df  /etc/dhcp
 文件系统                             1K-块    已用     可用   已用% 挂载点
/dev/mapper/fedora_linuxcool-root 15718400 2040836 13677564   13% /


# 显示文件类型为 ext4 的磁盘使用情况：
df  -t  ext4
文件系统        1K-块   已用   可用    已用% 挂载点
/dev/sda1      999320 128264 802244   14% /boot
```

