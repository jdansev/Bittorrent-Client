
/* Peer Pieces

  - Each TCP peer connection will maintain it's own separate queue
  - Contains all the pieces that a peer has
  - Populated when the peer returns HAVE or BITFIELD messages

*/


export class PeerPieces {

  constructor(torrent) {
    this._torrent = torrent;
    this._queue = [];
    this._choked = true;
  }

  enqueue = pieceIndex => this._queue.push(pieceIndex);

  dequeue = () => this._queue.shift();

  peek = () => this._queue[0];

  length = () => this._queue.length;

}
