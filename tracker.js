import url from 'url';
import dgram from 'dgram';

import { buildConnectPacket, buildAnnouncePacket } from './packets';

const RETRY_TIMEOUT_MS = 1000;
const MAX_RETRIES = 5;



export const PACKET = Object.freeze({
  CONNECT: 0,
  ANNOUNCE: 1,
});

const parseConnectResponse = response => {
  return {
    action: response.readUInt32BE(0),
    transactionId: response.readUInt32BE(4),
    connectionId: response.slice(8)
  }
}

const parseAnnounceResponse = response => {
  function group(iterable, groupSize) {
    let groups = [];
    for (let i = 0; i < iterable.length; i += groupSize) {
      groups.push(iterable.slice(i, i + groupSize));
    }
    return groups;
  }

  return {
    action: response.readUInt32BE(0),
    transactionId: response.readUInt32BE(4),
    leechers: response.readUInt32BE(8),
    seeders: response.readUInt32BE(12),
    peers: group(response.slice(20), 6).map(address => {
      return {
        ip: address.slice(0, 4).join('.'),
        port: address.readUInt16BE(4)
      }
    })
  }
}


const responseType = response => {
  const action = response.readUInt32BE(0);
  if (action === 0) return 'connect';
  if (action === 1) return 'announce';
}


export const udpSend = (torrent, packetType, connResponse = undefined) => {
  let socket = dgram.createSocket('udp4');
  let announceUrl = url.parse(torrent.announce.toString('utf8'));

  return new Promise((resolve, reject) => {
    let retryTimer;
    let nRetries = 0;

    const closeSocket = () => {
      clearTimeout(retryTimer);
      if (socket) {
        socket.close();
        socket = undefined;
      }
    }

    const onSocketResponse = socketResponse => {
      let response;

      if (responseType(socketResponse) == 'connect') {
        console.log('Connect response received.');
        response = parseConnectResponse(socketResponse);
      }
      
      else if (responseType(socketResponse) == 'announce') {
        console.log('Announce response received.');
        response = parseAnnounceResponse(socketResponse);
      }

      closeSocket();
      return resolve(response);
    }

    const onMaxRetries = () => {
      closeSocket();
      return reject('Max retries reached.');
    }

    const send = () => {
      if (nRetries >= MAX_RETRIES) {
        return onMaxRetries();
      }

      let udpPacket;
      switch (packetType) {
        case PACKET.CONNECT:
          udpPacket = buildConnectPacket();
          console.log('Sending connect request...');
          break;
        case PACKET.ANNOUNCE:
          udpPacket = buildAnnouncePacket(connResponse.connectionId, torrent);
          console.log('Sending announce request...');
          break;
      }

      /* Send the UDP packet */
      socket.send(udpPacket, 0, udpPacket.length, announceUrl.port, announceUrl.hostname, () => {});
      socket.on('message', onSocketResponse);

      retryTimer = setTimeout(send, RETRY_TIMEOUT_MS);
      nRetries++;
    }

    send();
  });

};
