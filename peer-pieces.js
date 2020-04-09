


/* Peer Pieces

  - Each TCP peer connection will maintain it's own separate queue
  - Contains all the pieces that a peer has
  - Populated when the peer returns HAVE or BITFIELD messages

*/


export class PeerPieces {

  constructor() {
    this._queue = [];
  }

  add = pieceIndex => {
    this._queue.push(pieceIndex);
  }

  getAll = () => {
    return this._queue;
  }

}

