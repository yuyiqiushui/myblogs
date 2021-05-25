# Git stash用法总结和注意点

## 1、描述

stash 命令可用于临时保存和回复修改，**可跨分支**

> 注意：在未  add  之前才能执行  stash 

- git  stash  [ save message ]

  保存，save 为可选项，message 为本次保存的注释

- git  stash  list

  所有保存的记录列表

- git  stash  pop  stash@{ num }

  恢复， num 是可选项，通过 git  stash  list  可查看具体值。只能恢复一次

- git  stash  apply  stash@{ num }

  恢复，num 是可选项，通过 git  stash  list  可查看具体值。可回复多次

- git  stash  drop  stash@{ num }

  删除某个保存，num 是可选项，通过 git stash list 可查看具体值

- git  stash  clear 

  删除所有保存。

