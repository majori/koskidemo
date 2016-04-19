The file provided in this directory (proximity.js) is a modified library file from the 'johnny-five' library.
It has an additional handler for the ultrasonic ranger SRF02.
Please replace the file ./node_modules/johnny-five/lib/proximity.js with the file provided in this directory.
If you want to modify the measuring frequency (present 500 ms, minimum 65 ms, recommended 70 ms -> ), edit the line 22 "var msUntilNextRead = 500;" to suit your liking.