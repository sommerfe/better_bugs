const createToast = (message) => {
  const toastContainer = document.getElementById('toast-container')
  const toast = document.createElement('div')
  toast.className = 'toast'
  toast.textContent = message

  toastContainer.appendChild(toast)
  toast.addEventListener('animationend', () => {
    toastContainer.removeChild(toast)
  })
}
