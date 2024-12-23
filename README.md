<div align="center">
  <img src="README_FILES/Icon.jpg" style="width: 72px; height: auto; border-radius: 25%;" alt="App Logo">
  <h1>活动照片文档生成工具</h1>
  <p>10 秒钟快速生成一份活动文档！</p>
</div>
<br />

<img src="README_Files/Homepage.jpg" style="width: 50%; height: auto; border-radius: 5%;" alt="App Homepage">

## :star2: 项目介绍

因为每周都需要打印主题班会、活动的照片，使用 Word 拼合十分耗时，便萌生了「偷懒」的想法。

<br />

本项目是在 [Cursor](https://www.cursor.com/) 的亲自指挥、亲自部署下完成的，十分十分十分感谢 🙏！Word 模版运用了 [docxtemplater](https://www.npmjs.com/package/docxtemplater) 与 [docxtemplater-image-module-free](https://www.npmjs.com/package/docxtemplater-image-module-free) 库，前端界面使用 [express](https://www.npmjs.com/package/express) 与 [ejs](https://www.npmjs.com/package/ejs) 库渲染。

<br />

Word 模板中使用固定表格，目前未实现根据图片数量自动增减表格的功能，因此单个文档的图片数量最多为 30 张。

<br />

在未来，可能会支持 Docker 容器部署，增加 API 接口以实现 Windows 右键菜单便捷上传，支持拖动图片调整展示顺序。如果你有好的功能、建议，欢迎提出 issue，或进行代码方面的支持！

## :eyes: 使用方法

<img src="README_Files/Demo.gif" style="border-radius: 5%;" alt="App Demo">

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