import { config } from '../config.js'

export function analyzeData(sortedNumArr) {
    const count = sortedNumArr.length
    let min = sortedNumArr[0]
    let max = sortedNumArr[0]
    let sum = 0
    for (let n of sortedNumArr) {
        if (n < min) {
            min = n
        }
        if (n > max) {
            max = n
        }
        sum += n
    }
    const mean = sum / count
    const range = max - min
    const median = sortedNumArr[percentileIndex(count, 50)]
    const percentiles = config.notablePercentiles.map(p => {
        const index = percentileIndex(count, p)
        const value = sortedNumArr[index]
        return {
            name: `P${p}`,
            index,
            value,
        }
    })
    return {
        count,
        min,
        max,
        range,
        mean,
        median,
        percentiles,
    }
}

export function percentileIndex(arrLength, percentile) {
    const maxPossibleIndex = arrLength - 1
    return Math.ceil(maxPossibleIndex * percentile / 100)
}
