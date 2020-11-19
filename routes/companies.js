const express = require('express');
const router = new express.Router();
const db = require('../db.js');
const NotFoundError = require('../errors.js');
const slugify = require('slugify');

router.get('/', async function(req, res) {
	let companies = await db.query('SELECT * FROM companies', []);
	return res.json({ companies: companies.rows });
});

router.get('/:code', async function(req, res, next) {
	try {
		let company = await db.query(
			`SELECT code,name,description, companies_industries.industries_code, invoices.amt, invoices.paid, invoices.paid_date FROM companies 
		LEFT JOIN invoices ON code = comp_code 
		LEFT JOIN companies_industries ON code = companies_code  WHERE code=$1`,
			[ req.params.code ]
		);
		if (company.rows.length) {
			let invoices = [];
			code = company.rows[0].code;
			name = company.rows[0].name;
			description = company.rows[0].description;
			industries_code = company.rows[0].industries_code;
			for (invoice of company.rows) {
				let info = {
					amt: invoice.amt,
					paid: invoice.paid,
					paid_date: invoice.paid_date
				};
				invoices.push(info);
			}
			return res.json({company: {
				code,
				name,
				description,
				industries_code,
				invoices
			}});
		} else {
			throw new NotFoundError(`${req.params.code} does not exist`, 404);
		}
	} catch (e) {
		next(e);
	}
});

router.post('/', async function(req, res) {
	let { name, description } = req.body;
	let code = slugify(name);
	let new_comp = await db.query(
		`INSERT INTO companies (code,name,description) VALUES ($1, $2,$3) RETURNING code,name,description`,
		[ code, name, description ]
	);
	return res.json({ company: new_comp.rows });
});

router.put('/:code', async function(req, res, next) {
	let { code, name, description } = req.body;
	try {
		let company = await db.query(
			`UPDATE companies SET code=$1,name=$2,description=$3 WHERE code=$4 RETURNING code,name,description`,
			[ code, name, description, req.params.code ]
		);
		if (company.rows.length) {
			return res.json({ company: company.rows });
		} else {
			throw new NotFoundError(`${req.params.code} does not exist`, 404);
		}
	} catch (e) {
		next(e);
	}
});

router.delete('/:code', async function(req, res, next) {
	try {
		let company = await db.query(`SELECT * FROM companies WHERE code = $1`, [ req.params.code ]);
		let deletedCompany = await db.query('DELETE FROM companies WHERE code=$1', [ req.params.code ]);
		if (company.rows.length) {
			return res.json({ deleted: company.rows });
		} else {
			throw new NotFoundError(`${req.params.code} does not exist`, 404);
		}
	} catch (e) {
		next(e);
	}
});

module.exports = router;
