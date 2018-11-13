const squar = squarify.default;

const DATASET = "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json";

const margin = {
    top: 100,
    right: 100,
    bottom: 100,
    left: 100
};
const h = 600,
    w = 960;

const xScale = d3.scaleLinear()
    .domain([0, Math.sqrt(1460)])
    .range([margin.left, w - margin.right]);

const yScale = d3.scaleLinear()
    .domain([0, Math.sqrt(1460)])
    .range([margin.top, h - margin.bottom]);

const container = {x0: xScale(0),
                   y0: yScale(0),
                   x1: xScale(Math.sqrt(1460)),
                   y1: yScale(Math.sqrt(1460))};

let tooltip = d3.select("#container")
    .append("div")
    .attr("id","tooltip");

let svg = d3.select("#container")
    .append("svg")
    .attr("height", h)
    .attr("width", w);

d3.json(DATASET).then(createMap);

function valToNumber(data){
    const children =  data.children.map((d) => {
        d.value = +d.value;
        return d;
    });
    data.children = children;
    return data;
}

function childrenValuesSum(dataItem){
    const sum = dataItem.children.map((i) => i.value)
          .reduce((agg,i) => agg + i);
    dataItem.value = sum;
    return dataItem;
}

function prepareData(data){
    console.log(data);
    data.children = data.children.map(valToNumber);
    console.log(data);
    data.children = data.children.map(childrenValuesSum);
    console.log(data);
    data = childrenValuesSum(data);
    console.log(data);

    return data;
}

const colors = ["#10BA62","#5F0E3B","#0F779F","#333333","#571D0D","#A67FA1","#8F6537","#D31724","#E22D60","#0B8C8F","#D2C8AF","#80BBA7","#6C7D99","#92AD66","#B6C16A","#AC1B2C","#F23C26","#093734"];

function createMap(data) {
    
    // svg.append("rect")
    //     .attr("width", xScale(Math.sqrt(1460)))
    //     .attr("height", yScale(Math.sqrt(1460)))
    //     .attr("fill","gray") ;

    data = prepareData(data);
    const transformedData = squar([data],container);
    console.log(transformedData);

    const categories = d3.set(transformedData.map((i) => i.category)).values();
    const colorScale = d3.scaleOrdinal(colors);

    svg.selectAll("rect")
        .data(transformedData)
        .enter()
        .append("rect")
        .attr("class","tile")
        .attr("x",(d) => d.x0)
        .attr("y",(d) => d.y0)
        .attr("width", (d) => d.x1 - d.x0)
        .attr("height",(d) => d.y1 - d.y0)
        .attr("fill",(d) => colorScale(categories.indexOf(d.category)))
        .attr("data-name",(d) => d.name)
        .attr("data-category", (d) => d.category)
        .attr("data-value", (d) => d.value)
        .on("mouseover", (d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity",1)
                .style("left", d.x0 + 10+ "px")
                .style("top", d.y0 + 10+"px");
            tooltip.attr("data-value",d.value)
                .html("<h1>"+d.name+"</h1>"
                      +"<h2>"+d.category+"</h2>"
                     +"<h3>"+d.value+"</h3>");
        })
        .on("mouseout", (d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity","0");
        });

    let legend = svg.append("g")
        .attr("id","legend")
        .attr("transform","translate("+margin.left+","+(h-margin.bottom + 20)+")");

    for (let i=0; i<= colors.length; i+=3){
        console.log(colors.slice(i,i+3));
        let grp = legend.append("g")
            .attr("transform","translate("+(i/3 * (w - margin.left - margin.right) / 6)+",0)");

        grp.selectAll("rect")
            .data(colors.slice(i,i+3))
            .enter()
            .append("rect")
            .attr("class","legend-item")
            .attr("fill",(d) => d)
            .attr("height",20)
            .attr("width",20)
            .attr("x",(d) => 0)
            .attr("y",(d,n) => n * 25);

        grp.selectAll("text")
            .data(colors.slice(i,i+3))
            .enter()
            .append("text")
            .text((d) => {
                const index = colors.indexOf(d);
                return categories[index];
            })
            .attr("x",(d) => 25)
            .attr("y",(d,n) => n * 25 + 15);
    }

}
