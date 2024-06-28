import { createApp } from './vendor/vue.js'
import plot2dComponent from './components/plot-2d.js'
import tabsComponent from './components/tabs.js'
import { createBuckets, generateData } from './lib/buckets.js'
import { analyzeData, percentileIndex } from './lib/data.js'
import { config } from './config.js'
import { d3 } from './vendor/d3.js'
import { calculateSlsMetric, createIsGood } from './lib/sl.js'

const freqIndicatorColor = d3.scaleLinear()
    .domain([config.slider.min, config.slider.max])
    .range(["#F86262", "#1BC554"])

const app = createApp({
    components: {
        plot2dComponent,
        tabsComponent,
    },
    data() {
        const frequencies = Array.from({ length: config.slider.count }, (_, i) => config.slider.default)
        return {
            config,
            dataCount: config.dataCount,
            min: config.min,
            max: config.max,
            selectedTab: 0,
            metricName: config.metricName.default,
            tabNames: [
                'Generator',
                'Percentile',
                'Service',
                'Analytics',
                'JSON Data',
            ],
            frequencies,
            onlyInt: true,
            sortAscending: true,
            sli: {
                upperBoundType: config.sli.upperBoundType,
                lowerBoundType: config.sli.lowerBoundType,
            },
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
        bucketRange() {
            return this.range / this.buckets.length
        },
        equalizerPoints() {
            // Each point is a tuple of [probability, value]
            const pointsArr = []

            const padding = this.bucketRange / 4

            const firstBucket = this.buckets[0]
            pointsArr.push([0, firstBucket.min - padding])
            pointsArr.push([0, firstBucket.min])
            
            for (let bucket of this.buckets) {
                pointsArr.push([
                    bucket.probability,
                    bucket.min,
                ])
                pointsArr.push([
                    bucket.probability,
                    bucket.max,
                ])
            }

            const lastBucket = this.buckets[this.buckets.length - 1]
            pointsArr.push([0, lastBucket.max])
            pointsArr.push([0, lastBucket.max + padding])

            console.log(pointsArr)

            return pointsArr
        },
        euqalizerData() {
            const data = []
            for (let i = this.frequencies.length - 1; i >= 0; i--) {
                data.push({
                    i,
                    min: this.buckets[i].min,
                    max: this.buckets[i].max,
                    probability: this.buckets[i].probability,
                    freqIndicatorStyle: {
                        backgroundColor: freqIndicatorColor(this.frequencies[i])
                    },
                })
            }
            return data
        },
        randomPoints() {
            return this.randomNumbers.map((y, x) => [x, y])
        },
        randomNumbers() {
            return generateData(this.dataCount, this.buckets, this.onlyInt)
        },
        sortedNumbers() {
            return this.randomNumbers.slice().sort(this.sortAscending ? d3.ascending : d3.descending)
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
        sloThresholds() {
            const ret = []
            if (this.sli.upperBoundType) {
                ret.push({
                    y: this.slo.upperBoundThreshold,
                    label: 'Upper Bound',
                })
            }
            if (this.sli.lowerBoundType) {
                ret.push({
                    y: this.slo.lowerBoundThreshold,
                    label: 'Lower Bound',
                })
            }
            return ret
        },
        equalizerThresholds() {
            const ret = []
            if (this.sli.upperBoundType) {
                ret.push({
                    x: this.slo.upperBoundThreshold,
                    label: 'Upper Bound',
                })
            }
            if (this.sli.lowerBoundType) {
                ret.push({
                    x: this.slo.lowerBoundThreshold,
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

            const isGood = createIsGood(this.sli, this.slo)

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
            const slsValues = calculateSlsMetric(this.randomNumbers, this.slo.windowDataCount, this.sli, this.slo)
            return slsValues.map((value, i) => [i, value])
        },
        accumulatedFailure() {
            let failureCounter = 0
            const isGood = createIsGood(this.sli, this.slo)
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
        toFixed(n, digits = 1) {
            return n.toFixed(digits)
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