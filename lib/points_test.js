import { assertEquals } from '../vendor/deno.js'
import { findIndex } from './points.js'

Deno.test('findIndex()', () => {
    const points = [
        [0, 0],
        [0.1, 0.4],
        [0.9, 0.6],
        [1, 1],
    ]

    assertEquals(findIndex(points, 0.05), 0, 'can find a point at the first range')
    assertEquals(findIndex(points, 0.15), 1, 'can find a point at the second range')
    assertEquals(findIndex(points, 0.5), 1, 'can find a point at the third range')
    assertEquals(findIndex(points, 0.95), 2, 'can find a point at the fourth range')

    assertEquals(findIndex(points, 0), 0, 'can find a point at the first point')
    assertEquals(findIndex(points, 0.1), 1, 'can find a point on the second point')
    assertEquals(findIndex(points, 0.9), 2, 'can find a point on the third point')
    assertEquals(findIndex(points, 1), 2, 'can find a point at the last point')
})