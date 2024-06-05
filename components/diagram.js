import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm'
import { loadComponent } from '../lib/fetch-template.js'
import { h } from '../vendor/vue.js'

const diagramConfig = {
    crosshairColor: 'red',
    dataColor: 'steelblue',
}

const PADDING_INDEX = {
    TOP: 0,
    RIGHT: 1,
    BOTTOM: 2,
    LEFT: 3,
}

class Diagram {
    constructor(svgTag, width, height, padding) {
        this.svg = d3.select(svgTag)
        this.svgTag = svgTag
        this.width = width
        this.height = height
        this.padding = padding

        this.svg.attr('width', width)
            .attr('height', height)
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
        console.log('update called', data.length, this.svgTag)
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

export default {
    template: await loadComponent(import.meta.url),
    data() {
        return {
            d: null,
        };
    },
    props: {
        points: {
            type: Array,
            required: true,
        },
        width: {
            type: Number,
            default: 500, // default value, adjust as needed
        },
        height: {
            type: Number,
            default: 500, // default value, adjust as needed
        },
        padding: {
            type: Array,
            default: [0, 0, 0, 0], // top, right, bottom, left
            validate: (val) => val.length === 4,
        },
    },
    mounted(){
        this.d = new Diagram(this.$refs.svgTag, this.width, this.height, this.padding)
        this.d.update(this.points)
    },
    watch: {
        points(newPoints) {
            this.d.update(newPoints)
        }
    },
}

