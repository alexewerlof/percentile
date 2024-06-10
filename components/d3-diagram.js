import { d3 } from '../vendor/d3.js'
import { DiagramBase } from './diagram-base.js'

export class D3Diagram extends DiagramBase {
    constructor(svgElement, width, height, padding) {
        super(svgElement, width, height, padding)
    }

    update(data) {        
        const [minX, maxX] = d3.extent(data, d => d[0])
        const [minY, maxY] = d3.extent(data, d => d[1])
        
        this.xScale.domain([minX, maxX])
        this.yScale.domain([minY, maxY])

        super.update()
        
        const line = d3.line()
            .x(d => this.xScale(d[0]))
            .y(d => this.yScale(d[1]))
    
        this.path
            .datum(data)
            .attr('d', line);
    }
}
