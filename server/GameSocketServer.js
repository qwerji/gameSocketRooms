// // --------------------------------------------------

// // socket.io-server interface for RPG store manager
// // bentswanson.com

// // --------------------------------------------------

// Pass in socket server, debug bool
function GameSocketServer(io, debug) {
    io.on('connection', socket => {

        if (debug) console.log(`Client joined! id: ${socket.id}`)

        // Triggered on room creation or joining
        socket.on('room', (username, userType, roomCode) => {

            // Set socket info
            socket.username = username
            socket.userType = userType

            const rooms = io.sockets.adapter.rooms

            if (socket.userType === 'player') {
                if (debug) console.log(`Player ${socket.username} wants to join a room.`)

                if (rooms[roomCode]) {
                    // If the room exists
                    if (debug) console.log(`Player ${socket.username} joined a room. code: ${roomCode}`)
                    joinOrCreateRoom(roomCode)
                } else {
                    // If the room does not exist
                    if (debug) console.log(`Player ${socket.username} requested a non-existent room.`)
                    socket.emit('no_room', 'Room does not exist.')
                }
            } else if (socket.userType === 'gm') {
                if (debug) console.log(`GM ${socket.username} requested a room.`)
                if (!rooms[roomCode]) {
                    // If the room does not exist already, generate a new code
                    // This prevents GMs from setting their own room code
                    roomCode = genRoomCode()
                    if (debug) console.log(`GM ${socket.username} created a room. code: ${roomCode}`)
                } else {
                    // If the room exists already, don't set a new code, so they just join the room
                    if (debug) console.log(`GM ${socket.username} joined a room. code: ${roomCode}`)
                }
                joinOrCreateRoom(roomCode)
            } else {
                // If anything other than the right user types were set
                socket.userType = 'player'
                socket.emit('error', 'Invalid user type.')
            }
        })

        // Short hand callback for broadcasting new stores
        socket.on('broadcast_stores', broadcastStores)

        // Short hand callback for broadcasting clear stores message
        socket.on('clear_stores', clearStores)

        // Sometimes the socket is undefined on improper disconnection
        socket.on('disconnect', reason => {
            if (socket) {
                updateGMRoomMembers()
            }
            const name = socket.username || "Someone"
            if (debug) console.log(`${name} disconnected: ${reason}`)
        })

        // Sends room members in a callback
        function getRoomMembers(cb) {
            // Get all room members
            io.of('/').in(socket.roomCode).clients((error, clients) => {
                if (error) throw error
                // Create empty room
                const roomPkg = [],
                    connected = io.sockets.connected
                for (let id of clients) {
                    // Get each socket by id
                    const client = connected[id]
                    // Push the socket info into the room
                    roomPkg.push({
                        id: id,
                        username: client.username,
                        userType: client.userType
                    })
                }
                cb(roomPkg)
            })
        }

        // Sends a GM the current room member information
        function updateGMRoomMembers() {
            getRoomMembers(members => {
                for (let member of members) {
                    // Find the GM
                    if (member.userType === 'gm') {
                        // Send them the members
                        io.to(member.id).emit('room_members', members)
                        return
                    }
                }
            })
        }

        // Sends store information to all selected recipients
        function broadcastStores(stores, recipients) {
            if (debug) {
                console.log("Sending stores:")
                console.log(stores)
                console.log("To:")
                console.log(recipients)
            }
            for (var i = 0; i < recipients.length; i++) {
                io.to(recipients[i]).emit('new_stores', stores)
            }
        }

        // Sends a clear stores message to selected recipients
        // If none are provided, it sends the message to whole room
        function clearStores(recipients) {
            if (!recipients.length) {
                getRoomMembers(members => {
                    sendClearStoresMessage(members)
                })
            } else {
                sendClearStoresMessage(recipients)
            }
        }

        // Helper function
        function sendClearStoresMessage(recipients) {
            for (var i = 0; i < recipients.length; i++) {
                io.to(recipients[i].id).emit('clear_stores')
            }
        }

        // Adds the socket to a room if it exists, or creates and then adds if it doesn't
        function joinOrCreateRoom(roomCode) {
            socket.join(roomCode, () => {
                // Sets the socket's room code
                socket.roomCode = roomCode
                // Sends room code to client
                socket.emit('room_joined', roomCode)
                // Updates GM's player list
                updateGMRoomMembers()
            })
        }

        // Generates a 5 character room code
        function genRoomCode() {
            const roomSeed = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                rooms = io.sockets.adapter.rooms;
            let code
            do {
                code = ''
                for (var i = 0; i < 5; i++) {
                    code += roomSeed[getRandomInt(roomSeed.length)]
                }
            // Keep generating new codes if the code is already in use
            } while (rooms[code])
            return code
        }

        // Helper function
        function getRandomInt(upperBound) {
            return Math.floor(Math.random() * upperBound)
        }

    })
}

// Only allow 1 DM in a room

module.exports = GameSocketServer
