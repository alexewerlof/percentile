import { assertEquals } from '../vendor/deno.js'
import { calculateSlsMetric, createIsGood } from './sl.js'

Deno.test('createIsGood(): lowerBoundType', (t) => {
    const sli = {
        lowerBoundType: 'lt',
    }
    const slo = {
        lowerBoundThreshold: 5,
    }
    const isGood = createIsGood(sli, slo)

    assertEquals(isGood(4), false)
    assertEquals(isGood(5), false)
    assertEquals(isGood(6), true)
})

Deno.test('createIsGood(): upperBoundType', () => {
    const sli = {
        upperBoundType: 'lte',
    }
    const slo = {
        upperBoundThreshold: 10,
    }
    const isGood = createIsGood(sli, slo)

    assertEquals(isGood(9), true)
    assertEquals(isGood(10), true)
    assertEquals(isGood(11), false)
})

Deno.test('createIsGood(): lowerBoundType and upperBoundType', () => {
    const sli = {
        lowerBoundType: 'lt',
        upperBoundType: 'lte',
    }
    const slo = {
        lowerBoundThreshold: 5,
        upperBoundThreshold: 10,
    }
    const isGood = createIsGood(sli, slo)

    assertEquals(isGood(4), false)
    assertEquals(isGood(5), false)
    assertEquals(isGood(6), true)
    assertEquals(isGood(9), true)
    assertEquals(isGood(10), true)
    assertEquals(isGood(11), false)
})

Deno.test('calculateSlsMetric()', () => {
    const metricData = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
    const windowLength = 4
    const expected   = [1, 2, 3, 4, 4, 3, 2].map(goodCount => goodCount * 100 / windowLength)  
    const sli = {
        lowerBoundType: 'lt',
        upperBoundType: 'lte',
    }
    const slo = {
        lowerBoundThreshold: 300,
        upperBoundThreshold: 800,
    }
    assertEquals(calculateSlsMetric(metricData, windowLength, sli, slo), expected)
})