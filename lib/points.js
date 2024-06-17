export function sortByY(points) {
    return points.slice().sort((a, b) => a[1] - b[1])
}

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
            probability: 100 * probability / freqSum,
            min: Math.round(min + i * bucketRange),
            max: Math.round(min + (i + 1) * bucketRange),
        }
    })
}

/**
 * Picks a random bucket based on the probability of each bucket
 * using a weighted random number generation algorithm that is
 * more likely to pick a bucket with a higher probability
 * @param {Bucket[]} bucketsArray
 * @param {number} probabilitySum
 * @returns the selected bucket
 */
export function getBucket(bucketsArray, probabilitySum) {
    let random = Math.random() * probabilitySum;

    for (let i = 0; i < bucketsArray.length; i++) {
        random -= bucketsArray[i].probability;
        if (random <= 0) {
            return bucketsArray[i];
        }
    }
}

/**
 * Generates a random number between min and max
 * @param {number} min 
 * @param {number} max 
 * @returns a random number between min and max
 */
function rnd(min, max) {
    return Math.round(Math.random() * (max - min) + min)
}

/**
 * Generates a random number in the range specified by the given bucket
 * @param {Bucket} bucket 
 * @returns a random number between the min and max of the bucket
 */
function getRandomNumberInBucket(bucket) {
    return rnd(bucket.min, bucket.max)
}


function generateRandomNumber(bucketsArray) {
    return getRandomNumberInBucket(getBucket(bucketsArray))
}

export function generateData(count, bucketsArray) {
    let probabilitySum = 0;
    for (let i = 0; i < bucketsArray.length; i++) {
        probabilitySum += bucketsArray[i].probability;
    }

    const data = []
    for (let x = 0; x < count; x++) {
        const pickedBucket = getBucket(bucketsArray, probabilitySum)
        data.push([x, getRandomNumberInBucket(pickedBucket)])
    }
    return data
}