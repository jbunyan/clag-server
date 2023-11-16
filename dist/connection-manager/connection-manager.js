"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionManager = void 0;
const rxjs_1 = require("rxjs");
const ws_1 = require("ws");
class ConnectionManager {
    constructor() {
        // console.log(`Process.env: ${JSON.stringify(process.env)}`)
        var _a;
        this.connections = [];
        this.PORT = (_a = process.env['PORT']) !== null && _a !== void 0 ? _a : '8080';
        this.messagePipe = new rxjs_1.BehaviorSubject({
            connectionId: -1,
            playerId: -1,
            messageType: "void"
        });
        this.wss = new ws_1.WebSocketServer({ port: parseInt(this.PORT) });
        this.wss.on('connection', (ws) => {
            let id = this.connections.push({
                playerId: -1,
                ws: ws
            }) - 1;
            ws.on('error', console.error);
            ws.on('message', (data) => {
                console.log('received: %s', data);
                let message = JSON.parse(data.toString());
                this.messagePipe.next(message);
            });
            ws.send(JSON.stringify({
                "connectionId": id,
                "playerId": -1,
                "messageType": "connection"
            }));
        });
        console.log(`server listening on port ${this.PORT}`);
    }
    getMessagePipe() {
        return this.messagePipe;
    }
    setPlayerId(connectionId, playerId) {
        this.connections[connectionId].playerId = playerId;
    }
    sendMessage(playerId, messagetype, data) {
        let connectionId = this.connections.findIndex(c => c.playerId === playerId);
        console.log("Sending message: " + JSON.stringify({
            connectionId: connectionId,
            playerId: playerId,
            messageType: messagetype,
            data: data || null
        }));
        this.connections[connectionId].ws.send(JSON.stringify({
            connectionId: connectionId,
            playerId: playerId,
            messageType: messagetype,
            data: data || null
        }));
    }
    broadcast(messageType, data) {
        this.connections.forEach((c, index) => {
            console.log("Sending broadcast message: " + JSON.stringify({
                connectionId: index,
                playerId: c.playerId,
                messageType: messageType,
                data: data || null
            }));
            c.ws.send(JSON.stringify({
                connectionId: index,
                playerId: c.playerId,
                messageType: messageType,
                data: data || null
            }));
        });
    }
}
exports.ConnectionManager = ConnectionManager;
