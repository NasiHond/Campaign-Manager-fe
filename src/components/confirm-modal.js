export function renderConfirmModal() {
  return `
    <div class="modal-backdrop" data-confirm-modal hidden>
      <section
        class="campaign-modal confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-message"
      >
        <button class="modal-close" type="button" aria-label="Close confirmation">×</button>
        <h2 id="confirm-modal-title"></h2>
        <p id="confirm-modal-message"></p>
        <div class="confirm-modal-actions">
          <button type="button" data-confirm-cancel>Cancel</button>
          <button type="button" data-confirm-submit>Confirm</button>
        </div>
      </section>
    </div>
  `
}

export function setupConfirmModal(modal, { onConfirm } = {}) {
  const title = modal.querySelector('#confirm-modal-title')
  const message = modal.querySelector('#confirm-modal-message')
  const closeButton = modal.querySelector('.modal-close')
  const cancelButton = modal.querySelector('[data-confirm-cancel]')
  const confirmButton = modal.querySelector('[data-confirm-submit]')
  let closeHandler
  let confirmHandler = onConfirm

  const close = ({ notify = true } = {}) => {
    modal.hidden = true
    if (notify) {
      closeHandler?.()
    }
    closeHandler = null
  }

  const open = ({ heading, text, confirmLabel = 'Confirm', onClose } = {}) => {
    title.textContent = heading || 'Confirm action'
    message.textContent = text || 'Are you sure you want to continue?'
    confirmButton.textContent = confirmLabel
    closeHandler = onClose
    modal.hidden = false
    confirmButton.focus()
  }

  closeButton.addEventListener('click', close)
  cancelButton.addEventListener('click', close)
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      close()
    }
  })
  confirmButton.addEventListener('click', async () => {
    confirmButton.disabled = true
    try {
      await confirmHandler?.()
      close({ notify: false })
    } finally {
      confirmButton.disabled = false
    }
  })

  return {
    open,
    close,
    set onConfirm(handler) {
      confirmHandler = handler
    },
  }
}
