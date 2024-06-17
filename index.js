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
        randomNumbers() {
            return generateData(this.dataCount, this.buckets)
        },
        randomNumberValues() {
            return this.randomNumbers.map(([, y]) => y)
        },
        sortedRandomNumberValues() {
            // sort using d3
            return this.randomNumberValues.slice().sort((a, b) => a - b)
        },
        sortedRandomNumbers() {
            let x = 0
            return this.sortedRandomNumberValues.map(y => {
                x ++
                return [x, y]
            })
        },
        percentiles() {
            const ret = []
            const len = this.sortedRandomNumberValues.length
            for (let x = 0; x <= 100; x += 1) {
                const index = percentileIndex(len, x)
                const y = this.sortedRandomNumberValues[index]
                ret.push([x, y])
            }
            return ret
        },
        analytics() {
            return analyzeData(this.sortedRandomNumberValues)
        },
        jsonData() {
            return JSON.stringify(this.randomNumberValues)
        }
    },
    methods: {
        setFrequencies(val) {
            this.frequencies = Array.from({ length: config.slider.count }, (_, i) => val)
        }
    }
})

app.mount('#app')