const express = require('express');
const cors = require('cors');
const multer  = require('multer');
const path = require('path');
const app = express();
const fs = require('fs');
app.use(cors());
// 生成文件存储逻辑，包括设置自定义过期时间并计算过期时间戳
const storage = multer.diskStorage({
  destination: 'src/file-servers/uploads/',
  filename: function (req, file, cb) {
    const timestamp = Date.now(); // 生成时间戳
    let expirationTime = 2 * 60 * 1000; // 默认过期时间为5分钟

    if (req.body.expirationHours) {
      expirationTime = req.body.expirationHours * 3 * 60 * 60 * 1000; // 使用小时作为过期时间
    } else if (req.body.expirationMinutes) {
      expirationTime = req.body.expirationMinutes * 5 * 60 * 1000; // 使用分钟作为过期时间
    } else if (req.body.expirationDays) {
      expirationTime = req.body.expirationDays * 24 * 60 * 60 * 1000; // 使用天作为过期时间
    }

    const expirationTimestamp = timestamp + expirationTime; // 计算过期时间戳
    const newFilename = expirationTimestamp + '_' + file.originalname; // 使用过期时间戳来命名文件
    const fileInfo = {
      filename: file.originalname, // 文件名
      timestamp: timestamp, // 上传时间戳
      expirationTimestamp: expirationTimestamp // 过期时间戳
    };

    let fileInfoContent = [];
    const fileInfoPath = 'src/file-servers/fileInfo.json';
    if (fs.existsSync(fileInfoPath)) {
      const fileData = fs.readFileSync(fileInfoPath, 'utf-8');
      if (fileData.trim() !== '') {
        fileInfoContent = JSON.parse(fileData);
      }
    }
    fileInfoContent.push(fileInfo);
    fs.writeFileSync(fileInfoPath, JSON.stringify(fileInfoContent)); // 将文件信息数组存储到 JSON 文件中
    cb(null, newFilename);
  }
});
  const upload = multer({ storage: storage });
  
  // 定时事件，处理过期文件
  function processExpiredFiles() {
    const fileInfoPath = 'src/file-servers/fileInfo.json';
    let fileInfoContent = [];
  
    if (fs.existsSync(fileInfoPath)) {
      const fileData = fs.readFileSync(fileInfoPath, 'utf-8').trim();
      if (fileData !== '') {
        fileInfoContent = JSON.parse(fileData);
        const currentTime = Date.now();
  
        // 使用 filter 方法创建一个新的数组，其中包含未过期的文件记录
        fileInfoContent = fileInfoContent.filter((fileInfo) => {
          if (currentTime > fileInfo.expirationTimestamp) {
            const filePath = path.join('src/file-servers/uploads/', fileInfo.expirationTimestamp + '_' + fileInfo.filename);
            // 检查文件是否存在
            if (fs.existsSync(filePath)) {
              // 删除过期文件
              fs.unlink(filePath, (err) => {
                if (err) {
                  console.error('Error deleting file:', err);
                }
              });
            } else {
              console.error('File does not exist:', filePath);
            }
            return false; // 返回 false 表示过期文件被删除
          }
          return true; // 返回 true 表示文件未过期
        });
  
        // 更新 JSON 文件
        fs.writeFileSync(fileInfoPath, JSON.stringify(fileInfoContent));
      } else {
        console.log('File is empty. Skipping processExpiredFiles.');
      }
    }
    console.log('文件过期处理成功');
  }
// 每隔一段时间执行一次处理过期文件的操作
// setInterval(processExpiredFiles, 24 * 60 * 60 * 1000); // 每隔24小时执行一次
setInterval(processExpiredFiles, 30 * 1000); //测试
  app.post('/upload', upload.single('file'), (req, res) => {
    res.status(200).send('文件上传成功');
    console.log('文件上传成功');
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