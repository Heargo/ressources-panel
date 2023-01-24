import { defineStore } from 'pinia'

export const useToast = defineStore('toast', {
    state: () => {
        return {
          visible: false,
          message: '',
          type: 'error',
          triggerNumber: 0
        }
    },
    actions: {
        Show(message,type) {
            console.log("TOAST",message,type)
            this.triggerNumber++
            this.HidePrevious()

            setTimeout(() => {
                this.visible = true
                this.message = message
                this.type = type

                setTimeout(() => {
                    this.triggerNumber--
                    console.log(this.triggerNumber, 'triggerNumber','can we hide?',this.triggerNumber == 0)
                    if(this.triggerNumber == 0)
                        this.HidePrevious()
                }, 3*1000)
            }, 10)
            
        },
        HidePrevious() {
            console.log('we hide')
            this.visible = false
            this.message = ''
            this.importance = 'default'
        },
    }
})