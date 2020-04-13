import crypto from 'crypto';



/* Connect Request

Offset   Size (bits)   Size (bytes)   Name             Value
-------------------------------------------------------------------------------------
0        64-bit        8 bytes        protocol_id      0x41727101980   (magic number)
8        32-bit        4 bytes        action           0               (connect)
12       32-bit        4 bytes        transaction_id   <randomly generated>
16                                                                                     */

export const buildConnectPacket = () => {
	let buffer = Buffer.alloc(16);

	// Protocol ID
	buffer.writeUInt32BE(0x417, 0);
	buffer.writeUInt32BE(0x27101980, 4);

	// Action
	buffer.writeUInt32BE(0, 8);

	// Transaction ID
	crypto.randomBytes(4).copy(buffer, 12);

	return buffer;
}



/* Announce Request

Offset   Size (bits)   Size (bytes)   Name             Value
----------------------------------------------------------------------------------------------
0        64-bit        8 bytes        connection_id    <Connection ID> (from Connect Response)
8        32-bit        4 bytes        action           1 (announce)
12       32-bit        4 bytes        transaction_id   <Randomly Generated>
16       160-bit       20 bytes       info_hash
36       160-bit       20 bytes       peer_id
56       64-bit        8 bytes        downloaded       0
64       64-bit        8 bytes        left             <Torrent File Size>
72       64-bit        8 bytes        uploaded         0
80       32-bit        4 bytes        event            0 (None)
84       32-bit        4 bytes        ip_address       0
88       32-bit        4 bytes        key              <Randomly Generated>
92       32-bit        4 bytes        num_want         -1
96       16-bit        2 bytes        port             6881 (between 6881 and 6889)
98                                                                                              */

export const buildAnnouncePacket = (connId, torrent, port = 6881) => {
	let buffer = Buffer.alloc(98);

	// Connection ID
	connId.copy(buffer, 0);

	// Action - 1: Announce
	buffer.writeUInt32BE(0x1, 8);

	// Transaction ID
	crypto.randomBytes(4).copy(buffer, 12);

	// Info Hash
	torrent.getInfoHash().copy(buffer, 16);

	// Peer ID
	torrent.generatePeerId().copy(buffer, 36);

	// Downloaded
	Buffer.alloc(8).copy(buffer, 56);

	// Left
	torrent.getTorrentSizeBuffer().copy(buffer, 64);

	// Uploaded
	Buffer.alloc(8).copy(buffer, 72);

	// Event - 0: None, 1: Completed, 2: Started, 3: Stopped
	buffer.writeUInt32BE(0x0, 80);

	// IP Address
	buffer.writeUInt32BE(0x0, 84);

	// Key
	crypto.randomBytes(4).copy(buffer, 88);

	// Num Want
	buffer.writeInt32BE(-1, 92);

	// Port
	buffer.writeUInt16BE(port, 96);

	return buffer;
}



/* Handshake

Offset   Size (bits)   Size (bytes)   Name             Value
--------------------------------------------------------------------------------------
0        8-bit         1 byte         pstrlen          <String length of pstr>
1        152-bit       19 bytes       pstr             "BitTorrent protocol"
20       64-bit        8 bytes        reserved         0
28       160-bit       20 bytes       info_hash        <SHA-1 Hash of Torrent's Info>
48       160-bit       20 bytes       peer_id          <Peer ID from Announce Request>
68                                                                                      */

export const buildHandshake = torrent => {
	let buffer = Buffer.alloc(68);

	// pstrlen
	buffer.writeUInt8(19, 0);

	// pstr
	buffer.write('BitTorrent protocol', 1);

	// Reserved
	Buffer.alloc(8).copy(buffer, 20);

	// Info Hash
	torrent.getInfoHash().copy(buffer, 28);

	// Peer ID
	torrent.generatePeerId().copy(buffer, 48);

	return buffer;
}
