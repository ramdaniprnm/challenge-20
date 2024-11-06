const express = require('express');
const router = express.Router();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./user.db', (err) => {
  if (err) {
    console.error('Gagal connect ke user db:', err);
  } else {
    console.log('Connect ke user db.');
  }
});


/* GET home page. */
router.get('/', (req, res, next) => {
  const limit = 5;
  const { page = 1, name, height, weight, birthDateStart, birthDateEnd } = req.query;
  const offset = (page - 1) * limit;
  const query = [];
  const params = [];

  if (name) {
    query.push(`name ilike ' % ' || ${params.length} || '%' `);
    params.push(name);
  }
  if (height) {
    query.push(`height ilike ' % ' || ${params.length} || '%' `);
    params.push(height);
  }
  if (weight) {
    query.push(`weight ilike ' % ' || ${params.length} || '%' `);
    params.push(weight);
  }
  if (birthDateStart) {
    query.push('birthdate >= ?');
    params.push(birthDateStart);
  }


  db.get('SELECT COUNT(*) AS count FROM data', (err, result) => {
    if (err) {
      console.error(err);
      return next(err);
    }

    const totalRows = parseInt(result.count, 10);  // pastikan jadi angka
    const searchQuery = Math.ceil(totalRows / limit);

    db.all('SELECT * FROM data LIMIT ? OFFSET ?', [limit, offset], (err, rows) => {
      if (err) {
        console.error(err);
        return next(err);
      }

      res.render('list', {
        data: rows,
        title: 'SQLite BREAD (Browse, Read, Edit, Add, Delete) and Pagination',
        page,
        totalPages,
      });
    });
  });
});


router.get('/add', (req, res, next) => {
  res.render('add', { title: 'Adding Data' });
});
router.post('/add', (req, res, next) => {
  const { name, height, weight, birthdate, married } = req.body;
  const query = `INSERT INTO data (name, height, weight, birthdate, married) VALUES (?, ?, ?, ?, ?)`;
  db.run(query, [name, height, weight, birthdate, married], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error adding user to database");
    } else {
      console.log('User added successfully');
      return res.redirect('/');
    }
  });
});


router.get('/edit/:id', (req, res, next) => {
  res.render('edit', { title: 'Updating Data' });
});

router.get('/delete/:id', (req, res, next) => {
  const id = req.params.id;
  res.render('edit', { title: 'Updating Data' });
});

module.exports = router;
