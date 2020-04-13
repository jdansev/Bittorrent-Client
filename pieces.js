
/* Pieces

  - Tracks which pieces are already requested
  - A single list shared by all TCP peer connections

*/

export class Pieces {

  constructor(torrent) {
    this._torrent = torrent;
    this._requested = [];
    this._received = [];
  }

  addRequested = pieceIndex => {
    this._requested.push(pieceIndex);
  }

  addReceived = pieceIndex => {
    this._received.push(pieceIndex);
  }

}
