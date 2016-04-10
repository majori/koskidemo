var padStart    = require('lodash/padStart');
var graph          = require('./chart');
var segment     = require('./segment');
var cfg         = require('../../config');

var socket      = require('socket.io-client')('http://' + cfg.httpAddress + ':' + cfg.ioPort);

socket.on('measurement', function (packet) {

    // Update chart data and parameters
    graph.filters.measurementFilter.add([packet]);
    graph.charts.depthChart.x(graph.dc.d3.scale.linear().domain([0,packet.time]));

    // Update segment displays
    segment.depthDisplay.setValue(padStart(String(packet.depth), 5));
    segment.waterDisplay.setValue(padStart(String(packet.waterTemperature), 5));
    segment.airDisplay.setValue(padStart(String(packet.airTemperature), 5));

    // Calculate how long basket has been in the water
    var minutes = Math.floor(+packet.time / 60);
    var seconds = +packet.time - minutes * 60;
    var value = ((minutes < 10) ? ' ' : '') + minutes + ':' + ((seconds < 10) ? '0' : '') + seconds;
    segment.timeDisplay.setValue(value);

    // Redraw charts
    graph.charts.depthChart.redraw();
});

socket.on('guild', function(packet) {

    // If there is already record in crossfilter with this basket,
    // update it instead of adding a new record
    graph.dimensions.basketDim.filter(packet.guildName + '#' + packet.basket);
    var selectedEntry = graph.dimensions.basketDim.top(1)[0];
    if (selectedEntry) {
        selectedEntry.time = packet.time;
        graph.filters.rankFilter.remove();
        graph.filters.rankFilter.add([selectedEntry]);

    // It was a new basket, add it to records
    } else {

        // Add record to crossfilter
        graph.filters.rankFilter.add([packet]);

        // Update rank-chart x-axis
        graph.charts.rankChart.x(graph.dc.d3.scale.ordinal());

        // Update new guild name and basket to header
        document.getElementById('guild-name').innerHTML = packet.guildName;
        document.getElementById('basket-number').innerHTML = (packet.basket) ? 'kori ' + packet.basket : '';

    }
    graph.dimensions.basketDim.filter(null);

    // Redraw chart
    graph.charts.rankChart.redraw();

    // Update leaderboard
    var top5 = graph.groups.durationByBasket.top(5);
    for (i=0;i<5;i++) {
        if (top5[i]) {
            document.getElementById(String(i+1)+'-rank-name').innerHTML = top5[i].key;
            document.getElementById(String(i+1)+'-rank-time').innerHTML = top5[i].value.toFixed(0);
        }
    }
});

// Reset measurement related data
socket.on('reset-data', function() {

    // Delete current data
    graph.filters.measurementFilter.remove();

    // Reset depth-chart axis
    graph.charts.depthChart.x(graph.dc.d3.scale.linear().domain([0,0]));

    // Reset displays
    segment.depthDisplay.setValue('---.-');
    segment.waterDisplay.setValue('---.-');
    segment.airDisplay.setValue('---.-');
    segment.timeDisplay.setValue(' 0:00');

    // Redraw chart
    graph.charts.depthChart.redraw();
});

// Reset rank related data
socket.on('reset-rank', function() {
    graph.filters.rankFilter.remove();
    graph.charts.rankChart.x(graph.dc.d3.scale.ordinal())
    graph.charts.rankChart.redraw();

    for (i=0;i<5;i++) {
        document.getElementById(String(i+1)+'-rank-name').innerHTML = '';
        document.getElementById(String(i+1)+'-rank-time').innerHTML = '';
    }
});

socket.on('initialize_measurements', function(packet) {
    graph.filters.measurementFilter.add(packet);
    graph.charts.depthChart.x(graph.dc.d3.scale.linear().domain([0,graph.dimensions.timeDim.top(1)[0].time]));

    graph.charts.depthChart.redraw();
});

socket.on('initialize_ranks', function(packet) {
    graph.filters.rankFilter.add(packet);

    graph.charts.rankChart.redraw();
});
