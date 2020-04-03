
import chalk from 'chalk';
import net from 'net';

import { buildHandshake } from './packets';



const msgHandler = (msg, socket, torrent) => {
  if (isHandshake(msg)) return;
}


const isHandshake = msg => {

  // The string length of <pstr> as a single byte
  let pstrlen = msg.readUInt8(0);

  let expectedByteLength = 49 + pstrlen;
  let pstr = msg.toString('utf8', 1, 20);
  let msgByteLength = msg.length;
  let isBTProtocol = pstr === 'BitTorrent protocol';
  let isExpectedByteLength = msgByteLength === expectedByteLength;


  // console.log('============================================');
  // console.log(`pstrlen: ${pstrlen}`);
  // console.log(`pstr: ${pstr}`);
  // console.log(`expectedByteLength: ${expectedByteLength}`);
  // console.log(`msgByteLength: ${msgByteLength}`);
  // console.log(`is Bittorrent protocol? ${isBTProtocol}`);
  // console.log(`isExpectedByteLength: ${isExpectedByteLength}`);
  // console.log('============================================');


  return isExpectedByteLength && isBTProtocol;
}



const handshakePrefix = `${chalk.bgYellow.black(' Handshake ')} `;
const dataPrefix = `${chalk.bgWhite.black(' Data ')}      `;
const connectedPrefix = `${chalk.bgGreen.black(' Connected ')} `;
const errorPrefix = `${chalk.bgRed.white(' Error ')}     `;


const dataLog = (peer) => console.log(`${dataPrefix} ${chalk.gray('received from')}  ${peer.ip}:${peer.port}`);
const errorLog = (peer) => console.log(`${errorPrefix} ${chalk.gray('closing socket')} ${peer.ip}:${peer.port}`);
const handshakeLog = (peer) => console.log(`${handshakePrefix} ${chalk.gray('received from')}  ${peer.ip}:${peer.port}`);
const connectedLog = (peer) => console.log(`${connectedPrefix} ${chalk.gray('to peer at')}     ${peer.ip}:${peer.port}`);


const onWholeMsg = (socket, peer, callback) => {
  let savedBuf = Buffer.alloc(0);
  let handshake = true;

  socket.on('data', recvBuf => {

    dataLog(peer);

    // msgLen calculates the length of a whole message
    const msgLen = () => handshake ? savedBuf.readUInt8(0) + 49 : savedBuf.readInt32BE(0) + 4;
    savedBuf = Buffer.concat([savedBuf, recvBuf]);

    while (savedBuf.length >= 4 && savedBuf.length >= msgLen()) {

      // callback(savedBuf.slice(0, msgLen()));

      if (isHandshake(savedBuf.slice(0, msgLen()))) {
        handshakeLog(peer);
      }

      savedBuf = savedBuf.slice(msgLen());
      handshake = false;
    }
  });
}



export const download = (peer, torrent) => {
  // console.log('Downloading...');

  let socket = net.Socket();

  socket.on('error', () => {
    errorLog(peer);
    socket.destroy();
  });

  socket.connect(peer.port, peer.ip, () => {
    connectedLog(peer);
    socket.write(buildHandshake(torrent));
  });

  onWholeMsg(socket, peer, msg => msgHandler(msg, socket, torrent));
};



