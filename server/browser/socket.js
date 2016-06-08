const padStart  = require('lodash/padStart');
const forEach   = require('lodash/forEach');

const graph     = require('./chart');
const segment   = require('./segment');
const progress  = require('./progress');

const demo  = require('./demo.json');

// Preprocess this with gulp
const socket      = require('socket.io-client')('http://' + '/*@echo KOSKIOTUS_HTTP_SERVER_ADDRESS*/' + ':' + '/*@echo KOSKIOTUS_IO_PORT*/');

// Process packet, which contains depth data
socket.on('depth', function (packet) {

    // Calculate how long basket has been in the water
    var timer = formatTimerFromSeconds(+packet.time);

    var color = (packet.isRed) ? 'red' : 'blue';

    // Update chart data and parameters
    graph.filters[color + 'MeasurementFilter'].add([packet]);
    graph.charts[color + 'DepthChart'].x(graph.dc.d3.scale.linear().domain([0,packet.time]));
    segment[color + 'DepthDisplay'].setValue(padStart(String(packet.depth), 5));
    segment[color + 'TimeDisplay'].setValue(timer);
    graph.charts[color + 'DepthChart'].redraw();

});

// Process packet, which contains rank and guild data
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
    }

    graph.dimensions.basketDim.filter(null);

    var color = (packet.isRed) ? 'red' : 'blue';

    // Update new guild name and basket to header
    document.getElementById(color + '-guild-name').innerHTML = packet.guildName + '#' + packet.basket;

    // Redraw chart
    graph.charts.rankChart.redraw();

    updateLeaderboard();

});


// Process packet, which contains temperature data
socket.on('temperature', function(packet) {

    // Update temperature displays
    if (packet.waterTemperature) {
        segment.waterDisplay.setValue(padStart(String(packet.waterTemperature), 4));
    }

    if (packet.airTemperature) {
        segment.airDisplay.setValue(padStart(String(packet.airTemperature), 4));
    }
});

// Reset red basket measurement data
socket.on('reset-red', function() {
    resetData('red');
});

// Reset blue basket measurement data
socket.on('reset-blue', function() {
    resetData('blue');
});

// Reset rank related data
socket.on('reset-rank', function() {
    graph.filters.rankFilter.remove();
    graph.charts.rankChart.x(graph.dc.d3.scale.ordinal())
    graph.charts.rankChart.redraw();

    forEach(['first', 'second', 'third', 'fourth', 'fifth'], function(place) {
        document.getElementById(place+'-rank-name').innerHTML = '';
        progress.bars[place].animate(0);
    });

    progress.maxValue = 0;
});

// Packet which comes when client connects to the server
socket.on('initialize_depths', function(packet) {
    initializeDepths(packet);
});

// Initialize ranks when client connects to the server
socket.on('initialize_ranks', function(packet) {
    initializeRanks(packet);
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
};

function formatTimerFromSeconds(seconds) {
    var minutes = Math.floor(seconds / 60);
    var seconds = seconds - minutes * 60;
    return ((minutes < 10) ? ' ' : '') + minutes + ':' + ((seconds < 10) ? '0' : '') + seconds;
};

function updateLeaderboard() {
    var top5 = graph.groups.durationByBasket.top(5);

    for (i=0;i<5;i++) {
        if (top5[i]) {
            if (i===0) {
                document.getElementById('first-rank-name').innerHTML = top5[i].key;
                progress.maxValue = top5[0].value.toFixed(0);
                progress.bars.first.animate(1.0);

            } else if (i===1) {
                document.getElementById('second-rank-name').innerHTML = top5[i].key;
                progress.bars.second.animate(top5[i].value / progress.maxValue);

            } else if (i===2) {
                document.getElementById('third-rank-name').innerHTML = top5[i].key;
                progress.bars.third.animate(top5[i].value / progress.maxValue);

            } else if (i===3) {
                document.getElementById('fourth-rank-name').innerHTML = top5[i].key;
                progress.bars.fourth.animate(top5[i].value / progress.maxValue);

            } else if (i===4) {
                document.getElementById('fifth-rank-name').innerHTML = top5[i].key;
                progress.bars.fifth.animate(top5[i].value / progress.maxValue);
            }
        }
    }
};

function initializeDepths(packet) {
    forEach(['red','blue'], function(color) {

        graph.filters[color + 'MeasurementFilter'].add(packet[color]);

        var maxTime = (graph.dimensions[color + 'TimeDim'].top(1)[0]) ? graph.dimensions[color + 'TimeDim'].top(1)[0].time : 0;

        graph.charts[color + 'DepthChart'].x(graph.dc.d3.scale.linear().domain([0,maxTime]));

        var timerValue = formatTimerFromSeconds(maxTime);
        segment[color + 'TimeDisplay'].setValue(timerValue);

        graph.charts[color + 'DepthChart'].redraw();
    });
};

function initializeRanks(packet) {
    graph.filters.rankFilter.add(packet);

    updateLeaderboard();

    graph.charts.rankChart.redraw();
};

// Initialize demo data
initializeDepths(demo.depth);
initializeRanks(demo.guild);

segment.waterDisplay.setValue('14.2');
segment.airDisplay.setValue('24.1');

segment['redDepthDisplay'].setValue(' 10.0');
segment['blueDepthDisplay'].setValue(' 20.0');

document.getElementById('red-guild-name').innerHTML = 'Autek#2';
document.getElementById('blue-guild-name').innerHTML = 'MIK#3';
