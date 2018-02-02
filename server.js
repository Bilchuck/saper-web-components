const express = require('express');
const app = express();
const path = require('path');
const expressWs = require('express-ws')(app);
const port = process.env.PORT || 8080;
const { makeField, closedField } = require('./saper');

const field = makeField();
const clientField = closedField();

const updateField = newField => field = newField.length ? newField : field;

app.listen(port, () => console.log(`App is running on ${port}`));
let wsConnections = [];
app.ws('/ws', function(connection) {
    const sendField = c => c.send(JSON.stringify({field: clientField}));

    wsConnections.push(connection);
    sendField(connection);

    connection.on('message', function(message) {
        const {x, y, flag} = JSON.parse(message);
        clientField[x][y] = flag ? 'f' : field[x][y];
        wsConnections.forEach(sendField);
    });
    connection.on('close', function(message) {
        wsConnections = wsConnections.filter(c => c !== connection);
    });
});



app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'web', 'index.html'));
});

app.use('/static', express.static(__dirname + '/web'));
