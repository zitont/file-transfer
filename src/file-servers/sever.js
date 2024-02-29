const express = require('express');
const cors = require('cors');
const multer  = require('multer');
const path = require('path');
const app = express();
const fs = require('fs');
app.use(cors());
// 自定义存储方式，保留原始文件名
// 修改文件存储逻辑，获取文件名并生成时间戳
const storage = multer.diskStorage({
  destination: 'src/file-servers/uploads/',
  filename: function (req, file, cb) {
    const timestamp = Date.now(); // 生成时间戳
    const newFilename = timestamp + '_' + file.originalname; // 使用时间戳来命名文件
    const fileInfo = {
      filename: file.originalname, // 文件名
      timestamp: timestamp // 时间戳
    };
    fs.writeFileSync('src/file-servers/fileInfo.json', JSON.stringify(fileInfo)); // 将文件名和时间戳存储到 JSON 文件中
    cb(null, newFilename);
  }
});
  const upload = multer({ storage: storage });
  
  app.post('/upload', upload.single('file'), (req, res) => {
    res.send('文件上传成功');
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