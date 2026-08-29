import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer | null = null;

export const initSocket = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`⚡ [WebSocket] Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`🔌 [WebSocket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
};

export const emitEvent = (event: string, payload: any): void => {
  if (io) {
    io.emit(event, payload);
  }
};