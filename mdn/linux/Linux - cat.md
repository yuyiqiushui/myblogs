# Linux

## cat 命令—在终端设备上显示文件内容

> 语法： cat 【 参数 】【 文件 】

常用参数：

| -n         | 显示行数( 空行也编号 )                   |
| ---------- | ---------------------------------------- |
| - s        | 显示行数 ( 多个空行算一个编号 )          |
| - b        | 显示行数 ( 空行不变行 )                  |
| - E        | 每行结束处显示 $ 符号                    |
| - T        | 将 TAB 字符显示为 ^\|  符号              |
| - v        | 使用 ^ 和 M - 引用，除了 LFD 和 TAB 之外 |
| - e        | 等价于 “-vE” 组合                        |
| - t        | 等价于 “-vT” 组合                        |
| - A        | 等价于-vET 组合                          |
| -- help    | 显示帮助信息                             |
| -- version | 显示版本信息                             |

```linux
# 查看文件内容
cat filename.txt

# 查看文件内容，并显示行数编号
cat -n filename.txt

#查看文件内容，并添加行数编号后输出到另一个文件中
cat -n linuxcool.log  >  linuxprobe.log

#清空文件内容
cat  /dev/null   >  /root/filename.txt
```

