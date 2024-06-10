import { d3 } from '../vendor/d3.js'

const PADDING_INDEX = {
    TOP: 0,
    RIGHT: 1,
    BOTTOM: 2,
    LEFT: 3,
}

export class DiagramBase {
    constructor(svgElement, width, height, padding) {
        this.svg = d3.select(svgElement)
        this.width = width
        this.height = height
        this.padding = padding

        this.svg.attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .classed('diagram', true)

        this.path = this.svg.append('path')
            .classed('diagram__line', true)

        // Create the axes
        this.xAxisGroup = this.svg.append('g').classed('diagram__axis diagram__axis--x', true)
        this.yAxisGroup = this.svg.append('g').classed('diagram__axis diagram__axis--y', true)

        // Create the scales
        this.xScale = d3.scaleLinear().range([this.leftSide, this.rightSide])
        this.yScale = d3.scaleLinear().range([this.bottomSide, this.topSide])
    }

    get leftSide() {
        return this.padding[PADDING_INDEX.LEFT]
    }

    get rightSide() {
        return this.width - this.padding[PADDING_INDEX.RIGHT]
    }

    get topSide() {
        return this.padding[PADDING_INDEX.TOP]
    }

    get bottomSide() {
        return this.height - this.padding[PADDING_INDEX.BOTTOM]
    }

    update() {
        const xAxis = d3.axisBottom(this.xScale)
        const yAxis = d3.axisLeft(this.yScale)
    
        this.xAxisGroup
            .attr('transform', `translate(0,${this.bottomSide})`)
            .call(xAxis)
    
        this.yAxisGroup
            .attr('transform', `translate(${this.leftSide},0)`)
            .call(yAxis)
    }
}