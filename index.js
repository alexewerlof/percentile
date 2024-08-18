import { createApp } from './vendor/vue.js'
import plot2dComponent from './components/plot-2d.js'
import tabsComponent from './components/tabs.js'
import { createBuckets, generateData, normalizeBucketProbabilities } from './lib/buckets.js'
import { analyzeData, percentileIndex } from './lib/data.js'
import { config } from './config.js'
import { d3 } from './vendor/d3.js'
import { boundTypeToOperator, calculateSlsMetric, createIsGood } from './lib/sl.js'
import { isNum } from './lib/validation-copy.js'

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
                upperBound: config.sli.upperBound,
                lowerBound: config.sli.lowerBound,
            },
            slo: {
                value: config.slo.value,
                windowDataCount: config.slo.windowDataCount,
                upperThreshold: config.slo.upperThreshold,
                lowerThreshold: config.slo.lowerThreshold,
            },
        }
    },
    computed: {
        sortedMetricData() {
            return [...this.metricData].sort(this.sortAscending ? d3.ascending : d3.descending)
        },

        metricDataPoints() {
            return this.metricData.map((y, x) => [x, y])
        },

        sortedMetricDataPoints() {
            return this.sortedMetricData.map((y, x) => [x, y])
        },

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

            if (this.sli.upperBound) {
                ret.push({
                    x: this.slo.upperThreshold,
                    label: '$UT',
                })
            }

            if (this.sli.lowerBound) {
                ret.push({
                    x: this.slo.lowerThreshold,
                    label: '$LT',
                })
            }

            return ret
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
        thresholdGuidesY() {
            const ret = []
            if (this.sli.upperBound) {
                ret.push({
                    y: this.slo.upperThreshold,
                    label: '$UT',
                })
            }
            if (this.sli.lowerBound) {
                ret.push({
                    y: this.slo.lowerThreshold,
                    label: '$LT',
                })
            }
            return ret
        },
        meanMedianGuidesY() {
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
        sloGuideY() {
            return [
                {
                    y: this.slo.value,
                    label: this.slo.value,
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

            if (this.slo.lowerThreshold < this.min) {
                this.slo.lowerThreshold = this.min
            }
            
            if (this.slo.lowerThreshold > this.slo.upperThreshold) {
                this.slo.lowerThreshold = this.slo.upperThreshold
            }
        },
        max() {
            if (this.max < this.min) {
                this.min = this.max
            }

            if (this.slo.upperThreshold > this.max) {
                this.slo.upperThreshold = this.max
            }

            if (this.slo.lowerThreshold > this.slo.upperThreshold) {
                this.slo.lowerThreshold = this.slo.upperThreshold
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
            return `${x.toFixed(1)}%`
        },
        unitRender(x) {
            return isNum(x) ? `${x}${this.metricUnit}` : x
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
            if (this.sli.lowerBound) {
                incidentBuckets.push({
                    probability: 100,
                    min: this.min,
                    max: this.slo.lowerThreshold,
                })
            }
            if (this.sli.upperBound) {
                incidentBuckets.push({
                    probability: 100,
                    min: this.slo.upperThreshold,
                    max: this.max,
                })
            }
            incidentBuckets = normalizeBucketProbabilities(incidentBuckets)
            const incidentData = generateData(this.incidentLength, incidentBuckets, this.onlyInt)

            // update this.metricData with the incident data overriding the elements that start at this.incidentInsertionPoint
            this.metricData.splice(this.incidentInsertionPoint, this.incidentLength, ...incidentData)
        },
    },
    created() {
        console.log('created')
        this.generateData()
        console.log('generated data', this.metricData)
    },
})

app.mount('#app')