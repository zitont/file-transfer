const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const app = express();
const fs = require('fs');
app.use(cors());
const fileUtils = require('./funciton/fileUtils.js');
// 生成文件存储逻辑，包括设置自定义过期时间并计算过期时间戳
function calculateExpirationTime(req) {
  let expirationTime = 5 * 60 * 1000; // 默认过期时间为5分钟

  if (req.body.expirationHours) {
    expirationTime = req.body.expirationHours * 60 * 60 * 1000; // 使用小时作为过期时间
  } else if (req.body.expirationMinutes) {
    expirationTime = req.body.expirationMinutes * 60 * 1000; // 使用分钟作为过期时间
  } else if (req.body.expirationDays) {
    expirationTime = req.body.expirationDays * 24 * 60 * 60 * 1000; // 使用天作为过期时间
  }

  return expirationTime;
}
function storeFileInfo(fileInfo) {
  const fileInfoPath = 'src/file-servers/fileInfo.json';
  let fileInfoContent = [];
  if (fs.existsSync(fileInfoPath)) {
    const fileData = fs.readFileSync(fileInfoPath, 'utf-8');
    if (fileData.trim() !== '') {
      fileInfoContent = JSON.parse(fileData);
    }
  }
  fileInfoContent.push(fileInfo);
  fs.writeFileSync(fileInfoPath, JSON.stringify(fileInfoContent)); // 将文件信息数组存储到 JSON 文件中
}
function storeFileInfos(fileInfo) {
  const fileInfoPath = 'src/file-servers/fileInfos.json';
  let fileInfoContent = [];
  if (fs.existsSync(fileInfoPath)) {
    const fileData = fs.readFileSync(fileInfoPath, 'utf-8');
    if (fileData.trim() !== '') {
      fileInfoContent = JSON.parse(fileData);
    }
  }
  fileInfoContent.push(fileInfo);
  fs.writeFileSync(fileInfoPath, JSON.stringify(fileInfoContent)); // 将文件信息对象追加到 JSON 文件中
}


function generateRandomSixDigitNumber() {
  return randomSixDigitNumber = Math.floor(100000 + Math.random() * 900000);
}
const storage = multer.diskStorage({
  destination: 'src/file-servers/uploads/',
  filename: function (req, file, cb) {
    const randomSixDigitNumber = generateRandomSixDigitNumber(); // 生成随机6位数
    // 将随机数写入到JSON文件中
    const timestamp = Date.now(); // 生成时间戳
    const expirationTime = calculateExpirationTime(req);
    const expirationTimestamp = timestamp + expirationTime; // 计算过期时间戳
    console.log(file.originalname)
    const encodedFilename = encodeURIComponent(file.originalname);
    const decodedFilename = decodeURIComponent(encodedFilename);
    const newFilename = expirationTimestamp + '_' + decodedFilename; // 使用过期时间戳来命名文件
    const fileInfo = {
      filename: file.originalname, // 文件名
      newFilename: newFilename, // 新文件名
      timestamp: timestamp, // 上传时间戳
      expirationTimestamp: expirationTimestamp,// 过期时间戳
      randomSixDigitNumber: randomSixDigitNumber // 随机数
    };
    storeFileInfos(fileInfo);
    storeFileInfo(fileInfo); // 调用函数存储文件信息

    cb(null, newFilename);
  }
});
const upload = multer({ storage: storage });

fileUtils.processExpiredFiles
//初始化处理过期文件的操作

// 每隔一段时间执行一次处理过期文件的操作
setInterval(fileUtils.processExpiredFiles, 10 * 60 * 1000); // 每隔10分钟执行一次
function getRandomSixDigitNumberFromJson(filename) {
  const filePath = 'src/file-servers/fileInfo.json'; // 替换为你的 JSON 文件路径
  const fileData = fs.readFileSync(filePath, 'utf-8');
  const jsonData = JSON.parse(fileData);

  for (let i = 0; i < jsonData.length; i++) {
    if (jsonData[i].newFilename === filename) {
      return jsonData[i].randomSixDigitNumber;
    }
  }

  return null; // 如果没有找到对应的文件名，则返回 null 或者其他你认为合适的值
}

app.post('/upload', upload.single('file'), (req, res) => {
  const NewrandomSixDigitNumber = getRandomSixDigitNumberFromJson(req.file.filename);
  console.log(NewrandomSixDigitNumber, req.file.filename + '上传成功');
  res.status(200).json({ message: '文件上传成功', filename: req.file.filename, randomSixDigitNumber: NewrandomSixDigitNumber });
});

function text(sNumber) {
  const filePath = 'src/file-servers/fileInfo.json'; // 替换为你的 JSON 文件路径
  const fileData = fs.readFileSync(filePath, 'utf-8');
  const jsonData = JSON.parse(fileData);

  for (let i = 0; i < jsonData.length; i++) {
    if (jsonData[i].newFilename === sNumber) {
      return jsonData[i].randomSixDigitNumber;
    }
  }

  return null; // 如果没有找到对应的文件名，则返回 null 或者其他你认为合适的值
}
function queryFileInfosByRandomSixDigitNumber(randomSixDigitNumber) {
  const filePath = 'src/file-servers/fileInfo.json'; // 替换为你的 JSON 文件路径
  const fileData = fs.readFileSync(filePath, 'utf-8');
  const jsonData = JSON.parse(fileData);
  for (let i = 0; i < jsonData.length; i++) {
    if (jsonData[i].randomSixDigitNumber == randomSixDigitNumber) {
      return jsonData[i];
    }
  }
  return null;
}
app.get('/download/:Number', (req, res) => {
  const randomSixDigitNumber = req.params.Number;
  const fileInfos = queryFileInfosByRandomSixDigitNumber(randomSixDigitNumber);
  console.log(randomSixDigitNumber);
  console.log(fileInfos);
  if (fileInfos==null) {
    // 如果fileInfos为空，你可以返回一个错误消息或执行其他逻辑
    res.status(404).send('File info not found');
  } else {
    const filePath = 'src/file-servers/uploads/' + fileInfos.newFilename;
    if (fs.existsSync(filePath)) {
      try {
        const file = fs.createReadStream(filePath);
        const stat = fs.statSync(filePath);
        res.setHeader('Content-Length', stat.size);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', 'attachment; filename=' + fileInfos.filename);
        file.pipe(res);
      } catch (err) {
        res.status(500).send('Internal server error');
      }
    } else {
      res.status(404).send('File not found');
    }
  }
});
app.listen(3000, () => {
  console.log('后端服务运行在 http://localhost:3000');
});