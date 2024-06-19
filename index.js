import { createApp } from './vendor/vue.js'
import diagramComponent from './components/diagram.js'
import { createBuckets, generateData } from './lib/buckets.js'
import { analyzeData, percentileIndex } from './lib/data.js'
import { config } from './config.js'
import { d3 } from './vendor/d3.js'
import { sls } from './lib/sl.js'

const freqIndicatorColor = d3.scaleLinear()
    .domain([config.slider.min, config.slider.max]) // replace with your actual min and max values
    .range(["#F86262", "#1BC554"])

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
            onlyInt: true,
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
            return generateData(this.dataCount, this.buckets, this.onlyInt)
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
        sli() {
            return {
                data: this.randomNumbers,
                upperBound: {
                    threshold: 19000,
                    equal: false,
                },
                lowerBound: {
                    threshold: 1000,
                    equal: true,
                },
                lookBackDataCount: 60,
            }
        },
        sls() {
            const slsDataPointLength = this.dataCount - this.sli.lookBackDataCount
            const slsData = []
            
            for (let time = 0; time < slsDataPointLength; time++) {
                slsData.push([time, sls(this.sli, time)])
            }
            return slsData
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
        },
        round(n) {
            return Math.round(n)
        },
        toFixed(n, digits = 1) {
            return n.toFixed(digits)
        },
        freqIndicatorStyle(freq) {
            return {
                backgroundColor: freqIndicatorColor(freq)
            }
        },
    }
})

app.mount('#app')