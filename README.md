# dante-control

A simple Javascript library for controlling Audinate Dante devices.

Expands on work by Chris Ritsen's [Network Audio Controller](https://github.com/chris-ritsen/network-audio-controller) library for Python.

And initial bash script investigations documented on [Gearspace](https://gearspace.com/board/music-computers/1221989-dante-routing-without-dante-controller-possible.html)

## Current Features:

-   Make Dante Crosspoin
-   Change device names
-   Change Tx and Rx channel names
-   Reset device and channel names
-   Get device Tx and Rx channel count

## Work in progress:

-   Get device Tx channel names
-   Get device Rx channel names
-   Publish on NPM

## Usage

```
const Dante = require("dante-control");

const dante = new Dante();
```

### Set and reseting Device name

`dante.setDeviceName("192.168.0.1", "MyNewDanteDeviceName");`

`dante.resetDeviceName("192.168.0.1");`

### Set and reseting Channel name

`dante.setChannelName("192.168.0.1", "MyRxChannelName", "rx", 1);`
`dante.setChannelName("192.168.0.1", "MyTxChannelName", "tx", 2);`

`dante.resetChannelName("192.168.0.1", "rx", 1);`
`dante.resetChannelName("192.168.0.1", "tx", 1);`

### Making a crosspoint

`dante.makeCrosspoint("192.168.0.1", "Input 1", "MyDanteDeviceName", 3);`
`dante.makeCrosspoint("192.168.0.1", "Input 2", "MyDanteDeviceName", 4);`

### Clearing a crosspoint

`dante.clearCrosspoint("192.168.0.113", 2);`

### Get number of Tx and Rx channels from a device

`dante.getChannelCount("192.168.0.1");`
