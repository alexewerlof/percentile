import { config } from '../config.js'

/**
 * Gets the index of the element in an array that corresponds to the given percentile
 * @param {number} arrLength the length of the array that we want to calculate its percentile
 * @param {number} percentile the percentile in the range [0..100] inclusive
 * @returns index of the array element that corresponds to the given percentile
 */
export function percentileIndex(arrLength, percentile) {
    const maxPossibleIndex = arrLength - 1
    return Math.ceil(maxPossibleIndex * percentile / 100)
}

/**
 * Analyzes the given data and returns various statistics about it
 * @param {number[]} sortedNumArr a sorted array of numbers
 * @returns an object with various analytics about the data
 */
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

    const mean = count ? sum / count : 0
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
