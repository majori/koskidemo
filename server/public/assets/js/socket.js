var socket = io.connect('http://192.168.1.201:8443');

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

    // If there is already record in crossfilter with this basket,
    // update it instead of adding a new record
    basketDim.filter(packet.guildName + '#' + packet.basket);
    var selectedEntry = basketDim.top(1)[0];
    if (selectedEntry) {
        selectedEntry.time = packet.time;
        rankFilter.remove();
        rankFilter.add([selectedEntry]);

    // It was a new basket, add it to records
    } else {

        // Add record to crossfilter
        rankFilter.add([packet]);

        // Update rank-chart x-axis
        rankChart.x(d3.scale.ordinal());

        // Update new guild name and basket to header
        document.getElementById('guild-name').innerHTML = packet.guildName;
        document.getElementById('basket-number').innerHTML = (packet.basket) ? 'kori ' + packet.basket : '';

    }
    basketDim.filter(null);

    // Redraw chart
    rankChart.redraw();

    // Update leaderboard
    var top5 = durationByBasket.top(5);
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

// Reset rank related data
socket.on('reset-rank', function() {
    rankFilter.remove();
    rankChart.x(d3.scale.ordinal())
    rankChart.redraw();

    for (i=0;i<5;i++) {
        document.getElementById(String(i+1)+'-rank-name').innerHTML = '';
        document.getElementById(String(i+1)+'-rank-time').innerHTML = '';
    }
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
