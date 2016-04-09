var socket = io.connect('http://localhost:3101');

socket.on('measurement', function (packet) {

    // Update chart data and parameters
    measurementFilter.add([packet]);
    depthChart.x(d3.scale.linear().domain([0,packet.time]));

    // Update segment displays
    depthDisplay.setValue(_.padStart(String(packet.depth), 5));
    waterDisplay.setValue(_.padStart(String(packet.waterTemperature), 5));
    airDisplay.setValue(_.padStart(String(packet.airTemperature), 5));

    // Calculate how long basket has been in the water
    var minutes = _.floor(+packet.time / 60);
    var seconds = +packet.time - minutes * 60;
    var value = ((minutes < 10) ? ' ' : '') + minutes + ':' + ((seconds < 10) ? '0' : '') + seconds;
    timeDisplay.setValue(value);

    // Redraw charts
    depthChart.redraw();
});

socket.on('guild', function(packet) {

    // Add packet to guild crossfilter
    rankFilter.add([packet]);

    // Update values on browser
    document.getElementById('guild-name').innerHTML = packet.guildName;
    document.getElementById('basket-number').innerHTML = (packet.basket) ? 'kori ' + packet.basket : '';

    // Update rankChart x-axis
    rankChart.x(d3.scale.ordinal());

    // Redraw chart
    rankChart.redraw();

    var top5 = basketDim.top(5);
    document.getElementById('first-rank-name').innerHTML = top5[0].guildName + '#' + top5[0].basket;
    document.getElementById('second-rank-name').innerHTML = top5[1].guildName + '#' + top5[1].basket;
    document.getElementById('third-rank-name').innerHTML = top5[2].guildName + '#' + top5[2].basket;
    document.getElementById('fourth-rank-name').innerHTML = top5[3].guildName + '#' + top5[3].basket;
    document.getElementById('fifth-rank-name').innerHTML = top5[4].guildName + '#' + top5[4].basket;

    document.getElementById('first-rank-time').innerHTML = top5[0].time;
    document.getElementById('second-rank-time').innerHTML = top5[1].time;
    document.getElementById('third-rank-time').innerHTML = top5[2].time;
    document.getElementById('fourth-rank-time').innerHTML = top5[3].time;
    document.getElementById('fifth-rank-time').innerHTML = top5[4].time;
});

socket.on('reset-data', function() {

    // Delete current data
    measurementFilter.remove();

    // Reset depth-chart axis
    depthChart.x(d3.scale.linear().domain([0,0]));

    // Reset displays
    depthDisplay.setValue('---.-');
    waterDisplay.setValue('---.-');
    airDisplay.setValue('---.-');
    timeDisplay.setValue(' 0:00');

    // Redraw chart
    depthChart.redraw();
});

socket.on('reset-rank', function() {
    rankFilter.remove();
    rankChart.redraw();
});

socket.on('initialize_measurements', function(packet) {
    measurementFilter.add(packet);
    depthChart.x(d3.scale.linear().domain([0,timeDim.top(1)[0].time]));

    depthChart.redraw();
});

socket.on('initialize_ranks', function(packet) {
    rankFilter.add(packet);

    rankChart.redraw();
});
