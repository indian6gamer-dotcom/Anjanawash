const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Helper to verify owner PIN
async function verifyOwnerPin(pin) {
  const row = await db.get("SELECT value FROM settings WHERE key = 'owner_pin'");
  return row && row.value === pin;
}

// Router
const apiRouter = express.Router();

// Auth Endpoints
apiRouter.post('/auth/verify-pin', async (req, res) => {
  try {
    const { role, pin } = req.body;
    if (!role || !pin) {
      return res.status(400).json({ error: 'Role and pin are required' });
    }
    const row = await db.get('SELECT value FROM settings WHERE key = ?', [`${role}_pin`]);
    if (row && row.value === pin) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

apiRouter.post('/auth/update-pin', async (req, res) => {
  try {
    const { owner_pin, role, new_pin } = req.body;
    if (!owner_pin || !role || !new_pin) {
      return res.status(400).json({ detail: 'All fields are required' });
    }
    const verified = await verifyOwnerPin(owner_pin);
    if (!verified) {
      return res.status(400).json({ detail: 'Incorrect owner PIN' });
    }
    if (!/^\d{4,6}$/.test(new_pin)) {
      return res.status(400).json({ detail: 'PIN must be 4-6 digits' });
    }
    await db.run('UPDATE settings SET value = ? WHERE key = ?', [new_pin, `${role}_pin`]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// Categories/Services Endpoints
apiRouter.get('/categories', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM categories');
    const topLevel = rows.filter(r => !r.parent_id);
    topLevel.forEach(parent => {
      parent.children = rows.filter(r => r.parent_id === parent.id);
    });
    res.json(topLevel);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

apiRouter.get('/services/by-category/:cat_id', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM services WHERE category_id = ? AND active = 1', [req.params.cat_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// Owner Service Management Endpoints
apiRouter.get('/owner/services', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM services');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

apiRouter.post('/owner/services', async (req, res) => {
  try {
    const { owner_pin, category_id, name, price, description } = req.body;
    if (!owner_pin || !category_id || !name || price === undefined) {
      return res.status(400).json({ detail: 'Required fields missing' });
    }
    const verified = await verifyOwnerPin(owner_pin);
    if (!verified) {
      return res.status(400).json({ detail: 'Incorrect owner PIN' });
    }
    const id = 'svc_' + Date.now() + Math.random().toString(36).substr(2, 5);
    await db.run('INSERT INTO services (id, category_id, name, price, description, active) VALUES (?, ?, ?, ?, ?, 1)', [
      id, category_id, name, price, description || ''
    ]);
    const service = await db.get('SELECT * FROM services WHERE id = ?', [id]);
    res.json(service);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

apiRouter.patch('/owner/services/:id', async (req, res) => {
  try {
    const { owner_pin, name, price, description, active } = req.body;
    const verified = await verifyOwnerPin(owner_pin);
    if (!verified) {
      return res.status(400).json({ detail: 'Incorrect owner PIN' });
    }
    const current = await db.get('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (!current) {
      return res.status(404).json({ detail: 'Service not found' });
    }
    const updName = name !== undefined ? name : current.name;
    const updPrice = price !== undefined ? price : current.price;
    const updDesc = description !== undefined ? description : current.description;
    const updActive = active !== undefined ? (active ? 1 : 0) : current.active;

    await db.run('UPDATE services SET name = ?, price = ?, description = ?, active = ? WHERE id = ?', [
      updName, updPrice, updDesc, updActive, req.params.id
    ]);
    const service = await db.get('SELECT * FROM services WHERE id = ?', [req.params.id]);
    res.json(service);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

apiRouter.delete('/owner/services/:id', async (req, res) => {
  try {
    const { owner_pin } = req.body;
    const verified = await verifyOwnerPin(owner_pin);
    if (!verified) {
      return res.status(400).json({ detail: 'Incorrect owner PIN' });
    }
    await db.run('DELETE FROM services WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// Bookings Endpoints
apiRouter.post('/bookings', async (req, res) => {
  try {
    const { customer_name, phone, vehicle_number, vehicle_photo, category_id, service_id, payment_method, payment_provider } = req.body;
    if (!customer_name || !phone || !vehicle_number || !category_id || !service_id || !payment_method) {
      return res.status(400).json({ detail: 'Missing required booking details' });
    }

    const service = await db.get('SELECT price FROM services WHERE id = ?', [service_id]);
    if (!service) {
      return res.status(404).json({ detail: 'Selected wash service not found' });
    }

    // Token Generation (Daily sequence)
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayStr = today.toISOString();
    
    // Find bookings created today
    const countRow = await db.get("SELECT COUNT(*) as count FROM bookings WHERE created_at >= ?", [todayStr]);
    const tokenIndex = countRow.count + 1;
    const token = 'A' + String(tokenIndex).padStart(3, '0');

    const id = 'bk_' + Date.now() + Math.random().toString(36).substr(2, 5);
    const payment_status = 'pending';
    const status = 'pending';

    await db.run(
      `INSERT INTO bookings (id, token, customer_name, phone, vehicle_number, photo, category_id, service_id, price, payment_method, payment_provider, payment_status, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, token, customer_name, phone, vehicle_number, vehicle_photo || '', category_id, service_id, service.price, payment_method, payment_provider || null, payment_status, status]
    );

    const booking = await db.get('SELECT * FROM bookings WHERE id = ?', [id]);
    res.json(booking);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// Get booking queue (pending bookings that are paid or cash)
apiRouter.get('/bookings/queue', async (req, res) => {
  try {
    const rows = await db.all(`
      SELECT b.*,
             s.name as service_name,
             c.label as category_label,
             pc.label as parent_category_label
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN categories pc ON c.parent_id = pc.id
      WHERE b.status = 'pending' AND (b.payment_method = 'cash' OR b.payment_status = 'paid')
      ORDER BY b.created_at ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// Get completed bookings
apiRouter.get('/bookings', async (req, res) => {
  try {
    // Return all bookings today
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayStr = today.toISOString();

    const rows = await db.all(`
      SELECT b.*,
             s.name as service_name,
             c.label as category_label,
             pc.label as parent_category_label
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN categories pc ON c.parent_id = pc.id
      WHERE b.created_at >= ?
      ORDER BY b.created_at DESC
    `, [todayStr]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// Get details for a single booking
apiRouter.get('/bookings/:id', async (req, res) => {
  try {
    const booking = await db.get(`
      SELECT b.*,
             s.name as service_name,
             c.label as category_label,
             pc.label as parent_category_label
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN categories pc ON c.parent_id = pc.id
      WHERE b.id = ?
    `, [req.params.id]);

    if (!booking) {
      return res.status(404).json({ detail: 'Booking not found' });
    }
    // Rename vehicle_photo back to frontend's expected properties if needed
    // The frontend accesses vehicle_photo directly in some pages, and photo in others.
    // Let's make sure both properties exist.
    booking.vehicle_photo = booking.photo;
    res.json(booking);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// Complete booking
apiRouter.post('/bookings/:id/complete', async (req, res) => {
  try {
    const { worker_photo } = req.body;
    const booking = await db.get('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    if (!booking) {
      return res.status(404).json({ detail: 'Booking not found' });
    }
    const completed_at = new Date().toISOString();
    await db.run(
      "UPDATE bookings SET status = 'completed', payment_status = 'paid', completed_at = ?, worker_photo = ? WHERE id = ?",
      [completed_at, worker_photo || null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// Stats endpoint
apiRouter.get('/bookings/stats/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayStr = today.toISOString();

    const allToday = await db.all("SELECT * FROM bookings WHERE created_at >= ?", [todayStr]);
    const completed = allToday.filter(b => b.status === 'completed');
    const pending = allToday.filter(b => b.status === 'pending');

    const total_earnings = completed.reduce((sum, b) => sum + b.price, 0);
    
    const cash = completed.filter(b => b.payment_method === 'cash');
    const cash_amount = cash.reduce((sum, b) => sum + b.price, 0);
    
    const online = completed.filter(b => b.payment_method === 'online');
    const online_amount = online.reduce((sum, b) => sum + b.price, 0);

    const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const formattedDate = formatter.format(new Date());

    res.json({
      date: formattedDate,
      total_earnings,
      cash_amount,
      cash_count: cash.length,
      online_amount,
      online_count: online.length,
      completed: completed.length,
      pending: pending.length,
      total_bookings: allToday.length
    });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// Paytm integration simulation
apiRouter.post('/payment/paytm/initiate', (req, res) => {
  const { booking_id } = req.body;
  if (!booking_id) {
    return res.status(400).json({ detail: 'Booking ID is required' });
  }
  // Redirect to the mock payment flow page on the frontend
  res.json({ checkout_url: `/paytm-mock?booking_id=${booking_id}` });
});

apiRouter.post('/payment/paytm/callback', async (req, res) => {
  try {
    const { booking_id } = req.body;
    if (!booking_id) {
      return res.status(400).json({ detail: 'Booking ID is required' });
    }
    await db.run("UPDATE bookings SET payment_status = 'paid' WHERE id = ?", [booking_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
