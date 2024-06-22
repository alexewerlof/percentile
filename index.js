import { createApp } from './vendor/vue.js'
import diagramComponent from './components/diagram.js'
import { createBuckets, generateData } from './lib/buckets.js'
import { analyzeData, percentileIndex } from './lib/data.js'
import { config } from './config.js'
import { d3 } from './vendor/d3.js'
import { isBad, isGood, sls } from './lib/sl.js'

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
            upperBoundType: 'lte',
            upperBoundThreshold: 19000,
            lowerBoundType: '',
            lowerBoundThreshold: 1000,
            slo: {
                value: 99.3,
                windowDataCount: 60,
            }
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
            const pointsArr = []
            
            for (let bucket of this.buckets) {
                pointsArr.push([
                    bucket.min,
                    bucket.probability,
                ])
                pointsArr.push([
                    bucket.max,
                    bucket.probability,
                ])
            }

            return pointsArr
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
            const ret = {}
            if (this.upperBoundType) {
                ret.upperBound = {
                    threshold: this.upperBoundThreshold,
                    equal: this.upperBoundType === 'lte',
                }
            }
            if (this.lowerBoundType) {
                ret.lowerBound = {
                    threshold: this.lowerBoundThreshold,
                    equal: this.lowerBoundType === 'lte',
                }
            }
            return ret
        },
        sliThresholds() {
            const ret = []
            if (this.upperBoundType) {
                ret.push({
                    y: this.upperBoundThreshold,
                    label: 'Upper Bound',
                })
            }
            if (this.lowerBoundType) {
                ret.push({
                    y: this.lowerBoundThreshold,
                    label: 'Lower Bound',
                })
            }
            return ret
        },
        slsGuides() {
            return [
                {
                    y: this.slo.value,
                    label: `SLO: ${this.slo.value}%`,
                },
            ]
        },
        slStats() {
            const stats = {
                good: 0,
                bad: 0,
                total: 0,
            }

            for (let dataPoint of this.randomNumbers) {
                if (isGood(dataPoint, this.sli)) {
                    stats.good++
                } else {
                    stats.bad++
                }
                stats.total++
            }

            return stats
        },
        slsPoints() {
            const slsDataPointLength = this.dataCount - this.slo.windowDataCount
            const slsData = []
            
            for (let time = 0; time < slsDataPointLength; time++) {
                slsData.push([time, sls(this.randomNumbers, time, this.slo.windowDataCount, this.sli)])
            }
            return slsData
        },
        accumulatedFailure() {
            let failureCounter = 0
            return this.randomNumbers.map((dataPoint, i) => {
                if (isBad(dataPoint, this.sli)) {
                    failureCounter++
                }
                return [i, failureCounter]
            })
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
        boundTypeToString(type) {
            switch(type) {
                case '': return ''
                case 'lt': return '<'
                case 'lte': return '≤'
                default:
                    throw new Error(`Unknown bound type: ${type}`)
            }
        },
    }
})

app.mount('#app')