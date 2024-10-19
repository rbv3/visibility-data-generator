import Experience from "../../Experience";
import ParticleHelper from "../../Utils/ParticleHelper";
import { pxStringToInt } from "../../Utils/helpers";

let global_locations = [];
let selected_locations = [];

export default class Histogram {
    constructor() {
        this.experience = new Experience();
        this.particleHelper = new ParticleHelper()
    };
    createHistogram(data) {
        console.log("Creating histogram...", data)

        global_locations = data;
        selected_locations = data;

        const svg = d3.select(".residualsGraph");
        
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = +pxStringToInt(svg.style("width")) - margin.left - margin.right;
        const height = +pxStringToInt(svg.style("height")) - margin.top - margin.bottom;
        
        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);


        const x = d3.scaleLinear()
            .domain([0, 0.6])
            .rangeRound([0, width]);

        const bins = d3.histogram()
            .domain(x.domain())
            .thresholds(x.ticks(20))
            (data.map(d => d.residual));

        const y = d3.scaleLinear()
            .domain([0, d3.max(bins, d => d.length)])
            .range([height, 0]);

        const bar = g.selectAll(".bar")
            .data(bins)
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", d => `translate(${x(d.x0)},${y(d.length)})`);

        bar.append("rect")
            .attr("x", 1)
            .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
            .attr("height", d => height - y(d.length))
            .attr("class", "bar");

        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(5));

        g.append("g")
            .attr("class", "brush")
            .call(d3.brushX()
                .extent([[0, 0], [width, height]])
                .on("brush end", (e) => {
                    console.log(e);
                    this.brushEnded(e, x)
                }));
    }
    
    resetHistogram() {
        // Reset the selected locations to the full global locations
        selected_locations = [];
        global_locations   = [];
    
        // Clear any existing brush selections on the histogram
        d3.select(".residualsGraph .brush").call(d3.brushX().clear);
    
        // Redraw the histogram with the original data
        d3.select(".residualsGraph").selectAll("*").remove();
        // createHistogram(global_locations);
        
        // Optionally, reset the parallel coordinates as well
        // updateParallelCoordinates();
    }

    brushEnded(event, x) {
        if (!event.selection) {
            selected_locations = global_locations;
        } else {
            const [x0, x1] = event.selection.map(x.invert);
            selected_locations = global_locations.filter(d => d.residual >= x0 && d.residual <= x1);
        }
        this.experience.queryLocationParticles = this.particleHelper.plotParticlesWithDirection(selected_locations)
        this.experience.world.updatePovInterfaceAfterBrushOnHistogram(selected_locations)
        console.log(selected_locations); // For debugging purposes
    }
}
