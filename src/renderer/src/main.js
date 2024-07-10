import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import App from './App.vue'
import { useDark } from '@vueuse/core'

const app = createApp(App)

const isDark = useDark()
if (isDark) {
  document.querySelector('html').classList.add('dark')
}

app.use(ElementPlus, {
  locale: zhCn
})
app.mount('#app')
