const dgram = require("dgram");
const mdns = require("multicast-dns")();
const merge = require("./utils/merge");

const danteServiceTypes = ["_netaudio-cmc._udp", "_netaudio-dbc._udp", "_netaudio-arc._udp", "_netaudio-chan._udp"];
const danteControlPort = 4440;
const sequenceId1 = Buffer.from([0x29]);
const danteConstant = Buffer.from([0x27]);

const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
};

const intToBuffer = (int) => {
    let intBuffer = Buffer.alloc(2);
    intBuffer.writeUInt16BE(int);
    return intBuffer;
};

const bufferToInt = (buffer) => {
    return buffer.readUInt16BE();
};

const parseChannelCount = (reply) => {
    const channelInfo = { txChannelCount: reply[13], rxChannelCount: reply[15] };
    return channelInfo;
};

const parseTxChannelNames = (reply) => {
    const names = { txChannelNames: [] };
    console.log(reply);
    console.log(reply.toString());

    return names;
};

class Dante {
    constructor() {
        this.devices;
        this.devicesList = [];
        this.socket = dgram.createSocket("udp4");

        this.socket.on("message", this.parseReply);
        this.socket.bind(danteControlPort);

        mdns.on("response", this.parseDevices);
    }

    parseDevices(response) {
        this.devicesList = response?.answers?.filter((answer) => {
            for (let danteServiceType of danteServiceTypes) {
                if (answer.name.includes(danteServiceType)) {
                    return true;
                }
                return false;
            }
        });
    }

    parseReply(reply, rinfo) {
        const deviceIP = rinfo.address;
        const replySize = rinfo.size;
        const deviceData = {};
        if (reply[0] === danteConstant[0] && reply[1] === sequenceId1[0]) {
            if (replySize === bufferToInt(reply.slice(2, 4))) {
                const commandId = reply.slice(6, 8);
                deviceData[rinfo.address] = {};
                console.log(bufferToInt(commandId));
                switch (bufferToInt(commandId)) {
                    case 4096:
                        deviceData[rinfo.address] = parseChannelCount(reply);
                        break;
                    case 8208:
                        deviceData[rinfo.address] = parseTxChannelNames(reply);
                        break;
                }

                this.devices = merge(this.devices, deviceData);
                console.log(deviceData);
            }
        }
    }

    sendCommand(command, host, port = danteControlPort) {
        console.log(command);
        console.log(command.length);
        this.socket.send(command, 0, command.length, port, host);
    }

    makeCommand(command, commandArguments = Buffer.alloc(2)) {
        let sequenceId2 = Buffer.alloc(2);
        sequenceId2.writeUInt16BE(getRandomInt(65535));

        const padding = Buffer.from([0x00, 0x00]);
        let commandLength = Buffer.alloc(2);
        let commandId = Buffer.alloc(2);

        switch (command) {
            case "channelCount":
                commandId = Buffer.from("1000", "hex");
                break;
            case "deviceInfo":
                commandId = Buffer.from("1003", "hex");
                break;
            case "deviceName":
                commandId = Buffer.from("1002", "hex");
                break;
            case "crosspoint":
                commandId = Buffer.from("3010", "hex");
                break;
            case "rxChannelNames":
                commandId = Buffer.from("3000", "hex");
                break;
            case "txChannelNames":
                commandId = Buffer.from("2010", "hex");
                break;
            case "setRxChannelName":
                commandId = Buffer.from([0x30, 0x01]);
                break;
            case "setTxChannelName":
                commandId = Buffer.from([0x20, 0x13]);
                break;
            case "setDeviceName":
                commandId = Buffer.from([0x10, 0x01]);
                break;
        }

        commandLength.writeUInt16BE(
            Buffer.concat([
                danteConstant,
                sequenceId1,
                sequenceId2,
                commandId,
                Buffer.alloc(2),
                commandArguments,
                Buffer.alloc(1),
            ]).length + 2
        );

        return Buffer.concat([
            danteConstant,
            sequenceId1,
            commandLength,
            sequenceId2,
            commandId,
            Buffer.alloc(2),
            commandArguments,
            Buffer.alloc(1),
        ]);
    }

    resetDeviceName(ipaddress) {
        const commandBuffer = this.makeCommand("setDeviceName");
        this.sendCommand(commandBuffer, ipaddress);
    }

    setDeviceName(ipaddress, name) {
        const commandBuffer = this.makeCommand("setDeviceName", Buffer.from(name, "ascii"));
        this.sendCommand(commandBuffer, ipaddress);
    }

    setChannelName(ipaddress, channelName = "", channelType = "rx", channelNumber = 0) {
        const channelNameBuffer = Buffer.from(channelName, "ascii");
        let commandBuffer = Buffer.alloc(1);
        let channelNumberBuffer = Buffer.alloc(2);
        channelNumberBuffer.writeUInt16BE(channelNumber);

        if (channelType === "rx") {
            const commandArguments = Buffer.concat([
                Buffer.from("0401", "hex"),
                channelNumberBuffer,
                Buffer.from("001c", "hex"),
                Buffer.alloc(12),
                channelNameBuffer,
            ]);
            commandBuffer = this.makeCommand("setRxChannelName", commandArguments);
        } else if (channelType === "tx") {
            const commandArguments = Buffer.concat([
                Buffer.from("040100000", "hex"),
                channelNumberBuffer,
                Buffer.from("0024", "hex"),
                Buffer.alloc(18),
                channelNameBuffer,
            ]);
            commandBuffer = this.makeCommand("setTxChannelName", commandArguments);
        } else {
            throw "Invalid Channel Type - must be 'tx' or 'rx'";
        }
        this.sendCommand(commandBuffer, ipaddress);
    }

    resetChannelName(ipaddress, channelType = "rx", channelNumber = 0) {
        this.setChannelName(ipaddress, "", channelType, channelNumber);
    }

    makeCrosspoint(ipaddress, sourceChannelName, sourceDeviceName, destinationChannelNumber = 0) {
        const sourceChannelNameBuffer = Buffer.from(sourceChannelName, "ascii");
        const sourceDeviceNameBuffer = Buffer.from(sourceDeviceName, "ascii");

        const commandArguments = Buffer.concat([
            Buffer.from("0401", "hex"),
            intToBuffer(destinationChannelNumber),
            Buffer.from("005c006d", "hex"),
            Buffer.alloc(107 - sourceChannelNameBuffer.length - sourceDeviceNameBuffer.length),
            sourceChannelNameBuffer,
            Buffer.alloc(1),
            sourceDeviceNameBuffer,
        ]);

        const commandBuffer = this.makeCommand("crosspoint", commandArguments);

        this.sendCommand(commandBuffer, ipaddress);
    }

    clearCrosspoint(ipaddress, destinationChannelNumber) {
        const commandArguments = Buffer.concat([
            Buffer.from("0401", "hex"),
            intToBuffer(destinationChannelNumber),
            Buffer.from("005c006d", "hex"),
            Buffer.alloc(108),
        ]);

        const commandBuffer = this.makeCommand("crosspoint", commandArguments);

        this.sendCommand(commandBuffer, ipaddress);
    }

    getChannelCount(ipaddress) {
        const commandBuffer = this.makeCommand("channelCount");
        this.sendCommand(commandBuffer, ipaddress);
    }

    getChannelNames(ipaddress) {
        const commandBuffer = this.makeCommand("txChannelNames", Buffer.from("0001000100", "hex"));
        this.sendCommand(commandBuffer, ipaddress);
    }

    get devices() {
        return this.devicesList;
    }
}

module.exports = Dante;
