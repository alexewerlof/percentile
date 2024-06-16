import { createApp } from './vendor/vue.js'
import diagramComponent from './components/diagram.js'
import { getPoints, calculateY } from './lib/points.js'
import { calculatePoints } from './data.js'
import { config } from './config.js'
import { sortByY } from './lib/points.js'

function f(x, points) {
    const [ point1, point2 ] = getPoints(points, x)

    return calculateY(x, point1, point2)
}

const app = createApp({
    components: {
        diagramComponent,
    },
    data() {
        const frequencies = Array.from({ length: config.slider.count }, (_, i) => 50)
        return {
            config,
            dataCount: config.dataCount,
            min: config.min,
            max: config.max,
            frequencies,
        }
    },
    computed: {
        ppp() {
            return calculatePoints(this.frequencies, this.min, this.max)
        },
        range() {
            return this.max - this.min
        },
        freqRanges() {
            const bandRange = this.range / this.frequencies.length
            return Array.from({ length: this.frequencies.length }, (_, i) => {
                return {
                    min: Math.floor(this.min + i * bandRange),
                    max: Math.ceil(this.min + (i + 1) * bandRange),
                }
            })                
        },
        randomNumbers() {
            const data = []
            for (let x = 0; x <= this.dataCount; x++) {
                const randomX = Math.random()
                data.push([x, f(randomX, this.ppp)])
            }
            return data
        },
        sortedRandomNumbers() {
            let x = 0
            return sortByY(this.randomNumbers).map(([, y]) => {
                x ++
                return [x, y]
            })
        },
    },
})

app.mount('#app')