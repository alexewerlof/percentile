import { createApp } from './vendor/vue.js'
import diagramComponent from './components/diagram.js'

function f(x, low, high) {
    if (low > 0 && x <= low) {
        return x / (low * 2)
    }
    if (high < 1 && x >= high) {
        return ((0.5 * x) + (0.5 - high)) / (1 - high)
    }
    return 0.5
}

const app = createApp({
    components: {
        diagramComponent,
    },
    data() {
        return {
            dataCount: 100,
            high: 0.9,
            low: 0.1,
        }
    },
    computed: {
        diagramData() {
            const data = []
            for (let i = 0; i < this.dataCount; i++) {
                data.push(f(i / this.dataCount, this.low, this.high))
            }
            return data
        }
    },
})

app.mount('#app')