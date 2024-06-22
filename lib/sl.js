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
    const { upperBound, lowerBound } = sli
    return isBelowBound(dataPoint, upperBound) && isAboveBound(dataPoint, lowerBound)
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