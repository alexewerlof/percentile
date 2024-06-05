import { createApp } from './vendor/vue.js'
import diagramComponent from './components/diagram.js'

function f(x, low, high) {
    if (low > 0 && x <= low) {
        return x / (low * 2)
    }
    if (high < 1 && x >= high) {
        return (0.5 * x + 0.5 - high) / (1 - high)
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
        resolution() {
            return 1 / this.dataCount
        },
        randomGeneratorShape() {
            const data = []
            for (let x = 0; x < 1; x += this.resolution) {
                data.push([x, f(x, this.low, this.high)])
            }
            return data
        },
        randomNumbers() {
            const data = []
            for (let x = 0; x < 1; x += this.resolution) {
                const rnd = Math.random()
                data.push([x, f(rnd, this.low, this.high)])
            }
            return data
        }
    },
})

app.mount('#app')