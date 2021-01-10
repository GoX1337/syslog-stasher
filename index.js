const net = require('net');
const syslogParser = require('glossy').Parse;
const { EventEmitter } = require ('events');

class SyslogServer extends EventEmitter {

    constructor(options) {
        super();
        console.log("Constructor", options);
        this.server = net.createServer();
        this.options = options;
        this.port = options.port || 514;
        this.server.maxConnections = options.maxConnections || 10;

        this.server.on('connection', (socket) => {
            socket.setEncoding('utf8');
            socket.on('data', (data) => {
                this.emit("data", syslogParser.parse(data));
            });

            socket.on('drain', () => {
                console.log('write buffer is empty now .. u can resume the writable stream');
                socket.resume();
            });

            socket.on('error', (error) => {
                this.emit("error", error);
            });

            socket.on('timeout', () => {
                console.log('Socket timed out !');
                socket.end('Timed out!');
            });

            socket.on('end', (data) => {
                console.log('Socket ended from other end!');
                console.log('End data : ' + data);
            });

            socket.on('close', (error) => {
                console.log('Socket closed!');
                if (error) {
                    console.log('Socket was closed coz of transmission error');
                }
            });
        });

        this.server.on('close', () => {
            console.log('Server closed !');
        });

        this.server.on('error', (error) => {
            console.log('Error: ' + error);
        });
    }

    listen(cb) {
        this.server.listen(this.port, () => {
            cb();
        });
    }
}

module.exports = SyslogServer;