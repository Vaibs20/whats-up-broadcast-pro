import './env.js';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import session from 'express-session';
import passport, { initializeOAuthStrategies } from './config/passport.js';
import authRoutes from './routes/auth.js';
import campaignRoutes from './routes/campaigns.js';
import contactRoutes from './routes/contacts.js';
import templateRoutes from './routes/templates.js';
import n8nRoutes from './routes/n8n.js';
import { initializeScheduler } from './services/scheduler.js';
import { setupSocketHandlers } from './services/socketService.js';


// // Debug environment variables loading
// console.log('Environment variables loaded:');
// console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'UNDEFINED');
// console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'UNDEFINED');
// console.log('NODE_ENV:', process.env.NODE_ENV);
// console.log('process.cwd():', process.cwd());
// console.log('dotenv loaded:', process.env.TWILIO_ACCOUNT_SID);

// Initialize OAuth strategies after environment variables are loaded
await initializeOAuthStrategies();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "https://wbc.trizenventures.com/",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Optional: Handle OPTIONS requests globally (if needed)
app.options('*', cors());

app.use(express.json());

// Session middleware for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://commonmail511:BI98nb9gfn987yDX@cluster0.1s50bav.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/n8n', n8nRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO setup
setupSocketHandlers(io);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Initialize job scheduler
  initializeScheduler(io);
});

export { io };
