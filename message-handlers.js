
import chalk from 'chalk';



const havePrefix = `${chalk.bgCyan.black(' Have ')}      `;
const bitfieldPrefix = `${chalk.bgMagenta.black(' Bitfield ')}  `;

const haveLog = peer => console.log(`${havePrefix} ${chalk.gray('received from')}  ${peer.ip}:${peer.port}`);
const bitfieldLog = peer => console.log(`${bitfieldPrefix} ${chalk.gray('received from')}  ${peer.ip}:${peer.port}`);


export const haveHandler = peer => {
  haveLog(peer);
}



export const bitfieldHandler = peer => {
  bitfieldLog(peer);
}




