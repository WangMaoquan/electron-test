import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import "./assets/icon/iconfont.css";
import "./assets/style.css"
const app = createApp(App);
app.use(router)
app.mount('#app')
