import url from 'url';
import crypto from 'crypto';
import dgram from 'dgram';


const RETRY_TIMEOUT_MS = 1200;
const MAX_RETRIES = 5;


const buildConnectRequest = () => {
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


const parseConnectResponse = (response) => {
	return {
		action: response.readUInt32BE(0),
		transactionId: response.readUInt32BE(4),
		connectionId: response.slice(8)
	}
}


const sendConnectionRequest = (socket, msg, connectUrl) => {
	socket.send(msg, 0, msg.length, connectUrl.port, connectUrl.hostname, () => {});
}


const connectToTracker = (rawAnnounceUrl) => {

	/* Establish a new tracker connection */
	return new Promise((resolve, reject) => {

		let nRetries = 0;

		let announceUrl = url.parse(rawAnnounceUrl);
		console.log(announceUrl);
	
		const socket = dgram.createSocket('udp4');
		const connectionMessage = buildConnectRequest();

		sendConnectionRequest(socket, connectionMessage, announceUrl);

		const checkConnectResponse = () => {
			console.log('No response.');

			if (nRetries >= MAX_RETRIES) {
				clearTimeout(retryTimeout);
				reject(`Error: ${rawAnnounceUrl}\nMax retries reached.`);
				return;
			}

			console.log('Resending connect response...');
			sendConnectionRequest(socket, connectionMessage, announceUrl);

			clearTimeout(retryTimeout);
			retryTimeout = setTimeout(checkConnectResponse, RETRY_TIMEOUT_MS);
			nRetries++;
		}

		socket.on('message', response => {
			console.log('Connection response received.');

			clearTimeout(retryTimeout);
			console.log('Retry timeout cleared.');

			const connectReponse = parseConnectResponse(response);

			socket.close();
			console.log('Socket closed.');
			resolve(connectReponse);
		});

		let retryTimeout = setTimeout(checkConnectResponse, RETRY_TIMEOUT_MS);
	});

}


const main = async () => {

	try {
		let connectResponse = await connectToTracker('udp://open.stealth.si:80/announce');
		console.log(connectResponse);
	}
	catch (err) {
		console.log('Bad announce url.');
	}

	console.log('Done!');
	process.exit();
};

main().catch(err => console.log(err));
