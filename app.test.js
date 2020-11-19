process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('./app.js');
const db = require('./db.js');

beforeEach(async function() {
	let companies = await db.query(`INSERT INTO companies (code,name,description) VALUES ($1,$2,$3)`, [
		'apple',
		'Apple Computer',
		'Maker of Osx.'
	]);

	let invoices = await db.query(
		`INSERT INTO invoices (comp_code, amt, paid, paid_date)
    VALUES ($1,$2,$3,$4)`,
		[ 'apple', 100, false, null ]
	);
});

afterEach(async function() {
	await db.query('DELETE FROM companies');
	await db.query('DELETE FROM invoices');
});

afterAll(async function() {
	await db.end();
});

describe('test company routes', function() {
	let code = 'apple';
	let name = 'Apple Computer';
	let description = 'Maker of Osx.';
	let code2 = 'ibm';
	let name2 = 'IBM';
	let description2 = 'Big Blue';
	comp_code = 'apple';
	amt = 100;
	paid = false;
	paid_date = null;

	test('get all companies', async function() {
		const res = await request(app).get('/companies');
		expect(res.body).toEqual({
			companies: [ { code, name, description } ]
		});
	});

	test('get individual company', async function() {
		const res = await request(app).get('/companies/apple');
		expect(res.body).toEqual({
			company: [
				{
					add_date: res.body.company[0].add_date,
					amt,
					code,
					comp_code,
					description,
					id: expect.any(Number),
					name,
					paid,
					paid_date
				}
			]
		});
	});

	test('add new company', async function() {
		const res = await request(app).post('/companies').send({ code: code2, name: name2, description: description2 });
		expect(res.body).toEqual({ company: [ { code: code2, name: name2, description: description2 } ] });
	});

	test('edit company', async function() {
		const res = await request(app).put(`/companies/${code}`).send({ code, name, description: 'marker' });
		expect(res.body).toEqual({
			company: [ { code, name, description: 'marker' } ]
		});
	});

	test('delete a company', async function() {
		const res = await request(app).delete(`/companies/${code}`);
		expect(res.body).toEqual({ deleted: [ { code, name, description } ] });
	});
});

describe('test invoices routes', function() {
	comp_code = 'apple';
	amt = 100;
	paid = false;
	paid_date = null;

	test('get all invoices', async function() {
		const res = await request(app).get('/invoices');
		expect(res.body).toEqual({
			invoices: [
				{ id: expect.any(Number), comp_code, amt, paid, add_date: res.body.invoices[0].add_date, paid_date }
			]
		});
	});

	// test('get individual invoice',function(){
	//     const res = await request(app).post(`/invoices`).send(comp_code,amt)
	//     expect(res.body).toEqual({invoice: })
	// })
});
