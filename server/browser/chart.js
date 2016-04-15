var dc  = require('dc');

// Create crossfilter instance
var measurementFilter = dc.crossfilter();
var rankFilter = dc.crossfilter();

// Red basket depth data
var redTimeDim = measurementFilter.dimension(function(d) {return d.time});
var redDepthGroup = redTimeDim.group().reduceSum(function(d) {return d.depth});

// Blue basket depth data
var blueTimeDim = measurementFilter.dimension(function(d) {return d.time});
var blueDepthGroup = blueTimeDim.group().reduceSum(function(d) {return d.depth});

// Rank dimensions
var guildDim = rankFilter.dimension(function(d) {return d.guildName});
var basketDim = rankFilter.dimension(function(d) {return d.guildName + '#' + d.basket});

// Rank groups
var durationByGuild = guildDim.group().reduceSum(function(d) { return +d.time }); // Y-axis don't work properly
var durationByBasket = basketDim.group().reduceSum(function(d) { return +d.time });

// Initialize charts
var redDepthChart = dc.lineChart('#red-depth-chart');
var blueDepthChart = dc.lineChart('#blue-depth-chart');
var rankChart = dc.barChart('#rank-chart');

redDepthChart
    .width(document.getElementById('red-depth-chart-div').offsetWidth - 20)
    .height(200)
    .dimension(redTimeDim)
    .group(redDepthGroup)
    .x(dc.d3.scale.linear().domain([0,0]))
    .renderArea(true)
    .brushOn(false)
    .elasticY(true)
    .xAxisLabel('Aika (s)')
    .yAxisLabel('Syvyys (mm)')
    .colors(["#a60000","#ff0000", "#ff4040","#ff7373","#67e667","#39e639","#00cc00"]);


blueDepthChart
    .width(document.getElementById('blue-depth-chart-div').offsetWidth - 20)
    .height(200)
    .dimension(blueTimeDim)
    .group(blueDepthGroup)
    .x(dc.d3.scale.linear().domain([0,0]))
    .renderArea(true)
    .brushOn(false)
    .elasticY(true)
    .xAxisLabel('Aika (s)')
    .yAxisLabel('Syvyys (mm)');

rankChart
    .width(document.getElementById('rank-chart-div').offsetWidth - 20)
    .height(200)
    .dimension(guildDim)
    .group(durationByGuild)
    .x(dc.d3.scale.ordinal())
    .xUnits(dc.units.ordinal)
    .brushOn(false)
    .xAxisLabel('Killat')
    .yAxisLabel('Kesto (s)')
    .elasticY(true)
    .barPadding(0.1)
    .outerPadding(0.05);


dc.renderAll();

window.onresize = function(event) {
    var newRedDepthWidth = document.getElementById('red-depth-chart-div').offsetWidth;
    var newBlueDepthWidth = document.getElementById('blue-depth-chart-div').offsetWidth;
    var newRankWidth = document.getElementById('rank-chart-div').offsetWidth;

    redDepthChart.width(newRedDepthWidth).transitionDuration(0);
    blueDepthChart.width(newBlueDepthWidth).transitionDuration(0);
    rankChart.width(newRankWidth).transitionDuration(0);

    dc.renderAll();

    redDepthChart.transitionDuration(750);
    blueDepthChart.transitionDuration(750);
    rankChart.transitionDuration(750);
};

module.exports = {
    dc: dc,
    filters: {
        measurementFilter: measurementFilter,
        rankFilter: rankFilter
    },
    dimensions: {
        redTimeDim: redTimeDim,
        blueTimeDim: blueTimeDim,
        guildDim: guildDim,
        basketDim: basketDim
    },
    groups: {
        redDepthGroup: redDepthGroup,
        blueDepthGroup: blueDepthGroup,
        durationByGuild: durationByGuild,
        durationByBasket: durationByBasket
    },
    charts: {
        redDepthChart: redDepthChart,
        blueDepthChart: blueDepthChart,
        rankChart: rankChart
    }
};
