
import chalk from 'chalk';



const havePrefix = `${chalk.bgCyan.black(' Have ')}      `;
const bitfieldPrefix = `${chalk.bgGray.black(' Bitfield ')}  `;
const unchokePrefix = `${chalk.bgMagenta.black(' Unchoke ')}   `;
const chokePrefix = `${chalk.bgRed.black(' Choke ')}     `;

const haveLog = peer => console.log(`${havePrefix} ${chalk.gray('received from')}  ${peer.ip}:${peer.port}`);
const bitfieldLog = peer => console.log(`${bitfieldPrefix} ${chalk.gray('received from')}  ${peer.ip}:${peer.port}`);
const chokeLog = peer => console.log(`${chokePrefix} ${chalk.gray('received from')}  ${peer.ip}:${peer.port}`);
const unchokeLog = peer => console.log(`${unchokePrefix} ${chalk.gray('received from')}  ${peer.ip}:${peer.port}`);




export const haveHandler = peer => {
  haveLog(peer);
}

export const bitfieldHandler = peer => {
  bitfieldLog(peer);
}

export const chokeHandler = peer => {
  chokeLog(peer);
}

export const unchokeHandler = peer => {
  unchokeLog(peer);
}

