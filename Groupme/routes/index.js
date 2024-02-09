const {sortResponses, groupmeFunc} = require("../public/javascripts/groupmerestapi.js")

var express = require('express');
var router = express.Router();

var cache = {}

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
  const groupMeId = req.body.groupMeId.toString()

  rank = rank=="yes" ? true : false
  if(groupMeId != ""){
    try {
      newResultJson = sortResponses(rank, cache[groupMeId], authorName, beforeDate, afterDate, searchText); 
    } catch {
      cache[groupMeId] = await groupmeFunc(groupMeId, "", "", "", "")
      newResultJson = sortResponses(rank, cache[groupMeId], authorName, beforeDate, afterDate, searchText)
    }
    if(newResultJson!=null)
      res.render('index', {title: 'GroupMeSorter', result: newResultJson})
  } else {
    res.render('index', {title: 'GroupMeSorter', result: null})
  }
});

module.exports = router;
