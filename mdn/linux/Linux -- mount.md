# Linux -- mount

## mount 命令 —— 文件系统挂载

> 语法格式： mount  【 参数 】

常用参数：

| -t   | 指定挂载类型                               |
| ---- | ------------------------------------------ |
| -l   | 显示已加载的文件系统列表                   |
| -h   | 显示帮助信息并退出                         |
| -V   | 显示程序版本                               |
| -n   | 加载没有写入文件 "etc/mtab" 中的文件系统   |
| -r   | 将文件系统加载为只读模式                   |
| -a   | 加载文件 "/etc/fstab" 中描述的所有文件系统 |



参考实例：

```
# 查看版本
mount  -V

# 启动所有挂载：
mount -a

# 挂载 /dev/cdrom  到  /mnt :
mount  /dev/cdrom   /mnt

#挂载 nfs 格式文件系统：
mount  -t  nfs  /123   /mnt

# 挂载第一块盘的第一个分区到 /etc 目录：
mount  -t  ext4  -o  loop, default  /dev/sda1   /etc
```

