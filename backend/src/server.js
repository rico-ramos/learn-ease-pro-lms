import { createServer } from 'http';
import app from './app.js';
import '../src/config/db.js'; // ensures MongoDB connects on startup

const port = process.env.PORT || 5050;
const server = createServer(app);

server.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
