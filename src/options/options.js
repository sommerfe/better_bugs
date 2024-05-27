const isFirefox = typeof browser !== 'undefined'
let currentBrowser = isFirefox ? browser : chrome

const main = () => {
  document.addEventListener('DOMContentLoaded', restoreSettings)
  const form = document.getElementById('settings-form')
  form.addEventListener('submit', function (event) {
    event.preventDefault()
    saveSettings()
  })

  // In firefox the extenstion cloes when the "save as" dialog is opened so the download link is not accessible anymore and can't download the report
  if (isFirefox) {
    document.getElementById('save-as-group').style.display = 'none'
  }
}

// Saves settings to browser.storage
const saveSettings = () => {
  currentBrowser.storage.sync.set(getCurrentSettings(), () => {
    createToast('Settings saved')
  })
}

const restoreSettings = () => {
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
      document.getElementById('disable-help-text').checked =
        items.disableHelpText
      document.getElementById('disable-toast').checked = items.disableToast
      document.getElementById('disable-comment').checked = items.disableComment
      document.getElementById('use-save-as').checked = items.useSaveAs
      document.getElementById('use-default-name').checked = items.useDefaultName
      document.getElementById('default-name').value = items.defaultName
      document.getElementById('show-name-option').checked = items.showNameOption
      document.getElementById('show-name-name').value = items.showNameName
      document.getElementById('add-timestamp').checked = items.addTimestamp
    }
  )
}

const getCurrentSettings = () => {
  const disableHelpText = document.getElementById('disable-help-text').checked
  const disableToast = document.getElementById('disable-toast').checked
  const disableComment = document.getElementById('disable-comment').checked
  const useSaveAs = document.getElementById('use-save-as').checked
  const useDefaultName = document.getElementById('use-default-name').checked
  const defaultName = document.getElementById('default-name').value
  const showNameOption = document.getElementById('show-name-option').checked
  const showNameName = document.getElementById('show-name-name').value
  const addTimestamp = document.getElementById('add-timestamp').checked

  return {
    disableHelpText: disableHelpText,
    disableToast: disableToast,
    disableComment: disableComment,
    useSaveAs: useSaveAs,
    useDefaultName: useDefaultName,
    defaultName: defaultName,
    showNameOption: showNameOption,
    showNameName: showNameName,
    addTimestamp: addTimestamp,
  }
}

main()
