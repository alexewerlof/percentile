import { createApp } from './vendor/vue.js'
import diagramComponent from './components/diagram.js'
import { getPoints, calculateY } from './lib/points.js'

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
        return {
            dataCount: 1000,
            min,
            max,
            points: [
                [0.1, min],
                [0.9, max],
            ],
        }
    },
    computed: {
        ppp() {
            return [
                [0, this.min],
                ...this.points.map(([x, y]) => [x,y]),
                [1, this.max],
            ]
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
    methods: {
        addPoint() {
            const lastPointIndex = this.ppp.length - 1
            const [x1, y1] = this.ppp[lastPointIndex]
            const [x2, y2] = this.ppp[lastPointIndex - 1]
            console.log(x1, y1, x2, y2)
            this.points.push([(x1 + x2) / 2, (y1 + y2) / 2])
        },
        removePoint(pointIndex) {
            this.points.splice(pointIndex, 1)
        },
    },
})

app.mount('#app')