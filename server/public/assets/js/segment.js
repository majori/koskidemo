// Depth
var depthDisplay = new SegmentDisplay("depth-display");
depthDisplay.pattern         = "###.#";
depthDisplay.displayAngle    = 10;
depthDisplay.digitHeight     = 20;
depthDisplay.digitWidth      = 12;
depthDisplay.digitDistance   = 2.5;
depthDisplay.segmentWidth    = 2.5;
depthDisplay.segmentDistance = 0.5;
depthDisplay.segmentCount    = 7;
depthDisplay.cornerType      = 3;
depthDisplay.colorOn         = "#000000";
depthDisplay.colorOff        = "#ededf4";
depthDisplay.setValue('---.-');
depthDisplay.draw();

// Timer
var timeDisplay = new SegmentDisplay("time-display");
timeDisplay.pattern         = "##:##:##";
timeDisplay.displayAngle    = 10;
timeDisplay.digitHeight     = 20;
timeDisplay.digitWidth      = 12;
timeDisplay.digitDistance   = 2.5;
timeDisplay.segmentWidth    = 2.5;
timeDisplay.segmentDistance = 0.5;
timeDisplay.segmentCount    = 7;
timeDisplay.cornerType      = 3;
timeDisplay.colorOn         = "#000000";
timeDisplay.colorOff        = "#ededf4";
timeDisplay.setValue('  :  :  ');
timeDisplay.draw();
