import Alpine from 'alpinejs'
import './_.scss'

Alpine.store('modalController', {
	modals: Array.from(document.querySelectorAll('.js-modal')),
	triggers: Array.from(document.querySelectorAll('.js-modal-trigger')),
	closeButtons: Array.from(document.querySelectorAll('.js-modal-close')),
	modalsContent: Array.from(document.querySelectorAll('.js-modal__content')),
	modalObjects: [],
	openModals: [],

	init() {
		console.log('modal controller init')
		this.modals.forEach((modal) => {
			this.modalObjects.push({
				element: modal, isOpen: false, modalId: modal.getAttribute('data-modal'), setAnimationDuration() {
					modal.getAttribute('modal-animation-duration') ? (this.animationDuration = parseInt(modal.getAttribute('modal-animation-duration'))) : 0
				}, setAnimationInName() {
					modal.getAttribute('modal-animationIn') ? (this.animationInName = modal.getAttribute('modal-animationIn')) : ''
				}, setAnimationOutName() {
					modal.getAttribute('modal-animationOut') ? (this.animationOutName = modal.getAttribute('modal-animationOut')) : ''
				}, preOpen: false,
			})
		})
		this.modalObjects.forEach((modalObject) => {
			modalObject.setAnimationDuration()
			modalObject.setAnimationInName()
			modalObject.setAnimationOutName()
		})
		this.triggers.forEach((trigger) => {
			trigger.setAttribute('x-data', '')
			trigger.setAttribute('x-on:click.stop', '$store.modalController.openOrClose')
		})
		this.closeButtons.forEach((button) => {
			button.setAttribute('x-data', '')
			// button.setAttribute('x-on:click.stop', '$store.modalController.closeModal($store.modalController.modalObjects.find(modal => modal.modalId === $el.closest(".js-modal").getAttribute("data-modal")))')
			button.setAttribute('x-on:click.stop', '$store.modalController.openOrClose')
		})
		this.modalsContent.forEach((content) => {
			content.setAttribute('x-data', '')
			content.setAttribute('x-on:click.outside', '$store.modalController.clickOutside')
		})
		this.activeClassHandler('js-modal--active')
		this.lockBodyHandler('body--unscroll')
		this.setDynamicIndex(500)
	},

	activeClassHandler(cssClass) {
		Alpine.effect(() => {
			this.modalObjects.forEach((modal) => {
				modal.isOpen ? modal.element.classList.add(cssClass) : modal.element.classList.remove(cssClass)
			})
		})
	},

	setDynamicIndex(idx) {
		Alpine.effect(() => {
			let zIndex = idx
			this.openModals.forEach((modal) => {
				if (modal) {
					zIndex = zIndex + 10
					modal.element.style.zIndex = zIndex
				}
			})
			if (!this.openModals.length) {
				this.modalObjects.forEach((modal) => {
					setTimeout(() => {
						modal.element.style.zIndex = ''
					}, modal.animationDuration || 0)
				})
			}
		})
	},

	lockBodyHandler(cssClass) {
		Alpine.effect(() => {
			if (this.modalObjects.some((el) => el.isOpen)) {
				document.body.classList.add(cssClass)
			} else {
				document.body.classList.remove(cssClass)
			}
		})
	},

	animationTimeout(modal, boolean) {
		setTimeout(() => {
			modal.isOpen = boolean
			modal.element.style.animation = ''
		}, modal.animationDuration)
	},

	toggleAnimation(modal) {
		let modalObject = Alpine.reactive(modal)
		modalObject.preOpen ? (modal.element.style.animation = `${modalObject.animationInName} ${modalObject.animationDuration}ms forwards`) : (modal.element.style.animation = `${modalObject.animationOutName} ${modalObject.animationDuration}ms forwards`)
	},

	closeModal(modal, boolean) {
		modal.preOpen = boolean
		this.toggleAnimation(modal)
		this.animationTimeout(modal, boolean)
		this.openModals = this.openModals.filter((el) => el !== modal)
	},

	openModal(modal, boolean) {
		modal.isOpen = boolean
		modal.preOpen = boolean
		this.toggleAnimation(modal)
		this.openModals.push(modal)
	},

	openOrClose(e) {
		e.preventDefault()
		let modal = this.$store.modalController.modalObjects.find((modal) => modal.modalId === this.$el.getAttribute('data-modal'))
		if (!modal.isOpen) {
			this.$store.modalController.openModal(modal, true)
		} else {
			this.$store.modalController.closeModal(modal, false)
		}
		// this.$store.modalController.openModal(modal, true)
	},

	clickOutside(e) {
		e.preventDefault()
		if (!e.target.closest('.js-modal__content')) {
			let modal = this.$store.modalController.modalObjects.find((modal) => modal.modalId === e.target.closest('.js-modal').getAttribute('data-modal'))
			this.$store.modalController.closeModal(modal, false)
		}
	},
})
