import { createApp } from './vendor/vue.js'
import diagramComponent from './components/diagram.js'
import { getPoints, calculateY } from './lib/points.js'
import { calculatePoints } from './data.js'

function f(x, points) {
    const [ point1, point2 ] = getPoints(points, x)

    return calculateY(x, point1, point2)
}

function generateData(xStart, xEnd, xStep, f, ...fArgs) {
    const data = []
    for (let x = xStart; x <= xEnd; x += xStep) {
        data.push([x, f(x, ...fArgs)])
    }
    return data
}

const app = createApp({
    components: {
        diagramComponent,
    },
    data() {
        const min = 100
        const max = 20000
        const sliderCount = 7
        const frequencies = Array.from({ length: sliderCount }, (_, i) => 50)
        return {
            dataCount: 1000,
            min,
            max,
            frequencies,
        }
    },
    computed: {
        ppp() {
            return calculatePoints(this.frequencies, this.min, this.max)
        },
        resolution() {
            return 1 / this.dataCount
        },
        randomNumbers() {
            return generateData(0, 1, this.resolution, () => {
                const randomX = Math.random()
                return f(randomX, this.ppp)
            }, this.xLow, this.xHigh)
        },
        sortedRandomNumbers() {
            const sorted = this.randomNumbers.slice().sort((a, b) => a[1] - b[1])

            let x = 0
            let step = this.resolution
            return sorted.map(([, y]) => {
                x += step
                return [x, y]
            })
        },
    },
})

app.mount('#app')