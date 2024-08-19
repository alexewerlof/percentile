import { createApp } from './vendor/vue.js'
import plot2dComponent from './components/plot-2d.js'
import tabsComponent from './components/tabs.js'
import { createBuckets, generateData } from './lib/buckets.js'
import { analyzeData, createIncidentBuckets, overwriteData, percentileIndex } from './lib/data.js'
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
            dataCountMultiplier: config.dataCountMultiplier.default,
            min: config.min,
            max: config.max,
            selectedTab: 'Generator',
            metricName: config.metricName.default,
            metricUnit: config.metricUnit.default,
            metricData: [],
            frequencies: [
                95.3,
                2.2,
                0.9,
                0.6,
                0.5,
                0.4,
            ],
            onlyInt: true,
            sortAscending: true,
            incidentMultiplier: config.incidentMultiplier.default,
            incidentInsertionPoint: 0,
            sli: {
                upperBound: config.sli.upperBound,
                lowerBound: config.sli.lowerBound,
            },
            slo: {
                value: config.slo.value,
                windowDataCount: config.windowDataCount.default,
                upperThreshold: config.slo.upperThreshold,
                lowerThreshold: config.slo.lowerThreshold,
            },
        }
    },
    computed: {
        dataCount() {
            return Math.round(this.slo.windowDataCount * this.dataCountMultiplier)
        },
        incidentDataCount() {
            return Math.round(this.slo.windowDataCount * this.incidentMultiplier)
        },
        sortedMetricData() {
            return [...this.metricData].sort(this.sortAscending ? d3.ascending : d3.descending)
        },
        metricDataPoints() {
            return this.metricData.map((y, x) => [x, y])
        },
        sortedMetricDataPoints() {
            return this.sortedMetricData.map((y, x) => [x, y])
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
            return this.buckets.flatMap(bucket => {
                return [
                    [bucket.min, bucket.probability],
                    [bucket.max, bucket.probability],
                ]
            })
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
        slsGuides() {
            return [
                {
                    y: this.slo.value,
                    label: this.slo.value,
                },
                {
                    x: this.slo.windowDataCount,
                    label: '1 Window',
                }
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
        burnRatePoints() {
            const errorBudgetPercent = 100 - this.slo.value
            return this.slsPoints.map(([x, sls]) => {
                const errorPercent = 100 - sls
                return [x, errorPercent / errorBudgetPercent]
            })
        },
        burnRateGuides() {
            return [
                {
                    y: 1,
                    label: '1',
                },
                {
                    y: 6,
                    label: '6',
                },
                {
                    y: 14.4,
                    label: '14.4',
                },
                {
                    x: this.slo.windowDataCount,
                    label: '1 Window',
                }
            ]
        },
        burnRateYExtent() {
            const maxBurnRate = d3.max(this.burnRatePoints.map(([x, y]) => y))
            return [0, Math.max(maxBurnRate, 14.4)]
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
            switch (x) {
                case 0:
                    return '0th'
                case 1:
                    return '1st'
                case 2:
                    return '2nd'
                case 3:
                    return '3rd'
                default:
                    return `${x}th`
            }
        },
        percentRender(x) {
            return `${x.toFixed(1)}%`
        },
        xRender(x) {
            return `${x}x`
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
            const incidentBuckets = createIncidentBuckets(this.min, this.max, this.sli, this.slo)
            const incidentDataCount = Math.min(this.dataCount - this.incidentInsertionPoint, this.incidentDataCount)
            console.log('metricData.length', this.metricData.length, '. Inserting', incidentDataCount, 'incident data points at', this.incidentInsertionPoint)
            const incidentData = generateData(incidentDataCount, incidentBuckets, this.onlyInt)
            this.metricData = overwriteData(this.metricData, incidentData, this.incidentInsertionPoint),
            console.log('done', incidentData.length)
        },
    },
    created() {
        this.generateData()
    },
})

app.mount('#app')