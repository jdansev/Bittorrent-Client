
import readline from 'readline';


import { PACKET, udpSend } from './tracker';
import { download } from './download';

import { Pieces } from './pieces';
import { PeerConnection, Peer } from './peer';
import { Torrent } from './torrent';


let peerList = [];



const main = async () => {
  console.log('Starting program.');


  const torrent = new Torrent('endgame.torrent');
  console.log(torrent);


  try {
    let connectResponse = await udpSend(torrent, PACKET.CONNECT);
    console.log(connectResponse);

    let announceResponse = await udpSend(torrent, PACKET.ANNOUNCE, connectResponse);
    console.log(announceResponse);

    /* Pieces */
    let pieces = new Pieces();

    let peerConnections = announceResponse.peers

    

    for (let peerConnection of peerConnections) {

      let { ip, port } = peerConnection;
      let conn = new PeerConnection(ip, port);
      let peer = new Peer(conn);
      peerList.push(peer);

      download(peerConnection, torrent, pieces);
    }

  } catch (e) {
    console.error(e);
  }






  // readline.emitKeypressEvents(process.stdin);
  // process.stdin.setRawMode(true);

  // process.stdin.on('keypress', (str, key) => {

  //   if (key.ctrl && key.name === 'c') {
  //     process.exit();
  //   } else {
  //     // console.log(`You pressed the "${str}" key`);
  //     // console.log();
  //     // console.log(key);
  //     // console.log();

  //     if (key.name === '1') {
  //       console.log(peerList);
  //     }

  //   }
  // });
  // console.log('Press any key...');


}


main().catch(e => console.error(e));
