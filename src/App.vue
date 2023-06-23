<template>
  <div v-show="visible" @keyup.stop.prevent="onkeyup">
    <div class="search-extension-popup">
      <div style="display: flex; flex-grow: 1">
        <input
          ref="searchRef"
          v-model="value"
          type="text"
          class="extension-search-input"
          tabindex="9999"
          @keydown.enter="onEnter"
        />
      </div>
      <div
        ref="listRef"
        style="overflow-y: scroll"
        class="extension-list"
        v-show="list.length > 0"
      >
        <ListItem
          v-for="(item, i) in list"
          :key="item.url"
          :data="item"
          :tabindex="i+1"
          :hightlight="value"
          @keyup.enter="onSelect(item)"
          @dblclick="onSelect(item)"
          @click="onClose(item)"
        />
      </div>
    </div>
    <div class="search-extension-mask" @click="visible = false"></div>
  </div>
</template>

<script setup>
import ListItem from './components/ListItem.vue'
import {ref, nextTick, onUnmounted, watch} from 'vue'

const value = ref('')
const visible = ref(false)
const listRef = ref(null)
const bookmarks = ref([])
const list = ref([])

const searchRef = ref(null)
let port

watch(value, (target) => {
  if(target === '') {
    port.postMessage({
      search: '*'
    })
    return
  }
  port.postMessage({
    search: target
  })
})

function onkeyup(e) {
  e.stopPropagation()
  e.preventDefault()
  if (e.key === 'Tab') {
    searchRef.value.focus()
  } else if (e.key === 'ArrowUp') {
    let nodes = listRef.value.children || []
    nodes = [...nodes]
    let index = nodes.findIndex(o => o === e.target)
    let len = nodes.length
    if (index === -1) {
      nodes[0].focus()
    } else {
      let pre = index - 1
      if (pre >= 0) {
        nodes[pre].focus()
      } else {
        nodes[len - 1].focus()
      }
    }
  } else if (e.key === 'ArrowDown') {
    let nodes = listRef.value.children || []
    nodes = [...nodes]
    let index = nodes.findIndex(o => o === e.target)
    if (index === -1) {
      nodes[0].focus()
    } else {
      let len = nodes.length
      let next = index + 1
      if (next < len) {
        nodes[next].focus()
      } else {
        nodes[0].focus()
      }
    }
  }

}

chrome.runtime.onConnect.addListener(tabPort => {
  port = tabPort
  tabPort.onMessage.addListener((msg) => {
    if (msg.active) {
      visible.value = true
      value.value = ''
      nextTick(() => {
        searchRef.value.focus()
        tabPort.postMessage({
          search: '*'
        })
      })
    } else if (msg.result) {
      list.value = msg.result
    }
  })
})

function hide(e) {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    e.stopPropagation()
  } else if (e.key === 'Escape' || e.keyCode === 27 || e.code === 'Escape') {
    visible.value = false
    value.value = ''
  }
}

function onClose(item) {
  port.postMessage({
    close: item
  })
  port.postMessage({
    search: '*'
  })
}

watch(visible, (v) => {
  if (v) {
    window.addEventListener('keydown', hide)
  } else {
    window.removeEventListener('keydown', hide)
  }
}, {immediate: true})

onUnmounted(() => {
  window.removeEventListener('keydown', hide)
})


function onSelect(item) {
  visible.value = false
  if (item.from === 'tab') {
    port.postMessage({
      highlight: item
    })
  } else {
    port.postMessage({
      create: item
    })
  }
}

function onEnter() {
  visible.value = false
  if (/^https?:\/\//.test(value.value)) {
    port.postMessage({
      create: {
        url: value.value
      }
    })
    return
  }
  port.postMessage({
    create: {
      url: `https://www.bing.com/search?q=${value.value}&PC=U316&FORM=CHROMN`
    }
  })
}

</script>

<style lang="scss">
#my-demo-extension {
  padding: 0;
  margin: 0;
  color: #000;
  font-size: 16px;

  .extension-search-input {
    height: 30px !important;
    line-height: 30px !important;
    font-size: 26px !important;
    width: 100% !important;
    border: 1px solid darkgray !important;
    border-radius: 5px !important;
    padding: 6px 10px !important;
    background-color: #fff;
    color: black;
    box-sizing: content-box;
  }

  .extension-search-input:focus-visible,
  .extension-search-input:focus,
  .extension-search-input:active {
    border: 1px solid skyblue !important;
  }

  .search-extension-popup {
    position: fixed;
    top: 200px;
    left: 50%;
    padding: 20px;
    transform: translateX(-50%);
    width: 800px;
    background-color: #d7d7e3;
    overflow: hidden;
    border-radius: 5px;
  }

  .extension-list {
    overflow-y: visible;
    width: 100%;
    height: 450px;
    > div {
      height: 40px;
      width: 100%;
    }
  }

  .extension-list::-webkit-scrollbar-thumb {
    background: #bda18e;
    border-radius: 4px;
  }

  .extension-list::-webkit-scrollbar {
    background-color: transparent;
    width: 4px;
  }

  .search-extension-mask {
    height: 100vh;
    width: 100vw;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .item {
    border-bottom: 1px solid darkgray;
  }

  input {
    outline: none;
  }

  div {
    outline: none;
  }

  p {
    margin: 0;
    padding: 0;
    font-size: 16px;
  }
}

</style>
