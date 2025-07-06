import express from 'express';
import cors from 'cors';
import runAgent from '../frontend/agent.js';

const app = express();
const port = 3000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());


app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  try {
    const response = await runAgent(message);
    let textResponse = "";
    let parsedResponse = response;
    if (typeof response === "string") {
  try {
    parsedResponse = JSON.parse(response);
  } catch {
    parsedResponse = response;
  }
}
  if (parsedResponse && parsedResponse.data && typeof parsedResponse.data.result === "string") {
    textResponse = parsedResponse.data.result;
  } else if (typeof parsedResponse === "string") {
    textResponse = parsedResponse;
  } else {
    textResponse = JSON.stringify(parsedResponse);
  }
  textResponse = textResponse.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  res.json({ response: textResponse });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});