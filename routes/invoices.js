const express = require('express');
const router = new express.Router();
const db = require('../db.js');
const NotFoundError = require('../errors.js');

router.get('/', async function(req, res) {
	let invoices = await db.query('SELECT * FROM invoices');
	return res.json({ invoices: invoices.rows });
});

router.get('/:id', async function(req, res) {
	let invoice = await db.query('SELECT * FROM invoices WHERE id=$1', [ req.params.id ]);
	return res.json({ invoice: invoice.rows });
});

router.post('/', async function(req, res) {
	let { comp_code, amt } = req.body;
	let new_invoice = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1,$2)', [ comp_code, amt ]);
	return res.json({ invoice: new_invoice });
});

router.put('/:id', async function(req, res, next) {
	let { amt, paid } = req.body;
	if (paid) {
		let paid_date = new Date();
		invoice = await db.query(
			'UPDATE invoices SET amt=$1,paid=$2,paid_date=$3 WHERE id=$4 RETURNING comp_code,amt,paid,add_date,paid_date',
			[ req.body.amt, req.body.paid, paid_date.toDateString(), req.params.id ]
		);
	} else {
		invoice = await db.query(
			'UPDATE invoices SET amt=$1,paid=$2,paid_date=$3 WHERE id=$4 RETURNING comp_code,amt,paid,add_date,paid_date',
			[ req.body.amt, req.body.paid, null, req.params.id ]
		);
	}
	try {
		if (invoice.rows.length == 1) {
			return res.json({ invoice: invoice.rows });
		} else {
			throw new NotFoundError(`Invoice not found`, 404);
		}
	} catch (e) {
		next(e);
	}
});

router.delete('/:id', async function(req, res, next) {
	try {
		let deletedInvoice = await db.query('SELECT * FROM invoices WHERE id=$1', [ req.params.id ]);
		let invoice = await db.query('DELETE FROM invoices WHERE id=$1', [ req.params.id ]);
		if (deletedInvoice.rows.length == 1) {
			return res.json({ 'Invoice deleted': deletedInvoice.rows });
		} else {
			throw new NotFoundError(`Invoice not found`, 404);
		}
	} catch (e) {
		next(e);
	}
});

module.exports = router;
