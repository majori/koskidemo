const padStart  = require('lodash/padStart');
const forEach   = require('lodash/forEach');
const graph     = require('./chart');
const segment   = require('./segment');

const socket      = require('socket.io-client')('http://' + '/*@echo KOSKIOTUS_HTTP_SERVER_ADDRESS*/' + ':' + '/*@echo KOSKIOTUS_IO_PORT*/');

socket.on('measurement', function (packet) {

    // Calculate how long basket has been in the water
    var timer = formatTimerFromSeconds(+packet.time);

    var color = (packet.isRed) ? 'red' : 'blue';

    // Update chart data and parameters
    graph.filters[color + 'MeasurementFilter'].add([packet]);
    graph.charts[color + 'DepthChart'].x(graph.dc.d3.scale.linear().domain([0,packet.time]));
    segment[color + 'DepthDisplay'].setValue(padStart(String(packet.depth), 5));
    segment[color + 'TimeDisplay'].setValue(timer);
    graph.charts[color + 'DepthChart'].redraw();

    // Update segment displays
    segment.waterDisplay.setValue(padStart(String(packet.waterTemperature), 5));
    segment.airDisplay.setValue(padStart(String(packet.airTemperature), 5));

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

        var color = (packet.isRed) ? 'red' : 'blue';

        // Update new guild name and basket to header
        document.getElementById(color + '-guild-name').innerHTML = packet.guildName;
        document.getElementById(color + '-basket-number').innerHTML = (packet.basket) ? 'kori ' + packet.basket : '';

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

// Reset red measurement data
socket.on('reset-red', function() {
    resetData('red');
});

// Reset blue measurement data
socket.on('reset-blue', function() {
    resetData('blue');
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

    forEach(['red','blue'], function(color) {

        graph.filters[color + 'MeasurementFilter'].add(packet[color]);

        var maxTime = (graph.dimensions[color + 'TimeDim'].top(1)[0]) ? graph.dimensions[color + 'TimeDim'].top(1)[0].time : 0;

        graph.charts[color + 'DepthChart'].x(graph.dc.d3.scale.linear().domain([0,maxTime]));

        var timerValue = formatTimerFromSeconds(maxTime);
        segment[color + 'TimeDisplay'].setValue(timerValue);

        graph.charts[color + 'DepthChart'].redraw();
    });
});

socket.on('initialize_ranks', function(packet) {
    graph.filters.rankFilter.add(packet);

    graph.charts.rankChart.redraw();
});

function resetData(color) {

    // Delete current data
    graph.filters[color + 'MeasurementFilter'].remove();

    // Reset depth-chart axis
    graph.charts[color + 'DepthChart'].x(graph.dc.d3.scale.linear().domain([0,0]));

    // Reset displays
    segment[color + 'DepthDisplay'].setValue('---.-');
    segment[color + 'TimeDisplay'].setValue(' 0:00');
    segment.waterDisplay.setValue('---.-');
    segment.airDisplay.setValue('---.-');

    // Redraw chart
    graph.charts[color + 'DepthChart'].redraw();
}

function formatTimerFromSeconds(seconds) {
    var minutes = Math.floor(seconds / 60);
    var seconds = seconds - minutes * 60;
    return ((minutes < 10) ? ' ' : '') + minutes + ':' + ((seconds < 10) ? '0' : '') + seconds;
}
