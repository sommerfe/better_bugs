let devtoolsOpened = false
const isFirefox = typeof browser !== 'undefined'
let currentBrowser = isFirefox ? browser : chrome
let disableToast
let useSaveAs
let useDefaultName
let showNameOption
let addTimestamp
let defaultName
let reportPrefix
let downloadId

const main = () => {
  initializeListerners()
  checkDevtoolsOpened()
  initializeOptionsSync()
}

const checkDevtoolsOpened = () => {
  chrome.runtime.sendMessage({
    action: 'ping',
  })
}

const initializeListerners = () => {
  initializeRuntimeMessageListener()
  initializeCreateReportListener()
  initializeOptionsButtonListener()
  initializeDownloadListener()
}

const initializeCreateReportListener = () => {
  console.log('initializeCreateReportListener')
  document.addEventListener('DOMContentLoaded', () => {
    document
      .getElementById('create-report-button')
      .addEventListener('click', async function () {
        if (!devtoolsOpened) {
          exportFile({}, true)
        } else {
          const tab = await getCurrentTab()
          console.log('tab', tab)
          chrome.runtime.sendMessage({
            action: 'requestHarLog',
            tabId: tab.id,
          })
        }
      })
  })
}

const initializeOptionsButtonListener = () => {
  document
    .getElementById('go-to-options')
    .addEventListener('click', function () {
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage()
      } else {
        window.open(browser.runtime.getURL('src/options/options.html'))
      }
    })
}

const initializeDownloadListener = () => {
  currentBrowser.downloads.onChanged.addListener((downloadDelta) => {
    if (downloadDelta.id !== downloadId || disableToast) return
    if (downloadDelta.state && downloadDelta.state.current === 'complete') {
      createToast('Download completed successfully! 🎉')
    }
    if (
      (downloadDelta.state && downloadDelta.state.current === 'interrupted') ||
      downloadDelta.error
    ) {
      createToast(
        `Download failed! ${
          downloadDelta.error ? 'with error ' + downloadDelta.error.current : ''
        } `,
        true
      )
    }
  })
}

const initializeRuntimeMessageListener = () => {
  chrome.runtime.onMessage.addListener(onMessage)
}

const initializeOptionsSync = () => {
  currentBrowser.storage.sync.get(
    {
      disableHelpText: false,
      disableToast: false,
      disableComment: false,
      useSaveAs: false,
      useDefaultName: false,
      defaultName: 'bug_report',
      showNameOption: true,
      showNameName: 'bug_report',
      addTimestamp: false,
    },
    (items) => {
      if (items.disableHelpText) {
        document.getElementById('information1').style.display = 'none'
        document.getElementById('information2').style.display = 'none'
      }
      disableToast = items.disableToast
      useSaveAs = items.useSaveAs
      useDefaultName = items.useDefaultName
      showNameOption = items.showNameOption
      addTimestamp = items.addTimestamp
      defaultName = items.defaultName
      if (items.disableComment) {
        document.getElementById('comment').style.display = 'none'
        document.getElementById('label-comment').style.display = 'none'
      }
      if (useDefaultName || !showNameOption) {
        document.getElementById('show-name-name').style.display = 'none'
        document.getElementById('label_show-name-name').style.display = 'none'
      }
      if (items.showNameName) {
        document.getElementById('show-name-name').value = items.showNameName
      }
    }
  )
}

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
  console.log('devtoolsOpened', devtoolsOpened, withoutHar)
  if (!devtoolsOpened) checkDevtoolsOpened()
  const tab = await getCurrentTab()
  console.log('tab.id', tab.id)
  console.log('message.tabId', message.tabId)
  if (!tab.id || (message.tabId && tab.id !== message.tabId)) withoutHar = true
  console.log('withoutHar', withoutHar)
  const zip = new JSZip()
  const dateString = getLocalDateTime()
  const inputString = document.getElementById('comment').value
  if (inputString) zip.file(`comment_${dateString}.txt`, inputString)

  let screenshotData = await currentBrowser.tabs.captureVisibleTab()

  screenshotData = screenshotData.replace('data:image/png;base64,', '')
  screenshotData = screenshotData.replace('data:image/jpeg;base64,', '')
  screenshotData = screenshotData.replace(' ', '+')

  if (!withoutHar && message.harLog)
    zip.file(`network_logs_${dateString}.har`, JSON.stringify(message.harLog))
  const systemInfoString = getSystemInfo(tab)
  zip.file(`system_infos_${dateString}.txt`, systemInfoString)
  zip.file(`screenshot_${dateString}.png`, screenshotData, { base64: true })

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const filename = getReportName(
    useDefaultName,
    showNameOption,
    defaultName,
    addTimestamp,
    dateString
  )

  currentBrowser.downloads
    .download({
      url: URL.createObjectURL(zipBlob),
      filename: filename,
      saveAs: isFirefox ? false : useSaveAs,
    })
    .then((d) => {
      downloadId = d
    })
    .catch((error) => {
      createToast(
        `Download failed! ${error ? 'with error ' + error.message : ''} `,
        true
      )
    })
}

const getReportName = (
  useDefaultName,
  showNameOption,
  defaultName,
  addTimestamp,
  dateString
) => {
  const reportPrefix =
    useDefaultName || !showNameOption
      ? defaultName
      : document.getElementById('show-name-name').value
  const reportPostfix = addTimestamp ? '_' + dateString : ''
  const reportEnd = '.zip'
  return `${reportPrefix}${reportPostfix}${reportEnd}`
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

main()
