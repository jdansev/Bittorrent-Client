
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


export const getTorrentSize = torrent => {
	const size = torrent.info.files ?
		torrent.info.files.map(file => file.length).reduce((a, b) => a + b) :
		torrent.info.length;

	return toBufferBE(BigInt(size), 8);
};


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
