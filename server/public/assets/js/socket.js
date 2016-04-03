var socket = io.connect('http://localhost:3101');

socket.on('measurement', function (packet) {

    // Update chart data and parameters
    ndx.add([packet]);
    depthChart.x(d3.scale.linear().domain([0,packet.time]));

    console.log(packet.time);
    // Update values on browser
    document.getElementById('guild-name').innerHTML = packet.guild.name;
    var basketNumber = (packet.guild.basket) ? '(' + packet.guild.basket + ')' : '';
    document.getElementById('basket-number').innerHTML = basketNumber;
    depthDisplay.setValue(_.padStart(String(packet.depth), 5));

    var minutes = _.floor(+packet.time / 60);
    var seconds = +packet.time - minutes * 60;
    var value = ((minutes < 10) ? ' ' : '') + minutes + ':' + ((seconds < 10) ? '0' : '') + seconds;
    timeDisplay.setValue(value);

    // Redraw charts
    depthChart.redraw();
    rankChart.redraw();
});

socket.on('reset_data', function() {

    // Delete current data
    ndx.remove();
    // Reset depth-chart axis
    depthChart.x(d3.scale.linear().domain([0,0]));
    // Reset depth display
    depthDisplay.setValue(' --.-')
    // Reset time display
    timeDisplay.setValue(' 0:00')
    // Redraw charts
    dc.redrawAll();
});
