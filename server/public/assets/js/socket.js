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
    var basketNumber = (packet.basket) ? 'kori ' + packet.basket : '';
    document.getElementById('basket-number').innerHTML = basketNumber;

    // Update x-axis
    rankChart.x(d3.scale.ordinal());

    // Redraw chart
    rankChart.redraw();
});

socket.on('reset_data', function() {

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
