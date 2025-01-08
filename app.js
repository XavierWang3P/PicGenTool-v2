// 活动照片文档生成工具 v2.1
// 项目地址：https://github.com/XavierWang3P/PicGenTool-v2
//
// by 王虾虾

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const ImageModule = require('docxtemplater-image-module-pwndoc');
const sharp = require('sharp');

const app = express();

// 确保目录存在
const ensureDirectoryExists = (directory) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
};

// 创建必要的目录
ensureDirectoryExists(path.join(__dirname, 'public', 'uploads'));
ensureDirectoryExists(path.join(__dirname, 'public', 'uploads', 'compressed'));
ensureDirectoryExists(path.join(__dirname, 'views'));
ensureDirectoryExists(path.join(__dirname, 'templates'));

// 配置 multer 存储
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function(req, file, cb) {
        // 使用时间戳和原始文件名，确保文件名唯一
        const timestamp = Date.now();
        // 使用 Buffer 处理文件名编码
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        // 移除文件名中的非法字符
        const safeName = originalName.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
        cb(null, `${timestamp}-${safeName}`);
    }
});

// 文件过滤器
const fileFilter = function(req, file, cb) {
    // 检查文件类型
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // 允许上传
    } else {
        cb(new Error('只允许上传图片文件！'), false); // 拒绝上传
    }
};

// 创建 multer 实例
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 30 * 1024 * 1024, // 限制文件大小为 30MB
        files: 30 // 最多 30 个文件
    }
}).array('images', 30);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

// 主页路由
app.get('/', (req, res) => {
    res.render('index');
});

// 处理文档生成
app.post('/generate', (req, res) => {
    upload(req, res, async function(err) {
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            return res.status(400).json({ error: err.message });
        } else if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: '上传失败' });
        }

        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: '请选择要上传的图片' });
            }

            const { title, location, date } = req.body;
            const images = req.files;

            console.log('接收到的数据:', { title, location, date, images: images.length });

            // 压缩图片并保存
            const compressedImages = await Promise.all(images.map(async (image) => {
                const compressedImagePath = path.join('public/uploads/compressed', image.filename);
                await sharp(image.path)
                    .resize(800)
                    .toFile(compressedImagePath);
                return compressedImagePath;
            }));

            // 根据图片数量选择模板
            const templateFileName = `Template-${compressedImages.length}.docx`;
            const templatePath = path.join(__dirname, 'templates', templateFileName);

            if (!fs.existsSync(templatePath)) {
                throw new Error(`模板文件不存在: ${templateFileName}`);
            }

            // 解析输入的日期
            const inputDate = new Date(date);
            
            // 文档中显示的日期格式（移除前导零）
            const monthForDoc = (inputDate.getMonth() + 1);  // 直接使用数字
            const dayForDoc = inputDate.getDate();           // 直接使用数字
            const dateForDoc = `${inputDate.getFullYear()}年${monthForDoc}月${dayForDoc}日`;

            // 文件名中的日期格式（保持前导零）
            const month = (inputDate.getMonth() + 1).toString().padStart(2, '0');
            const day = inputDate.getDate().toString().padStart(2, '0');
            const dateForFile = `${inputDate.getFullYear().toString().slice(-2)}.${month}.${day}`;

            // 读取模板文件
            const template = fs.readFileSync(templatePath, 'binary');
            const zip = new PizZip(template);

            // 配置图片模块
            const imageModule = new ImageModule({
                centered: false,
                fileType: 'docx',
                getImage: (tagValue) => {
                    const imageIndex = parseInt(tagValue.replace('image', '')) - 1;
                    if (imageIndex >= 0 && imageIndex < compressedImages.length) {
                        try {
                            const imagePath = compressedImages[imageIndex];
                            if (fs.existsSync(imagePath)) {
                                const imageBuffer = fs.readFileSync(imagePath);
                                return imageBuffer;
                            }
                            console.error(`未找到图片文件: ${imagePath}`);
                            return null;
                        } catch (error) {
                            console.error(`读取图片时出错: ${error}`);
                            return null;
                        }
                    }
                    console.error(`无效的图片索引: ${imageIndex}`);
                    return null;
                },
                getSize: () => {
                    // 修改图片尺寸设置
                    // 7cm × 5.5cm，转换为像素（1厘米约等于37.8像素）
                    return [
                        Math.round(7 * 37.8),  // 7cm
                        Math.round(5.5 * 37.8) // 5.5cm
                    ];
                }
            });

            // 创建文档模板
            const doc = new Docxtemplater(zip, {
                modules: [imageModule],
                paragraphLoop: true,
                linebreaks: true
            });

            // 准备数据对象
            const templateData = {
                title: title,
                location: location,
                date: dateForDoc,
                dateForDoc: dateForDoc
            };

            // 添加图片数据
            compressedImages.forEach((image, index) => {
                templateData[`image${index + 1}`] = `image${index + 1}`;
            });

            console.log('模板数据:', templateData);

            try {
                // 渲染文档
                await doc.renderAsync(templateData);

                // 生成文档
                const buf = doc.getZip().generate({
                    type: 'nodebuffer',
                    compression: 'DEFLATE'
                });

                // 修改文件名处理逻辑
                const cleanTitle = title.trim(); // 去除首尾空格
                const safeFileName = `${dateForFile}-${cleanTitle}照片.docx`;

                // 修改响应头设置
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(safeFileName)}`);

                // 发送文件
                res.send(buf);

                // 清理文件
                setTimeout(() => {
                    // 清理上传的图片
                    images.forEach(image => {
                        const imagePath = path.resolve(image.path);
                        fs.unlink(imagePath, (err) => {
                            if (err) {
                                console.error('删除上传文件时出错:', err);
                            } else {
                                console.log(`成功删除上传的图片: ${image.path}`);
                            }
                        });
                    });

                    // 清理压缩的图片
                    compressedImages.forEach(imagePath => {
                        const resolvedPath = path.resolve(imagePath);
                        try {
                            fs.unlinkSync(resolvedPath);
                        } catch (error) {
                            console.error('删除压缩文件时出错:', error);
                        }
                    });
                }, 1000);

            } catch (renderError) {
                console.error('渲染文档时出错:', renderError);
                throw new Error('渲染文档失败: ' + renderError.message);
            }

        } catch (error) {
            console.error('生成文档时出错:', error);
            res.status(500).json({ error: error.message || '文档生成失败' });
        }
    });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: '服务器错误' });
});

// 启动服务器
const PORT = process.env.PORT || 5965;
app.listen(PORT, () => {
    const host = 'http://localhost'; // 或者使用您的服务器地址
    console.log(`Server is running on ${host}:${PORT}`);
});