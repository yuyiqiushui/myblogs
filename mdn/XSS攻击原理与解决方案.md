# XSS攻击原理与解决方案

## 简介

跨站脚本攻击（cross site scripting）缩写 css，但这会与层叠样式表 ( cascading style sheets, css) 的缩写混淆，故取名 xss，Xss 攻击是网络安全攻击中非常常见的一种攻击方式。它是对网页注入可执行脚本的一种攻击方式

1、反射型 XSS

假设我们的网站中有这样一行代码：

```
...
<span>输入：<?php echo $_GET['input'];?></span>
...
```

这是一个简单的页面，$_GET 获取了变量名为 input 的值，通过 echo 函数输出了值。

这个时候我们访问：

