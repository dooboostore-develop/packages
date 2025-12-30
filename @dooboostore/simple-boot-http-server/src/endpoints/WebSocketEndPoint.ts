import { RawData, WebSocket } from 'ws';
import { IncomingMessage } from 'http';

export type WebSocketSet ={ socket: WebSocket, request: IncomingMessage };
export interface WebSocketEndPoint {

  connect?(wsSet: WebSocketSet): void;
  ping?(wsSet: WebSocketSet): void;
  close?(wsSet: WebSocketSet): void;
  message(wsSet: WebSocketSet, data: {data: RawData, isBinary: boolean}): void;
  error?(wsSet: WebSocketSet, error: Error): void;
}