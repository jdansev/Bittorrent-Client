
import chalk from 'chalk';



const havePrefix = `${chalk.bgCyan.black(' Have ')}      `;
const bitfieldPrefix = `${chalk.bgGray.black(' Bitfield ')}  `;
const unchokePrefix = `${chalk.bgMagenta.black(' Unchoke ')}  `;

const haveLog = peer => console.log(`${havePrefix} ${chalk.gray('received from')}  ${peer.ip}:${peer.port}`);
const bitfieldLog = peer => console.log(`${bitfieldPrefix} ${chalk.gray('received from')}  ${peer.ip}:${peer.port}`);
const unchokeLog = peer => console.log(`${unchokePrefix} ${chalk.gray('received from')}  ${peer.ip}:${peer.port}`);




export const haveHandler = peer => {
  haveLog(peer);
}

export const bitfieldHandler = peer => {
  bitfieldLog(peer);
}

export const unchokeHandler = peer => {
  unchokeLog(peer);
}

