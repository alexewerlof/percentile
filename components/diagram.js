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
            default: 500, // default value, adjust as needed
        },
        height: {
            type: Number,
            default: 500, // default value, adjust as needed
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
    },
    mounted() {
        this.d3d.mount(this.$refs.svgElement)
        this.d3d.update(this.points)
    },
    watch: {
        points(newPoints) {
            this.d3d.update(newPoints)
        }
    },
}

