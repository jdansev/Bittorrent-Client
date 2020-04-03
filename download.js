import chalk from 'chalk';
import net from 'net';

import { createSocketTimeout } from './timeout';
import { buildHandshake } from './packets';
import { buildInterested } from './messages';
import { haveHandler, bitfieldHandler, chokeHandler, unchokeHandler } from './message-handlers';



const parseRecvBuf = msg => {
  const id = msg.length > 4 ? msg.readInt8(4) : null;
  let payload = msg.length > 5 ? msg.slice(5) : null;

  if (id === 6 || id === 7 || id === 8) {
    const rest = payload.slice(8);
    payload = {
      index: payload.readInt32BE(0),
      begin: payload.readInt32BE(4)
    };
    payload[id === 7 ? 'block' : 'length'] = rest;
  }

  return {
    size: msg.readInt32BE(0),
    id: id,
    payload: payload
  }
};




const isHandshake = msg => {

  // The string length of <pstr> as a single byte
  let pstrlen = msg.readUInt8(0);

  let expectedByteLength = 49 + pstrlen;
  let pstr = msg.toString('utf8', 1, 20);
  let msgByteLength = msg.length;
  let isBTProtocol = pstr === 'BitTorrent protocol';
  let isExpectedByteLength = msgByteLength === expectedByteLength;

  return isExpectedByteLength && isBTProtocol;
}



const handshakePrefix = `${chalk.bgYellow.black(' Handshake ')} `;
const dataPrefix = `${chalk.bgWhiteBright.black(' Data ')}      `;
const connectedPrefix = `${chalk.bgGreen.black(' Connected ')} `;
const errorPrefix = `${chalk.bgRed.white(' Error ')}     `;

const dataLog = (peer) => console.log(`${dataPrefix} ${chalk.gray('received from')}  ${peer.ip}:${peer.port}`);
const errorLog = (peer) => console.log(`${errorPrefix} ${chalk.gray('closing socket')} ${peer.ip}:${peer.port}`);
const handshakeLog = (peer) => console.log(`${handshakePrefix} ${chalk.gray('received from')}  ${peer.ip}:${peer.port}`);
const connectedLog = (peer) => console.log(`${connectedPrefix} ${chalk.gray('to peer at')}     ${peer.ip}:${peer.port}`);



const onWholeMsg = (socket, peer) => {

  const HANDSHAKE_TIMEOUT_MS = 10000;
  const FOLLOW_UP_TIMEOUT_MS = 10000;

  let savedBuf = Buffer.alloc(0);
  let handshake = true;

  /* Start handshake timeout */
  let handshakeTimeout = createSocketTimeout('Handshake Timeout', socket, peer, HANDSHAKE_TIMEOUT_MS);
  handshakeTimeout.start();




  socket.on('data', recvBuf => {

    // msgLen calculates the length of a whole message
    const msgLen = () => handshake ? savedBuf.readUInt8(0) + 49 : savedBuf.readInt32BE(0) + 4;
    savedBuf = Buffer.concat([savedBuf, recvBuf]);

    while (savedBuf.length >= 4 && savedBuf.length >= msgLen()) {

      // callback(savedBuf.slice(0, msgLen()));

      // When placed inside the socket's receive listener, the timeout resets each time a follow up is received
      let followUpTimeout = createSocketTimeout('Follow Up Timeout', socket, peer, FOLLOW_UP_TIMEOUT_MS);

      if (isHandshake(savedBuf.slice(0, msgLen()))) {
        handshakeTimeout.stop();

        handshakeLog(peer);
        socket.write(buildInterested());

        // After handshake start the follow up timeout
        followUpTimeout.start();

      } else {

        followUpTimeout.stop();

        const msg = parseRecvBuf(savedBuf.slice(0, msgLen()));

        switch (msg.id) {
          case 0:
            chokeHandler(peer);
            break;

          case 1:
            unchokeHandler(peer);
            break;

          case 4:
            haveHandler(peer);
            break;

          case 5:
            bitfieldHandler(peer);
            break;

          default:
            dataLog(peer);
            break;

        }

        console.log(msg);
      }

      savedBuf = savedBuf.slice(msgLen());
      handshake = false;
    }
  });
}





const connectToPeer = () => {

}







export const download = (peer, torrent) => {
  const CONNECTION_TIMEOUT_MS = 10000;

  let socket = net.Socket();

  let connectTimeout = createSocketTimeout('Connection Timeout', socket, peer, CONNECTION_TIMEOUT_MS);
  connectTimeout.start();


  socket.on('error', err => {
    errorLog(peer);
    socket.destroy();
  });

  socket.connect(peer.port, peer.ip, () => {
    connectedLog(peer);
    socket.write(buildHandshake(torrent));

    connectTimeout.stop();

    // Only enable the data listener once socket is connected
    onWholeMsg(socket, peer);
  });

};