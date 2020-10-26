# 手写一个WebSocket协议

为什么要使用 websocket协议 (以下简称WS)协议，什么场景使用？



我之前是做IM相关桌面软件的开发，基于TCP长链接自己封装的一套私有协议，目前公司也有项目用到了 ws 协议，好像无论什么行业，都会遇到这个 ws 协议。



想自己造轮子，可以参考我之前的代码和文章

从零实现一个 简单的React（含源码）

如何实现一个简单的 webpack 构建工具 【附源码】



**在 H5 中**

| 事件    | 事件处理程序     | 描述                       |
| ------- | ---------------- | -------------------------- |
| open    | Socket.onopen    | 连接建立时触发             |
| message | Socket.onmessage | 客户端接收服务端数据时触发 |
| error   | Socket.onerror   | 通信发生错误时触发         |
| close   | Socket.onclose   | 连接关闭时触发             |

在H5中使用的案例：

``` html

<!DOCTYPE HTML>
<html>
<head>
<meta charset="utf-8">
<script type="text/javascript">
function WebSocketTest() {
if ("WebSocket" in window) {
                alert("您的浏览器支持 WebSocket!");
// 打开一个 web socket
var ws = new WebSocket("ws://localhost:9998");
                ws.onopen = function () {
// Web Socket 已连接上，使用 send() 方法发送数据
                    ws.send("发送数据");
                    alert("数据发送中...");
                };
                ws.onmessage = function (evt) {
var received_msg = evt.data;
                    alert("数据已接收...");
                };
                ws.onclose = function () {
// 关闭 websocket
                    alert("连接已关闭...");
                };
            }
else {
// 浏览器不支持 WebSocket
                alert("您的浏览器不支持 WebSocket!");
            }
        }
</script>
</head>
<body>
<div id="sse">
<a href="javascript:WebSocketTest()">运行 WebSocket</a>
</div>
</body>
</html>
```

Node.js中的服务端搭建：

```javascript
const {Server} = require('ws');//引入模块
const wss = new Server({ port: 9998 });//创建一个WebSocketServer的实例，监听端口9998
wss.on('connection', function connection(socket)  {
    socket.on('message', function incoming(message) {
console.log('received: %s', message);
    socket.send('Hi Client');
  });//当收到消息时，在控制台打印出来，并回复一条信息
});
```

这样你就可以愉快的通信科，不需要关注协议的实现，但是真正的项目场景中，可能会有UDP、TCP、FTP、SFTP等场景，你还需要了解不同的协议实现细节，这里我推荐一下某金的张师傅小册《TCP协议》，看过都说好。（这里没收钱，就是觉得好）



正式开始：



为什么要使用ws协议？

传统的Ajax轮询(即一直不停发请求去后端拿数据)或长轮询的操作太过于粗暴，性能更不用说。



ws协议在目前浏览器中的支持已经非常好了，另外这里说一句，他也是一个应用层协议，成功升级 ws 协议，是 101 状态码，像 webpack 热更新这些都有用 ws 协议

![](http://cdn.yuyiqiushui.cn/ws02.png)

这就是连接了本地的 ws 服务器



现在开始，我们实现服务端的 ws 协议，就是自己实现一个 websocket 类，并且继承 Node.js 的自定义事件模块，还要一个起一个进程占用端口，那么就用到 http 模块

```javascript
const { EventEmitter } = require('events');
const { createServer } = require('http');
class MyWebsocket extends EventEmitter {}
module.exports = MyWebsocket;
```

这是一个基础的类，我们继承了自定义的事件模块，还引入了 http 的 createServer 方法，此时先实现端口占用：

```javascript
const { EventEmitter } = require('events');
const { createServer } = require('http');
class MyWebsocket extends EventEmitter {
constructor(options) {
super(options);
this.options = options;
this.server = createServer();
    options.port ? this.server.listen(options.port) : this.server.listen(8080); //默认端口8080
  }
}
module.exports = MyWebsocket;
```

接下来，要先分析下请求的 ws 协议的请求头、响应头

![](http://cdn.yuyiqiushui.cn/ws03.png)

正常一个 ws 协议成功建立分下面几个步骤：

客户端请求升级协议：

```
GET / HTTP/1.1
Upgrade: websocket
Connection:Upgrade
Host: example.com
Origin: http://example.comSec-WebSocket-Key: sN9cRrP/n9NdMgdcy2VJFQ==Sec-WebSocket-Version:13
```

服务端响应：

```
HTTP/1.1101
SwitchingProtocolsUpgrade: websocket
Connection:UpgradeSec-WebSocket-Accept: fFBooB7FAkLlXgRSz0BT3v4hq5s=Sec-WebSocket-Location: ws://example.com/
```

以下是官方对这些字段的解释：

- Connection必须设置 Upgrade ，表示客户端希望连接升级
- Upgrade：字段必须设置 Websocket，表示希望升级到 Websocket 协议
- Sec-WebSocket-Key:是随机字符串，服务端会用这些数据构造出一个 SHA-1的信息摘要。把 “Sec-WebSocket-Key”加上一个特殊字符串“258EAFA5-E914-47DA-95CA-C5AB0DC85B11”，然后计算 SHA-1 摘要，之后进行 BASE-64 编码，将结果做为 “Sec-WebSocket-Accept” 头的值，返回给客户端。如此操作，可以尽量避免普通 HTTP 请求被误认为 Websocket 协议。
- Sec-WebSocket-Version表示支持的Websocket版本。RFC6455 要求使用的版本是 13，之前草案的版本均应当弃用。
- Origin：字段是可选的，通常用来表示在浏览器中发起此 Websocket 连接所在的页面，类似于 Referer.但是，与 Referrer 不同的是，Origin 只包含了协议和主机名称。
- 有其他一些定义在HTTP协议中的字段， 如 Cookie 等，也可以在 Websocket 中使用。



这里得先看这张图

![](http://cdn.yuyiqiushui.cn/ws04.png)



在第一次 HTTP 握手阶段，触发服务端的 upgrade 事件，我们把浏览器端的 ws 地址改成我们自己实现的端口地址：

websocket的协议特点：

- 建立在 TCP 协议之上，服务端的实现比较容易。
- 与 HTTP 协议有良好的兼容性。默认端口也是 80 和 433，并且握手阶段采用 HTTP 协议，因此握手时不容易屏蔽，能通过各种 HTTP 代理服务器
- 数据格式比较轻量，性能开销少，通信高效
- 可以发送文本，也可以发送二进制
- 没有同源策略，客户端可以与任意服务器通信
- 协议标识符是 ws (如果加密 ，则为 wss )，服务器网址就是 URL



将客户端 ws 协议连接地址选择我们的服务器地址，然后改造服务端代码，监听 upgrade 事件看看：

```javascript
const { EventEmitter } = require('events');
const { createServer } = require('http');
class MyWebsocket extends EventEmitter {
constructor(options) {
super(options);
this.options = options;
this.server = createServer();
    options.port ? this.server.listen(options.port) : this.server.listen(8080); //默认端口8080
// 处理协议升级请求
this.server.on('upgrade', (req, socket, header) => {
this.socket = socket;
console.log(req.headers)
      socket.write('hello');
    });
  }
}
module.exports = MyWebsocket;
```

我们可以看到，监听到了协议请求升级事件，而且可以拿到请求头部。上面提到过：

![](http://cdn.yuyiqiushui.cn/wss05.png)

-  Sec-WebSocket-Key 是随机的字符串，服务器端会用这些数据来构造出一个 SHA-1 的信息摘要。把 “Sec-WebSocket-Key” 加上一个特殊字符串 “258EAFA5-E914-47DA-95CA-C5AB0DC85B11”，然后计算 SHA-1 摘要，之后进行 BASE-64 编码，将结果做为 “Sec-WebSocket-Accept” 头的值，返回给客户端。如此操作，可以尽量避免普通 HTTP 请求被误认为 Websocket 协议。

也就是：

就是给一个特定的响应头，告诉浏览器，这个 ws 协议请求升级，我同意了

代码实现：

```javascript

const { EventEmitter } = require('events');
const { createServer } = require('http');
const crypto = require('crypto');
const MAGIC_STRING = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'; // 固定的字符串
function hashWebSocketKey(key) {
const sha1 = crypto.createHash('sha1'); // 拿到sha1算法
  sha1.update(key + MAGIC_STRING, 'ascii');
return sha1.digest('base64');
}
class MyWebsocket extends EventEmitter {
constructor(options) {
super(options);
this.options = options;
this.server = createServer();
    options.port ? this.server.listen(options.port) : this.server.listen(8080); //默认端口8080
this.server.on('upgrade', (req, socket, header) => {
this.socket = socket;
console.log(req.headers['sec-websocket-key'], 'key');
const resKey = hashWebSocketKey(req.headers['sec-websocket-key']); // 对浏览器生成的key进行加密
// 构造响应头
const resHeaders = [
'HTTP/1.1 101 Switching Protocols',
'Upgrade: websocket',
'Connection: Upgrade',
'Sec-WebSocket-Accept: ' + resKey,
      ]
        .concat('', '')
        .join('\r\n');
console.log(resHeaders, 'resHeaders');
      socket.write(resHeaders); // 返回响应头部
    });
  }
}
module.exports = MyWebsocket;

```

看的到 network 面板，状态码已经变成了 101 ，到这一步，我们已经成功把协议升级成功，并且写入了响应头：

![](http://cdn.yuyiqiushui.cn/ws06.png)



剩下的就是数据交互了，既然 ws 是长连接 + 双工通讯，而且是应用层，建立在 TCP 之上封装的，这张图应该能很好的解释（来自阮一峰老师的博客）

![](http://cdn.yuyiqiushui.cn/ws07.png)

网络链路已经通了，协议已经打通，剩下一个长链接+数据推送，但是我们目前还是一个普通的 http 服务器



这是一个 web socket 基本帧协议 (其实 websocket 可以看成基于 TCP 封装的私有协议，只不过大家采用了某个标准达成了共识，有兴趣的同学可以看看微服务架构的相关内容，设计私有协议，端到端加密等)

![](http://cdn.yuyiqiushui.cn/ws01.png)



其中 FIN 代表是否为消息的最后一个数据帧 (类似于 TCP 的 FIN， TCP也会分片传输)



![](http://cdn.yuyiqiushui.cn/ws08.png)

- RSV1,RSV2,RSV3,( 每个占1位 )，必须是 0 ，除非一个扩展协商为 非零值定义的
- Opcode 表示帧的类型 ( 4位 )，例如这个传输的帧是文本类型还是二进制类型，二进制类型传输的数据可以是图片或者语音之类的。( 这4位转换成16进制表示的意思如下)：
- 0x0 表示附加数据帧
- 0x1 表示文本数据帧
- 0x2 表示二进制数据帧
- 0x3-7 暂时无定义，为以后的非控制帧保留
- 0x8 表示连接关闭
- 0x9 表示ping
- 0xA 表示pong
- 0xB-F 暂时无定义，为以后控制帧保留

Mask（占一位）：表示是否经过掩码处理，1 是经过掩码的，0 是没有经过掩码的。如果 Mask 位为 1，

表示这是客户端发送过来的数据，因为客户端发送的数据要进行掩码加密；如果 Mask 位为0，表示是服务端发送的数据



payload  length  （ 7位 + 16位，或者 7位 + 64位），定义负载数据的长度。

- 如果数据长度小于等于 125的话，那么该 7位用来表示实际数据长度；
- 如果数据长度为 126 到 65535 (2的16次方)之间，该7位值固定为 126，也就是 1111110，往后扩展2个字节（16位，第三个区块表示），用于存储数据的实际长度；
- 如果数据长度大于 65535，该 7位 的值固定为 127，也就是 1111111，往后扩展 8个字节 ( 64位 )，用于存储数据实际长度



Masking-key( 0 或者 4个字节)，该区块用于存储掩码密钥，只有在第二个字节中的 mask 为1，也就是消息进行了掩码处理时才有，否则没有，所以服务器端向客户端发送消息就没有这一块



Payload data 扩展数据，是 0 字节，除非已经协商了一个扩展



现在我们需要保持长链接



![](http://cdn.yuyiqiushui.cn/ws09.png)



如果你使用 Node.js 开启基于 TCP 的私有双工长链接协议，也要开启这个选项

```javascript

const { EventEmitter } = require('events');
const { createServer } = require('http');
const crypto = require('crypto');
const MAGIC_STRING = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'; // 固定的字符串
function hashWebSocketKey(key) {
  const sha1 = crypto.createHash('sha1'); // 拿到sha1算法
  sha1.update(key + MAGIC_STRING, 'ascii');
  return sha1.digest('base64');
}
class MyWebsocket extends EventEmitter {
  constructor(options) {
    super(options);
    this.options = options;
    this.server = createServer();
    options.port ? this.server.listen(options.port) : this.server.listen(8080); //默认端口8080
    this.server.on('upgrade', (req, socket, header) => {
      this.socket = socket;
      socket.setKeepAlive(true);
      console.log(req.headers['sec-websocket-key'], 'key');
      const resKey = hashWebSocketKey(req.headers['sec-websocket-key']); // 对浏览器生成的key进行加密
      // 构造响应头
      const resHeaders = [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        'Sec-WebSocket-Accept: ' + resKey,
      ]
        .concat('', '')
        .join('\r\n');
      console.log(resHeaders, 'resHeaders');
      socket.write(resHeaders); // 返回响应头部
    });
  }
}

module.exports = MyWebsocket;
```

OK,现在最重要的一个通信长链接和头部已经实现，只剩下两点：

- 进行与掩码异或运行拿到真实数据；
- 处理真实数据（根据opcode）；

提示：如果这两点你看不懂没关系，只是一个运算过程，当你自己基于 TCP 设计私有协议时候，也要考虑这些， msgType、payloadLength、服务端发包粘包、客户端收包粘包、断线重传、timeout、心跳、发送队列等。



给socket对象挂载事件，我们已经继承了 EventEmitter模块

```javascript
socket.on('data', (data) => {
        // 监听客户端发送过来的数据，该数据是一个Buffer类型的数据
        this.buffer = data; // 将客户端发送过来的帧数据保存到buffer变量中
        this.processBuffer(); // 处理Buffer数据
      });
      socket.on('close', (error) => {
        // 监听客户端连接断开事件
        if (!this.closed) {
          this.emit('close', 1006, 'timeout');
          this.closed = true;
        }
```

每次接受到了 data，触发事件，解析 Buffer，进行运算：

```javascript
processBuffer() {
    let buf = this.buffer;
    let idx = 2; // 首先分析前两个字节
    // 处理第一个字节
    const byte1 = buf.readUInt8(0); // 读取buffer数据的前8 bit并转换为十进制整数
    // 获取第一个字节的最高位，看是0还是1
    const str1 = byte1.toString(2); // 将第一个字节转换为二进制的字符串形式
    const FIN = str1[0];
    // 获取第一个字节的后四位，让第一个字节与00001111进行与运算，即可拿到后四位
    let opcode = byte1 & 0x0f; //截取第一个字节的后4位，即opcode码, 等价于 (byte1 & 15)
    // 处理第二个字节
    const byte2 = buf.readUInt8(1); // 从第一个字节开始读取8位，即读取数据帧第二个字节数据
    const str2 = byte2.toString(2); // 将第二个字节转换为二进制的字符串形式
    const MASK = str2[0]; // 获取第二个字节的第一位，判断是否有掩码，客户端必须要有
    let length = parseInt(str2.substring(1), 2); // 获取第二个字节除第一位掩码之后的字符串并转换为整数
    if (length === 126) {
      // 说明125<数据长度<65535（16个位能描述的最大值，也就是16个1的时候)
      length = buf.readUInt16BE(2); // 就用第三个字节及第四个字节表示数据的长度
      idx += 2; // 偏移两个字节
    } else if (length === 127) {
      // 说明数据长度已经大于65535，16个位也已经不足以描述数据长度了，就用第三到第十个字节这八个字节来描述数据长度
      const highBits = buf.readUInt32BE(2); // 从第二个字节开始读取32位，即4个字节，表示后8个字节（64位）用于表示数据长度，其中高4字节是0
      if (highBits != 0) {
        // 前四个字节必须为0，否则数据异常，需要关闭连接
        this.close(1009, ''); //1009 关闭代码，说明数据太大；协议里是支持 63 位长度，不过这里我们自己实现的话，只支持 32 位长度，防止数据过大；
      }
      length = buf.readUInt32BE(6); // 获取八个字节中的后四个字节用于表示数据长度，即从第6到第10个字节，为真实存放的数据长度
      idx += 8;
    }
    let realData = null; // 保存真实数据对应字符串形式
    if (MASK) {
      // 如果存在MASK掩码，表示是客户端发送过来的数据，是加密过的数据，需要进行数据解码
      const maskDataBuffer = buf.slice(idx, idx + 4); //获取掩码数据, 其中前四个字节为掩码数据
      idx += 4; //指针前移到真实数据段
      const realDataBuffer = buf.slice(idx, idx + length); // 获取真实数据对应的Buffer
      realData = handleMask(maskDataBuffer, realDataBuffer); //解码真实数据
      console.log(`realData is ${realData}`);
    }
    let realDataBuffer = Buffer.from(realData); // 将真实数据转换为Buffer
    this.buffer = buf.slice(idx + length); // 清除已处理的buffer数据
    if (FIN) {
      // 如果第一个字节的第一位为1,表示是消息的最后一个分片，即全部消息结束了(发送的数据比较少，一次发送完成)
      this.handleRealData(opcode, realDataBuffer); // 处理操作码
    }
  }
```

如果 FIN 不为 0，那么意味着分片结束，可以解析 Buffer；

处理 mask 掩码 （客户端发过来的是1，服务端发的是0）得到真正的数据；

```javascript

function handleMask(maskBytes, data) {
  const payload = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) {
    // 遍历真实数据
    payload[i] = maskBytes[i % 4] ^ data[i]; // 掩码有4个字节依次与真实数据进行异或运算即可
  }
  return payload;
}
```

根据 opcode (接受到的数据是字符串还是 Buffer)进行处理：

```javascript

  const OPCODES = {
  CONTINUE: 0,
  TEXT: 1,
  BINARY: 2,
  CLOSE: 8,
  PING: 9,
  PONG: 10,
};

  // 处理客户端发送过来的真实数据
  handleRealData(opcode, realDataBuffer) {
    switch (opcode) {
      case OPCODES.TEXT:
        this.emit('data', realDataBuffer.toString('utf8')); // 服务端WebSocket监听data事件即可拿到数据
        break;
      case OPCODES.BINARY: //二进制文件直接交付
        this.emit('data', realDataBuffer);
        break;
      default:
        this.close(1002, 'unhandle opcode:' + opcode);
    }
  }
```

如果是 Buffer就转换为 utf8 的字符串 (如果是 protobuffer协议，那么还要根据 pb 文件进行解析)

接受数据已经搞定，传输数据无非两种，字符串和二进制，那么发送也是。

下面把发送数据搞定：

```javascript

  send(data) {
    let opcode;
    let buffer;
    if (Buffer.isBuffer(data)) {
      // 如果是二进制数据
      opcode = OPCODES.BINARY; // 操作码设置为二进制类型
      buffer = data;
    } else if (typeof data === 'string') {
      // 如果是字符串
      opcode = OPCODES.TEXT; // 操作码设置为文本类型
      buffer = Buffer.from(data, 'utf8'); // 将字符串转换为Buffer数据
    } else {
      throw new Error('cannot send object.Must be string of Buffer');
    }
    this.doSend(opcode, buffer);
  }

  // 开始发送数据
  doSend(opcode, buffer) {
    this.socket.write(encodeMessage(opcode, buffer)); //编码后直接通过socket发送
  }
```

首先把要发送的数据都转换成 二进制，然后进行数据帧格式拼装

```javascript

function encodeMessage(opcode, payload) {
  let buf;
  // 0x80 二进制为 10000000 | opcode 进行或运算就相当于是将首位置为1
  let b1 = 0x80 | opcode; // 如果没有数据了将FIN置为1
  let b2; // 存放数据长度
  let length = payload.length;
  console.log(`encodeMessage: length is ${length}`);
  if (length < 126) {
    buf = Buffer.alloc(payload.length + 2 + 0); // 服务器返回的数据不需要加密，直接加2个字节即可
    b2 = length; // MASK为0，直接赋值为length值即可
    buf.writeUInt8(b1, 0); //从第0个字节开始写入8位，即将b1写入到第一个字节中
    buf.writeUInt8(b2, 1); //读8―15bit，将字节长度写入到第二个字节中
    payload.copy(buf, 2); //复制数据,从2(第三)字节开始,将数据插入到第二个字节后面
  }
  return buf;
}
```

服务端发送的数据，Mask的值为0；

此时在外面监听事件，像平时一样使用 ws 协议一样即可

```javascript
const MyWebSocket = require('./ws');
const ws = new MyWebSocket({ port: 8080 });

ws.on('data', (data) => {
  console.log('receive data:' + data);
  ws.send('this message from server');
});

ws.on('close', (code, reason) => {
  console.log('close:', code, reason);
});
```

