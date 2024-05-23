const checkDevtoolsOpened = () => {
  chrome.runtime.sendMessage({
    action: 'ping',
  })
}

let devtoolsOpened = false
let currentBrowser = typeof browser !== 'undefined' ? browser : chrome

checkDevtoolsOpened()

chrome.runtime.onMessage.addListener(onMessage)

document.addEventListener('DOMContentLoaded', () => {
  document
    .getElementById('createReportButton')
    .addEventListener('click', function () {
      console.log('devtoolsOpened', devtoolsOpened)
      if (!devtoolsOpened) {
        exportFile({}, true)
      } else {
        chrome.runtime.sendMessage({
          action: 'requestHarLog',
        })
      }
    })
})

document.querySelector('#go-to-options').addEventListener('click', function () {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage()
  } else {
    window.open(browser.runtime.getURL('src/options/options.html'))
  }
})

chrome.storage.sync.onChanged.addListener((changes, namespace) => {
  console.log('changes', changes)
  console.log('namespace', namespace)
})

browser.storage.sync.get(
  { favoriteColor: 'red', likesColor: true },
  (items) => {
    console.log('items', items)
  }
)

function onMessage(message) {
  if (!message) {
    console.error("ERROR: message object doesn't exist!")
    return
  }

  switch (message.action) {
    case 'exportFile':
      exportFile(message)
      break
    case 'pong':
      devtoolsOpened = true
      break
  }
}

const exportFile = async (message, withoutHar = false) => {
  if (!devtoolsOpened) checkDevtoolsOpened()
  const tab = await getCurrentTab()
  if (!tab.id || (message.tabId && tab.id !== message.tabId)) return
  const zip = new JSZip()
  const dateString = getLocalDateTime()
  const inputString = document.getElementById('comment').value
  if (inputString) zip.file(`comment_${dateString}.txt`, inputString)

  let screenshotData = await currentBrowser.tabs.captureVisibleTab()

  screenshotData = screenshotData.replace('data:image/png;base64,', '')
  screenshotData = screenshotData.replace('data:image/jpeg;base64,', '')
  screenshotData = screenshotData.replace(' ', '+')
  if (!withoutHar && tab.id === message.tabId && message.harLog)
    zip.file(`network_logs_${dateString}.har`, JSON.stringify(message.harLog))
  const systemInfoString = getSystemInfo(tab)
  zip.file(`system_infos_${dateString}.txt`, systemInfoString)
  zip.file(`screenshot_${dateString}.png`, screenshotData, { base64: true })

  const zipBlob = await zip.generateAsync({ type: 'blob' })

  currentBrowser.downloads.download({
    url: URL.createObjectURL(zipBlob),
    filename: `bug_report_${dateString}.zip`,
  })
  createToast('Report downloaded successfully! 🎉')
}

// const createToast = (message) => {
//   const toastContainer = document.getElementById('toast-container')
//   const toast = document.createElement('div')
//   toast.className = 'toast'
//   toast.textContent = message

//   toastContainer.appendChild(toast)
//   toast.addEventListener('animationend', () => {
//     toastContainer.removeChild(toast)
//   })
// }

const getSystemInfo = (tab) => {
  const manifest = chrome.runtime.getManifest()
  let systemInfoString =
    `System information\n` +
    `User Agent: ${navigator.userAgent}\n` +
    `OS: ${navigator.oscpu ?? navigator.userAgentData.platform}\n` +
    `Language: ${navigator.language}\n` +
    `Better Bugs version: ${manifest.version}\n` +
    `Current URL: ${tab.url}`
  return systemInfoString
}
const getLocalDateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0')

  return `${year}-${month}-${day}T${hours}-${minutes}-${seconds}-${milliseconds}`
}

const getCurrentTab = async () => {
  return new Promise((resolve, reject) => {
    currentBrowser.tabs.query(
      { active: true, currentWindow: true },
      function (tabs) {
        var tab = tabs[0]
        resolve(tab)
      }
    )
  })
}
