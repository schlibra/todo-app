<script setup>
import { ref } from 'vue'
import { ElMessageBox } from 'element-plus'
const emit = defineEmits(['reload'])
// eslint-disable-next-line vue/require-prop-types
const model = defineModel()
const loadedData = ref([])
const dataCount = ref(0)

function importData() {
  // eslint-disable-next-line no-undef
  electron.ipcRenderer.send('open-file-dialog')
}
function exportData() {
  let data = localStorage.getItem('data') ?? '[]'
  // eslint-disable-next-line no-undef
  electron.ipcRenderer.send('save-file-dialog', data)
}
// eslint-disable-next-line no-undef
electron.ipcRenderer.on('selected-file', (event, args) => {
  console.log(event, args)
  loadedData.value = JSON.parse(args)
  dataCount.value = loadedData.value.length
})
// eslint-disable-next-line no-undef
electron.ipcRenderer.on('saved-file', (event, args) => {
  console.log(event, args)
})
function saveData() {
  ElMessageBox.confirm('导入后将会覆盖原有数据', '导入数据').then((action) => {
    if (action === 'confirm') {
      localStorage.setItem('data', JSON.stringify(loadedData.value))
      loadedData.value = []
      dataCount.value = 0
      emit('reload')
      model.value = false
    }
  })
}
function appendData() {
  let data = JSON.parse(localStorage.getItem('data') ?? '[]')
  data.push(...loadedData.value)
  localStorage.setItem('data', JSON.stringify(data))
  loadedData.value = []
  dataCount.value = 0
  emit('reload')
  model.value = false
}
function resetData() {
  ElMessageBox.confirm('清空数据后将不能恢复，是否继续？', '清空数据').then((action) => {
    if (action === 'confirm') {
      localStorage.setItem('data', '[]')
      emit('reload')
      model.value = false
    }
  })
}
</script>

<template>
  <el-dialog v-model="model" fullscreen>
    <template #header>
      <span>设置</span>
    </template>
    <template #default>
      <el-form label-position="top">
        <el-form-item label="导入设置">
          <el-row>
            <el-col>
              <el-text v-if="dataCount > 0">共{{ dataCount }}条数据</el-text>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-button @click="importData">从文件读取</el-button>
              <el-button v-if="dataCount > 0" @click="saveData">导入数据</el-button>
              <el-button v-if="dataCount > 0" @click="appendData">追加数据</el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="导出设置">
          <el-button @click="exportData">保存到文件</el-button>
        </el-form-item>
        <el-form-item label="清空数据">
          <el-button type="danger" @click="resetData">清空数据</el-button>
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <el-button @click="model = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>
