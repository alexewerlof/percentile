/**
 * Given an array of points fined the index of the point that is closest to the value of p
 * @param {[number, number][]} points an array of point tuples ([x,y]) which are sorted based on the value of x
 * @param {number} p the value of x to find the index for
 * @returns the index of the point that is closest to the value of p in the array of points where the x is less than or equal to p
 */
export function findIndex(points, p) {
    const lastIndex = points.length - 1
    for (let i = 0; i < lastIndex; i++) {
        const [x1] = points[i]
        const [x2] = points[i + 1]
        if (x1 <= p && p < x2) {
            return i
        }
    }
    // If p is exactly 1, return the last valid index
    return lastIndex - 1
}

export function getPoints(points, x) {
    const index = findIndex(points, x)
    return points.slice(index, index + 2)
}

/**
 * Calculates the value of y based on the x value for a straight line that goes through point 1 and 2
 * `point1` and `point2` are tuples like this: `[x1, y1]` and `[x2, y2]`
 */
export function calculateY(x, point1, point2) {
    const [x1, y1] = point1
    const [x2, y2] = point2

    if (x1 === x2) {
        return (y1 + y2) / 2
    }

    // Calculate the slope (m)
    const m = (y2 - y1) / (x2 - x1)
    
    // Calculate the y-intercept (c)
    const c = y1 - m * x1
    
    // Calculate the y value for the given x
    const y = m * x + c
    
    return y
}

export function sortByY(points) {
    return points.slice().sort((a, b) => a[1] - b[1])
}
