export function boundTypeToOperator(boundType) {
    switch (boundType) {
        case 'le':
            return '<='
        case 'lt':
            return '<'
        case 'ge':
            return '>='
        case 'gt':
            return '>'
        default:
            return ''
    }
}

export function createIsGoodFnBody(varName, sli, slo) {
    const { lowerBound, upperBound } = sli
    const { lowerThreshold, upperThreshold } = slo
    
    if (lowerBound && !Number.isFinite(lowerThreshold)) {
        throw new Error('Lower bound threshold must be a number')
    }
    
    if (upperBound && !Number.isFinite(upperThreshold)) {
        throw new Error('Upper bound threshold must be a number')
    }
    
    if (lowerBound && upperBound && lowerThreshold > upperThreshold) {
        throw new Error('Lower bound threshold must be less than upper bound threshold')
    }   

    if (!lowerBound && !upperBound) {
        return 'return true'
    }

    let fnBodyTokens = ['return']
    const lowerBoundOp = boundTypeToOperator(lowerBound)
    const upperBoundOp = boundTypeToOperator(upperBound)

    if (lowerBoundOp) {
        fnBodyTokens.push(varName)
        fnBodyTokens.push(lowerBoundOp)
        fnBodyTokens.push(lowerThreshold)

        if (upperBoundOp) {
            fnBodyTokens.push('&&')
        }    
    }

    if (upperBoundOp) {
        fnBodyTokens.push(varName)
        fnBodyTokens.push(upperBoundOp)
        fnBodyTokens.push(upperThreshold)
    }

    return fnBodyTokens.join(' ')
}

export function createIsGood(sli, slo) {
    const varName = 'dataPoint'
    return new Function(varName, createIsGoodFnBody(varName, sli, slo))
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

function countTrue(boolArr, startIndex, endIndex) {
    let count = 0
    for (let i = startIndex; i < endIndex; i++) {
        if (boolArr[i]) {
            count++
        }
    }
    return count
}

/**
 * Takes an array of boolean values and moves through the array
 * to count the number of true values in a window of a given size.
 * 
 * @param {boolean[]} boolArr 
 * @param {number} windowLen 
 * @returns 
 */
export function movingWindowBooleanCounter(boolArr, windowLen) {
    const booleanDataLen = boolArr.length
    const lastIndex = booleanDataLen - windowLen
    const ret = new Array(lastIndex + 1)
    for (let i = 0; i <= lastIndex; i++) {
        ret[i] = countTrue(boolArr, i, i + windowLen)
    }

    return ret
}

export function calculateSlsMetric(metricData, sli, slo) {
    const { windowDataCount } = slo
    const isGood = createIsGood(sli, slo)
    const goodData = metricData.map(isGood)
    const goodCount = movingWindowBooleanCounter(goodData, windowDataCount)

    const valid = windowDataCount
    return goodCount.map(good => 100 * good / valid)
}