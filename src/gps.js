const axios = require('axios');
const SerialPort = require("serialport")
const Readline = require("@serialport/parser-readline")
const nmea = require("nmea-simple")

const serialPort = new SerialPort(
    '/dev/serial0',
    {
        baudRate: 9600
    }
)

const parser = serialPort.pipe(new Readline({ delimiter: '\r\n' }))

console.log('Port running...')
parser.on("data", line => {
    try {
        const packet = nmea.parseNmeaSentence(line);
        if (packet.sentenceId === "RMC" && packet.status === "valid") {
            console.log("Got location via RMC packet:", packet.latitude, packet.longitude);
        }
        if (packet.sentenceId === "GGA" && packet.fixType !== "none") {
            console.log("Got location via GGA packet:", packet.latitude, packet.longitude);

            axios.post('http://dabpi.local:3001/post', {
                lat: packet.latitude,
                lng: packet.longitude
            })
                .catch(function (error) {
                    //console.log(error);
                });
        }
        if (packet.sentenceId === "GSA" && packet.satellites.length > 0) {
            console.log("There are " + packet.satellites.length + " satellites in view.");
        }
    } catch (error) {
        //console.error("Got bad packet:", line, error);
    }
})