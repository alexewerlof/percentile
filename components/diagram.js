import { loadComponent } from '../lib/fetch-template.js'
import { D3Diagram } from './d3-diagram.js'

export default {
    template: await loadComponent(import.meta.url),
    data() {
        return {
            d3d: new D3Diagram(this.width, this.height, this.padding, this.isBarChart),
        };
    },
    props: {
        points: {
            type: Array,
            required: true,
        },
        width: {
            type: Number,
            default: 1000, // default value, adjust as needed
        },
        height: {
            type: Number,
            default: 300, // default value, adjust as needed
        },
        padding: {
            type: Array,
            default: [0, 0, 0, 0], // top, right, bottom, left
            validate: (val) => val.length === 4 && val.every(v => typeof v === 'number'),
        },
        isBarChart: {
            type: Boolean,
            default: false,
        },
        axisTitleX: {
            type: String,
            default: 'x',
        },
        axisTitleY: {
            type: String,
            default: 'y',
        },
        guides: {
            type: Array,
            default: () => [],
            validate: (val) => val.every(v => typeof v.y === 'number' && typeof v.label === 'string'),
        },
    },
    mounted() {
        this.d3d.mount(this.$refs.svgElement)
        this.d3d.updateData(this.points, this.guides)
        this.d3d.updateAxisTitleX(this.axisTitleX)
        this.d3d.updateAxisTitleY(this.axisTitleY)
    },
    watch: {
        points(newPoints) {
            this.d3d.updateData(newPoints, this.guides)
        },
        guides(newGuides) {
            this.d3d.updateData(this.points, newGuides)
        },
        axisTitleX(newTitle) {
            this.d3d.updateAxisTitleX(newTitle)
        },
        axisTitleY(newTitle) {
            this.d3d.updateAxisTitleY(newTitle)
            console.log(newTitle)
        },
    },
}

