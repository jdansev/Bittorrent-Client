import chalk from 'chalk';
import net from 'net';

import { buildHandshake } from './packets';
import { buildInterested } from './messages';
import { haveHandler, bitfieldHandler, chokeHandler, unchokeHandler } from './message-handlers';

import { PeerPieces } from './peer-pieces';
import { SocketTimeout } from './timeout';


/* TODO: Move into Logger file */
const handshakePrefix = `${chalk.bgYellow.black(' Handshake ')} `;
const dataPrefix = `${chalk.bgWhiteBright.black(' Data ')}      `;
const connectedPrefix = `${chalk.bgGreen.black(' Connected ')} `;
const errorPrefix = `${chalk.bgRed.white(' Error ')}     `;

const dataLog = (peer) => console.log(`${dataPrefix} ${chalk.gray('received from')}  ${peer.ip}:${peer.port}`);
const errorLog = (peer) => console.log(`${errorPrefix} ${chalk.gray('closing socket')} ${peer.ip}:${peer.port}`);
const handshakeLog = (peer) => console.log(`${handshakePrefix} ${chalk.gray('received from')}  ${peer.ip}:${peer.port}`);
const connectedLog = (peer) => console.log(`${connectedPrefix} ${chalk.gray('to peer at')}     ${peer.ip}:${peer.port}`);




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




const onWholeMsg = (socket, peer, peerPieces) => {
  let savedBuf = Buffer.alloc(0);
  let handshake = true;
  

  /* Start handshake timeout */
  let handshakeTimeout = new SocketTimeout('Handshake Timeout', socket, peer);
  handshakeTimeout.start(10000);
  

  // When placed inside the socket's receive listener, the timeout resets each time a follow up message is received
  let messageTimeout = new SocketTimeout('Message Timeout', socket, peer);


  socket.on('data', recvBuf => {

    // Calculates the length of a whole message
    const msgLen = () => handshake ? savedBuf.readUInt8(0) + 49 : savedBuf.readInt32BE(0) + 4;
    savedBuf = Buffer.concat([savedBuf, recvBuf]);


    // On socket message, and handshake has already been received, start the follow up timeout
    if (handshake) {
      messageTimeout.start(10000);
    }


    while (savedBuf.length >= 4 && savedBuf.length >= msgLen()) {


      if (isHandshake(savedBuf.slice(0, msgLen()))) {
        handshakeTimeout.clear();
        handshakeLog(peer);
        socket.write(buildInterested());
      }
      
      else {
        // messageTimeout.clear();

        const message = parseSocketMessage(savedBuf.slice(0, msgLen()));

        if (message.id === 0) {
          chokeHandler(peer);
        } else if (message.id === 1) {
          unchokeHandler(peer);
        } else if (message.id === 4) {
          haveHandler(message.payload, peerPieces, peer);
        } else if (message.id === 5) {
          bitfieldHandler(peer);
        } else {
          dataLog(peer);
        }
        console.log(message);
      }

      savedBuf = savedBuf.slice(msgLen());
      handshake = false;
    }
  });
}



export const download = (peer, torrent, pieces) => {

  /* Peer Pieces */
  let peerPieces = new PeerPieces();

  let socket = net.Socket();

  socket.on('error', _ => {
    errorLog(peer);
    socket.destroy();
  });

  socket.connect(peer.port, peer.ip, () => {
    connectedLog(peer);
    socket.write(buildHandshake(torrent));

    connectTimeout.clear();

    // Only enable the data listener once socket is connected
    onWholeMsg(socket, peer, peerPieces);
  });

  /* Connect Timeout */
  let connectTimeout = new SocketTimeout('Connection Timeout', socket, peer);
  connectTimeout.start(10000);

};
