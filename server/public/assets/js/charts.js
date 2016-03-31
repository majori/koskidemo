// Create crossfilter instance
var ndx = crossfilter();

var timeDim = ndx.dimension(function(d) { return d.time});

// Create dimensions from data
var timeGroup = timeDim.group();
var depthGroup = timeGroup.reduceSum(function(d) {return d.depth});

var depthChart = dc.lineChart('#depth-chart');

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

var socket = io.connect('http://localhost:3101');

socket.on('measurement', function (packet) {

    // Update chart data and parameters
    ndx.add([packet]);
    depthChart.x(d3.scale.linear().domain([0,packet.time]));

    // Update values on browser
    document.getElementById('guild-name').innerHTML = packet.guild.name;
    document.getElementById('basket-number').innerHTML = '(' + packet.guild.basket + ')';
    depthDisplay.setValue(_.padStart(String(packet.depth), 5));
    // Redraw charts
    dc.redrawAll();
});

socket.on('reset_chart', function() {

    // Delete current data
    ndx.remove();

    startTime = 0;
    depthChart.x(d3.scale.linear().domain([0,0]));
    dc.redrawAll();
});

dc.renderAll();

