const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
  res.render('index', { title: 'Discogs Image Program' });
});

module.exports = router;
