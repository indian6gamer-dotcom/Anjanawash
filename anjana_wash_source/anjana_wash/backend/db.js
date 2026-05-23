const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'anjana.db');
const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

const seedCategories = [
  { id: 'car', label: 'Car', icon: 'Car', parent_id: null },
  { id: 'small_car', label: 'Small Car', icon: 'Car', parent_id: 'car' },
  { id: 'xuv', label: 'XUV / SUV', icon: 'Car', parent_id: 'car' },
  { id: '7seater', label: '7-Seater', icon: 'Car', parent_id: 'car' },
  { id: 'auto', label: 'Auto', icon: 'Bus', parent_id: null },
  { id: 'ape_auto', label: 'Ape Auto', icon: 'Truck', parent_id: null },
  { id: 'tt', label: 'Tempo Traveller', icon: 'Bus', parent_id: null },
  { id: 'tractor', label: 'Tractor', icon: 'Tractor', parent_id: null },
  { id: 'tata_ace', label: 'Tata Ace', icon: 'Truck', parent_id: null },
  { id: 'bike', label: 'Bike', icon: 'Bike', parent_id: null },
  { id: 'scooter', label: 'Scooter', icon: 'Bike', parent_id: null },
  { id: 'jcb', label: 'JCB', icon: 'Construction', parent_id: null }
];

const seedServices = [
  { id: 'c8257c8b-b3c3-477f-96ca-d4cb261ddaa5', category_id: 'small_car', name: 'Basic Wash', price: 150, description: 'Exterior wash + tyre shine', active: 1 },
  { id: '1714bbce-28cc-4e67-bca3-c7e41611eaa7', category_id: 'small_car', name: 'Premium Wash', price: 300, description: 'Exterior + interior vacuum, dashboard polish', active: 1 },
  { id: '20821600-54aa-4b51-80cc-a77b9af0d9b1', category_id: 'small_car', name: 'Full Detailing', price: 600, description: 'Full detailing + wax + interior deep clean', active: 1 },
  { id: '9d90863a-8a93-489a-b3d2-53a3a524f700', category_id: 'xuv', name: 'Basic Wash', price: 200, description: 'Exterior wash + tyre shine', active: 1 },
  { id: '865ab90d-4259-4c30-95b0-d8ec1956d3c0', category_id: 'xuv', name: 'Premium Wash', price: 400, description: 'Exterior + interior vacuum, dashboard polish', active: 1 },
  { id: '6093f086-7033-49c6-bcb0-b816f420fdaf', category_id: 'xuv', name: 'Full Detailing', price: 800, description: 'Full detailing + wax + interior deep clean', active: 1 },
  { id: 'eaa15cec-0d92-4b7f-afb9-208653444503', category_id: '7seater', name: 'Basic Wash', price: 250, description: 'Exterior wash + tyre shine', active: 1 },
  { id: 'fcc1a585-0abd-42e9-a065-704e27b2c63f', category_id: '7seater', name: 'Premium Wash', price: 500, description: 'Exterior + interior vacuum, dashboard polish', active: 1 },
  { id: 'cd392fd1-f904-4c47-b37b-492a14d5d35f', category_id: '7seater', name: 'Full Detailing', price: 1000, description: 'Full detailing + wax + interior deep clean', active: 1 },
  { id: 'd26b06f3-8e95-4e84-bad5-b22c23a84d18', category_id: 'auto', name: 'Basic Wash', price: 100, description: 'Exterior wash', active: 1 },
  { id: '5d78fe99-66a9-4ca6-a487-3cbb6b59c407', category_id: 'auto', name: 'Premium Wash', price: 200, description: 'Exterior + seat cleaning', active: 1 },
  { id: '95241a40-c1b4-4a39-95b9-8c1185ce5251', category_id: 'ape_auto', name: 'Basic Wash', price: 120, description: 'Exterior wash', active: 1 },
  { id: '21e6d915-1577-4c20-991b-8e7a9a8fb6e1', category_id: 'ape_auto', name: 'Premium Wash', price: 220, description: 'Exterior + cabin cleaning', active: 1 },
  { id: '60256ed9-72b9-4859-b956-ada35dbb1e24', category_id: 'tt', name: 'Basic Wash', price: 300, description: 'Exterior wash', active: 1 },
  { id: '1857f0b2-1aad-4d9f-8a3f-5b88b1955a05', category_id: 'tt', name: 'Premium Wash', price: 600, description: 'Exterior + interior vacuum', active: 1 },
  { id: '7b04395c-34c5-439f-906e-ca0dcb739b6a', category_id: 'tractor', name: 'Basic Wash', price: 400, description: 'Heavy-duty exterior wash', active: 1 },
  { id: '1cd850b8-b603-445e-8aee-c1fb259ace02', category_id: 'tractor', name: 'Premium Wash', price: 700, description: 'Exterior + undercarriage clean', active: 1 },
  { id: '941e65d0-daf7-4f14-bbd0-65ec88a51a9a', category_id: 'tata_ace', name: 'Basic Wash', price: 200, description: 'Exterior wash', active: 1 },
  { id: 'c5ec0c17-4112-44e2-8e84-4eabf54b24c0', category_id: 'tata_ace', name: 'Premium Wash', price: 350, description: 'Exterior + cabin cleaning', active: 1 },
  { id: '491d00c9-4f3a-44eb-85bc-957389c4af3b', category_id: 'bike', name: 'Basic Wash', price: 70, description: 'Exterior wash + chain clean', active: 1 },
  { id: '3f9fd338-c595-47a1-935f-f5096a46c8a7', category_id: 'bike', name: 'Premium Wash', price: 120, description: 'Exterior + polish', active: 1 },
  { id: 'fdad9a47-4fe4-4a94-b98e-d4e9dfd3f5bc', category_id: 'scooter', name: 'Basic Wash', price: 70, description: 'Exterior wash', active: 1 },
  { id: '33cb82c9-35c2-4a42-a943-375cea8c1481', category_id: 'scooter', name: 'Premium Wash', price: 120, description: 'Exterior + polish', active: 1 },
  { id: '5439c753-298c-43ef-b25e-43fde2b72fe6', category_id: 'jcb', name: 'Basic Wash', price: 500, description: 'Heavy-duty exterior wash', active: 1 },
  { id: '7f9df9b9-6cd9-485b-bfb7-839f864389a4', category_id: 'jcb', name: 'Premium Wash', price: 900, description: 'Exterior + undercarriage clean', active: 1 }
];

async function initDb() {
  db.serialize(async () => {
    // Create Tables
    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        icon TEXT NOT NULL,
        parent_id TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY,
        category_id TEXT NOT NULL,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        active INTEGER DEFAULT 1
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        token TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        vehicle_number TEXT NOT NULL,
        photo TEXT,
        category_id TEXT NOT NULL,
        service_id TEXT NOT NULL,
        price REAL NOT NULL,
        payment_method TEXT NOT NULL,
        payment_provider TEXT,
        payment_status TEXT NOT NULL,
        status TEXT NOT NULL,
        worker_photo TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    // Wait a brief moment for tables to be created before checking and seeding
    setTimeout(async () => {
      try {
        const catCount = await get('SELECT COUNT(*) as count FROM categories');
        if (catCount.count === 0) {
          console.log('Seeding categories...');
          for (const cat of seedCategories) {
            await run('INSERT INTO categories (id, label, icon, parent_id) VALUES (?, ?, ?, ?)', [
              cat.id,
              cat.label,
              cat.icon,
              cat.parent_id
            ]);
          }
        }

        const svcCount = await get('SELECT COUNT(*) as count FROM services');
        if (svcCount.count === 0) {
          console.log('Seeding services...');
          for (const svc of seedServices) {
            await run('INSERT INTO services (id, category_id, name, price, description, active) VALUES (?, ?, ?, ?, ?, ?)', [
              svc.id,
              svc.category_id,
              svc.name,
              svc.price,
              svc.description,
              svc.active
            ]);
          }
        }

        const settingsCount = await get('SELECT COUNT(*) as count FROM settings');
        if (settingsCount.count === 0) {
          console.log('Seeding default settings...');
          await run('INSERT INTO settings (key, value) VALUES (?, ?)', ['worker_pin', '1234']);
          await run('INSERT INTO settings (key, value) VALUES (?, ?)', ['owner_pin', '9999']);
        }
        
        console.log('Database initialized successfully.');
      } catch (err) {
        console.error('Error during database seeding:', err);
      }
    }, 100);
  });
}

initDb();

module.exports = {
  db,
  run,
  get,
  all
};
