var SegmentDisplay = require('./lib/segment-display');

var options = {
    red: {
        colorOn: '#ff0000',
        colorOff: '#ffc4c4'
    },
    blue: {
        colorOn: '#0051ff',
        colorOff: '#bee3ff'
    },
    default: {
        pattern:        '###.#',
        displayAngle:   10,
        digitHeight:    20,
        digitWidth:     12,
        digitDistance:  2.5,
        segmentWidth:   2.5,
        segmentDistance:0.5,
        segmentCount:   7,
        cornerType:     3,
        colorOn:        '#000000',
        colorOff:       '#ededf4',
        defaultValue:   '---.-'
    },
    time: {
        pattern:        '##:##',
        displayAngle:   10,
        digitHeight:    20,
        digitWidth:     12,
        digitDistance:  2.5,
        segmentWidth:   2.5,
        segmentDistance:0.5,
        segmentCount:   7,
        cornerType:     3,
        colorOff:       '#ededf4',
        colorOn:        '#ededf4',
        defaultValue:   ' 0:00'
    }
};

// Depth
var redDepthDisplay = new SegmentDisplay("red-depth-display");
redDepthDisplay.pattern         = options.default.pattern;
redDepthDisplay.displayAngle    = options.default.displayAngle;
redDepthDisplay.digitHeight     = options.default.digitHeight;
redDepthDisplay.digitWidth      = options.default.digitWidth;
redDepthDisplay.digitDistance   = options.default.digitDistance;
redDepthDisplay.segmentWidth    = options.default.segmentWidth;
redDepthDisplay.segmentDistance = options.default.segmentDistance;
redDepthDisplay.segmentCount    = options.default.segmentCount;
redDepthDisplay.cornerType      = options.default.cornerType;
redDepthDisplay.colorOn         = options.red.colorOn;
redDepthDisplay.colorOff        = options.red.colorOff;
redDepthDisplay.setValue(options.default.defaultValue);
redDepthDisplay.draw();

var blueDepthDisplay = new SegmentDisplay("blue-depth-display");
blueDepthDisplay.pattern         = options.default.pattern;
blueDepthDisplay.displayAngle    = options.default.displayAngle;
blueDepthDisplay.digitHeight     = options.default.digitHeight;
blueDepthDisplay.digitWidth      = options.default.digitWidth;
blueDepthDisplay.digitDistance   = options.default.digitDistance;
blueDepthDisplay.segmentWidth    = options.default.segmentWidth;
blueDepthDisplay.segmentDistance = options.default.segmentDistance;
blueDepthDisplay.segmentCount    = options.default.segmentCount;
blueDepthDisplay.cornerType      = options.default.cornerType;
blueDepthDisplay.colorOn         = options.blue.colorOn;
blueDepthDisplay.colorOff        = options.blue.colorOff;
blueDepthDisplay.setValue(options.default.defaultValue);
blueDepthDisplay.draw();

// Red timer
var redTimeDisplay = new SegmentDisplay("red-time-display");
redTimeDisplay.pattern         = options.time.pattern;
redTimeDisplay.displayAngle    = options.time.displayAngle;
redTimeDisplay.digitHeight     = options.time.digitHeight;
redTimeDisplay.digitWidth      = options.time.digitWidth;
redTimeDisplay.digitDistance   = options.time.digitDistance;
redTimeDisplay.segmentWidth    = options.time.segmentWidth;
redTimeDisplay.segmentDistance = options.time.segmentDistance;
redTimeDisplay.segmentCount    = options.time.segmentCount;
redTimeDisplay.cornerType      = options.time.cornerType;
redTimeDisplay.colorOn         = options.red.colorOn;
redTimeDisplay.colorOff        = options.red.colorOff;
redTimeDisplay.setValue(options.time.defaultValue);
redTimeDisplay.draw();

// Blue timer
var blueTimeDisplay = new SegmentDisplay("blue-time-display");
blueTimeDisplay.pattern         = options.time.pattern;
blueTimeDisplay.displayAngle    = options.time.displayAngle;
blueTimeDisplay.digitHeight     = options.time.digitHeight;
blueTimeDisplay.digitWidth      = options.time.digitWidth;
blueTimeDisplay.digitDistance   = options.time.digitDistance;
blueTimeDisplay.segmentWidth    = options.time.segmentWidth;
blueTimeDisplay.segmentDistance = options.time.segmentDistance;
blueTimeDisplay.segmentCount    = options.time.segmentCount;
blueTimeDisplay.cornerType      = options.time.cornerType;
blueTimeDisplay.colorOn         = options.blue.colorOn;
blueTimeDisplay.colorOff        = options.blue.colorOff;
blueTimeDisplay.setValue(options.time.defaultValue);
blueTimeDisplay.draw();

// Water temperature
var waterDisplay = new SegmentDisplay("water-display");
waterDisplay.pattern         = options.default.pattern;
waterDisplay.displayAngle    = options.default.displayAngle;
waterDisplay.digitHeight     = options.default.digitHeight;
waterDisplay.digitWidth      = options.default.digitWidth;
waterDisplay.digitDistance   = options.default.digitDistance;
waterDisplay.segmentWidth    = options.default.segmentWidth;
waterDisplay.segmentDistance = options.default.segmentDistance;
waterDisplay.segmentCount    = options.default.segmentCount;
waterDisplay.cornerType      = options.default.cornerType;
waterDisplay.colorOn         = options.default.colorOn;
waterDisplay.colorOff        = options.default.colorOff;
waterDisplay.setValue(options.default.defaultValue);
waterDisplay.draw();

// Water temperature
var airDisplay = new SegmentDisplay("air-display");
airDisplay.pattern         = options.default.pattern;
airDisplay.displayAngle    = options.default.displayAngle;
airDisplay.digitHeight     = options.default.digitHeight;
airDisplay.digitWidth      = options.default.digitWidth;
airDisplay.digitDistance   = options.default.digitDistance;
airDisplay.segmentWidth    = options.default.segmentWidth;
airDisplay.segmentDistance = options.default.segmentDistance;
airDisplay.segmentCount    = options.default.segmentCount;
airDisplay.cornerType      = options.default.cornerType;
airDisplay.colorOn         = options.default.colorOn;
airDisplay.colorOff        = options.default.colorOff;
airDisplay.setValue(options.default.defaultValue);
airDisplay.draw();

module.exports = {
    redDepthDisplay: redDepthDisplay,
    redTimeDisplay: redTimeDisplay,
    blueDepthDisplay: blueDepthDisplay,
    blueTimeDisplay: blueTimeDisplay,
    waterDisplay: waterDisplay,
    airDisplay: airDisplay
};
