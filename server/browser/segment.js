var SegmentDisplay = require('./lib/segment-display');

var options = {
  value: {
    pattern:        '###.#',
    displayAngle:   10,
    digitHeight:    20,
    digitWidth:     12,
    digitDistance:  2.5,
    segmentWidth:   2.5,
    segmentDistance:0.5,
    segmentCount:   7,
    cornerType:     3,
    colorOn:        '#2554C7',
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
    colorOn:        '#000000',
    defaultValue:   ' 0:00'
  }
};

// Depth
var depthDisplay = new SegmentDisplay("depth-display");
depthDisplay.pattern         = options.value.pattern;
depthDisplay.displayAngle    = options.value.displayAngle;
depthDisplay.digitHeight     = options.value.digitHeight;
depthDisplay.digitWidth      = options.value.digitWidth;
depthDisplay.digitDistance   = options.value.digitDistance;
depthDisplay.segmentWidth    = options.value.segmentWidth;
depthDisplay.segmentDistance = options.value.segmentDistance;
depthDisplay.segmentCount    = options.value.segmentCount;
depthDisplay.cornerType      = options.value.cornerType;
depthDisplay.colorOn         = options.value.colorOn;
depthDisplay.colorOff        = options.value.colorOff;
depthDisplay.setValue(options.value.defaultValue);
depthDisplay.draw();

// Water temperature
var waterDisplay = new SegmentDisplay("water-display");
waterDisplay.pattern         = options.value.pattern;
waterDisplay.displayAngle    = options.value.displayAngle;
waterDisplay.digitHeight     = options.value.digitHeight;
waterDisplay.digitWidth      = options.value.digitWidth;
waterDisplay.digitDistance   = options.value.digitDistance;
waterDisplay.segmentWidth    = options.value.segmentWidth;
waterDisplay.segmentDistance = options.value.segmentDistance;
waterDisplay.segmentCount    = options.value.segmentCount;
waterDisplay.cornerType      = options.value.cornerType;
waterDisplay.colorOn         = options.value.colorOn;
waterDisplay.colorOff        = options.value.colorOff;
waterDisplay.setValue(options.value.defaultValue);
waterDisplay.draw();

// Water temperature
var airDisplay = new SegmentDisplay("air-display");
airDisplay.pattern         = options.value.pattern;
airDisplay.displayAngle    = options.value.displayAngle;
airDisplay.digitHeight     = options.value.digitHeight;
airDisplay.digitWidth      = options.value.digitWidth;
airDisplay.digitDistance   = options.value.digitDistance;
airDisplay.segmentWidth    = options.value.segmentWidth;
airDisplay.segmentDistance = options.value.segmentDistance;
airDisplay.segmentCount    = options.value.segmentCount;
airDisplay.cornerType      = options.value.cornerType;
airDisplay.colorOn         = options.value.colorOn;
airDisplay.colorOff        = options.value.colorOff;
airDisplay.setValue(options.value.defaultValue);
airDisplay.draw();

// Timer
var timeDisplay = new SegmentDisplay("time-display");
timeDisplay.pattern         = options.time.pattern;
timeDisplay.displayAngle    = options.time.displayAngle;
timeDisplay.digitHeight     = options.time.digitHeight;
timeDisplay.digitWidth      = options.time.digitWidth;
timeDisplay.digitDistance   = options.time.digitDistance;
timeDisplay.segmentWidth    = options.time.segmentWidth;
timeDisplay.segmentDistance = options.time.segmentDistance;
timeDisplay.segmentCount    = options.time.segmentCount;
timeDisplay.cornerType      = options.time.cornerType;
timeDisplay.colorOn         = options.time.colorOn;
timeDisplay.colorOff        = options.time.colorOff;
timeDisplay.setValue(options.time.defaultValue);
timeDisplay.draw();

module.exports = {
    depthDisplay: depthDisplay,
    waterDisplay: waterDisplay,
    airDisplay: airDisplay,
    timeDisplay: timeDisplay
};
