import { createApp } from './vendor/vue.js'
import diagramComponent from './components/diagram.js'
import tabsComponent from './components/tabs.js'
import { createBuckets, generateData } from './lib/buckets.js'
import { analyzeData, percentileIndex } from './lib/data.js'
import { config } from './config.js'
import { d3 } from './vendor/d3.js'
import { calculateSlsMetric, createIsGood } from './lib/sl.js'

const freqIndicatorColor = d3.scaleLinear()
    .domain([config.slider.min, config.slider.max]) // replace with your actual min and max values
    .range(["#F86262", "#1BC554"])

const app = createApp({
    components: {
        diagramComponent,
        tabsComponent,
    },
    data() {
        const frequencies = Array.from({ length: config.slider.count }, (_, i) => config.slider.default)
        return {
            config,
            dataCount: config.dataCount,
            min: config.min,
            max: config.max,
            selectedTab: 1,
            tabNames: [
                'Data',
                'SLS',
                'Analytics',
                'JSON Data',
            ],
            frequencies,
            onlyInt: true,
            upperBoundType: config.sli.upperBoundType,
            lowerBoundType: config.sli.lowerBoundType,
            slo: {
                value: config.slo.value,
                windowDataCount: config.slo.windowDataCount,
                upperBoundThreshold: config.slo.upperBoundThreshold,
                lowerBoundThreshold: config.slo.lowerBoundThreshold,
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
                    threshold: this.slo.upperBoundThreshold,
                    equal: this.upperBoundType === 'lte',
                }
            }
            if (this.lowerBoundType) {
                ret.lowerBound = {
                    threshold: this.slo.lowerBoundThreshold,
                    equal: this.lowerBoundType === 'lte',
                }
            }
            return ret
        },
        sloThresholds() {
            const ret = []
            if (this.upperBoundType) {
                ret.push({
                    y: this.slo.upperBoundThreshold,
                    label: 'Upper Bound',
                })
            }
            if (this.lowerBoundType) {
                ret.push({
                    y: this.slo.lowerBoundThreshold,
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

            const isGood = createIsGood(this.sli)

            for (let dataPoint of this.randomNumbers) {
                if (isGood(dataPoint)) {
                    stats.good++
                } else {
                    stats.bad++
                }
                stats.total++
            }

            return stats
        },
        slsPoints() {
            const slsValues = calculateSlsMetric(this.randomNumbers, this.slo.windowDataCount, this.sli)
            return slsValues.map((value, i) => [i, value])
        },
        accumulatedFailure() {
            let failureCounter = 0
            const isGood = createIsGood(this.sli)
            return this.randomNumbers.map((dataPoint, i) => {
                if (!isGood(dataPoint)) {
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
            this.frequencies = new Array(this.frequencies.length).fill(val)
        },
        addFrequency() {
            this.frequencies.push(config.slider.default)
        },
        removeFrequency() {
            if (this.frequencies.length > 1) {
                this.frequencies.pop()
            }
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