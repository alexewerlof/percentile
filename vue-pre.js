import { createApp } from './vendor/vue.js'
import diagramComponent from './components/diagram.js'

/**
 * Calculates the value of y based on the x value for a straight line that goes through point 1 and 2
 * `point1` and `point2` are tuples like this: `[x1, y1]` and `[x2, y2]`
 */
function calculateY(x, point1, point2) {
    const [x1, y1] = point1
    const [x2, y2] = point2

    // Calculate the slope (m)
    const m = (y2 - y1) / (x2 - x1)
    
    // Calculate the y-intercept (c)
    const c = y1 - m * x1
    
    // Calculate the y value for the given x
    const y = m * x + c
    
    return y
}

function f(x, point1, point2) {
    const [xLow, yLow] = point1
    const [xHigh, yHigh] = point2
    if (xLow < 0 || xHigh > 1) {
        throw new Error(`xLow and xHigh must be in the range [0, 1]. Got: ${xLow}, ${xHigh}`)
    }

    if (yLow < 0 || yHigh > 1) {
        throw new Error(`yLow and yHigh must be in the range [0, 1]. Got: ${yLow}, ${yHigh}`)
    }

    if (x === xLow) {
        return yLow
    }

    if (x === xHigh) {
        return yHigh
    }

    if (x < xLow) {
        return calculateY(x, [0, 0], point1)
    }

    if (x > xHigh) {
        return calculateY(x, point2, [1, 1])
    }

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
        return {
            dataCount: 100,
            xLow: 0.1,
            xHigh: 0.9,
            yLow: 0.4,
            yHigh: 0.6,
        }
    },
    computed: {
        resolution() {
            return 1 / this.dataCount
        },
        randomGeneratorShape() {
            return generateData(0, 1, this.resolution, f, [this.xLow, this.yLow], [this.xHigh, this.yHigh])
        },
        randomNumbers() {
            return generateData(0, 1, this.resolution, () => {
                const randomX = Math.random()
                return f(randomX, [this.xLow, this.yLow], [this.xHigh, this.yHigh])
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