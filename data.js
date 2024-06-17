import { config } from './config.js'

function rnd(range) {
    return Math.random() * range
}

function spike(x) {
    const y = 1 / (x + 1)
    return y
}

function dip(x) {
    const y = 1 - spike(x)
    return y
}

function func(variation = 0) {
    if (variation === 0) {
        return Math.random()
    }

    const x = rnd(config.xMax)
    return variation < 0 ? spike(x) : dip(x)
}

export function dataPoint(yMin, yRange, variation) {
    const y = (func(variation) * yRange) + yMin
    return y
}

export function generateData(count, min, max, variation) {
    const ret = []
    const range = max - min
    while (count-- > 0) {
        ret.push(Math.round(dataPoint(min, range, variation)))
    }
    return ret
}

export function analyzeData(sortedNumArr) {
    const count = sortedNumArr.length
    let min = sortedNumArr[0]
    let max = sortedNumArr[0]
    let sum = 0
    for (let d of sortedNumArr) {
        if (d < min) {
            min = d
        }
        if (d > max) {
            max = d
        }
        sum += d
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

export function arrSum(arr) {
    return arr.reduce((a, b) => a + b, 0)
}

export function normalizeFrequencies(frequencies) {
    const sum = arrSum(frequencies)
    return frequencies.map(f => f / sum)
}

export function accumulateFrequencies(frequencies) {
    let sum = 0;
    const result = [0]
    for (let freq of frequencies) {
        sum += freq
        result.push(sum)
    }
    return result
}

export function calculatePoints(frequencies, min, max) {
    const points = [];

    const xArr = accumulateFrequencies(normalizeFrequencies(frequencies))
    const step = (max - min) / xArr.length
    let y = min
    for (let x of xArr) {
        points.push([x, y])
        y += step
    }

    return points;
}