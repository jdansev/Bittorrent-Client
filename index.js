
import * as torrentParser from './torrent-parser';
import { PACKET, udpSend } from './tracker';
import { download } from './download';

import { RequestedList } from './requested-list';


const main = async () => {
  console.log('Starting program.');

  const torrent = torrentParser.open('endgame.torrent');


  try {
    let connectResponse = await udpSend(torrent, PACKET.CONNECT);
    console.log(connectResponse);

    let announceResponse = await udpSend(torrent, PACKET.ANNOUNCE, connectResponse);
    console.log(announceResponse);

    /* REQUESTED LIST */
    let requestedList = new RequestedList();

    for (let peer of announceResponse.peers) {
      download(peer, torrent, requestedList);
    }

  } catch (e) {
    console.error(e);
  }


  console.log('Program terminated.');
}


main().catch(e => console.error(e));
