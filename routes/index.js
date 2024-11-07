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
  const { page = 1, name, height, weight, birthDateStart, birthDateEnd, married } = req.query;
  const offset = (page - 1) * limit;
  const query = [];
  const params = [];

  if (name) {
    query.push(`name LIKE '%' || ? || '%'`);
    params.push(name);
  }
  if (height) {
    query.push(`height = ? `);
    params.push(height);
  }
  if (weight) {
    query.push(`weight = ?`);
    params.push(weight);
  }
  if (birthDateStart && birthDateEnd) {
    query.push(`birthdate BETWEEN ? AND ?`);
    params.push(birthDateStart, birthDateEnd)
  } else if (birthDateStart) {
    query.push('birthdate >= ?');
    params.push(birthDateStart);
  } else if (birthDateEnd) {
    query.push('birthdate <= ?');
    params.push(birthDateEnd);
  }
  if (married) {
    query.push(`married = ?`);
    params.push(married);
  }

  const whereClause = query.length ? `WHERE ${query.join(' AND ')}` : '';

  db.get(`SELECT COUNT(*) AS count FROM data ${whereClause}`, params, (err, result) => {
    if (err) {
      console.error(err);
      return next(err);
    }

    const totalRows = parseInt(result.count, 10);
    const totalPages = Math.ceil(totalRows / limit);

    db.all(`SELECT * FROM data ${whereClause} LIMIT ? OFFSET ?`, [...params, limit, offset], (err, rows) => {
      if (err) {
        console.error(err);
        return next(err);
      }

      res.render('list', {
        data: rows,
        title: 'SQLite BREAD (Browse, Read, Edit, Add, Delete) and Pagination',
        page: parseInt(page, 10),
        totalPages,
        offset
      });
    });
  });
});


router.get('/add', (req, res, next) => {
  res.render('add', { title: 'Adding Data' });
});

router.post('/add', (req, res, next) => {
  const { name, height, weight, birthdate, married } = req.body;
  const marriedValue = married === 'true' ? 1 : 0;

  if (!name || !height || !weight || !birthdate) {
    return res.status(400).send("semua data telah ada");
  }

  const query = `INSERT INTO data (name, height, weight, birthdate, married) VALUES (?, ?, ?, ?, ?)`;
  db.run(query, [name, height, weight, birthdate, marriedValue], (err) => {
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
  const id = parseInt(req.params.id, 10);
  db.get(`SELECT * FROM data WHERE id = ?`, [id], (err, item) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    if (!item) {
      return next(createError(404));
    }
    res.render('edit', { item, title: 'Editing Data' });
  });
});

router.post('/edit/:id', (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const { name, height, weight, birthdate, married } = req.body;
  const marriedValue = married === 'true' ? 1 : 0;

  if (!name || !height || !weight || !birthdate || !married === undefined) {
    return res.status(400).send("semua data telah ada");
  }

  const query = `UPDATE data SET name = ?, height = ?, weight = ?, birthdate = ?, married = ? WHERE id = ?`;
  db.run(query, [name, height, weight, birthdate, marriedValue, id], (err) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    console.log('Data updated successfully');
    res.redirect('/');
  });
});


router.get('/delete/:id', (req, res, next) => {
  const id = req.params.id;
  db.run(`DELETE FROM data WHERE id = ?`, [id], (err) => {
    if (err) {
      console.error(err);
      return next(err);
    } else {
      console.log('Data deleted successfully');
      return res.redirect('/');
    }
  });
});

module.exports = router;
