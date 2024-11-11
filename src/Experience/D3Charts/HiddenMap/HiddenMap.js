import { SeekBehavior } from "yuka";
import Experience from "../../Experience";
import ParticleHelper from "../../Utils/ParticleHelper";
import { pxStringToInt } from "../../Utils/helpers";

// Global Variables
let global_locations = [];
let selected_locations = [];
let global_query_locations = [];
let selected_query_locations = [];

// const margin = { top: 20, right: 20, bottom: 40, left: 40 },
//       width = 800 - margin.left - margin.right,
//       height = 600 - margin.top - margin.bottom;
const margin = { top: 10, right: 10, bottom: 20, left: 80 },
    width = 500 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;


const xScale = d3.scaleLinear().range([0, width]);
const yScale = d3.scaleLinear().range([height, 0]);
let coordName = "UMAP"; // Change this to the appropriate field in your data

let colorGlobal = "seagreen";
let colorSelectedGlobal = "aquamarine";
let colorQuery = "darkorange";
let colorSelectedQuery = "firebrick";


export default class HiddenMap {
    constructor() {
        this.experience = new Experience();
        this.particleHelper = new ParticleHelper();
        this.svg = undefined;
    };

    createHiddenMap() { // Should receive global data and query data.

        //  d3.json("test_set_as_query.json").then(data => {
        d3.json("test_set_as_query_full_semantics.json").then(data => {

            global_locations = data;
            selected_locations = global_locations;

            this.displayGlobalLocations();

            console.log("Populating hidden map with ", global_locations.length, " locations.")



            const svg = d3.select("#HiddenMap")
                .append("svg")
                // .attr("width", width + margin.left + margin.right)
                // .attr("height", height + margin.top + margin.bottom)
                .attr("width", "90%")
                .attr("height", "90%")
                .append("g")
                .attr("transform", `translate(20,20)`);
            // .attr("transform", `translate(${margin.left},${margin.top})`);
            console.log("svg", svg)
            const heatData = data.map(d => d[coordName]);


            const xAxis = svg.append("g").attr("transform", `translate(0, ${height})`);
            const yAxis = svg.append("g");

            xScale.domain(d3.extent(heatData, d => d[0]));
            yScale.domain(d3.extent(heatData, d => d[1]));

            xAxis.call(d3.axisBottom(xScale));
            yAxis.call(d3.axisLeft(yScale));

            // Create heatmap points
            svg.selectAll(".heat-point")
                .data(heatData)
                .enter()
                .append("circle")
                .attr("class", "heat-point")
                .attr("cx", d => xScale(d[0]))
                .attr("cy", d => yScale(d[1]))
                .attr("r", 4)
                .style("fill", colorGlobal)
                .style("opacity", 0.5);

            // Add selection brush
            const brush = d3.brush()
                .extent([[0, 0], [width, height]])
                .on("start brush", brushed)
                .on("end", (e) => {
                    console.log(e);
                    this.brushEnded(e)
                });

            svg.call(brush);

            function brushed(event) {
                const selection = event.selection;
                console.log("Selection computed in brushed()", selection);

                if (!selection) {
                    // Reset selection
                    // selected_locations = [];
                    // selected_query_locations = [];
                    svg.selectAll(".heat-point")
                        .style("fill", colorGlobal)
                        .style("opacity", 0.6);
                    svg.selectAll(".scatter-point")
                        .style("fill", colorQuery)
                        .style("opacity", 0.9);
                    return;
                }

                const [[x0, y0], [x1, y1]] = selection;
                // selected_locations = [];
                // selected_query_locations = [];

                // Update selected points for heatmap (data.json)
                svg.selectAll(".heat-point")
                    .style("fill", colorGlobal)
                    .style("opacity", 0.6)
                    .filter(d => {
                        const x = xScale(d[0]);
                        const y = yScale(d[1]);
                        return x0 <= x && x <= x1 && y0 <= y && y <= y1;
                    })
                    .style("fill", colorSelectedGlobal)
                    .style("opacity", 0.7);
                // .each(d => selected_locations.push(d));

                // console.log("Selected Heatmap Points:", selected_locations);

                // Update selected points for scatter plot (query.json)
                svg.selectAll(".scatter-point")
                    .style("fill", colorQuery)
                    .style("opacity", 0.9)
                    .filter(d => {
                        const x = xScale(d[0]);
                        const y = yScale(d[1]);
                        return x0 <= x && x <= x1 && y0 <= y && y <= y1;
                    })
                    .style("fill", colorSelectedQuery)
                    .style("opacity", 0.9);
                // .each(d => selected_query_locations.push(d));

                // console.log("Selected Scatter Plot Points:", selected_query_locations);
            }
            // Function for custom scatter plot marker shape


            // Load query.json for scatter plot
            d3.json("small_query.json").then(queryData => {
                this.queryPoints = queryData.map(d => d[coordName]);
                global_query_locations = queryData;
                // Use a custom shape for scatter plot points (e.g., square)
                svg.selectAll(".scatter-point")
                    .data(this.queryPoints)
                    .enter()
                    .append("path")
                    .attr("class", "scatter-point")
                    .attr("d", d => this.customShape(xScale(d[0]), yScale(d[1])))
                    .style("fill", colorQuery)
                    .style("opacity", 0.9);
            });
        });


        // await 
        // this.displayGlobalLocations();

    };

    customShape(x, y) {
        // 'x' shape for scatter points
        const size = 6;
        // return `M${x - size},${y - size} L${x + size},${y + size} M${x + size},${y - size} L${x - size},${y + size}`;
        return `M${x},${y - size} L${x - size},${y + size} L${x + size},${y + size} Z`; //triangle
        // return `M${x - size},${y - size} L${x + size},${y - size} L${x + size},${y + size} L${x - size},${y + size} Z`;
        // Uncomment the following lines to switch to triangles or squares
        // For triangle: `M${x},${y - size} L${x - size},${y + size} L${x + size},${y + size} Z`;
        // For square: `M${x - size},${y - size} L${x + size},${y - size} L${x + size},${y + size} L${x - size},${y + size} Z`;
    }

    renderQueryOnHiddenMap(queryData) {
        
        const svg = d3.select("#HiddenMap").selectAll("svg");
        // const queryPoints = this.particleHelper.lastResult.map(d => d[coordName]);
        const queryPoints = queryData.map(d => d[coordName]);
        console.log("queryPoints", coordName, " features:\n", queryPoints)
        console.log("svg in render", svg)

        global_query_locations = queryData;
        svg.selectAll(".scatter-point").remove();
        
        // Use a custom shape for scatter plot points (e.g., square)
        svg.selectAll(".scatter-point")
            .data(queryPoints)
            .enter()
            .append("path")
            .attr("class", "scatter-point")
            .attr("d", d => this.customShape(xScale(d[0]), yScale(d[1])))
            .style("fill", colorQuery)
            .style("opacity", 0.9);
    }

    displayGlobalLocations() {
        console.log("displaying ", selected_locations.length, " locations")
        console.log("Selected locations:", selected_locations); // For debugging purposes
        this.experience.queryLocationParticles = this.particleHelper.plotParticlesWithDirection(selected_locations)
        this.experience.world.updatePovInterfaceAfterBrushOnHistogram(selected_locations)
    };

    resetHeatMap() {
        // Reset the selected locations to the full global locations
        // selected_locations = [];
        // global_locations   = [];

        selected_locations = global_locations;

        // Clear any existing brush selections on the histogram
        d3.select("#HiddenMap .brush").call(d3.brushX().clear);

        // Redraw the histogram with the original data
        d3.select("#HiddenMap").selectAll("*").remove();
        // createHistogram(global_locations);

        // Optionally, reset the parallel coordinates as well
        // updateParallelCoordinates();
    }

    brushEnded(event) {
        const [[x0, y0], [x1, y1]] = event.selection;
        // const [x0, x1] = event.selection.map(xScale.invert);
        // const [y0, y1] = event.selection.map(yScale.invert);

        console.log("Brushing event ended...")
        console.log("Selection coordinates:", event.selection);
        if (!event.selection) {
            // selected_locations = [];//global_locations;
            selected_locations = global_locations;
            selected_query_locations = global_query_locations;
        } else {

            selected_locations = global_locations.filter(d => {
                const x = xScale(d[coordName][0]);
                const y = yScale(d[coordName][1]);
                return x0 <= x && x <= x1 && y0 <= y && y <= y1;
            });
            selected_query_locations = global_query_locations.filter(d => {
                const x = xScale(d[coordName][0]);
                const y = yScale(d[coordName][1]);
                return x0 <= x && x <= x1 && y0 <= y && y <= y1;
            });
        }
        console.log("Selected Heatmap Points:", selected_locations);
        console.log("Selected Query Points:", selected_query_locations);

        if (false) {//(selected_query_locations.length > 5){
            this.experience.queryLocationParticles = this.particleHelper.plotParticlesWithDirection(selected_query_locations)
            this.experience.world.updatePovInterfaceAfterBrushOnHistogram(selected_query_locations)
        }
        else {
            selected_locations = selected_locations
                .map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value);

            this.experience.queryLocationParticles = this.particleHelper.plotParticlesWithDirection(selected_locations)
            
            // let povStyleLocations = {data: selected_locations}
            let povStyleLocations = {data: selected_query_locations}
            
            this.experience.world.updatePovInterfaceAfterBrushOnHistogram(povStyleLocations)
            // this.experience.world.updatePovInterfaceAfterBrushOnHistogram(selected_query_locations);
            console.log(selected_locations); // For debugging purposes
        }
    }

}