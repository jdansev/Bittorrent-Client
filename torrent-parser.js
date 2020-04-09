
import fs from 'fs';
import crypto from 'crypto';
import bencode from 'bencode';
import { toBigIntBE, toBufferBE } from 'bigint-buffer';



export const open = (filePath) => {
  const encodedTorrent = fs.readFileSync(filePath);
  const decodedTorrent = bencode.decode(encodedTorrent);
  return decodedTorrent;
}


export const getInfoHash = torrent => {
	const info = bencode.encode(torrent.info);
	return crypto.createHash('sha1').update(info).digest();
};


/* Returns a BigInt */
const getTorrentSize = torrent => {
	const size = torrent.info.files ?
		torrent.info.files.map(file => file.length).reduce((a, b) => a + b) :
		torrent.info.length;

	return BigInt(size);
};


/* Returns a buffer */
export const getTorrentSizeBuffer = torrent => toBufferBE(getTorrentSize(torrent), 8);


/* Returns a BigInt */
export const getPieceLength = (torrent, pieceIndex) => {
	const totalLength = getTorrentSize(torrent);
	const pieceLength = BigInt(torrent.info['piece length']);
	let lastPieceLength = totalLength % pieceLength;
	let lastPieceIndex = Math.floor(Number(totalLength / pieceLength));

	// console.log(`totalLength: ${totalLength}`);
	// console.log(`pieceLength: ${pieceLength}`);
	// console.log(`lastPieceLength: ${lastPieceLength}`);
	// console.log(`lastPieceIndex: ${lastPieceIndex}`);

	return pieceIndex == lastPieceIndex ? lastPieceLength : pieceLength;
}



const generatePeerId = () => {
	let peerId;
	return () => {
		if (!peerId) {
			peerId = crypto.randomBytes(20);
			Buffer.from('-BC0001-').copy(peerId, 0);
		}
		return peerId;
	}
}

export const getPeerId = generatePeerId();
