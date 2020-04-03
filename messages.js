
/* Message

    <Length Prefix> <Message ID> <Payload>

    Length prefix: 4-byte big endian value
    Message ID: Single decimal byte
    Payload: Message dependant

*/

const buildMessage = messageID => {
    const buffer = Buffer.alloc(5);

    // Length
    buffer.writeUInt32BE(1, 0);

    // ID
    buffer.writeUInt8(messageID, 4);

    return buffer;
}



/* Keep Alive

Offset   Size (bits)   Size (bytes)   Name             Value
-------------------------------------------------------------------------
0        64-bit        4 bytes        length_prefix    0                 
4                                                                          */

export const buildKeepAlive = () => Buffer.alloc(4);



/* Choke

Offset   Size (bits)   Size (bytes)   Name             Value
-------------------------------------------------------------------------
0        64-bit         4 bytes       length_prefix    1
4        8-bit          1 byte        id               0 (Choke)         
5                                                                          */

export const buildChoke = () => buildMessage(0);



/* Unchoke

Offset   Size (bits)   Size (bytes)   Name             Value
-------------------------------------------------------------------------
0        64-bit        4 bytes        length_prefix    1
4        8-bit         1 byte         id               1 (Unchoke)       
5                                                                          */

export const buildUnchoke = () => buildMessage(1);



/* Interested

Offset   Size (bits)   Size (bytes)   Name             Value
-------------------------------------------------------------------------
0        64-bit         4 bytes       length_prefix    1
4        8-bit          1 byte        id               2 (Interested)    
5                                                                          */

export const buildInterested = () => buildMessage(2);



/* Not Interested

Offset   Size (bits)   Size (bytes)   Name             Value
-------------------------------------------------------------------------
0        64-bit        4 bytes        length_prefix    1
4        8-bit         1 byte         id               3 (Not Interested)
5                                                                          */

export const buildNotInterested = () => buildMessage(3);








const buildHave = () => {

}

const buildBitfield = () => {

}

const buildRequest = () => {

}

const buildPiece = () => {

}

const buildCancel = () => {

}

const buildPort = () => {

}
