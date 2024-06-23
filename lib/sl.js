function isBelowBound(dataPoint, bound) {
    const { equal, threshold } = bound
    return equal ? dataPoint <= threshold : dataPoint < threshold
}

function isAboveBound(dataPoint, bound) {
    const { equal, threshold } = bound
    return equal ? dataPoint >= threshold : dataPoint > threshold
}

export function createIsGood(sli) {
    const { lowerBound, upperBound } = sli
    if (lowerBound && upperBound) {
        return dataPoint => isBelowBound(dataPoint, upperBound) && isAboveBound(dataPoint, lowerBound)
    } else if (lowerBound) {
        return dataPoint => isAboveBound(dataPoint, lowerBound)
    } else if (upperBound) {
        return dataPoint => isBelowBound(dataPoint, upperBound)
    } else {
        return () => true
    }
}

export function sls(metricData, startIndex, windowLength, sli) {
    let good = 0, valid = 0
    const isGood = createIsGood(sli)
    for (let i = startIndex; i < startIndex + windowLength; i++) {
        const dataPoint = metricData[i]
        if (isGood(dataPoint)) {
            good++
        }
        valid++
    }
    return 100 * good / valid
}

export function calculateSlsMetric(metricData, windowLength, sli) {
    const slsArrLen = metricData.length - windowLength + 1
    const goodCount = new Array(slsArrLen)
    goodCount.fill(0)
    const isGood = createIsGood(sli)

    for (let i = 0; i < metricData.length; i++) {
        if (isGood(metricData[i])) {
            const start = Math.max(i - windowLength + 1, 0)
            const end = Math.min(i, slsArrLen - 1)

            for (let j = start; j <= end; j++) {
                goodCount[j]++
            }
        }
    }

    const valid = windowLength
    return goodCount.map(good => 100 * good / valid)
}