import { BehaviorSubject } from 'rxjs'
import { WebSocketServer, WebSocket } from 'ws';

export interface Message {
  connectionId: number;
  playerId: number;
  messageType: string;
  data?: any;
}

interface Connection {
  playerId: number,
  ws: WebSocket
}
export class ConnectionManager {

  server: any
  wss: WebSocketServer
  connections: Connection[] = []

  messagePipe: BehaviorSubject<Message> = new BehaviorSubject({
    connectionId: -1,
    playerId: -1,
    messageType: "void"
  })

  constructor() {

    this.wss = new WebSocketServer({ port: 8080 });
    
    this.wss.on('connection', (ws) => {

      let id = this.connections.push({
        playerId: -1,
        ws: ws
      }) - 1

      ws.on('error', console.error);
    
      ws.on('message', (data) => {
        console.log('received: %s', data);
        let message = JSON.parse(data.toString())
        this.messagePipe.next(message as Message)
      });

      ws.send(JSON.stringify({
        "connectionId": id,
        "playerId": -1,
        "messageType": "connection"
      }))

    });

    console.log("server listening on port 8080")
  }

  getMessagePipe(): BehaviorSubject<Message> {
    return this.messagePipe
  }

  setPlayerId(connectionId: number, playerId: number) {
    this.connections[connectionId].playerId = playerId
  }

  sendMessage(playerId: number, messagetype: string, data?: any) {
    let connectionId = this.connections.findIndex(c => c.playerId === playerId)
    console.log("Sending message: " + JSON.stringify({
      connectionId: connectionId,
      playerId: playerId,
      messageType: messagetype,
      data: data || null      
    }))
    this.connections[connectionId].ws.send(JSON.stringify({
      connectionId: connectionId,
      playerId: playerId,
      messageType: messagetype,
      data: data || null
    }))
  }

  broadcast(messageType: string, data?: any) {
    this.connections.forEach( (c:Connection,index:number) => {
      console.log("Sending broadcast message: " + JSON.stringify({
        connectionId: index,
        playerId: c.playerId,
        messageType: messageType,
        data: data || null      
      }))
      c.ws.send(JSON.stringify({
        connectionId: index,
        playerId: c.playerId,
        messageType: messageType,
        data: data || null
      }))
    })

  }
}