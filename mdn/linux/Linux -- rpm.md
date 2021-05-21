Linux -- rpm

rpm 命令 -- RPM 软件包管理器

> 语法格式：rpm 【 参数 】【 软件包 】

常用参数：

| -a              | 查询所有的软件包                                |
| --------------- | ----------------------------------------------- |
| -b 或 -t        | 设置包装套件的完成阶段，并指定套件档的文件名称  |
| -c              | 只列出组态配置文件，本参数需配合  "-l" 参数使用 |
| -d              | 只列出文本文件，本参数需配合  "-l" 参数使用     |
| -e 或 --erase   | 卸载软件包                                      |
| -f              | 查询文件或命令属于哪个软件包                    |
| -h 或 --hash    | 安装软件包时列出标记                            |
| -i              | 显示软件包的相关信息                            |
| --install       | 安装软件包                                      |
| -l              | 显示软件包的文件列表                            |
| -p              | 查询指定的 rpm 软件包                           |
| -q              | 查询软件包                                      |
| -R              | 显示软件包的依赖关系                            |
| -s              | 显示文件状态，本参数需配合 "-l" 参数使用        |
| -U 或 --upgrade | 升级软件包                                      |
| -v              | 显示命令执行过程                                |
| -vv             | 详细显示指令执行过程                            |



参考实例：

```
# 直接安装软件包
rpm  -ivh  packge.rpm

# 忽略报错，强制安装：
rpm  --force  -ivh  package.rpm

# 列出所有安装过的包：
rpm  -qa

# 查询 rpm 包中的文件安装的位置：
rpm  -ql  ls

# 卸载  rpm  包：
rpm  -e  package.rpm

# 升级软件包：
rpm  -U  file.rpm
```
