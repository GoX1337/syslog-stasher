const SyslogStasher = require('./index');

const options = {
    port: 514,
    maxConnections: 10,
    persistence: true,
    mongoDb: {
        uri: 'mongodb://localhost:27017',
        name: 'logs-db',
        logCollectionName: 'logs',
        expirationDelayInDays: 3
    }
};

const syslogServer = new SyslogStasher(options);

syslogServer.on('msg', (msg) => {
    console.log('SYSLOG:', msg);
});

syslogServer.on('error', (err) => {
    console.error('SYSLOG:', err);
});

syslogServer.listen(() => {
    console.log(`Syslog server listening on ${options.port}...`);
});