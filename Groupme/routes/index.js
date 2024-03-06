const {sortResponses, groupmeFunc, getUsers, getGroups, inContext} = require("../public/javascripts/groupmerestapi.js")

const https = require('https');
const fs = require('fs');
var express = require('express');
var router = express.Router();

var cache = {}
var groupMeId = ""
var accessToken = ""
var groupUsers = []

router.get('/', async function(req, res, next) {
  if(!(req.query === undefined)){
    accessToken = req.query.access_token
    console.log(accessToken)
  }
  var groups = await getGroups("?token=prraXW47Lw8MODGw5ND1VH0ou0mwa9HCkoiXBTyj")
  res.render('index', { title: 'GroupMeArchive' , result: null, groups: groups, searchText: null});
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
  groupUsers = await getUsers(groupMeId);
  rank = rank=="yes" ? true : false

  //if we're looking for an author, find his user id then search by that instead of his name
  var authorId = "";

  if(authorName != ""){
    for(let user of groupUsers){
      if(user.nickname == authorName){
        authorId = user.user_id
      }
    }
  }

  if(groupMeId != ""){
    try {
      newResultJson = sortResponses(rank, cache[groupMeId], authorId, beforeDate, afterDate, searchText); 
    } catch {
      cache[groupMeId] = await groupmeFunc(groupMeId)
      newResultJson = sortResponses(rank, cache[groupMeId], authorId, beforeDate, afterDate, searchText)
    }
    if(newResultJson!=null)
      res.render('index', {title: 'GroupMeArchive', result: newResultJson, groups: groups, rank: rank, searchText: searchText})
  } else {
    res.render('index', {title: 'GroupMeArchive', result: null, groups: groups, rank: rank, searchText: searchText})
  }
});


router.get('/autocomplete', async (req, res) => {
  const query = req.query.q.toLowerCase()
  nameArray = []
  for(let i=0; i<groupUsers.length;i++){
    nameArray.push(groupUsers[i].nickname)
  }
  const suggestions = nameArray.filter(name => 
    name.toLowerCase().startsWith(query)
);
  res.json(suggestions);
});

router.get('/incontext', async (req, res) => {
  var messageId = req.query.messageId
  var messageAfter = req.query.messageAfter
  var messagesBefore = []
  var messagesAfter = []
  var temp = await inContext(groupMeId, messageId, messageAfter)
  console.log(temp[2])
  res.render('incontext', {messagesBefore: temp[0], messagesAfter: temp[1], message: temp[2]})

})

const sslServerOptions = {
  key: fs.readFileSync('localhost.key'),
  cert: fs.readFileSync('localhost.crt')
};

// Create an HTTPS server
https.createServer(sslServerOptions, router).listen(4000, () => {
  console.log('Server is running on https://localhost:4000');
});

module.exports = router;
