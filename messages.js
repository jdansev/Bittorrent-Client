
/* Message

    <Length Prefix> <Message ID> <Payload>

    Length prefix: 4-byte big endian value
    Message ID: Single decimal byte
    Payload: Message dependant

*/

const buildMessage = messageID => {
    const buffer = Buffer.alloc(5);
    buffer.writeUInt32BE(1, 0);       // Length
	buffer.writeUInt8(messageID, 4);  // ID
    return buffer;
}



/* Keep Alive

Offset   Size (bits)   Size (bytes)   Name             Value
-------------------------------------------------------------------------
0        64-bit        4 bytes        length_prefix    0                   */

export const buildKeepAlive = () => Buffer.alloc(4);



/* Choke

Offset   Size (bits)   Size (bytes)   Name             Value
-------------------------------------------------------------------------
0        64-bit         4 bytes       length_prefix    1
4        8-bit          1 byte        id               0 (Choke)           */

export const buildChoke = () => buildMessage(0);



/* Unchoke

Offset   Size (bits)   Size (bytes)   Name             Value
-------------------------------------------------------------------------
0        64-bit        4 bytes        length_prefix    1
4        8-bit         1 byte         id               1 (Unchoke)         */

export const buildChoke = () => buildMessage(1);



/* Interested

Offset   Size (bits)   Size (bytes)   Name             Value
-------------------------------------------------------------------------
0        64-bit         4 bytes       length_prefix    1
4        8-bit          1 byte        id               2 (Interested)      */

export const buildInterested = () => buildMessage(2);



/* Not Interested

Offset   Size (bits)   Size (bytes)   Name             Value
-------------------------------------------------------------------------
0        64-bit        4 bytes        length_prefix    1
4        8-bit         1 byte         id               3 (Not Interested)  */

export const buildNotInterested = () => buildMessage(3);








const buildHave = () => {

}


const buildBitfield = () => {

}


const buildRequest = () => {

}