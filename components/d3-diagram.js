import { d3 } from '../vendor/d3.js'
import { DiagramBase } from '../lib/diagram-base.js'

export class D3Diagram extends DiagramBase {
    constructor(width, height, padding) {
        super(width, height, padding)
    }

    mount(svgElement) {
        this.svg = d3.select(svgElement)

        this.svg.attr('viewBox', this.viewBox)
            .attr('width', this.width)
            .attr('height', this.height)
            .classed('diagram', true)

        // Create the axes
        this.xAxisGroup = this.svg.append('g')
            .classed('diagram__axis diagram__axis--x', true)
            .attr('transform', `translate(0,${this.bottomSide})`)

        this.yAxisGroup = this.svg.append('g')
            .classed('diagram__axis diagram__axis--y', true)
            .attr('transform', `translate(${this.leftSide},0)`)      

        this.path = this.svg.append('path')
            .classed('diagram__line', true)
    }

    update(data) {
        const [minX, maxX] = d3.extent(data, d => d[0])
        const [minY, maxY] = d3.extent(data, d => d[1])
        
        this.xScale.domain([minX, maxX])
        this.yScale.domain([minY, maxY])

        const xAxis = d3.axisBottom(this.xScale)
        const yAxis = d3.axisLeft(this.yScale)
    
        this.xAxisGroup.call(xAxis)
        this.yAxisGroup.call(yAxis)
        
        const line = d3.line()
            .x(d => this.xScale(d[0]))
            .y(d => this.yScale(d[1]))
    
        this.path
            .datum(data)
            .attr('d', line)
    }
}
