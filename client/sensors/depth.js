"use strict";

var mraa = require('mraa');
var Promise = require('bluebird')

const var TIMEOUT_MS = 2000
const var TIMEOUT = -2

class depth {

	constructor(RecievePin, SendPin) {
		this.myRecievePin = new mraa.Gpio(RecievePin);
		this.mySendPin = new mraa.Gpio(SendPin);
		var timer = 0;
	}

	getRawValue(){

		mySendPin.write(0);
		then.myRecievePin.dir(mraa.DIR_IN);
		then.myRecievePin.dir(mraa.DIR_OUT);
		then.myRecievePin.write(0);
		then.setTimeout(function(){
			myRecievePin.dir(mraa.DIR_IN);
			mySendPin.write(1);
		}, 25)
		then.while(myRecievePin.read() = 0 && (timer < TIMEOUT_MS)){
			++timer;
		}
		then.if(timer >= TIMEOUT_MS){
			return TIMEOUT;
		}
		
		then.myRecievePin.dir(mraa.DIR_OUT)  // receivePin to OUTPUT - pin is now HIGH AND OUTPUT
		then.myRecievePin.write(1);
		then.myRecievePin.write(1);
		then.myRecievePin.write(0);
		then.myRecievePin.dir(mraa.DIR_IN) 	// receivePin to INPUT (pullup is off)

	}



}



