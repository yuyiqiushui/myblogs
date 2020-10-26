# Centos 安装 apache

```
yun install httpd

//安装成功后，检测有无  httped 进程
ps -e |grep httpd

//如没有，启动该服务
systemctl restart httpd.service

//使用浏览器访问iP 地址，如无法访问，关闭防火墙
systemctl stop firewalld.service  //停止防火墙服务

//禁用防火墙开机启动服务
systemctl disable firewalld.service

//再次访问服务器IP，成功访问

//iptables 进行防火墙配置，可做下面设置
yum install iptables-services
systemctl enable iptables
```

