Linux -- find

find -- 查找和搜索文件

> 语法格式： find 【 参数 】【 路径 】【 查找和搜索范围 】

常用参数：

| -name  | 按名称查找 |
| ------ | ---------- |
| -size  | 按大小查找 |
| -user  | 按属性查找 |
| -type  | 按类型查找 |
| -iname | 忽略大小写 |



参考用例：

```
# 使用 -name 参数查看 /etc 目录下面所有的 .conf	结尾的配置文件	：
find  /etc  -name  "*.conf

# 使用 -size 参数查看 /etc 目录下面大于 1M 的文件：
find  /etc  -size  +1M

# 查找当前用户主目录下的所有文件
find  $HOME  -print

# 列出当前目录及子目录下所有文件和文件夹
find  .

# 在 /home 目录下查找以 .txt 结尾的文件名
find  /home  -name  "*.txt"

# 在 /var/log 目录下忽略大小写查找以 .log 结尾的文件名
find  /var/log  -iname  "*.log"

# 搜索超过七天内被访问过的所有文件：
find  . -type f -atime  +7

# 搜索访问时间超过 10分钟的所有文件
find  . -type f -amin  10

# 找出 /home 下不是以 .txt 结尾的文件：
find  /home  !  -name  "*.txt"
```

 