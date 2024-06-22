import { assert, assertEquals } from '../vendor/deno.js'
import { calculateSlsMetric, isBad, isGood } from './sl.js'

Deno.test('isGood()', () => {
    const sli = {
        upperBound: {
            equal: true,
            threshold: 10,
        },
        lowerBound: {
            equal: false,
            threshold: 5,
        },
    }
    assert(isGood(6, sli))
    assert(isGood(9, sli))
    assert(!isGood(11, sli))
    assert(isGood(10, sli))
    assert(!isGood(4, sli))
    assert(!isGood(5, sli))
})

Deno.test('isBad()', () => {
    const sli = {
        upperBound: {
            equal: true,
            threshold: 10,
        },
        lowerBound: {
            equal: false,
            threshold: 5,
        },
    }
    assert(!isBad(6, sli))
    assert(!isBad(9, sli))
    assert(isBad(11, sli))
    assert(!isBad(10, sli))
    assert(isBad(4, sli))
    assert(isBad(5, sli))
})

Deno.test('calculateSlsMetric()', () => {
    const metricData = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
    const windowLength = 4
    const expected   = [1, 2, 3, 4, 4, 3, 2].map(goodCount => goodCount * 100 / windowLength)  
    const sli = {
        upperBound: {
            equal: true,
            threshold: 800,
        },
        lowerBound: {
            equal: false,
            threshold: 300,
        },
    }
    assertEquals(calculateSlsMetric(metricData, windowLength, sli), expected)
})