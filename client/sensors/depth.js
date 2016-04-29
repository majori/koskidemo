var five    = require('johnny-five');
var Edison  = require('galileo-io');

var board   = new five.Board({
    debug: true,
    repl: false,
    io: new Edison()

});
function Depthsensor (){

    this.rawDepth = 1;
    this.depth = 1;
    this.depthArray = [0];
    this.skipped = 0;

    var that = this;
    board.on("ready", function(){
        // this needs a modified proximity.js in johnny-five library
        var prox = new five.Proximity({
            controller: "SRF02"
        })
        prox.on("data", function(){

            that.rawDepth = this.cm;

            // The sensos reading is 0 only when there is a reading error
            if (that.rawDepth == 0){}

            // If the depth change is too big remeasure once
            else if (Math.abs(that.rawDepth - that.depthArray[that.depthArray.lenght-1] > 30 && that.skipped < 10)){
                ++that.skipped;
            }
            else{
                that.skipped = 0;
                that.depth = that.rawDepth;
                that.depthArray.push(that.depth);
                if (that.depthArray.length > 10){
                    that.depthArray.shift();
                }
            }
        });
    });
};

Depthsensor.prototype.getDepthRaw = function(){
    return this.rawDepth;
}
Depthsensor.prototype.getDepth = function(){
    return this.depth;
}
Depthsensor.prototype.getDepthMean = function(){
    i = 0;
    var mean = 0.00;
    while(i<this.depthArray.length){
        mean = mean + this.depthArray[i];
        ++i;
    }
    mean = (mean / this.depthArray.length);
    return mean;
}

// Suppress I2C read errors. This is optional
console.warn = function(){}

module.exports = Depthsensor;
