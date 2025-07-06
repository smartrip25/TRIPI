import elAgente from '../backend/main.js';

async function runAgent(message) {
  return await elAgente.run(message);
}


export default runAgent;