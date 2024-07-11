import { assertEquals } from '../vendor/deno.js'
import { boundTypeToOperator, calculateSlsMetric, createIsGood, createIsGoodFnBody } from './sl.js'

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

Deno.test('boundTypeToOperator()', () => {
    assertEquals(boundTypeToOperator('lte'), '<=')
    assertEquals(boundTypeToOperator('lt'), '<')
    assertEquals(boundTypeToOperator('gte'), '>=')
    assertEquals(boundTypeToOperator('gt'), '>')
    assertEquals(boundTypeToOperator(''), '')
    assertEquals(boundTypeToOperator(), '')
})

Deno.test('createIsGoodFnBody()', () => {
    assertEquals(createIsGoodFnBody('dataPoint',
        {
            lowerBoundType: 'lt',
        }, {
            lowerBoundThreshold: 1,
        }
    ), `return 1 < dataPoint`)

    assertEquals(createIsGoodFnBody('dataPoint',
        {
            lowerBoundType: 'lte',
        }, {
            lowerBoundThreshold: 2,
        }
    ), `return 2 <= dataPoint`)

    assertEquals(createIsGoodFnBody('dataPoint',
        {
            upperBoundType: 'lt',
        }, {
            upperBoundThreshold: 3,
        }
    ), `return dataPoint < 3`)

    assertEquals(createIsGoodFnBody('dataPoint',
        {
            upperBoundType: 'lte',
        }, {
            upperBoundThreshold: 4,
        }
    ), `return dataPoint <= 4`)

    assertEquals(createIsGoodFnBody('dataPoint',
        {
            lowerBoundType: 'lt',
            upperBoundType: 'lte',
        }, {
            lowerBoundThreshold: 5,
            upperBoundThreshold: 10,
        }
    ), `return 5 < dataPoint && dataPoint <= 10`)
})

Deno.test('calculateSlsMetric()', () => {
    const metricData = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
    const windowDataCount = 4
    const expected   = [1, 2, 3, 4, 4, 3, 2].map(goodCount => goodCount * 100 / windowDataCount)  
    const sli = {
        lowerBoundType: 'lt',
        upperBoundType: 'lte',
    }
    const slo = {
        lowerBoundThreshold: 300,
        upperBoundThreshold: 800,
        windowDataCount,
    }
    assertEquals(calculateSlsMetric(metricData, sli, slo), expected)
})