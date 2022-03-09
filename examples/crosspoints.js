const Dante = require("../dante");

const dante = new Dante();

//Turn on debug mode so we can see what's being sent and received.
dante.debug = true;

// Make a crosspoint - provide the IP address of the device and the channel numbers to be the reciever.
// Provide the device name and the channel name of the transmitter.
dante.makeCrosspoint("10.32.61.13", "01 Input 1", "dante-devie-name", 3);

// Remove a crosspoint - provide the IP address of the device and the channel number. Removes this crosspoint.
dante.clearCrosspoint("10.32.61.13", 2);
