const Dante = require("../dante");

const dante = new Dante();

//Turn on debug mode so we can see what's being sent and received.
dante.debug = true;

//Set the device name - provide the IP address of the device and a name. Name must be less than 32 characters.
dante.setDeviceName("10.32.61.12", "dante-devie-name");

//Reset the device name - provide the IP address of the device and a name. Name will be device default.
dante.resetDeviceName("10.32.61.12");
