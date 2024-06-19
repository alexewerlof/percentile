import { assert } from '../vendor/deno.js'
import { isBad, isGood } from './sl.js'

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