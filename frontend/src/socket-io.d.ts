import type * as SocketIO from "socket.io-client";

declare global {
    const SOCKET_IO: SocketIO.Socket;
    interface Window {
        SOCKET_IO: SocketIO.Socket;
    }
}
