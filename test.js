const Dante = require("./dante");

const dante = new Dante();

// dante.setDeviceName("10.32.61.12", "dante-devie-name");

// dante.resetDeviceName("10.32.61.12");

// dante.setChannelName("10.32.61.12", "abcdefghiklmnopqrstuvwxyz", "rx", 1);
// dante.setChannelName("10.32.61.13", "atxchannelname", "tx", 2);

// dante.resetChannelName("10.32.61.13", "rx", 1);
// dante.resetChannelName("10.32.61.13", "tx", 1);

// dante.makeCrosspoint("10.32.61.13", "01 Input 1", "dante-devie-name", 3);
// dante.makeCrosspoint("10.32.61.13", "05 Input 2", "dante-devie-name", 4);
// dante.clearCrosspoint("10.32.61.13", 2);

// dante.getChannelCount("10.32.61.12");

dante.getChannelNames("10.32.61.13");

// while (true) {
//     console.log(dante.devices);
// }
