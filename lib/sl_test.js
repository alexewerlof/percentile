import { assertEquals } from '../vendor/deno.js'
import { boundTypeToOperator, calculateSlsMetric, createIsGood, createIsGoodFnBody, metricToGood, movingWindowBooleanCounter } from './sl.js'

Deno.test('createIsGood(): lowerBound', (t) => {
    const sli = {
        lowerBound: 'gt',
    }
    const slo = {
        lowerThreshold: 5,
    }
    const isGood = createIsGood(sli, slo)

    assertEquals(isGood(4), false)
    assertEquals(isGood(5), false)
    assertEquals(isGood(6), true)
})

Deno.test('createIsGood(): upperBound', () => {
    const sli = {
        upperBound: 'le',
    }
    const slo = {
        upperThreshold: 10,
    }
    const isGood = createIsGood(sli, slo)

    assertEquals(isGood(9), true)
    assertEquals(isGood(10), true)
    assertEquals(isGood(11), false)
})

Deno.test('createIsGood(): lowerBound and upperBound', () => {
    const sli = {
        lowerBound: 'gt',
        upperBound: 'le',
    }
    const slo = {
        lowerThreshold: 5,
        upperThreshold: 10,
    }
    const isGood = createIsGood(sli, slo)

    assertEquals(isGood(4), false)
    assertEquals(isGood(5), false)
    assertEquals(isGood(6), true)
    assertEquals(isGood(9), true)
    assertEquals(isGood(10), true)
    assertEquals(isGood(11), false)
})

Deno.test('boundTypeToOperator()', () => {
    assertEquals(boundTypeToOperator('lt'), '<')
    assertEquals(boundTypeToOperator('gt'), '>')
    assertEquals(boundTypeToOperator('le'), '<=')
    assertEquals(boundTypeToOperator('ge'), '>=')
    assertEquals(boundTypeToOperator(''), '')
    assertEquals(boundTypeToOperator(), '')
})

Deno.test('createIsGoodFnBody()', () => {
    assertEquals(createIsGoodFnBody('dataPoint',
        {
            lowerBound: 'gt',
        }, {
            lowerThreshold: 1,
        }
    ), `return dataPoint > 1`)

    assertEquals(createIsGoodFnBody('dataPoint',
        {
            lowerBound: 'ge',
        }, {
            lowerThreshold: 2,
        }
    ), `return dataPoint >= 2`)

    assertEquals(createIsGoodFnBody('dataPoint',
        {
            upperBound: 'lt',
        }, {
            upperThreshold: 3,
        }
    ), `return dataPoint < 3`)

    assertEquals(createIsGoodFnBody('dataPoint',
        {
            upperBound: 'le',
        }, {
            upperThreshold: 4,
        }
    ), `return dataPoint <= 4`)

    assertEquals(createIsGoodFnBody('dataPoint',
        {
            lowerBound: 'gt',
            upperBound: 'le',
        }, {
            lowerThreshold: 5,
            upperThreshold: 10,
        }
    ), `return dataPoint > 5 && dataPoint <= 10`)
})

Deno.test('metricToGood()', () => {
    const sli = {
        lowerBound: 'gt',
        upperBound: 'le',
    }
    const slo = {
        lowerThreshold: 5,
        upperThreshold: 10,
    }
    const metricData = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    const expected = [false, false, false, false, false, false, true, true, true, true, true, false]
    assertEquals(metricToGood(metricData, sli, slo), expected)
})

Deno.test('movingWindowBooleanCounter()', () => {
    let metricData = [true, true, false, false, true, true, true, false, false, false]
    let expectedCounts = /* ----- */ [2,     1,    1,    2,    3,     2,     1,     0]
    let windowDataCount = 3
    assertEquals(movingWindowBooleanCounter(metricData, windowDataCount), expectedCounts)
})

Deno.test('calculateSlsMetric()', () => {
    const metricData = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
    const windowDataCount = 4
    const expected   = [1, 2, 3, 4, 4, 3, 2].map(goodCount => goodCount * 100 / windowDataCount)  
    const sli = {
        lowerBound: 'gt',
        upperBound: 'le',
    }
    const slo = {
        lowerThreshold: 300,
        upperThreshold: 800,
        windowDataCount,
    }
    assertEquals(calculateSlsMetric(metricData, sli, slo), expected)
})