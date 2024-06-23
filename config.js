export const config = {
    notablePercentiles: [1, 10, 20, 25, 50, 75, 80, 90, 95, 99, 99.5, 99.9],
    slider: {
        count: 20,
        min: 0.01,
        max: 100,
        default: 50,
        step: 0.01,
    },
    min: 100,
    max: 20000,
    dataCount: 2190, // hours in 3 months
    slo: {
        value: 99.3,
        windowDataCount: 730, // hours in 30 days
        min: 50,
        max: 99.9,
        step: 0.1,
    },
    width: 1000,
    height: 300,
    margin: {top: 30, right: 50, bottom: 40, left: 80},
    xMin: 0,
    xMax: 100,
    xCount: 200,
    yMin: 0,
    yMax: 1000,
}