export function sortByY(points) {
    return points.slice().sort((a, b) => a[1] - b[1])
}

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

export function getBucket(bucketsArray) {
    let total = 0;
    for (let i = 0; i < bucketsArray.length; i++) {
        total += bucketsArray[i].probability;
    }

    let random = Math.random() * total;

    for (let i = 0; i < bucketsArray.length; i++) {
        random -= bucketsArray[i].probability;
        if (random <= 0) {
            return bucketsArray[i];
        }
    }
}

function rnd(min, max) {
    return Math.round(Math.random() * (max - min) + min)
}

function getRandomNumberInBucket(bucket) {
    return rnd(bucket.min, bucket.max)
}

function generateRandomNumber(bucketsArray) {
    return getRandomNumberInBucket(getBucket(bucketsArray))
}

export function generateData(count, bucketsArray) {
    const data = []
    for (let x = 0; x < count; x++) {
        data.push([x, generateRandomNumber(bucketsArray)])
    }
    return data
}