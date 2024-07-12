import { createApp } from './vendor/vue.js'
import plot2dComponent from './components/plot-2d.js'
import tabsComponent from './components/tabs.js'
import { createBuckets, generateData, normalizeBucketProbabilities } from './lib/buckets.js'
import { analyzeData, percentileIndex } from './lib/data.js'
import { config } from './config.js'
import { d3 } from './vendor/d3.js'
import { boundTypeToOperator, calculateSlsMetric, createIsGood } from './lib/sl.js'

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
            selectedTab: 'Generator',
            metricName: config.metricName.default,
            metricUnit: config.metricUnit.default,
            metricData: [],
            frequencies,
            onlyInt: true,
            sortAscending: true,
            incidentLength: config.dataCount / 10,
            incidentInsertionPoint: 0,
            sli: {
                upperBoundType: config.sli.upperBoundType,
                lowerBoundType: config.sli.lowerBoundType,
            },
            slo: {
                value: config.slo.value,
                windowDataCount: config.slo.windowDataCount,
                upperBoundThreshold: config.slo.upperBoundThreshold,
                lowerBoundThreshold: config.slo.lowerBoundThreshold,
            },
        }
    },
    computed: {
        sloWindowDataCountMax() {
            return this.dataCount / 2
        },
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
            pointsArr.push([firstBucket.min - padding, 0])
            pointsArr.push([firstBucket.min, 0])
            
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

            const lastBucket = this.buckets[this.buckets.length - 1]
            pointsArr.push([lastBucket.max, 0])
            pointsArr.push([lastBucket.max + padding, 0])

            return pointsArr
        },
        equalizerGuides() {
            const ret = []

            for (let bucket of this.buckets) {
                ret.push({
                    x: bucket.min,
                    label: bucket.min,
                })
            }

            const lastBucket = this.buckets[this.buckets.length - 1]
            ret.push({
                x: lastBucket.max,
                label: lastBucket.max,
            })

            if (this.sli.upperBoundType) {
                ret.push({
                    x: this.slo.upperBoundThreshold,
                    label: 'UBT',
                })
            }

            if (this.sli.lowerBoundType) {
                ret.push({
                    x: this.slo.lowerBoundThreshold,
                    label: 'LBT',
                })
            }

            return ret
        },
        metricDataPoints() {
            return this.metricData.map((y, x) => [x, y])
        },
        sortedMetricData() {
            return this.metricData.slice().sort(this.sortAscending ? d3.ascending : d3.descending)
        },
        sortedPoints() {
            let x = 0
            return this.sortedMetricData.map(y => {
                x ++
                return [x, y]
            })
        },
        percentiles() {
            const ret = []
            const len = this.sortedMetricData.length
            for (let x = 0; x <= 100; x += 1) {
                const index = percentileIndex(len, x)
                const y = this.sortedMetricData[index]
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
        meanMedianGuides() {
            const ret = []
            ret.push({
                y: this.analytics.mean,
                label: 'Mean',
            })
            ret.push({
                y: this.analytics.median,
                label: 'Median',
            })
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

            for (let dataPoint of this.metricData) {
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
            const slsValues = calculateSlsMetric(this.metricData, this.sli, this.slo)
            return slsValues.map((value, i) => [i, value])
        },
        accumulatedFailure() {
            let failureCounter = 0
            const isGood = createIsGood(this.sli, this.slo)
            return this.metricData.map((dataPoint, i) => {
                if (!isGood(dataPoint)) {
                    failureCounter++
                }
                return [i, failureCounter]
            })
        },
        analytics() {
            return analyzeData(this.sortedMetricData)
        },
        jsonData() {
            return JSON.stringify(this.metricData)
        },
    },
    watch: {
        dataCount() {
            if (this.slo.windowDataCount > this.sloWindowDataCountMax) {
                this.slo.windowDataCount = this.sloWindowDataCountMax
            }
        },
        min() {
            if (this.min > this.max) {
                this.max = this.min
            }

            if (this.slo.lowerBoundThreshold < this.min) {
                this.slo.lowerBoundThreshold = this.min
            }
            
            if (this.slo.lowerBoundThreshold > this.slo.upperBoundThreshold) {
                this.slo.lowerBoundThreshold = this.slo.upperBoundThreshold
            }
        },
        max() {
            if (this.max < this.min) {
                this.min = this.max
            }

            if (this.slo.upperBoundThreshold > this.max) {
                this.slo.upperBoundThreshold = this.max
            }

            if (this.slo.lowerBoundThreshold > this.slo.upperBoundThreshold) {
                this.slo.lowerBoundThreshold = this.slo.upperBoundThreshold
            }
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
            return boundTypeToOperator(type)
        },
        nthRender(x) {
            return `${x}th`
        },
        percentRender(x) {
            return `${x}%`
        },
        unitRender(x) {
            return `${x}${this.metricUnit}`
        },
        freqIndicatorStyle(freqIndex) {
            return {
                backgroundColor: freqIndicatorColor(this.frequencies[freqIndex])
            }
        },
        generateData() {
            this.metricData = generateData(this.dataCount, this.buckets, this.onlyInt)
        },
        addIncident() {
            let incidentBuckets = []
            if (this.sli.lowerBoundType) {
                incidentBuckets.push({
                    probability: 100,
                    min: this.min,
                    max: this.slo.lowerBoundThreshold,
                })
            }
            if (this.sli.upperBoundType) {
                incidentBuckets.push({
                    probability: 100,
                    min: this.slo.upperBoundThreshold,
                    max: this.max,
                })
            }
            incidentBuckets = normalizeBucketProbabilities(incidentBuckets)
            const incidentData = generateData(this.incidentLength, incidentBuckets, this.onlyInt)

            // update this.metricData with the incident data overriding the elements that start at this.incidentInsertionPoint
            this.metricData.splice(this.incidentInsertionPoint, this.incidentLength, ...incidentData)
        },
    },
    mounted() {
        this.generateData()
    },
})

app.mount('#app')