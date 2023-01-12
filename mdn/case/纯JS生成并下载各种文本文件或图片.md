纯JS 生成并下载各种文本文件或图片

## 一、HTML与文件下载

如果希望子啊前端册直接触发某些资源的下载，最快捷方便的方法就是使用 HTML5 原生的 `download`  属性， 例如：

```js
<a href="large.jpg" download>下载</a>
```

具体介绍可参考我之前的文章：“[了解HTML/HTML5中的download属性](https://link.juejin.cn/?target=http%3A%2F%2Fwww.zhangxinxu.com%2Fwordpress%2F%3Fp%3D5332)”。

但显然，如果纯粹利用HTML属性来实现文件的下载（而不是浏览器打开或浏览），对于动态内容，就无能为力。

例如，我们对页面进行分享的时候，希望分享图片是页面内容的实时截图，此时，这个图片就是动态的，纯HTML显然是无法满足我们的需求的，借助JS和其它一些HTML5特性，例如，将页面元素转换到`canvas`上，然后再转成图片进行下载，可参见“[SVG 简介与截图等应用](https://link.juejin.cn/?target=https%3A%2F%2Fwww.zhangxinxu.com%2Fwordpress%2F2017%2F08%2Fsvg-foreignobject%2F)”一文。

但本文要介绍的下载不是图片的下载，而是文本信息的下载，所需要使用的HTML特性不是`canvas`，而是其它。



## 二、借助 HTML5 Blob  实现文本信息文件下载

如果对Blob不了解，可以先看看我好些年之前写的“[理解DOMString、Document、FormData、Blob、File、ArrayBuffer数据类型](https://link.juejin.cn/?target=http%3A%2F%2Fwww.zhangxinxu.com%2Fwordpress%2F%3Fp%3D3725)”一文。

原理其实很简单，我们可以将文本或者JS字符串信息借助Blob转换成二进制，然后，作为`<a>`元素的`href`属性，配合`download`属性，实现下载。

代码也比较简单，如下示意（兼容Chrome和Firefox）：

```js
var funDownlaod = function (content, filename) {
    // 创建隐藏的可下载链接
    var eleLink = document.createElement('a')
    eleLink.download = filename;
    eleLlink.style.display = 'none'
    // 字符串转变为 blob 地址
    var blob = new Blob([content])
    eleLink.href = URL.createObjectURL(blob);
    //  触发点击
    document.body.appendChild(eleLink);
    eleLink.click();
    // 然后移除
    document.body.removeChild(eleLink);
}
```

其中， `content`  指需要下载的文本或字符串内容， `filename` 指下载到系统中的文件名称。

您可以狠狠地点击这里：[基于funDownload实现的html格式文件下载demo](https://link.juejin.cn/?target=http%3A%2F%2Fwww.zhangxinxu.com%2Fstudy%2F201707%2Fjs-text-download-as-html-file.html)

点击“下载”按钮，会把文本域中的内容全部作为一个`.html`后缀文件下载下来，各流程效果如下面几张图：

[![下载按钮点击示意](https://user-gold-cdn.xitu.io/2018/10/25/166ab1b848734a42?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)]()

出现下载确认框（根据浏览器的设置不同也可能直接下载），然后名称默认就是`test.html`。

[](https://user-gold-cdn.xitu.io/2018/10/25/166ab1b8489ea3bb?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

然后对应保存目录就多了个类似下图的文件：

[](https://user-gold-cdn.xitu.io/2018/10/25/166ab1b84892d475?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

双击该`test.html`文件可以在浏览器中正常浏览，说明，保存信息无误。

[](https://user-gold-cdn.xitu.io/2018/10/25/166ab1b84892d475?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



## 三、借助 Base64 实现任意文件下载

对于非文本文件，也是可以直接 JS 触发下载的，例如，如果我们想下载一张图片，可以把这张图片转换成 base64 格式，然后下载：

eg:

```js
var funDownload = function (domImg, filename) {
    // 创建隐藏的可下载链接
    var eleLink = document.createElement('a');
    eleLink.download = filename;
    eleLink.style.display = 'none';
    // 图片转base64地址
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var width = domImg.naturalWidth;
    var height = domImg.naturalHeight;    context.drawImage(domImg, 0, 0);
    // 如果是PNG图片，则canvas.toDataURL('image/png')
    eleLink.href = canvas.toDataURL('image/jpeg');
    // 触发点击
    document.body.appendChild(eleLink);
    eleLink.click();
    // 然后移除
    document.body.removeChild(eleLink);
};
```

## 四、结束语

不止是 .html 文件， .txt ， .json 等文本文件都可以使用这种小技巧实现下载。

在Chrome浏览器下，模拟点击创建的`<a>`元素即使不`append`到页面中，也是可以触发下载的，但是在Firefox浏览器中却不行，因此，上面的`funDownload()`方法有一个`appendChild`和`removeChild`的处理，就是为了兼容Firefox浏览器。

`download`属性从Edge13开始支持，根据同行测试可以触发下载，不过生成的文件命名类似GUID，需要手动再加个后缀。