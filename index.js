
import * as torrentParser from './torrent-parser';
import { PACKET, udpSend } from './tracker';
import { download } from './download';


const main = async () => {
  console.log('Starting program.');
  const torrent = torrentParser.open('endgame.torrent');

  try {
    let connectResponse = await udpSend(torrent, PACKET.CONNECT);
    console.log(connectResponse);

    let announceResponse = await udpSend(torrent, PACKET.ANNOUNCE, connectResponse);
    console.log(announceResponse);

    let peers = announceResponse.peers;

    for (let peer of peers) {
      download(peer, torrent);
    }

    // download(peers[0], torrent);

    

  } catch (e) {
    console.error(e);
  }



  console.log('Program terminated.');
}

main().catch(e => console.error(e));
