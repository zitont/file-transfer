// fileUtils.js
const fs = require('fs');
const path = require('path');
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
                            } else {
                                console.log(fileInfo.expirationTimestamp + '_' + fileInfo.filename + '文件已过期，已删除');
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
            console.log('没有文件信息，无需处理');
        }
    }
    // console.log('文件过期处理成功');
}

module.exports = {
    processExpiredFiles
};