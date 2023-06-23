chrome.action.onClicked.addListener((tab) => {
  if (tab.url === 'chrome://extensions/' || tab.url === 'chrome://newtab/') return
  // 建立当前tab的连接
  const tabPort = chrome.tabs.connect(tab.id)
  try {
    tabPort.postMessage({
      active: true
    })
  } catch (e) {
    return;
  }

  tabPort.onMessage.addListener(msg => {
    if (msg.highlight) {
      chrome.tabs.highlight({tabs: msg.highlight.index, windowId: msg.highlight.windowId})
    } else if (msg.create) {
      chrome.tabs.query({}, tabs => {
        chrome.tabs.create({url: msg.create.url}, () => {
        })
      })
    } else if (msg.search) {
      handleSearch(msg.search).then(result => {
        tabPort.postMessage({
          result
        })
      })
    } else if (msg.close) {
      chrome.tabs.remove(msg.close.id, () => {
      })
    }
  })
})



function filter(data, from, ret, t, target) {
  data.forEach(i => {
    if (i.title.toLowerCase().includes(target)
      || i.url.toLowerCase().includes(target)
      || target === '*'
    ) {
      i.from = from
      if (!t[i.url]) {
        ret.push(i)
      }
      t[i.url] = true
    }
  })
}

function handleSearch(target) {
  return new Promise(async resolve => {
    let history = await chrome.history.search({text: target})
    let tabs = await chrome.tabs.query({})
    let tree = await chrome.bookmarks.getTree()
    let bookmarks = tree2list(tree)
    const ret = []
    let t = {}
    filter(history, 'history', ret, t, target)
    filter(tabs, 'tab', ret, t, target)
    filter(bookmarks, 'bookmarks', ret, t, target)
    resolve(ret)
  })

}

function tree2list(tree) {
  const ret = new Set()
  const list = (data) => {
    if (Array.isArray(data)) {
      data.forEach(i => list(i))
    } else if (Array.isArray(data.children)) {
      data.children.forEach(i => list(i))
    } else {
      ret.add(data)
    }
  }
  list(tree)
  return [...ret]
}