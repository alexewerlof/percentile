function isBelowBound(dataPoint, bound) {
        // If a bound is set
    if (bound) {
        const { equal, threshold } = bound
        if (equal) {
            return dataPoint <= threshold
        } else {
            return dataPoint < threshold
        }
    }
    return true
}

function isAboveBound(dataPoint, bound) {
    // If a bound is set
    if (bound) {
        const { equal, threshold } = bound
        if (equal) {
            return dataPoint >= threshold
        } else {
            return dataPoint > threshold
        }
    }
    return true
}

export function isGood(dataPoint, sli) {
    const { lowerBound, upperBound } = sli
    return isAboveBound(dataPoint, lowerBound) && isBelowBound(dataPoint, upperBound)
}

export function isBad(dataPoint, sli) {
    return !isGood(dataPoint, sli)
}

export function sls(metricData, startIndex, windowLength, sli) {
    let good = 0, valid = 0
    for (let i = startIndex; i < startIndex + windowLength; i++) {
        const dataPoint = metricData[i]
        if (isGood(dataPoint, sli)) {
            good++
        }
        valid++
    }
    return 100 * good / valid
}

export function calculateSlsMetric(metricData, windowLength, sli) {
    const slsArrLen = metricData.length - windowLength + 1
    const goodCount = Array.from({ length: slsArrLen }, () => 0)

    for (let i = 0; i < metricData.length; i++) {
        if (isGood(metricData[i], sli)) {
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