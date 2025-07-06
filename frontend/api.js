export async function sendMessage(message) {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
  
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
  
    return await response.json();
  }