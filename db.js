/** Database setup for BizTime. */

const { Client } = require('pg');

let databaseName;

if (process.env.NODE_ENV === 'test') {
	databaseName = 'postgresql:///biztime_test';
} else {
	databaseName = 'postgresql:///biztimedb';
}

let db = new Client({
	connectionString: databaseName
});

db.connect()

module.exports = db;