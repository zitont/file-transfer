<template>

  <div class="common-layout">
    <el-container>
      <el-header>Header</el-header>
      <el-main>
        <el-row :gutter="20" class="el-row-sc">
    <el-col :span="12" :offset="6">
      <el-card class="box-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <span>上传文件</span>
      </div>
    </template>
    <el-upload
    ref="uploadRef"
    class="upload-demo"
    drag
    action="http://localhost:3000/upload"
    multiple
    :on-success="handleSuccess"
    :on-error="handleError"
    :auto-upload="false"
  >
    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
    <div class="el-upload__text">
      将文件拖放到此处或<em>单击以上传</em>
    </div>
    <template #tip>
      <div class="el-upload__tip">
      </div>
    </template>
    
  </el-upload>
    <template #footer>
      <el-button  type="primary" @click="submitUpload">
      上传<el-icon class="el-icon--right"><Upload /></el-icon>
    </el-button>
    </template>
  </el-card>
    </el-col>
  </el-row>
      </el-main>
      <el-footer>Footer</el-footer>
    </el-container>
  </div>



  </template>
  
  <script setup lang="ts">
import { ref } from "vue";
import { UploadFilled } from '@element-plus/icons-vue'
import type { UploadFile} from "element-plus";
import type { UploadInstance } from 'element-plus'
import { ElNotification } from 'element-plus'
const handleSuccess = (response: any, file: UploadFile, fileList: UploadFile[],name: any) => {
  ElNotification({
    title: response,
    message:file.name,
    type: 'success',
  })
  // 处理上传成功后的逻辑
  console.log(response, file, fileList);
}
const handleError = (response: any, file: UploadFile, fileList: UploadFile[],name: any) => {
  ElNotification({
    title: "文件上传失败",
    message:file.name,
    type: 'error',
  })
  // 处理上传成功后的逻辑
  console.log(response, file, fileList);
}

const uploadRef = ref<UploadInstance>()

const submitUpload = () => {
  uploadRef.value!.submit()
  console.log(uploadRef.value)
}
  </script>
  <style>
  .el-row-sc {
    margin-top: 100px;
    margin-bottom: 200px;
  }
  .box-card {
  width: 480px;
  height: 400px;
}
</style>
  