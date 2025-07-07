const BASE_URL = 'http://localhost:3000'; 

async function runAgent(message) {
  try {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    return data.response || 'No se recibió respuesta del servidor';
  } catch (err) {
    console.error('Error al contactar al backend:', err);
    return 'Hubo un error al procesar tu mensaje.';
  }
}

export default runAgent;
