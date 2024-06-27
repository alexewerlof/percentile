export const config = {
    notablePercentiles: [0.1, 0.5, 1, 5, 10, 20, 25, 50, 75, 80, 90, 95, 99, 99.5, 99.9],
    metricName: {
        default: 'Latency',
    },
    slider: {
        count: 10,
        min: 0,
        max: 100,
        default: 50,
        step: 0.01,
        presets: [
            {
                name: 'Normal',
                values: [50],
            },
            {
                name: 'Long Tail',
                values: [100, 30, 10, 9, 3, 2, 1],
            },
            {
                name: 'Long Tail Extreme',
                values: [100, 3, 2, 1, 1, 0.5],
            },
            {
                name: 'Hill',
                values: [1, 2, 3, 9, 10, 30, 100],
            },
            {
                name: 'Hill Extreme',
                values: [0.5, 1, 1, 2, 3, 5, 100],
            },
            {
                name: 'Two Tails',
                values: [1, 2, 3, 7, 100, 7, 3, 2, 1],
            },
            {
                name: 'Two Tails Extreme',
                values: [0.5, 1, 1, 100, 1, 1, 0.5],
            },
            {
                name: 'Camel',
                values: [1, 2, 3, 7, 100, 7, 3, 2, 1, 1, 2, 3, 7, 100, 7, 3, 2, 1],
            },
            {
                name: 'Timeout',
                values: [100, 0, 0, 0, 0, 0, 0, 0.3],
            },
            {
                name: 'Pits',
                values: [0.3, 0, 0, 0, 0, 0, 0, 100],
            },
            {
                name: 'Crazy Bounce',
                values: [100, 2, 2, 2, 5, 2, 2, 2, 100],
            }
        ]
    },
    min: 100,
    max: 20000,
    dataCount: 2190, // hours in 3 months
    sli: {
        upperBoundType: 'lte',
        lowerBoundType: 'lt',
    },
    slo: {
        value: 99.3,
        windowDataCount: 730, // hours in 30 days
        min: 50,
        max: 99.9,
        step: 0.1,
        upperBoundThreshold: 19000,
        lowerBoundThreshold: 1000,
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