const {sortResponses, groupmeFunc, getUsers, getGroups, inContext} = require("../public/javascripts/groupmerestapi.js")

var express = require('express');
var router = express.Router();

var cache = {}
var groupMeId = ""
router.get('/', async function(req, res, next) {
  var groups = await getGroups("?token=prraXW47Lw8MODGw5ND1VH0ou0mwa9HCkoiXBTyj")
  res.render('index', { title: 'GroupMeSorter' , result: null, groups: groups});
});

router.post('/', async (req, res) => {

  var groups = await getGroups("?token=prraXW47Lw8MODGw5ND1VH0ou0mwa9HCkoiXBTyj")
  var newResultJson = []

  const authorName = req.body.authorName
  const beforeDate = req.body.beforeDate
  const afterDate = req.body.afterDate
  const searchText = req.body.searchText
  var rank = req.body.rank
  groupMeId = req.body.groupMeId==null ? "" : req.body.groupMeId.toString()
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
      res.render('index', {title: 'GroupMeSorter', result: newResultJson, groups: groups, rank: rank})
  } else {
    res.render('index', {title: 'GroupMeSorter', result: null, groups: groups, rank: rank})
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

router.get('/incontext', async (req, res) => {
  var messageId = req.query.messageId
  var messagesBefore = []
  var messagesAfter = []
  var temp = await inContext(groupMeId, messageId)
  console.log(temp[2])
  res.render('incontext', {messagesBefore: temp[0], messagesAfter: temp[1], message: temp[2]})

})


module.exports = router;
