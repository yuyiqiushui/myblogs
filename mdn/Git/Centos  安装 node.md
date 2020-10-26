# Centos  安装 node

## 下载

```javascript
yum install gcc gcc-c++
wget https://npm.taobao.org/mirrors/node/v14.14.1/node-v14.14.1-linux-x64.tar.gz
```

解压

```javascript
tar -xvf  node-v14.14.1-linux-x64.tar.gz
ls
mv node-v14.14.1-linux-x64 node   #重命名
```

建立软连接  #注意  node 的具体目录

```javascript
ln -s -i /opt/node/bin/node /usr/bin/node
node -v
ln -s -i /opt/node/bin/npm /usr/bin/npm
npm -v
```

下载 cnpm，cnpm 下载包快一点

```javascript
npm install -g cnpm --registry=https://registry.npm.taobao.org
设置软连接
ln -s -i /opt/node/bin/cnpm /usr/bin/cnpm
```

此时查看 node， npm 位置

```javascript
which node   //查看 node 安装目录
which npm    //查看 npm 安装目录
npm root -g  //查看全局包的安装目录
npm list -g --depth 0    //查看全局安装过的包
```

全局安装和局部安装

```javascript
npm install <packageNmae> -save-dev  //保存到开发依赖  devDependencies
npm install <packageNmae> -save  //保存到生产依赖  dependencies
```

此时创建 vue 项目需要下载  vue， webpack

```javascript
cnpm install vue@版本号  -g  #全局安装
```

设置软链

```javascript
ln -s -i  /opt/node/bin/vue  /usr/bin/vue
```

安装 webpack

```javascript
npm install webpack  -g 全局安装
```

webpack41, webpack 不在单独使用，需要 webpack-cli

```javascript
//全局安装
npm install webpack  webpack-cli  -g  -D
//局部安装
npm install webpack  webpack-cli  -D

//增加了模式区分  (development, production)
webpack  mode  development/production  进行模式切换
development  开发者模式  打包默认不压缩代码
production  生产者模式  上线时使用，压缩代码。  默认是这个模式


//固定入口目录  src ,与入口默认文件  index.js，打包后文件在新增的 dist 目录下
当只有一个入口文件也就是  src/index.js时，无需增加 webpack.config.js
```

安装 vue-cli

```javascript
//使用 npm 全局安装 vue-cli
npm install -g vue-cli

//安装完成后在自己的工作空间里
vue init webpack vue-demo
输入命令后进入安装阶段，需要用户输入一些信息，这里省略了。。。。


//切换到我们的项目目录下
cd vue-demo
npm run dev
```

