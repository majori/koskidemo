// Create crossfilter instance
var measurementFilter = crossfilter();
var rankFilter = crossfilter();

// Create dimensions from data
var timeDim = measurementFilter.dimension(function(d) {return d.time});
var guildDim = rankFilter.dimension(function(d) {return d.guildName});
var basketDim = rankFilter.dimension(function(d) {return d.guildName + '#' + d.basket});

var depthGroup = timeDim.group().reduceSum(function(d) {return d.depth});
var durationByGuild = guildDim.group().reduceSum(function(d) { return +d.time }); // Y-axis don't work properly
var durationByBasket = basketDim.group().reduceSum(function(d) { return +d.time });

// Initialize charts
var depthChart = dc.lineChart('#depth-chart');
var rankChart = dc.barChart('#rank-chart');

depthChart
    .width(document.getElementById('depth-chart-div').offsetWidth)
    .height(200)
    .dimension(timeDim)
    .group(depthGroup)
    .x(d3.scale.linear().domain([0,0]))
    .renderArea(true)
    .brushOn(false)
    .elasticY(true)
    .xAxisLabel('Aika (s)')
    .yAxisLabel('Syvyys (mm)');

rankChart
    .width(document.getElementById('rank-chart-div').offsetWidth)
    .height(200)
    .dimension(guildDim)
    .group(durationByGuild)
    .x(d3.scale.ordinal())
    .xUnits(dc.units.ordinal)
    .brushOn(false)
    .xAxisLabel('Killat')
    .yAxisLabel('Kesto (s)')
    .elasticY(true)
    .barPadding(0.1)
    .outerPadding(0.05);


dc.renderAll();

window.onresize = function(event) {
    var newDepthWidth = document.getElementById('depth-chart-div').offsetWidth;
    var newRankWidth = document.getElementById('rank-chart-div').offsetWidth;

    depthChart.width(newDepthWidth).transitionDuration(0);
    rankChart.width(newRankWidth).transitionDuration(0);

    dc.renderAll();

    depthChart.transitionDuration(750);
    rankChart.transitionDuration(750);
};
