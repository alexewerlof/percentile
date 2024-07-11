function isBelowBound(dataPoint, boundType, threshold) {
    return boundType === 'lte' ? dataPoint <= threshold : dataPoint < threshold
}

function isAboveBound(dataPoint, boundType, threshold) {
    return boundType === 'lte' ? dataPoint >= threshold : dataPoint > threshold
}

export function createIsGood(sli, slo) {
    const { lowerBoundType, upperBoundType } = sli
    const { lowerBoundThreshold, upperBoundThreshold } = slo

    if (lowerBoundType && upperBoundType) {
        return dataPoint => isAboveBound(dataPoint, lowerBoundType, lowerBoundThreshold) && isBelowBound(dataPoint, upperBoundType, upperBoundThreshold)
    } else if (lowerBoundType) {
        return dataPoint => isAboveBound(dataPoint, lowerBoundType, lowerBoundThreshold)
    } else if (upperBoundType) {
        return dataPoint => isBelowBound(dataPoint, upperBoundType, upperBoundThreshold)
    } else {
        // No bound provided
        return () => true
    }
}

export function sls(metricData, startIndex, windowLength, sli, slo) {
    let good = 0, valid = 0
    const isGood = createIsGood(sli, slo)
    for (let i = startIndex; i < startIndex + windowLength; i++) {
        const dataPoint = metricData[i]
        if (isGood(dataPoint)) {
            good++
        }
        valid++
    }
    return 100 * good / valid
}

export function calculateSlsMetric(metricData, sli, slo) {
    const { windowDataCount } = slo
    const metricDataLen = metricData.length
    const slsArrLen = metricDataLen - windowDataCount + 1
    const goodCount = new Array(slsArrLen)
    goodCount.fill(0)
    const isGood = createIsGood(sli, slo)

    for (let i = 0; i < metricDataLen; i++) {
        if (isGood(metricData[i])) {
            const start = Math.max(i - windowDataCount + 1, 0)
            const end = Math.min(i, slsArrLen - 1)

            for (let j = start; j <= end; j++) {
                goodCount[j]++
            }
        }
    }

    const valid = windowDataCount
    return goodCount.map(good => 100 * good / valid)
}