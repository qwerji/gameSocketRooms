// Server and socket.io boilerplate
const express = require('express'),
    app = express(),
    path = require('path'),
    socket = require('socket.io'),
    gameSocket = require('./server/GameSocketServer.js'),
    port = 8000;

app.use(express.static(path.join(__dirname, '/client')))

const server = app.listen(port, () => console.log(`Listening on ${port}`)),
    io = socket(server)

// Initialzes custom socket setup
gameSocket(io, true)
