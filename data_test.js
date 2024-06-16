import { assertEquals } from './vendor/deno.js'
import { arrSum, normalizeFrequencies, accumulateFrequencies, calculatePoints } from './data.js'

Deno.test('arrSum()', () => {
    assertEquals(arrSum([0]), 0)
    assertEquals(arrSum([13]), 13)
    assertEquals(arrSum([1, 2, 3, 4]), 10)
    assertEquals(arrSum([0, 0, 0, 0]), 0)
    assertEquals(arrSum([1, 2, 3, 4, 5]), 15)
})

Deno.test('normalizeFrequencies()', () => {
    assertEquals(normalizeFrequencies([50, 50, 50, 50]), [0.25, 0.25, 0.25, 0.25])
    assertEquals(normalizeFrequencies([50, 50, 100, 50]), [50/250, 50/250, 100/250, 50/250])
    assertEquals(normalizeFrequencies([0, 10, 90]), [0, 0.1, 0.9])
})

Deno.test('accumulateFrequencies()', () => {
    assertEquals(accumulateFrequencies([0.25, 0.25, 0.25, 0.25]), [0, 0.25, 0.5, 0.75, 1])
    assertEquals(accumulateFrequencies([0.1, 0.4, 0.5]), [0, 0.1, 0.5, 1])
    assertEquals(accumulateFrequencies([0, 0, 0, 1]), [0, 0, 0, 0, 1])
    assertEquals(accumulateFrequencies([0, 1, 0]), [0, 0, 1, 1])
})

Deno.test('calculatePoints()', () => {})