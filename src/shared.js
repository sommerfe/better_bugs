const createToast = (message, isError = false) => {
  const toastContainer = isError
    ? document.getElementById('toast-error-container')
    : document.getElementById('toast-container')
  const toast = document.createElement('div')
  toast.className = 'toast'
  toast.textContent = message

  toastContainer.appendChild(toast)
  toast.addEventListener('animationend', () => {
    toastContainer.removeChild(toast)
  })
}
