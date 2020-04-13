
import fs from 'fs';
import bencode from 'bencode';
import crypto from 'crypto';
import url from 'url';
import { toBigIntBE, toBufferBE } from 'bigint-buffer';


export class Torrent {

  constructor(filePath) {
    this._torrent = bencode.decode(fs.readFileSync(filePath));
  }

  getAnnounceUrl = () => {
    if (!this._announceUrl) {
      this._announceUrl = url.parse(this._torrent.announce.toString('utf8'));
    }
    return this._announceUrl;
  };

  getInfoHash = () => {
    if (!this._infoHash) {
      let info = bencode.encode(this._torrent.info);
      this._infoHash = crypto.createHash('sha1').update(info).digest();
    }
    return this._infoHash;
  };

  getTorrentSize = () => {
    let size = this._torrent.info.files ?
      this._torrent.info.files.map(file => file.length).reduce((a, b) => a + b) :
      this._torrent.info.length;
	  return BigInt(size);
  };

  getTorrentSizeBuffer = () => toBufferBE(this.getTorrentSize(this._torrent), 8);

  getPieceLength = (torrent, pieceIndex) => {
    let totalLength = getTorrentSize(torrent);
    let pieceLength = BigInt(torrent.info['piece length']);
    let lastPieceLength = totalLength % pieceLength;
    let lastPieceIndex = Math.floor(Number(totalLength / pieceLength));

    return pieceIndex == lastPieceIndex ? lastPieceLength : pieceLength;
  };

  generatePeerId = () => {
    if (!this._peerId) {
      this._peerId = crypto.randomBytes(20);
      Buffer.from('-BC0001-').copy(this._peerId, 0);
    }
    return this._peerId;
  };

}
