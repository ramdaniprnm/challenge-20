var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('list', { title: 'SQlite BREAD (Browse, Read, Edit, Add, Delete) and Pagination' });
});

router.get('/add', function (req, res, next) {
  res.render('add', { title: 'Adding Data' });
});

router.get('/edit/:id', function (req, res, next) {
  console.log(`req.params.id: ${req.params.id}`);

  res.render('edit', { title: 'Updating Data' });
});

router.get('/delete/:id', function (req, res, next) {
  const id = req.params.id;
  res.render('edit', { title: 'Updating Data' });
});

module.exports = router;