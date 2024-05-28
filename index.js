import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"
import { generateData, analyzeData, percentileIndex } from "./data.js"
import { config } from "./config.js"

const $ = id => document.getElementById(id)

// Define the scales
const xScale = d3.scaleLinear().domain([0, 100]).range([config.margin.left, config.width - config.margin.right])
const yScale = d3.scaleLinear().domain([0, config.yMax]).range([config.height - config.margin.bottom, config.margin.top])

function initDiagram() {
    const line = d3.line()
        .defined(d => !isNaN(d[1]))
        .x(d => xScale(d[0]))
        .y(d => yScale(d[1]))

    // Create the SVG
    const svg = d3.create('svg')
        .attr('viewBox', [0, 0, config.width, config.height])

    // The data lines
    const linesGroup = svg.append('g')
        .classed('data', true)

    // Add the x-axis
    svg.append('g')
        .classed('x-axis', true)
        .attr('transform', `translate(0,${yScale(0)})`)
        .call(d3.axisBottom(xScale).ticks(config.width / 100))

    // Add the y-axis
    svg.append('g')
        .classed('y-axis', true)
        .attr('transform', `translate(${xScale(0)},0)`)
        .call(d3.axisLeft(yScale))

    return {
        svg,
    }
}

function updateStats(data) {
    const { min, max, range, mean } = analyzeData(data)
    $("data-count").innerText = data.length
    $("data-min").innerText = min
    $("data-max").innerText = max
    $("data-range").innerText = range
    $("data-mean").innerText = mean.toFixed(2)

    const sortedData = [...data].sort(d3.ascending)
    const percentileTableData = config.percentiles.map(percentile => {
        const dataIndex = percentileIndex(sortedData.length, percentile)
        return [
            percentile,
            dataIndex,
            sortedData[dataIndex],
        ]
    })

    d3.select('#percentile-table')
        .selectAll('tr')
        .data(percentileTableData)
        .join('tr')
        .selectAll('td')
        .data(d => d)
        .join('td')
        .text(d => d)
}


function updateDiagram(data) {
    const x = 100 / data.length
    const lines = d3.select('g.data')
        .selectAll('line')
        .data(data)
        .join('line')
        .attr('x1', (d, i) => xScale((i + 1) * x))
        .attr('x2', (d, i) => xScale((i + 1) * x))
        .attr('y1', yScale(0))  // start at the bottom of the chart
        .attr('y2', d => yScale(d))  // end at the data point
        .attr('class', 'data-line')
        .attr('stroke-width', 1.5)
        .attr('stroke-linecap', 'round')

    lines.append('title')
        .text((d, i) => `data[${i}] = ${d}`);
}

function updateState(data) {
    updateStats(data)
    updateDiagram(data)
}

const { svg } = initDiagram()
$('diagram').appendChild(svg.node())
const initBtn = $("init-button")
const variationInput = $("variation-input")

let data = []

function initData() {
    const variation = Number(variationInput.value)
    data = generateData(config.xCount, config.yMin, config.yMax, variation)
    updateState(data)
}

function sortData() {
    data.sort(d3.ascending)
    updateState(data)
}

variationInput.addEventListener('input', () => {
    $("variation-label").innerText = variationInput.value
    initData()
    sortData()
})

initBtn.addEventListener("click", () => {
    initData()
})

$("sort-button").addEventListener("click", () => {
    sortData()
})

initBtn.click()