




export class PeerConnection {

  constructor(ip, port) {
    this._ip = ip;
    this._port = port;
  }

}


export class Peer {

  constructor(connection) {
    this._connection = connection;
    this._pieceQueue = [];
    this._choked = true;
  }

}



