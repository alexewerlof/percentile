import { createApp } from './vendor/vue.js'
import diagramComponent from './components/diagram.js'
import { createBuckets, generateData } from './lib/points.js'
import { analyzeData, percentileIndex } from './lib/data.js'
import { config } from './config.js'

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
            isJsonDataVisible: false,
        }
    },
    computed: {
        range() {
            return this.max - this.min
        },
        buckets() {
            return createBuckets(this.min, this.max, this.frequencies)
        },
        bucketPoints() {
            return this.buckets.map(bucket => {
                return [
                    (bucket.min + bucket.max)/2,
                    bucket.probability,
                ]
            })
        },
        randomPoints() {
            return this.randomNumbers.map((y, x) => [x, y])
        },
        randomNumbers() {
            return generateData(this.dataCount, this.buckets)
        },
        sortedNumbers() {
            // sort using d3
            return this.randomNumbers.slice().sort((a, b) => a - b)
        },
        sortedPoints() {
            let x = 0
            return this.sortedNumbers.map(y => {
                x ++
                return [x, y]
            })
        },
        percentiles() {
            const ret = []
            const len = this.sortedNumbers.length
            for (let x = 0; x <= 100; x += 1) {
                const index = percentileIndex(len, x)
                const y = this.sortedNumbers[index]
                ret.push([x, y])
            }
            return ret
        },
        analytics() {
            return analyzeData(this.sortedNumbers)
        },
        jsonData() {
            return JSON.stringify(this.randomNumbers)
        }
    },
    methods: {
        setFrequencies(val) {
            this.frequencies = Array.from({ length: config.slider.count }, (_, i) => val)
        }
    }
})

app.mount('#app')