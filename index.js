import { createApp } from './vendor/vue.js'
import diagramComponent from './components/diagram.js'
import { createBuckets, generateData } from './lib/points.js'
import { analyzeData, percentileIndex } from './lib/data.js'
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
    methods: {
        setFrequencies(val) {
            this.frequencies = Array.from({ length: config.slider.count }, (_, i) => val)
        }
    }
})

app.mount('#app')