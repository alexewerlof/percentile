import { d3 } from '../vendor/d3.js'

const PADDING_INDEX = {
    TOP: 0,
    RIGHT: 1,
    BOTTOM: 2,
    LEFT: 3,
}

export class DiagramBase {
    constructor(width, height, padding) {
        this.width = width
        this.height = height
        this.padding = padding
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

    get viewBox() {
        return [0, 0, this.width, this.height].join(' ')
    }
}

export class D3Diagram extends DiagramBase {
    constructor(width, height, padding, isBarChart = false) {
        super(width, height, padding)
        this.isBarChart = isBarChart
    }

    mount(svgElement) {
        this.svg = d3.select(svgElement)

        this.svg.attr('viewBox', this.viewBox)
            .attr('width', this.width)
            .attr('height', this.height)
            .classed('diagram', true)

        // Placeholder for the data
        if (this.isBarChart) {
            // Placeholder for bar charts
            this.linesGroup = this.svg.append('g')
                .classed('diagram__bars', true)
        } else {
            // Placeholder for line charts
            this.path = this.svg.append('path')
                .classed('diagram__line', true)
        }

        // Create placeholder for the axes
        this.xAxisGroup = this.svg.append('g')
            .classed('diagram__axis diagram__axis--x', true)
            .attr('transform', `translate(0,${this.bottomSide})`)

        this.yAxisGroup = this.svg.append('g')
            .classed('diagram__axis diagram__axis--y', true)
            .attr('transform', `translate(${this.leftSide},0)`)

        // Create placeholder for the lines
        this.guideGroup = this.svg.append('g')
            .classed('diagram__guides', true)    
    }

    updateData(data, guides = []) {
        const xDataExtent = d3.extent(data, d => d[0])
        const yDataExtent = d3.extent(data, d => d[1])
        const yLinesExtent = d3.extent(guides, l => l.y)
        const yExtent = d3.extent([...yDataExtent, ...yLinesExtent])

        this.xScale.domain(xDataExtent)
        this.yScale.domain(yExtent)

        const xAxis = d3.axisBottom(this.xScale)
        const yAxis = d3.axisLeft(this.yScale)
    
        this.xAxisGroup.call(xAxis)
        this.yAxisGroup.call(yAxis)
        
        const x = 0
        if (this.isBarChart) {
            const lines = this.linesGroup
                .selectAll('line')
                .data(data)
                .join('line')
                .attr('x1', (d) => this.xScale(d[0]))
                .attr('x2', (d) => this.xScale(d[0]))
                .attr('y1', this.bottomSide)  // start at the bottom of the chart
                .attr('y2', d => this.yScale(d[1]))  // end at the data point
                .attr('class', 'diagram__bars')
                .append('title')
                .text((d, i) => `#${i}: [${d[0]}, ${d[1]}]`)
        } else {
            const line = d3.line()
                .x(d => this.xScale(d[0]))
                .y(d => this.yScale(d[1]))
        
            this.path
                .datum(data)
                .attr('d', line)
        }

        // Update the guide line group
        this.guideGroup
            .selectAll('g')
            .data(guides)
            .join(
                enter => {
                    const group = enter.append('g')
                        .classed('diagram__guide', true)
    
                    group.append('line')
                        .classed('diagram__guide-line', true)
                        .attr('x1', this.leftSide)
                        .attr('x2', this.rightSide)
                        .attr('y1', d => this.yScale(d.y))
                        .attr('y2', d => this.yScale(d.y))
    
                    group.append('text')
                        .classed('diagram__guide-title', true)
                        .attr('x', this.rightSide)
                        .attr('y', d => this.yScale(d.y))
                        .text(d => d.label)
    
                    return group
                },
                update => {
                    update.select('line')
                        .attr('y1', d => this.yScale(d.y))
                        .attr('y2', d => this.yScale(d.y))
    
                    update.select('text')
                        .attr('y', d => this.yScale(d.y))
                        .text(d => d.label)
    
                    return update
                },
                exit => exit.remove()
            )
    }
}
