import { createApp } from './vendor/vue.js'
import diagramComponent from './components/diagram.js'
import { generateData } from './lib/points.js'
import { analyzeData, calculatePoints, percentileIndex } from './lib/data.js'
import { config } from './config.js'
import { sortByY } from './lib/points.js'

const app = createApp({
    components: {
        diagramComponent,
    },
    data() {
        const frequencies = Array.from({ length: config.slider.count }, (_, i) => config.slider.default)
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
            return generateData(this.dataCount, this.ppp)
        },
        sortedRandomNumbers() {
            let x = 0
            return sortByY(this.randomNumbers).map(([, y]) => {
                x ++
                return [x, y]
            })
        },
        percentiles() {
            const ret = []
            const len = this.sortedRandomNumbers.length
            for (let x = 0; x <= 100; x += 1) {
                const index = percentileIndex(len, x)
                const point = this.sortedRandomNumbers[index]
                const y = point[1]
                ret.push([x, y])
            }
            return ret
        },
        analytics() {
            return analyzeData(this.sortedRandomNumbers.map(([, y]) => y))
        },
    },
})

app.mount('#app')