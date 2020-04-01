
import fs from 'fs';
import bencode from 'bencode';

export const open = (filePath) => {
  const encodedTorrent = fs.readFileSync(filePath);
  const decodedTorrent = bencode.decode(encodedTorrent);
  return decodedTorrent;
}
