<script setup>
import { CircleCloseFilled, Moon, Sunny } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { ref, onMounted } from 'vue'

const dataList = ref([])
const createTODODialog = ref(false)
const createTODOTitle = ref('')
const createTODODescription = ref('')
const detailTODODialog = ref(false)
const detailTODOEdit = ref(false)
const detailTODOIndex = ref(undefined)
const detailTODOTitle = ref('')
const detailTODODescription = ref('')
// eslint-disable-next-line no-undef
globalThis.getData = () => {
  console.log(localStorage.getItem('data'))
  console.log(dataList.value)
}
onMounted(() => {
  // dataList.value = readData()
})
function saveData(data) {
  if (typeof data === 'string') {
    localStorage.setItem('data', data)
  } else {
    localStorage.setItem('data', JSON.stringify(data))
  }
}
function readData() {
  let data = localStorage.getItem('data')
  if (data) {
    return JSON.parse(data)
  } else {
    return []
  }
}
function openDetail(index) {
  detailTODOIndex.value = index
  detailTODOTitle.value = dataList.value[index].title
  detailTODODescription.value = dataList.value[index].description
  detailTODODialog.value = true
}
function deleteTODO(index) {
  console.log(index)
  ElMessageBox.confirm(`是否删除代办“${dataList.value[index].title}”`, '删除代办').then(
    (action) => {
      if (action === 'confirm') {
        dataList.value.splice(index)
        saveData(dataList.value)
      }
    }
  )
}
function createTODO() {
  createTODODialog.value = true
}

function createTODOSave() {
  createTODODialog.value = false
  dataList.value.push({
    title: createTODOTitle.value,
    description: createTODODescription.value,
    complete: false
  })
  saveData(dataList.value)
}
function createTODOCancel() {
  createTODODialog.value = false
  createTODOTitle.value = ''
  createTODODescription.value = ''
}
function checkChange() {
  saveData(dataList.value)
}
function detailTODOSave() {
  dataList.value[detailTODOIndex.value].title = detailTODOTitle.value
  dataList.value[detailTODOIndex.value].description = detailTODODescription.value
  detailTODOEdit.value = false
  saveData(dataList.value)
}
</script>

<template>
  <el-main>
    <h1>代办清单 / TODO List</h1>
    <el-row justify="center">
      <el-col :span="18">
        <el-button
          size="large"
          type="primary"
          style="width: 100%; margin-bottom: 16px"
          @click="createTODO"
          >添加代办</el-button
        >
      </el-col>
    </el-row>
    <el-row gutter="8">
      <el-col :span="24">
        <el-card v-for="(item, index) in dataList" :key="index" shadow="hover" class="card">
          <template #default>
            <el-row align="middle">
              <el-col :span="2">
                <el-checkbox v-model="item.complete" size="large" @change="checkChange(index)" />
              </el-col>
              <el-col :span="19">
                <el-text
                  :tag="item.complete ? 'del' : 'span'"
                  :type="item.complete ? 'info' : ''"
                  size="large"
                  class="pointer"
                  @click="openDetail(index)"
                  >{{ item.title }}</el-text
                >
              </el-col>
              <el-col :span="1">
                <el-tooltip content="删除代办">
                  <el-icon color="red" size="large" class="pointer" @click="deleteTODO(index)">
                    <CircleCloseFilled />
                  </el-icon>
                </el-tooltip>
              </el-col>
            </el-row>
          </template>
        </el-card>
      </el-col>
    </el-row>
  </el-main>
  <el-backtop :right="100" :bottom="100">
    <div>
      <el-icon><Moon /></el-icon>
      <el-icon><Sunny /></el-icon>
    </div>
  </el-backtop>
  <el-dialog v-model="createTODODialog" width="80%">
    <template #header>
      <span>创建代办</span>
    </template>
    <template #default>
      <el-form label-position="top">
        <el-form-item label="代办事件标题">
          <el-input v-model="createTODOTitle" />
        </el-form-item>
        <el-form-item label="代办事件描述">
          <el-input v-model="createTODODescription" type="textarea" rows="8" />
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <el-button @click="createTODOCancel">取消</el-button>
      <el-button @click="createTODOSave">保存</el-button>
    </template>
  </el-dialog>
  <el-dialog v-model="detailTODODialog" width="80%">
    <template #header>
      <span>{{ detailTODOEdit ? '编辑代办' : '查看代办' }}</span>
    </template>
    <template #default>
      <el-form label-position="top">
        <el-form-item label="代办事件标题">
          <el-input v-if="detailTODOEdit" v-model="detailTODOTitle" />
          <el-text v-else type="info">{{ detailTODOTitle }}</el-text>
        </el-form-item>
        <el-form-item label="代办事件描述">
          <el-input v-if="detailTODOEdit" v-model="detailTODODescription" />
          <el-text v-else type="info">{{ detailTODODescription }}</el-text>
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <el-button v-if="detailTODOEdit" @click="detailTODOEdit = false">取消</el-button>
      <el-button v-if="!detailTODOEdit" @click="detailTODODialog = false">关闭</el-button>
      <el-button v-if="detailTODOEdit" type="primary" @click="detailTODOSave">保存</el-button>
      <el-button v-if="!detailTODOEdit" type="warning" @click="detailTODOEdit = true"
        >编辑</el-button
      >
    </template>
  </el-dialog>
</template>

<style scoped>
h1 {
  margin-top: 0;
  text-align: center;
}
.card {
  border-radius: 50px;
  margin-bottom: 8px;
}
.pointer {
  cursor: pointer;
}
</style>
