const {runInOrder, groupmeFunc} = require("../public/javascripts/groupmerestapi.js")

var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'GruopMeSorter' , result: null});
});

router.post('/', async (req, res) => {
  const authorName = req.body.authorName
  const beforeDate = req.body.beforeDate
  const afterDate = req.body.afterDate
  const searchText = req.body.searchText
  const rank = req.body.rank
  var newResultJson = await runInOrder(rank, authorName, beforeDate, afterDate, searchText, groupmeFunc)
  if(newResultJson!=null)
    res.render('index', {title: 'Express', result: newResultJson})
});

module.exports = router;
