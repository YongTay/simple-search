import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

const div = document.createElement('div')
div.id = 'my-demo-extension'
const style = {
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: '99999'
}
for(const prop in style) {
  div.style[prop] = style[prop]
}
document.body.appendChild(div)

const app = createApp(App)
if(import.meta.env.MODE === 'development') {
  app.mount('#app')
} else {
  app.mount('#my-demo-extension')
}


