const Dante = require("../dante");

const dante = new Dante();

//Turn on debug mode so we can see what's being sent and received.
dante.debug = true;

// Set the channel name - provide the IP address of the device and a new channel namme.
// Name must be less than 32 characters.
// Decide whether the channel is a TX or RX channel and provide the channel number to act on
dante.setChannelName("10.32.61.12", "abcdefghiklmnopqrstuvwxyz", "rx", 1);
dante.setChannelName("10.32.61.13", "atxchannelname", "tx", 2);

// Same as above - resets the name to the device default.
dante.resetChannelName("10.32.61.13", "rx", 1);
dante.resetChannelName("10.32.61.13", "tx", 1);
