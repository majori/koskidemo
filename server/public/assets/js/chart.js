// Create crossfilter instance
var ndx = crossfilter();

// Create dimensions from data
var timeDim = ndx.dimension(function(d) {return d.time});
var guildDim = ndx.dimension(function(d) {return d.guild.name});

var depthGroup = timeDim.group().reduceSum(function(d) {return +d.depth});
var durationGroup = guildDim.group().reduceSum(function(d) {return d.guild.cnt});

// Initialize charts
var depthChart = dc.lineChart('#depth-chart');
var rankChart = dc.barChart('#rank-chart');

depthChart
    .width(300).height(200)
    .dimension(timeDim)
    .group(depthGroup)
    .x(d3.scale.linear().domain([0,0]))
    .renderArea(true)
    .brushOn(false)
    .elasticY(true)
    .xAxisLabel('Aika (s)')
    .yAxisLabel('Syvyys (mm)');

rankChart
    .width(300).height(200)
    .dimension(guildDim)
    .group(durationGroup)
    .x(d3.scale.ordinal())
    .xUnits(dc.units.ordinal)
    .brushOn(false)
    .xAxisLabel('Killat')
    .yAxisLabel('Kesto (s)')
    .barPadding(0.1)
    .outerPadding(0.05);

dc.renderAll();

