const {sortResponses, groupmeFunc, getUsers} = require("../public/javascripts/groupmerestapi.js")

var express = require('express');
var router = express.Router();

var cache = {}
var groupMeId = 
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
  groupMeId = req.body.groupMeId.toString()
  const users = await getUsers(groupMeId);
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


router.get('/autocomplete', async (req, res) => {
  var users = await getUsers(groupMeId)
  const query = req.query.q.toLowerCase()
  nameArray = []
  for(let i=0; i<users.length;i++){
    nameArray.push(users[i].nickname)
  }
  const suggestions = nameArray.filter(name => 
    name.toLowerCase().startsWith(query)
);
  res.json(suggestions);
});


module.exports = router;
