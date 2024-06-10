import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm'

const PADDING_INDEX = {
    TOP: 0,
    RIGHT: 1,
    BOTTOM: 2,
    LEFT: 3,
}

export class D3Diagram {
    constructor(svgTag, width, height, padding) {
        this.svg = d3.select(svgTag)
        this.svgTag = svgTag
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

    update(data) {        
        const [minX, maxX] = d3.extent(data, d => d[0]);
        const [minY, maxY] = d3.extent(data, d => d[1]);
        
        const xScale = d3.scaleLinear().domain([minX, maxX]).range([this.leftSide, this.rightSide]);
        const yScale = d3.scaleLinear().domain([minY, maxY]).range([this.bottomSide, this.topSide]);
        
        const line = d3.line()
            .x(d => xScale(d[0]))
            .y(d => yScale(d[1]));
    
        this.path
            .datum(data)
            .attr('d', line);
    
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);
    
        this.xAxisGroup
            .attr('transform', `translate(0,${this.bottomSide})`)
            .call(xAxis);
    
        this.yAxisGroup
            .attr('transform', `translate(${this.leftSide},0)`)
            .call(yAxis);
    }
}
