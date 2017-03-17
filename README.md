# gameSocketRooms
A socket.io interface designed for a specific fantasy RPG store management project.
## Running the test project
```bash
npm i -S
```
```bash
npm start
```
or
```bash
node server
```
As of now, the test file has no UI.
## Using the module
### Node Server
```javascript
// ...

// Needs socket.io
const socket = require('socket.io'),
    gameSocket = require('./server/GameSocketServer.js') // or wherever you put it

// ...

const io = socket(server)

// Pass in socket server, debug bool
gameSocket(io, true)
```
### Client
```html
<script src="/socket.io/socket.io.js"></script>
<script src="GameSocketClient.js"></script>
```
Barebones
```html
<script>
    const gameSocket = new GameSocketClient(io, true)
</script>
```
With event handlers
```html
<script>
// Example:
const eventHandlers = {
    serverConnectionHandler: message => {
        // message, String, server connection success
    },
    roomJoinedHandler: roomCode => {
        // roomCode, String, joined room's code
    },
    noRoomHandler: message => {
        // message, String, room error message
    },
    roomMembersHandler: room => {
        // room
        //    [{
        //      id: String,
        //      username: String,
        //      userType: String
        //    }]
        // current room members
        // Also stored in gameSocket.roomMembers
    },
    newStoresHandler: stores => {
        // stores, [{???}], available stores
        // Also stored in gameSocket.stores
    },
    clearStoresHandler: stores => {
        // stores, [], empty array
        // Also stored in gameSocket.stores
    },
    errorHandler: message => {
        // message, String, error message
    }
}

// Initialize with io (from socket.io), and your event handler functions
// Second arg is a debug bool
const gameSocket = new GameSocketClient(io, true, eventHandlers)

// Methods to use:
gameSocket.joinOrCreateRoom(username, userType, roomCode)
gameSocket.broadcastStores(stores, recipients)
gameSocket.clearStores()
</script>
```
>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.