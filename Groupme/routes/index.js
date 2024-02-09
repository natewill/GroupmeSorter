const {sortResponses, rankFunc, groupmeFunc} = require("../public/javascripts/groupmerestapi.js")

var express = require('express');
var router = express.Router();

cache = {}

router.get('/', function(req, res, next) {
  res.render('index', { title: 'GroupMeSorter' , result: null});
});

router.post('/', async (req, res) => {

  var newResultJson = []
  const authorName = req.body.authorName
  const beforeDate = req.body.beforeDate
  const afterDate = req.body.afterDate
  const searchText = req.body.searchText
  var rank = req.body.rank
  const groupMeId = req.body.groupMeId

  rank = rank=="yes" ? true : false

  try {
    newResultJson = sortResponses(rank, cache.groupMeId, authorName, beforeDate, afterDate, searchText); 
  } catch {
    cache.groupMeId = await groupmeFunc(false, "", "", "", "", groupMeId)
    newResultJson = sortResponses(rank, cache.groupMeId, authorName, beforeDate, afterDate, searchText)
  }
  if(newResultJson!=null)
    res.render('index', {title: 'Express', result: newResultJson})
});

module.exports = router;
