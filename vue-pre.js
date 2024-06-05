import { createApp } from './vendor/vue.js'
import diagramComponent from './components/diagram.js'

function f(x) {
    const y = Math.sin(x)
    return y
}

const app = createApp({
    components: {
        diagramComponent,
    },
    data() {
        return {
            dataCount: 1000,
            high: 90,
            low: 10,
        }
    },
    computed: {
        diagramData() {
            const data = []
            for (let i = 0; i < this.dataCount; i++) {
                data.push(this.f(100 * i / this.dataCount))
            }
            return data
        }
    },
    methods: {
        f(x) {
            if (this.low > 0 && x <= this.low) {
                return x / (this.low * 2)
            }
            if (this.high < 100 && x >= this.high) {
                return ((0.5 * x) + (50 - this.high)) / (100 - this.high)
            }
            return 0.5
        }
    }
})

app.mount('#app')