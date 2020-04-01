
import * as torrentParser from './torrent-parser';
import { PACKET, udpSend } from './tracker';


const main = async () => {
  console.log('Starting program.');
  const torrent = torrentParser.open('book.torrent');

  try {
    let connectResponse = await udpSend(torrent, PACKET.CONNECT);
    console.log(connectResponse);

    let announceResponse = await udpSend(torrent, PACKET.ANNOUNCE, connectResponse);
    console.log(announceResponse);

  } catch (e) {
    console.error(e);
  }

  console.log('Program terminated.');
}

main().catch(e => console.error(e));
