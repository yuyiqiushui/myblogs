# 解读Nodejs多核处理模块 cluster

## 1、cluster介绍

Cluster 是 nodes 内置的模块，用于node's 多核处理。 Cluster 模块，可以帮助我们简化多进程并行化程序的开发难度，轻松构建一个用户负载均衡的集群。

## 2、c luster的简单实用

新建文件index.js

```javascript
var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    console.log("master start...");

    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('listening',function(worker,address){
        console.log('listening: worker ' + worker.process.pid +', Address: '+address.address+":"+address.port);
    });

    cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
    });
} else {
    http.createServer(function(req, res) {
        res.writeHead(200);
        res.end("hello world\n");
    }).liste
```

在控制台启动node程序

```javascript
chenyanliangdeMacBook-Pro:Desktop chenyanliang$ node index.js 
master start...
listening: worker 5593, Address: null:59059
listening: worker 5594, Address: null:59059
listening: worker 5592, Address: null:59059
listening: worker 5595, Address: null:59059
listening: worker 5596, Address: null:59059
listening: worker 5597, Address: null:59059
listening: worker 5598, Address: null:59059
listening: worker 5599, Address: null:59059
```

master是总控节点，worker是运行节点。根据CPU的数量，启动worker。



## 3、cluster的工作原理

每个 worker进程通过使用child_process.fork()函数，基于IPC (Inter-Process Communication,进程间通信)，实现与master进程间通信。



当worker使用server.listen (...) 函数时，将参数序列传递给master进程。如果master进程已经匹配workers，会将传递句柄给工人。如果master没有匹配好worker，那么会创建一个worker，再把传递句柄传递给worker。



在边界条件，有3个有趣的行为：

注：下面server.listen()，是对底层“http.Server-->net.Server”类的调用。

1、server.linsten({fd:7})：在master和worker通信过程，通过传递文件，master会监听“文件描述为7“，而不是传递”文件描述为7“的引用。

2、server.listen(handle)：master和worker通信过程，通过handle函数进行通信，而不用进程联系。

3、server.listen(0):在master和worker通信过程，集群中的worker会打开一个随机端口公用，通过socket通信。



当多个进程都在accept()同样的资源的时候，操作系统的负载均衡非常高效。Node.js没有路由逻辑，worker之间没有共享状态。所以，程序要设计的简单一些，比如基于内存的session。



因为worker都是独立运行的，根据程序的需要，他们可以被独立删除或者重启，worker并不相互影响，只要还有workers存活，则master将继续接收连接。Node不会自动维护workers数目。我们可以建立自己的连接池。

## 4、cluster的API

**cluster对象**

cluster的各种属性和函数：

- cluster.settings:	      配置集群参数对象
- cluster.isMaster:         判断是不是master节点
- cluster.isWorker:         判断是不是worker节点
- Event：'fork':               监听创建worker进程事件
- Event：'online':           监听worker创建成功事件
- Event：'listening':       监听worker向master状态事件
- Event：'disconnect'：监听worker断线事件
- Event：'exit'：             监听 worker退出事件
- Event：'setup'：         监听setupMaster事件
- cluster.setupMaster([settings]):      设置集群参数
- cluster.fork([env])：   创建worker进程
- cluster.disconnect([callback]):    关闭worker进程
- cluster.worker：         获得当前的worker对象
- cluster.workers：       获得集群中所有存活的worker对象



**worker对象**

worker的各种属性和函数： 可以通过cluster.workers, cluster.worket获得。

- worker.id:										 进程ID号
- worker.process:                               ChildProcess对象
- worker.suicide:                                在disconnect()后，判断worker是否自杀
- worker.send(message,[sendHandle]):   master给worker发送消息。注：worker给发master发送消息要用  process.send(message)
- worker.kill([signal='SIGTERM']):     杀死指定的worker，别名destroy()
- worker.disconnect():                       断开worker连接，让worker自杀
- Event：'message':                           监听master和worker的message事件
- Event：'online'：                             监听指定的worker创建成功事件
- Event：'listening':                           监听master向worker状态事件
- Event：'disconncet':                       监听worker断线事件
- Event：'exit':                                    监听worker退出事件



## 5、master和worker的通信

实现cluster的API，让master和worker相互通信

新建cluster.js

```javascript
var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    console.log('[master] ' + "start master...");

    for (var i = 0; i < numCPUs; i++) {
        var wk = cluster.fork();
        wk.send('[master] ' + 'hi worker' + wk.id);
    }

    cluster.on('fork', function (worker) {
        console.log('[master] ' + 'fork: worker' + worker.id);
    });

    cluster.on('online', function (worker) {
        console.log('[master] ' + 'online: worker' + worker.id);
    });

    cluster.on('listening', function (worker, address) {
        console.log('[master] ' + 'listening: worker' + worker.id + ',pid:' + worker.process.pid + ', Address:' + address.address + ":" + address.port);
    });

    cluster.on('disconnect', function (worker) {
        console.log('[master] ' + 'disconnect: worker' + worker.id);
    });

    cluster.on('exit', function (worker, code, signal) {
        console.log('[master] ' + 'exit worker' + worker.id + ' died');
    });

    function eachWorker(callback) {
        for (var id in cluster.workers) {
            callback(cluster.workers[id]);
        }
    }

    setTimeout(function () {
        eachWorker(function (worker) {
            worker.send('[master] ' + 'send message to worker' + worker.id);
        });
    }, 3000);

    Object.keys(cluster.workers).forEach(function(id) {
        cluster.workers[id].on('message', function(msg){
            console.log('[master] ' + 'message ' + msg);
        });
    });

} else if (cluster.isWorker) {
    console.log('[worker] ' + "start worker ..." + cluster.worker.id);

    process.on('message', function(msg) {
        console.log('[worker] '+msg);
        process.send('[worker] worker'+cluster.worker.id+' received!');
    });

    http.createServer(function (req, res) {
            res.writeHead(200, {"content-type": "text/html"});
            res.end('worker'+cluster.worker.id+',PID:'+process.pid);
    }).listen(3000);

}
```

```
chenyanliangdeMacBook-Pro:Desktop chenyanliang$ node cluster.js 
[master] start master...
[master] fork: worker1
[master] fork: worker2
[master] fork: worker3
[master] fork: worker4
[master] fork: worker5
[master] fork: worker6
[master] fork: worker7
[master] fork: worker8
[master] online: worker2
[master] online: worker1
[master] online: worker3
[master] online: worker4
[master] online: worker5
[worker] start worker ...2
[master] online: worker6
[worker] start worker ...1
[worker] [master] hi worker1
[worker] [master] hi worker2
[worker] start worker ...3
[worker] start worker ...4
[worker] [master] hi worker3
[worker] [master] hi worker4
[worker] start worker ...5
[master] message [worker] worker2 received!
[master] message [worker] worker1 received!
[master] message [worker] worker3 received!
[master] online: worker7
[master] message [worker] worker4 received!
[master] listening: worker1,pid:6132, Address:null:3000
[master] listening: worker2,pid:6133, Address:null:3000
[worker] start worker ...6
[master] listening: worker3,pid:6134, Address:null:3000
[master] listening: worker4,pid:6135, Address:null:3000
[worker] [master] hi worker5
[master] message [worker] worker5 received!
[master] listening: worker5,pid:6136, Address:null:3000
[worker] [master] hi worker6
[master] message [worker] worker6 received!
[master] listening: worker6,pid:6137, Address:null:3000
[worker] start worker ...7
[master] online: worker8
[worker] [master] hi worker7
[master] message [worker] worker7 received!
[master] listening: worker7,pid:6138, Address:null:3000
[worker] start worker ...8
[worker] [master] hi worker8
[master] message [worker] worker8 received!
[master] listening: worker8,pid:6139, Address:null:3000
[worker] [master] send message to worker1
[worker] [master] send message to worker2
[worker] [master] send message to worker4
[worker] [master] send message to worker3
[worker] [master] send message to worker7
[worker] [master] send message to worker5
[worker] [master] send message to worker6
[worker] [master] send message to worker8
[master] message [worker] worker1 received!
[master] message [worker] worker2 received!
[master] message [worker] worker4 received!
[master] message [worker] worker3 received!
[master] message [worker] worker7 received!
[master] message [worker] worker5 received!
[master] message [worker] worker6 received!
[master] message [worker] worker8 received!

```

6、用cluster实现负载均衡(Load Balance).  -- win7失败

```javascript
var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    console.log('[master] ' + "start master...");

    for (var i = 0; i < numCPUs; i++) {
         cluster.fork();
    }

    cluster.on('listening', function (worker, address) {
        console.log('[master] ' + 'listening: worker' + worker.id + ',pid:' + worker.process.pid + ', Address:' + address.address + ":" + address.port);
    });

} else if (cluster.isWorker) {
    console.log('[worker] ' + "start worker ..." + cluster.worker.id);
    http.createServer(function (req, res) {
        console.log('worker'+cluster.worker.id);
        res.end('worker'+cluster.worker.id+',PID:'+process.pid);
    }).listen(3000);
}
```

```

```

7、用cluster实现负载均衡(Load Balance) -- ubuntu成功

```javascript
var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    console.log('[master] ' + "start master...");

    for (var i = 0; i < numCPUs; i++) {
         cluster.fork();
    }

    cluster.on('listening', function (worker, address) {
        console.log('[master] ' + 'listening: worker' + worker.id + ',pid:' + worker.process.pid + ', Address:' + address.address + ":" + address.port);
    });

} else if (cluster.isWorker) {
    console.log('[worker] ' + "start worker ..." + cluster.worker.id);
    http.createServer(function (req, res) {
        console.log('worker'+cluster.worker.id);
        res.end('worker'+cluster.worker.id+',PID:'+process.pid);
    }).listen(3000);
}
```



```
chenyanliangdeMacBook-Pro:Desktop chenyanliang$ node server.js 
[master] start master...
[worker] start worker ...3
[worker] start worker ...2
[worker] start worker ...4
[worker] start worker ...1
[master] listening: worker2,pid:6191, Address:null:3000
[master] listening: worker4,pid:6193, Address:null:3000
[master] listening: worker3,pid:6192, Address:null:3000
[master] listening: worker1,pid:6190, Address:null:3000
[worker] start worker ...5
[worker] start worker ...6
[master] listening: worker5,pid:6194, Address:null:3000
[worker] start worker ...7
[master] listening: worker6,pid:6195, Address:null:3000
[worker] start worker ...8
[master] listening: worker7,pid:6196, Address:null:3000
[master] listening: worker8,pid:6197, Address:null:3000

```

## 8、cluster负载均衡策略的测试

我们在centos下面，完成测试，用过测试软件：siege

安装siege

```
yum install siege
```

启动node cluster

```
node server.js
```

运行siege启动命令，每秒发送50个并发请求

```
sudo siege -c 50 http://localhost:9000

HTTP/1.1 200   0.00 secs:      16 bytes ==> /
HTTP/1.1 200   0.00 secs:      16 bytes ==> /
HTTP/1.1 200   0.00 secs:      16 bytes ==> /
HTTP/1.1 200   0.01 secs:      16 bytes ==> /
HTTP/1.1 200   0.00 secs:      16 bytes ==> /
HTTP/1.1 200   0.00 secs:      16 bytes ==> /
HTTP/1.1 200   0.00 secs:      16 bytes ==> /
HTTP/1.1 200   0.01 secs:      16 bytes ==> /
HTTP/1.1 200   0.00 secs:      16 bytes ==> /
HTTP/1.1 200   0.00 secs:      16 bytes ==> /
HTTP/1.1 200   0.00 secs:      16 bytes ==> /
HTTP/1.1 200   0.02 secs:      16 bytes ==> /
HTTP/1.1 200   0.00 secs:      16 bytes ==> /
HTTP/1.1 200   0.02 secs:      16 bytes ==> /
HTTP/1.1 200   0.01 secs:      16 bytes ==> /
HTTP/1.1 200   0.01 secs:      16 bytes ==> /
.....

^C
Lifting the server siege...      done.                                                                Transactions:                    3760 hits
Availability:                 100.00 %
Elapsed time:                  39.66 secs
Data transferred:               0.06 MB
Response time:                  0.01 secs
Transaction rate:              94.81 trans/sec
Throughput:                     0.00 MB/sec
Concurrency:                    1.24
Successful transactions:        3760
Failed transactions:               0
Longest transaction:            0.20
Shortest transaction:           0.00

FILE: /var/siege.log
You can disable this annoying message by editing
the .siegerc file in your home directory; change
the directive 'show-logfile' to false.
```

我们统计结果，执行3760次请求，消耗39.66秒，每秒处理94.81次请求。

