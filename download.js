import chalk from 'chalk';
import net from 'net';

import { createSocketTimeout } from './timeout';
import { buildHandshake } from './packets';
import { buildInterested } from './messages';
import { haveHandler, bitfieldHandler, chokeHandler, unchokeHandler } from './message-handlers';



const parseSocketMessage = message => {
  const id = message.length > 4 ? message.readInt8(4) : null;
  let payload = message.length > 5 ? message.slice(5) : null;

  if (id === 6 || id === 7 || id === 8) {
    const rest = payload.slice(8);
    payload = {
      index: payload.readInt32BE(0),
      begin: payload.readInt32BE(4)
    };
    payload[id === 7 ? 'block' : 'length'] = rest;
  }

  return {
    size: message.readInt32BE(0),
    id: id,
    payload: payload
  }
};




const isHandshake = message => {

  // The string length of <pstr> as a single byte
  let pstrlen = message.readUInt8(0);

  let expectedByteLength = 49 + pstrlen;
  let pstr = message.toString('utf8', 1, 20);
  let msgByteLength = message.length;
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


  
  // When placed inside the socket's receive listener, the timeout resets each time a follow up message is received
  let messageTimeout = createSocketTimeout('Message Timeout', socket, peer, FOLLOW_UP_TIMEOUT_MS);


  socket.on('data', recvBuf => {

    // Calculates the length of a whole message
    const msgLen = () => handshake ? savedBuf.readUInt8(0) + 49 : savedBuf.readInt32BE(0) + 4;
    savedBuf = Buffer.concat([savedBuf, recvBuf]);


    // On socket message, and handshake has already been received, start the follow up timeout
    if (handshake) {
      messageTimeout.start();
    }


    while (savedBuf.length >= 4 && savedBuf.length >= msgLen()) {


      if (isHandshake(savedBuf.slice(0, msgLen()))) {

        handshakeTimeout.stop();

        handshakeLog(peer);
        socket.write(buildInterested());

      } else {

        messageTimeout.stop();

        const message = parseSocketMessage(savedBuf.slice(0, msgLen()));

        switch (message.id) {
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

        console.log(message);
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


  socket.on('error', _ => {
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
