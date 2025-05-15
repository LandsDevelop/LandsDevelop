import db from './db.js';

const testDbConnection = async () => {
  try {
    const [rows] = await db.query('SELECT 1');
    console.log('✅ MySQL connection successful:', rows);
    process.exit(0); // success
  } catch (error) {
    console.error('❌ MySQL connection failed:', error);
    process.exit(1); // failure
  }
};

testDbConnection();
