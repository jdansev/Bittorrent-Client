



export const createSocketTimeout = (timeoutName, socket, peer, TIMEOUT_MS) => {
    let flag = false;

    return {
        start: () => setTimeout(() => {
            if (!flag) {
                console.log(`${timeoutName} ${peer.ip}:${peer.port}`);
                socket.destroy();
            }
        }, TIMEOUT_MS),

        stop: () => flag = true
    }
}
