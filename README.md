# Simple Syslog RFC5424 server

## Example:
```javascript
const SyslogStasher = require('syslog-stasher');

const options = {
    port: 514,
    maxConnections: 10
};

const syslogServer = new SyslogStasher(options);

syslogServer.on('data', (msg) => {
    console.log('SYSLOG:', msg);
});

syslogServer.on('error', (err) => {
    console.error('SYSLOG:', err);
});

syslogServer.listen(() => {
    console.log(`Syslog server started listening on ${options.port}...`);
});
```
