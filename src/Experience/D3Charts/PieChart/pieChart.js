// define data
var dataset = [
  { label: "Building", count: 13 },
  { label: "Water", count: 83 },
  { label: "Tree", count: 1.4 },
  { label: "Sky", count: 2.3 },
];

export default class PieChart {
  constructor(id) {
    this.data = [];
  };
  createPieChart(id, data) {
    this.data = this.formatData(data)

    const chartElement = document.querySelector(`#chart${id}`)
    const tooltipElement = document.querySelector('.tooltip')
    var width = tooltipElement.clientWidth;
    var height = tooltipElement.clientHeight;

    console.log(width, height);

    // a circle chart needs a radius
    var radius = Math.min(width, height) / 2;

    // legend dimensions
    var legendRectSize = 25; // defines the size of the colored squares in legend
    var legendSpacing = 6; // defines spacing between squares

    var color = d3.scaleOrdinal(d3.schemeAccent);

    var svg = d3.select(`#chart${id}`) // select element in the DOM with id 'chart'
      .append('svg') // append an svg element to the element we've selected
      .attr('width', width) // set the width of the svg element we just added
      .attr('height', height) // set the height of the svg element we just added
      .append('g') // append 'g' element to the svg element
      .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')'); // our reference is now to the 'g' element. centerting the 'g' element to the svg element

    var arc = d3.arc()
      .innerRadius(0) // none for pie chart
      .outerRadius(radius); // size of overall chart

    var pie = d3.pie() // start and end angles of the segments
      .value((d) => { return d.count; }) // how to extract the numerical data from each entry in our dataset
      .sort(null); // by default, data sorts in oescending value. this will mess with our animation so we set it to null

    // define tooltip
    var tooltip = d3.select(`#chart${id}`)
      .append('div')
      .attr('class', 'tooltip')

    tooltip.append('div')
      .attr('class', 'label')

    tooltip.append('div')
      .attr('class', 'count')

    tooltip.append('div')
      .attr('class', 'percent')

    this.data.forEach((d) => {
      d.count = +d.count; // calculate count as we iterate through the data
      d.enabled = true; // add enabled property to track which entries are checked
    });

    // creating the chart
    var path = svg.selectAll('path') // select all path elements inside the svg. specifically the 'g' element. they don't exist yet but they will be created below
      .data(pie(this.data)) //associate dataset wit he path elements we're about to create. must pass through the pie function. it magically knows how to extract values and bakes it into the pie
      .enter() //creates placeholder nodes for each of the values
      .append('path') // replace placeholders with path elements
      .attr('d', arc) // define d attribute with arc function above
      .attr('fill', (d) => { return color(d.data.label); }) // use color scale to define fill of each label in dataset
      .each((d) => { this._current - d; }); // creates a smooth animation for each track

    // mouse event handlers are attached to path so they need to come after its definition
    path.on('mouseover', (event, d) => {
      var total = d3.sum(this.data.map((d) => { // calculate the total number of tickets in the dataset         
        return (d.enabled) ? d.count : 0; // checking to see if the entry is enabled. if it isn't, we return 0 and cause other percentages to increase                                      
      }));
      var percent = Math.round(1000 * d.data.count / total) / 10; // calculate percent
      tooltip.select('.label').html(d.data.label); // set current label           
      tooltip.select('.percent').html(percent + '%'); // set percent calculated above          
      tooltip.style('display', 'block'); // set display                     
    });

    path.on('mouseout', () => { // when mouse leaves div                        
      tooltip.style('display', 'none'); // hide tooltip for that element
    });

    path.on('mousemove', (event, d) => { // when mouse moves   
      tooltip
        .style('top', (event.clientY + 10) + 'px') // always 10px below the cursor
        .style('left', (event.clientX + 10) + 'px'); // always 10px to the right of the mouse
    });

    // define legend
    var legend = svg.selectAll('.legend') // selecting elements with class 'legend'
      .data(color.domain()) // refers to an array of labels from our dataset
      .enter() // creates placeholder
      .append('g') // replace placeholders with g elements
      .attr('class', 'legend') // each g is given a legend class
      .attr('transform', (d, i) => {
        var height = legendRectSize + legendSpacing; // height of element is the height of the colored square plus the spacing      
        var offset = height * color.domain().length / 2; // vertical offset of the entire legend = height of a single element & half the total number of elements  
        var horz = 18 * legendRectSize; // the legend is shifted to the left to make room for the text
        var vert = i * height - offset; // the top of the element is hifted up or down from the center using the offset defiend earlier and the index of the current element 'i'               
        return 'translate(' + horz + ',' + vert + ')'; //return translation       
      });

    // adding colored squares to legend
    legend.append('rect') // append rectangle squares to legend                                   
      .attr('width', legendRectSize) // width of rect size is defined above                        
      .attr('height', legendRectSize) // height of rect size is defined above                      
      .style('fill', color) // each fill is passed a color
      .style('stroke', color) // each stroke is passed a color
      .on('click', (label) => {
        var rect = d3.select(this); // this refers to the colored squared just clicked
        var enabled = true; // set enabled true to default
        var totalEnabled = d3.sum(this.data.map((d) => { // can't disable all options
          return (d.enabled) ? 1 : 0; // return 1 for each enabled entry. and summing it up
        }));

        if (rect.attr('class') === 'disabled') { // if class is disabled
          rect.attr('class', ''); // remove class disabled
        } else { // else
          if (totalEnabled < 2) return; // if less than two labels are flagged, exit
          rect.attr('class', 'disabled'); // otherwise flag the square disabled
          enabled = false; // set enabled to false
        }

        pie.value((d) => {
          if (d.label === label) d.enabled = enabled; // if entry label matches legend label
          return (d.enabled) ? d.count : 0; // update enabled property and return count or 0 based on the entry's status
        });

        path = path.data(pie(this.data)); // update pie with new data

        path.transition() // transition of redrawn pie
          .duration(750) // 
          .attrTween('d', (d) => { // 'd' specifies the d attribute that we'll be animating
            var interpolate = d3.interpolate(this._current, d); // this = current path element
            this._current = interpolate(0); // interpolate between current value and the new value of 'd'
            return (t) => {
              return arc(interpolate(t));
            };
          });
      });

    // adding text to legend
    legend.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text((d) => { return d; }); // return label
  }
  resetPieChart(id) {
    // this.data = [];

    d3.select(`#chart${id}`).selectAll("*").remove();
  }
  formatData(data) {
    let tempData = [];
    
    for(const key in data) {
      tempData.push({
        "label": [key.trim()],
        "count": data[key] * 100
      })
    }
    return tempData
  }
}