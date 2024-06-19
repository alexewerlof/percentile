/**
 * @typedef {Object} Bucket
 * @property {number} probability - The probability of this bucket being selected, expressed as a percentage.
 * @property {number} min - The minimum value that can be generated within this bucket.
 * @property {number} max - The maximum value that can be generated within this bucket.
 */

/**
 * Generates buckets by dividing the range into n equal parts.
 * n is the length of the frequencies array.
 * The probability is normalized based on how likely it is for a given bucket to be picked up
 * @param {number} min 
 * @param {number} max 
 * @param {number[]} frequencies 
 * @returns an array of buckets
 */
export function createBuckets(min, max, frequencies) {
    const range = max - min
    const length = frequencies.length
    const bucketRange = range / length
    const freqSum = frequencies.reduce((sum, cur) => sum + cur, 0)

    return frequencies.map((probability, i) => {
        return {
            // Normalize probability to a percentage value
            probability: 100 * probability / freqSum,
            min: min + i * bucketRange,
            max: min + (i + 1) * bucketRange,
        }
    })
}

/**
 * Picks a random bucket based on the probability of each bucket
 * using a weighted random number generation algorithm that is
 * more likely to pick a bucket with a higher probability
 * @param {Bucket[]} bucketsArr
 * @returns the selected bucket
 */
function getRandomBucket(bucketsArr) {
    const probabilitiesSum = 100
    let random = rnd(0, probabilitiesSum)

    for (let i = 0; i < bucketsArr.length; i++) {
        random -= bucketsArr[i].probability;
        if (random <= 0) {
            return bucketsArr[i];
        }
    }

    throw new Error('No bucket was selected')
}

/**
 * Generates a random number between min and max
 * @param {number} min 
 * @param {number} max 
 * @returns a random number between min and max
 */
function rnd(min, max) {
    return Math.random() * (max - min) + min
}

/**
 * Generates a random number in the range specified by the given bucket
 * @param {Bucket} bucket 
 * @returns a random number between the min and max of the bucket
 */
function getRandomNumberInBucket(bucket) {
    return rnd(bucket.min, bucket.max)
}

export function generateData(count, bucketsArr) {
    const ret = []
    for (let i = 0; i < count; i++) {
        const pickedBucket = getRandomBucket(bucketsArr)
        ret.push(getRandomNumberInBucket(pickedBucket))
    }
    return ret
}