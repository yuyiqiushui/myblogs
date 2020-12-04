# Linux

## mkdir 命令 - 创建目录

> 语法格式： mkdir 【 参数 】【 目录 】

常用参数：

| -p   | 递归创建多级目录             |
| ---- | ---------------------------- |
| -m   | 建立目录的同时设置目录的权限 |
| -z   | 设置安全上下文               |
| -v   | 显示目录的创建过程           |

参考实例：

```
#在工作目录下，建立一个名为 dir 的子目录
mkdir  dir

#在目录 /usr/linuxcool 下建立子目录 dir，并设置文件属主有读、写 和 执行权限，其他人无权访问
mkdir  -m  700  /usr/linuxcool/dir

#同时创建子目录  dir1， dir2， dir3：
mkdir  dir1  dir2   dir3

#递归创建目录：
mkdir  -p  linuxcool/dir
```

