const db = require('../db.js');
const express = require('express');
const { response } = require('express');
const NotFoundError = require('../errors.js');
const router = new express.Router();

router.get('/', async function(req, res) {
	let industries = await db.query(`SELECT * FROM industries`);
	res.json({ industries: industries.rows });
});

router.get('/:code', async function(req, res, next) {
	let industry = await db.query(
		`SELECT * FROM industries LEFT JOIN companies_industries ON industries_code = code WHERE code=$1`,
		[ req.params.code ]
	);
	if (industry.rows.length == 0) {
		let error = new NotFoundError(`${req.params.id} does not exist`, 404);
		next(error);
	}
	let companies = [];
	for (company of industry.rows) {
		companies.push(company.companies_code);
	}
	res.json({
		industry: {
			code: industry.rows[0].code,
			indudstry: industry.rows[0].industry,
			companies
		}
	});
});

router.post('/', async function(req, res) {
	let { code, industry } = req.body;
	let new_industry = await db.query(`INSERT INTO industries (code,industry) VALUES ($1,$2)`, [ code, industry ]);
	res.send({ industry: new_industry });
});

router.put('/:code', async function(req, res) {
	let companies_code = req.body.companies_code;
	let compInd = await db.query('INSERT INTO companies_industries (companies_code,industries_code) VALUES ($1,$2)', [
		companies_code,
		req.params.code
	]);
	res.json(compInd);
});

module.exports = router;
