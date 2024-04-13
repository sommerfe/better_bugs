const zip = new JSZip()
let devtoolsOpened = false
let currentBrowser = typeof browser !== 'undefined' ? browser : chrome
chrome.runtime.sendMessage({
  action: 'ping',
})

chrome.runtime.onMessage.addListener(onMessage)

document.addEventListener('DOMContentLoaded', () => {
  document
    .getElementById('createReportButton')
    .addEventListener('click', function () {
      if (!devtoolsOpened) {
        exportFile({}, true)
      } else {
        chrome.runtime.sendMessage({
          action: 'requestHarLog',
        })
      }
    })
})

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
  const tab = await getCurrentTab()
  if (tab.id !== message.tabId) return
  const dateString = getLocalDateTime()
  const inputString = document.getElementById('comment').value
  if (inputString) zip.file(`comment_${dateString}.txt`, inputString)

  let screenshotData = await currentBrowser.tabs.captureVisibleTab()

  screenshotData = screenshotData.replace('data:image/png;base64,', '')
  screenshotData = screenshotData.replace('data:image/jpeg;base64,', '')
  screenshotData = screenshotData.replace(' ', '+')
  if (!withoutHar && tab.id === message.tabId)
    zip.file(`network_logs_${dateString}.har`, JSON.stringify(message.harLog))
  const systemInfoString = getSystemInfo(tab)
  zip.file(`system_infos_${dateString}.txt`, systemInfoString)
  zip.file(`screenshot_${dateString}.png`, screenshotData, { base64: true })

  const zipBlob = await zip.generateAsync({ type: 'blob' })

  currentBrowser.downloads.download({
    url: URL.createObjectURL(zipBlob),
    filename: `bug_report_${dateString}.zip`,
  })
}

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
