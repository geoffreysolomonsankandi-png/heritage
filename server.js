// In: server.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { ApolloServer } = require('apollo-server-express');
const path = require('path');
const { graphqlUploadExpress } = require('graphql-upload');

// --- NEW IMPORTS ---
const http = require('http');
const { WebSocketServer } = require('ws');
const { v4: uuidv4 } = require('uuid');

const upload = require('./config/multer-config');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const viewRoutes = require('./routes/viewRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// --- NEW: GLOBAL MAPS FOR REAL-TIME COMMUNICATION ---
// Stores active WebSocket connections, mapping a unique clientId to the connection object.
const clients = new Map();
// Stores pending QR scan sessions, mapping a unique scanId to the town and originating client.
const scanSessions = new Map();

// Middleware & Setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.post('/upload', upload.single('eventImage'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file was uploaded.' });
    res.status(200).json({ imageUrl: `/uploads/${req.file.filename}` });
});

app.get('/town/:townName', (req, res) => {
  res.render('town', { townName: req.params.townName });
});

// --- NEW: ROUTE TO CONFIRM A QR CODE SCAN ---
app.get('/scan/confirm/:scanId', (req, res) => {
    const { scanId } = req.params;
    const session = scanSessions.get(scanId);

    if (session) {
        const { clientId, townName } = session;
        const clientConnection = clients.get(clientId);

        if (clientConnection && clientConnection.readyState === clientConnection.OPEN) {
            // Send navigation command to the original browser via WebSocket
            clientConnection.send(JSON.stringify({
                type: 'navigate',
                url: `/town/${encodeURIComponent(townName)}`
            }));
            scanSessions.delete(scanId); // Session is used, delete it
            res.send('<h1>Scan successful!</h1><p>The page has been opened on your computer.</p>');
        } else {
            res.status(404).send('Original browser session not found or disconnected.');
        }
    } else {
        res.status(404).send('Invalid or expired scan session.');
    }
});

app.use('/', viewRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully.'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- SERVER AND WEBSOCKET SETUP ---
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    const clientId = uuidv4();
    clients.set(clientId, ws);
    
    // Send the unique ID to the newly connected client
    ws.send(JSON.stringify({ type: 'init', clientId }));

    ws.on('close', () => {
        clients.delete(clientId);
    });

    ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
        clients.delete(clientId);
    });
});

// Apollo Server (GraphQL)
async function startApolloServer() {
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({
        // Provide the session maps to the GraphQL context
        scanSessions,
    })
  });

  await apolloServer.start();
  app.use(graphqlUploadExpress());
  apolloServer.applyMiddleware({ app });

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`GraphQL endpoint at http://localhost:${PORT}${apolloServer.graphqlPath}`);
  });
}

startApolloServer();