import { loadComponent } from '../lib/fetch-template.js'
import { D3Diagram } from './d3-diagram.js'

export default {
    template: await loadComponent(import.meta.url),
    data() {
        return {
            d3d: null,
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
    },
    mounted(){
        this.d = new D3Diagram(this.$refs.svgTag, this.width, this.height, this.padding)
        this.d.update(this.points)
    },
    watch: {
        points(newPoints) {
            this.d.update(newPoints)
        }
    },
}

