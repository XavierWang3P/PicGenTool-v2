<div align="center">
  <img src="README_FILES/Icon.jpg" style="width: 72px; height: auto; border-radius: 25%;">
  <h1>活动照片文档生成工具</h1>
  <p>10 秒钟快速生成一份活动文档！</p>
</div>
<br />

## :star2: 项目介绍

因为每周都需要打印主题班会、活动的照片，使用 Word 拼合十分耗时，便萌生了「偷懒」的想法。

<br />

本项目是在 [Cursor](https://www.cursor.com/) 的亲自指挥、亲自部署下完成的，十分十分十分感谢 🙏！Word 模版运用了 [docxtemplater](https://www.npmjs.com/package/docxtemplater) 与 [docxtemplater-image-module-free](https://www.npmjs.com/package/docxtemplater-image-module-free) 库，前端界面使用 [express](https://www.npmjs.com/package/express) 与 [ejs](https://www.npmjs.com/package/ejs) 库渲染。

## :eyes: 使用方法

1. **安装依赖**
   拉取本项目后，在项目目录中运行命令安装依赖：
   ```bash
   npm install
   ```
2. **运行项目**
   启动本地服务器：
   ```bash
   node app.js
   ```
3. **生成文档**
   访问 `http://localhost:3000`，拖入图片，按照指示填写相关信息，点击生成按钮即可创建文档。

## :information_source: 版权

本项目遵循 GPL v3.0 协议。

## :mailbox_with_mail: 联系我

- 博客：[鸟之言语](https://xavier.wang/)
- 公众号：[鸟言鸟语](http://weixin.qq.com/r/mp/SyhTV57E11arKdo0b33P)
- 电邮：me#xavier.wang

