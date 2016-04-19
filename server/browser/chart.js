const forEach   = require('lodash/forEach');
const dc        = require('dc');

var graph = {
    dc: dc,
    filters: {},
    dimensions: {},
    groups: {},
    charts: {}
};

// Decide colors for both charts
var chartColors = {
    red: ["#a60000","#ff0000", "#ff4040","#ff7373","#67e667","#39e639","#00cc00"],
    blue: ['rgb(39,48,215)', 'rgb(67,109,244)', 'rgb(97,174,253)', 'rgb(144,224,254)']
};

// Process red and blue depth chart
forEach(['red', 'blue'], function (color) {

    graph.filters[color + 'MeasurementFilter'] = graph.dc.crossfilter();

    graph.dimensions[color+'TimeDim'] = graph.filters[color+'MeasurementFilter'].dimension(function(d) {return d.time});

    graph.groups[color+'DepthGroup'] = graph.dimensions[color+'TimeDim'].group().reduceSum(function(d) {return d.depth});

    graph.charts[color+'DepthChart'] = graph.dc.lineChart('#'+color+'-depth-chart');

    graph.charts[color+'DepthChart']
        .width(document.getElementById(color+'-depth-chart-div').offsetWidth * 0.9)
        .height(200)
        .dimension(graph.dimensions[color+'TimeDim'])
        .group(graph.groups[color+'DepthGroup'])
        .x(graph.dc.d3.scale.linear().domain([0,0]))
        .renderArea(true)
        .brushOn(false)
        .elasticY(true)
        .xAxisLabel('Aika (s)')
        .yAxisLabel('Syvyys (mm)')
        .colors(chartColors[color]);
})

// Process rank chart
graph.filters.rankFilter = graph.dc.crossfilter();
graph.dimensions.guildDim = graph.filters.rankFilter.dimension(function(d) {return d.guildName});
graph.dimensions.basketDim = graph.filters.rankFilter.dimension(function(d) {return d.guildName + '#' + d.basket});
graph.groups.durationByGuild = graph.dimensions.guildDim.group().reduceSum(function(d) { return +d.time }); // Y-axis don't work properly
graph.groups.durationByBasket = graph.dimensions.basketDim.group().reduceSum(function(d) { return +d.time });

graph.charts.rankChart = graph.dc.barChart('#rank-chart');
graph.charts.rankChart
    .width(document.getElementById('rank-chart-div').offsetWidth * 0.9)
    .height(200)
    .dimension(graph.dimensions.guildDim)
    .group(graph.groups.durationByGuild)
    .x(graph.dc.d3.scale.ordinal())
    .xUnits(graph.dc.units.ordinal)
    .brushOn(false)
    .xAxisLabel('Killat')
    .yAxisLabel('Kesto (s)')
    .elasticY(true)
    .barPadding(0.1)
    .outerPadding(0.05);

// Render all charts
graph.dc.renderAll();

window.onresize = function(event) {

    // Resize charts and do it fast
    forEach(['red', 'blue'], function (color) {
        graph.charts[color+'DepthChart']
            .width(document.getElementById(color+'-depth-chart-div').offsetWidth * 0.9)
            .transitionDuration(0);
    });
    graph.charts.rankChart
    .width(document.getElementById('rank-chart-div').offsetWidth * 0.9)
    .transitionDuration(0);

    graph.dc.renderAll();

    // Make charts smooth again
    forEach(['red', 'blue'], function (color) {
        graph.charts[color+'DepthChart']
        .transitionDuration(750);
    });
    graph.charts.rankChart.transitionDuration(750);

};

module.exports = graph;
