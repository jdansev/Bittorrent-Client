
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
