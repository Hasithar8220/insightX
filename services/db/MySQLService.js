'use strict';
const mysql = require('mysql2/promise'); // Import mysql2's promise-based version
const config = require('../../config.json');
const fs = require('fs');

let pool; // Declare a global connection pool

class MySQLService {
  constructor() {
    // Initialize the connection pool if it doesn't exist
    if (!pool) {

      const dbConfig = {
        host: config.isLocalDB ? 'localhost' : process.env.HOST,
      user: config.isLocalDB ? 'root' : process.env.DBUSER,
      password: config.isLocalDB ? '' : process.env.PASSWORD,
      database: config.isLocalDB ? 'cs' : process.env.DB,
      port: config.isLocalDB? 3306: 4000,
      ssl:config.isLocalDB? false:  {
        minVersion: 'TLSv1.2',
        ca: fs.readFileSync('./services/db/cert.pem') 
     } ,
      waitForConnections: true,
      connectionLimit: 30,
      maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
      idleTimeout: 180000, // idle connections timeout, in milliseconds, the default value 60000
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    multipleStatements: true,
  connectTimeout: 60000, // Set the connection timeout to 30 seconds (adjust as needed)

    
      };

      pool = mysql.createPool(dbConfig); // Create a global connection pool using mysql2
    }
  }

 

sanitizeQuery(sql) {
  // Basic sanitization to prevent SQL injection
  const sanitizedSQL = sql.replace(/[\u0000-\u001F\u007F-\u009F\u00AD\u0600-\u0604\u070F\u17B4\u17B5\u200C-\u200F\u2028-\u202F\u2060-\u206F\uFEFF\uFFF0-\uFFFF\\]/g, '');
  return sanitizedSQL;
}


// Function to run a query with retries
// Function to run a query with retries
async runquery(sql, params = [], maxRetries = 3, retryInterval = 1000) {
  let connection;
  let retries = 0;
  while (retries < maxRetries) {
    try {
      connection = await pool.getConnection();
      const [rows, fields] = await connection.execute(sql, params);
      return rows;
    } catch (error) {
      console.error(error);
      if ((error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') && retries < maxRetries - 1) {
        // Retry the operation after a delay
        retries++;
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
        continue;
      } else {
        // Propagate the error if it's not a connection reset error or retries are exhausted
        throw error;
      }
    } finally {
      if (connection) {
        connection.release(); // Always release the connection, whether the query succeeded or failed
      }
    }
  }
  throw new Error('Max retries reached, query failed.');
}

}

module.exports = MySQLService;