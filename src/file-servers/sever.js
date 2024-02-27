const express = require('express');
const cors = require('cors');
const multer  = require('multer');
const path = require('path');
const app = express();
app.use(cors());
// 自定义存储方式，保留原始文件名
const storage = multer.diskStorage({
    destination: 'src/file-servers/uploads/',
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  });
  
  const upload = multer({ storage: storage });
  
  app.post('/upload', upload.single('file'), (req, res) => {
    // 处理文件上传逻辑
    res.send('文件上传成功');
    const fileName = req.file.originalname;
    console.log(fileName+'文件上传成功');
  });
  app.get('/download/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, '../file-servers/uploads', fileName);
  
    // 使用res.download()方法来提供文件下载
    res.download(filePath, fileName, (err) => {
      if (err) {
        // 发生错误时的处理逻辑
        console.error('文件下载失败: ' + err);
        res.status(404).send('文件不存在或无法下载');
      } else {
        // 下载成功时的处理逻辑
        console.log('文件下载成功');
      }
    });
  });
app.listen(3000, () => {
  console.log('后端服务运行在 http://localhost:3000');
});