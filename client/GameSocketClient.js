// // --------------------------------------------------

// // socket.io-client interface for RPG store manager
// // bentswanson.com

// // --------------------------------------------------

function GameSocketClient(socketio, debug, handlers={}) {

    this.roomMembers = []
    this.stores = []

    // Must have access to socket.io
    const socket = socketio.connect()

    // Runs handler for when client connects to server, if it exists
    // Passes out a string message
    socket.on('connect', () => {
        const message = 'Connected to server.'
        if (debug) console.log(message)
        if (handlers.serverConnectionHandler) {
            handlers.serverConnectionHandler(message)
        }
    })

    // Runs handler for when client joins a room, if it exists
    // Passes out a string of the room code
    socket.on('room_joined', roomCode => {
        if (debug) console.log(`Joined a room. Code: ${roomCode}`)
        if (handlers.roomJoinedHandler) {
            handlers.roomJoinedHandler(roomCode)
        }
    })

    // Runs handler for a room joining error, if it exists
    // Passes out a string message
    socket.on('no_room', message => {
        if (debug) console.log(message)
        if (handlers.noRoomHandler) {
            handlers.noRoomHandler(message)
        }
    })

    // Runs handler for recieving a room member update, if it exists
    // Passes out an array of the members
    socket.on('room_members', room => {
        if (debug) console.log('Got a room update.')
        this.roomMembers = room
        if (handlers.roomMembersHandler) {
            handlers.roomMembersHandler(this.roomMembers)
        }
    })

    // Runs handler for recieving new stores, if it exists
    // Passes out an array of the stores
    socket.on('new_stores', stores => {
        if (debug) console.log('Got new stores.')
        this.stores = stores
        if (handlers.newStoresHandler) {
            handlers.newStoresHandler(this.stores)
        }
    })

    // Runs handler for when stores are cleared, if it exists
    // This event should be ignored by a GM
    // Passes out an empty array
    socket.on('clear_stores', () => {
        if (debug) console.log('Stores cleared.')
        this.stores = []
        if (handlers.clearStoresHandler) {
            handlers.clearStoresHandler(this.stores)
        }
    })

    // Runs handler for other errors, if it exists
    // Passes out a string message
    socket.on('error', message => {
        if (debug) console.log(message)
        if (handlers.errorHandler) {
            handlers.errorHandler(message)
        }
    })
    
    // Should be called on when GM wants to send stores to certain recipients
    // recipients = [String], stores = [{Store}]
    this.broadcastStores = (stores, recipients) => {
        socket.emit('broadcast_stores', stores, recipients)
    }

    // Should be called on when a client wants to join OR create a room
    // username = String, userType = String ('gm' or 'player'), roomCode = String (Optional when 
    //     creating a room as a GM)
    this.joinOrCreateRoom = (username, userType, roomCode) => {
        socket.emit('room', username, userType, roomCode)
    }

    // Should be called on when a GM wants to clear the stores they sent
    // recipients = [{
    //     id: String,
    //     username: String,
    //     userType: String
    // }]
    this.clearStores = (recipients=[]) => {
        socket.emit('clear_stores', recipients)
    }
}
