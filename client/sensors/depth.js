/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */
// Leave the above lines for propper jshinting
//Type Node.js Here :)

var mraa = require('mraa');
var async = require('async');

var TIMEOUT_MS = 2000;
var TIMEOUT = -2;

function depth(RecievePin, SendPin) {

    this.myRecievePin = new mraa.Gpio(RecievePin);
    
    this.mySendPin = new mraa.Gpio(SendPin);


}

depth.prototype.getValue = function () {

    var that = this;
    var timer = 0;
    console.log("Rec: " + this.myRecievePin.read() + "Send: " + this.mySendPin.read() );
    
    async.series([
        function (callback) {

            that.mySendPin.dir(mraa.DIR_OUT);
            callback(null, 1);
        },
        function (callback) {

            that.mySendPin.write(0);
            console.log("Send status: " + that.mySendPin.read());
            callback(null, 2);
        },
        function (callback) {

            that.myRecievePin.dir(mraa.DIR_IN);
            callback(null, 3);
        },
        function (callback) {

            that.myRecievePin.dir(mraa.DIR_IN);
            callback(null, 4);
        },
        function (callback) {

            that.myRecievePin.dir(mraa.DIR_IN);
            that.myRecievePin.dir(mraa.DIR_OUT);
            callback(null, 5);
        },
        function (callback) {

            that.myRecievePin.write(0);
            callback(null, 6);
        },
         function (callback) {

            setTimeout(function () {
                that.myRecievePin.dir(mraa.DIR_IN);
                that.mySendPin.write(1);
            }, 25);
            callback(null, 7);
        },
         function (callback) {
            setTimeout(function () {
                console.log("SendStatus: " + that.mySendPin.read());
                that.myRecievePin.dir(mraa.DIR_IN);
                that.mySendPin.write(1);
            }, 25);

            callback(null, 8);
        },
        function (callback) {
            console.log("timer: " + timer);
            while(that.myRecievePin.read() === 0 && (timer < TIMEOUT_MS)) {
            ++timer;
            }
            callback(null, 9);
        },
        function (callback) {
            
            if(timer >= TIMEOUT_MS) {
                //return TIMEOUT;
            }
            
            callback(null, 10);
        },
        function (callback) {
            console.log("x");
            that.myRecievePin.dir(mraa.DIR_OUT); // receivePin to OUTPUT - pin is now HIGH AND OUTPUT
            callback(null, 11);
        },
        function (callback) {

            that.myRecievePin.write(1);
            callback(null, 12);
        },
        function (callback) {

            that.myRecievePin.write(1);
            callback(null, 13);
        },
        function (callback) {
            console.log("x");
            that.myRecievePin.write(0);
            callback(null, 14);
        },
        function (callback) {

            that.myRecievePin.dir(mraa.DIR_IN); // receivePin to INPUT (pullup is off)
            callback(null, 15);
        }
    ],
    function(err, results){

        console.log(results);
        
        });

    

    return timer;
};

console.log("start");

var sensori = new depth(46, 47);

    console.log("valu: " + sensori.getValue());
