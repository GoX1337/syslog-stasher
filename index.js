const net = require('net');
const syslogParser = require('glossy').Parse;
const { EventEmitter } = require ('events');
const MongoClient = require('mongodb').MongoClient;

class SyslogServer extends EventEmitter {

    constructor(options) {
        super();
        this.server = net.createServer();
        this.port = options.port || 514;
        this.server.maxConnections = options.maxConnections || 10;
        this.persistenceActive = options.persistence || false;
        this.mongoUri = options.mongoDb.uri || "mongodb://localhost:27017";
        this.mongoDbName = options.mongoDb.name || "logs-db";
        this.logCollectionName = options.mongoDb.logCollectionName || "logs";
        this.expirationDelayInDays = options.mongoDb.expirationDelayInDays || 1;
        this.nbMilisecondInOneDay = 24 * 60 * 60 * 1000;

        if(this.persistenceActive){
            MongoClient.connect(this.mongoUri, { useUnifiedTopology: true }, (err, client) => {
                if(err){
                    this.emit("error", error);
                    return;
                }
                console.log("Connected successfully to MongoDB");
                this.db = client.db(this.mongoDbName);
                this.db.collection(this.logCollectionName).createIndex( { "expireAt": 1 }, { expireAfterSeconds: 0 } );
            });
        }
        
        this.server.on('connection', (socket) => {
            socket.setEncoding('utf8');

            socket.on('data', (data) => {
                let logRecord = syslogParser.parse(data);
                this.emit("msg", logRecord);
                if(this.persistenceActive){
                    logRecord.expireAt = new Date(new Date().getTime() + this.expirationDelayInDays * this.nbMilisecondInOneDay);
                    this.db.collection(this.logCollectionName).insertOne(logRecord);
                }
            });

            socket.on('drain', () => {
                socket.resume();
            });

            socket.on('error', (error) => {
                this.emit("error", error);
            });

            socket.on('timeout', () => {
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
            this.emit("error", error);
        });
    }

    listen(cb) {
        this.server.listen(this.port, () => {
            cb();
        });
    }
}

module.exports = SyslogServer;