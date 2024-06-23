import { assert, assertEquals } from '../vendor/deno.js'
import { calculateSlsMetric, createIsGood } from './sl.js'

Deno.test('createIsGood()', () => {
    const isGoodLH = createIsGood({
        upperBound: {
            equal: true,
            threshold: 10,
        },
        lowerBound: {
            equal: false,
            threshold: 5,
        },
    })
    assert(isGoodLH(6))
    assert(isGoodLH(9))
    assert(!isGoodLH(11))
    assert(isGoodLH(10))
    assert(!isGoodLH(4))
    assert(!isGoodLH(5))

    const isGoodU = createIsGood({
        upperBound: {
            equal: true,
            threshold: 10,
        },
    })
    assert(isGoodU(9))
    assert(!isGoodU(11))
    assert(isGoodU(10))

    const isGoodL = createIsGood({
        lowerBound: {
            equal: false,
            threshold: 5,
        },
    })
    assert(isGoodL(6))
    assert(!isGoodL(4))
    assert(!isGoodL(5))
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