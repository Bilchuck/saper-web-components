const express = require('express');
const app = express();
const path = require('path');
const expressWs = require('express-ws')(app);
const port = process.env.PORT || 8080;
const { makeField, closedField, makeStep } = require('./saper');

const FLAG_C = 'f';
const field = makeField();
let clientField = closedField();

app.listen(port, () => console.log(`App is running on ${port}`));
let wsConnections = [];
app.ws('/ws', function(connection) {
    const sendField = c => c.send(JSON.stringify({field: clientField}));
    const sendChanges = changes => c => c.send(JSON.stringify({changes}));

    wsConnections.push(connection);
    sendField(connection);

    connection.on('message', function(message) {
        const {x, y, flag} = JSON.parse(message);
        if (flag) {
            clientField[x][y] = FLAG_C;  
            wsConnections.forEach(sendChanges({x,y,value: FLAG_C}));  
        } else {
            const {changes, newField} = makeStep({x,y,field, oldField: clientField});
            clientField = newField;
            wsConnections.forEach(sendChanges(changes));
        }
    });
    connection.on('close', function(message) {
        wsConnections = wsConnections.filter(c => c !== connection);
    });
});



app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'web', 'index.html'));
});

app.use('/static', express.static(__dirname + '/web'));
