const Dante = require("../dante");

const dante = new Dante();

//Turn on debug mode so we can see what's being sent and received.
dante.debug = true;

// Get the number of Tx and Rx channels by providing the device IP address.
const channelCount = dante.getChannelCount("10.32.61.12");
console.log(channelCount);

// Get the names of Tx and Rx channels by providing the device IP address.
const channelNames = dante.getChannelNames("10.32.61.13");
console.log(channelNames);
