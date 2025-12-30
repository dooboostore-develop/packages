import 'reflect-metadata';
import { SimpleBootHttpServer } from '@dooboostore/simple-boot-http-server/SimpleBootHttpServer';
import { HttpServerOption } from '@dooboostore/simple-boot-http-server/option/HttpServerOption';
import { AppRouter } from './routers/AppRouter';
import { ApiRouter } from './routers/ApiRouter';
import { CloseLogEndPoint } from './endpoints/CloseLogEndPoint';
import { ErrorLogEndPoint } from './endpoints/ErrorLogEndPoint';
import { GlobalAdvice } from './advices/GlobalAdvice';
import { WebSocketManager } from '@dooboostore/simple-boot-http-server/websocket/WebSocketManager';

// HTTP 서버 옵션 설정
const option = new HttpServerOption(
  {
    globalAdvice: new GlobalAdvice(),
    closeEndPoints: [new CloseLogEndPoint()],
    errorEndPoints: [new ErrorLogEndPoint()],
    webSocketEndPoints: [WebSocketManager],
    listen: { port: 8080 },
  },
  {
    rootRouter: AppRouter
  }
);

const server = new SimpleBootHttpServer(option).run();
console.log('🚀 Simple Boot HTTP Server is running!');
console.log('📍 Server: http://localhost:8080');
console.log('📄 Static files: http://localhost:8080/resources/');
console.log('🔌 API endpoints: http://localhost:8080/api/');
