
export const createSocketTimeout = (timeoutName, socket, peer, TIMEOUT_MS) => {
    let flag = false;

    return {
        start: () => setTimeout(() => {
            if (!flag) {
                console.log(`${timeoutName} ${peer.ip}:${peer.port}`);
                socket.destroy();
            }
        }, TIMEOUT_MS),

        clear: () => flag = true
    }
}



export class SocketTimeout {

    constructor(timeoutName, socket, peer) {
        this._flag = false;
        this._timeoutName = timeoutName;
        this._socket = socket;
        this._peer = peer;
    }

    start = (TIMEOUT_MS) => {
        setTimeout(() => {
            if (!this._flag) {
                console.log(`${this._timeoutName} ${this._peer.ip}:${this._peer.port}`);
                this._socket.destroy();
            }
        }, TIMEOUT_MS);
    }

    clear = () => this._flag = true;
}
