const {sortResponses, groupmeFunc, getUsers, getGroups, inContext} = require("../public/javascripts/groupmerestapi.js")

var express = require('express');
var router = express.Router();

var cache = {}
var currGroupCache = []
var groupMeId = ""
var accessToken = ""
var groupUsers = []
var groups = []

router.get('/', async function(req, res, next) {
  if(!(req.query === undefined) && !(req.query.access_token == 'undefined')){
    console.log(accessToken)
    accessToken = "?token="+req.query.access_token
  }

  console.log("HEY RIGHT HERE " + accessToken)
  if(accessToken != "" && accessToken != '?token=undefined'){ 
    groups = await getGroups(accessToken)
  }
  res.render('index', { title: 'GroupMeArchive' , result: null, groups: groups, searchText: null, rank: false, groupMeId: '', beforeDate: '', afterDate: '', authorName: ''});
});

router.post('/', async (req, res) => {

  if(accessToken != "" && accessToken != undefined) groups = await getGroups(accessToken)

  var newResultJson = []

  const authorName = req.body.authorName || ''
  const beforeDate = req.body.beforeDate || ''
  const afterDate = req.body.afterDate || ''
  const searchText = req.body.searchText || ''
  var rank = req.body.rank || 'false'
  groupMeId = req.body.groupMeId==null ? "" : req.body.groupMeId.toString()
  groupUsers = await getUsers(groupMeId, accessToken);
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
      cache[groupMeId] = await groupmeFunc(groupMeId, accessToken)
      newResultJson = sortResponses(rank, cache[groupMeId], authorId, beforeDate, afterDate, searchText)
    }
    if(newResultJson!=null){
      currGroupCache = newResultJson
      res.render('index', {title: 'GroupMeArchive', result: newResultJson, groups: groups, rank: rank, searchText: searchText, groupMeId: groupMeId, beforeDate: beforeDate, afterDate: afterDate, authorName: authorName})
    }
  } else {
    res.render('index', {title: 'GroupMeArchive', result: "", groups: groups, rank: rank, searchText: searchText, groupMeId: groupMeId, beforeDate: beforeDate, afterDate: afterDate, authorName: authorName})
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

router.get('/loadMoreResults', async (req, res) => {
  const page = parseInt(req.query.page, 10);
  const resultsPerPage = parseInt(req.query.resultsPerPage, 10);

  // Slice the results based on the current page and results per page
  const startIndex = (page - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const paginatedResults = currGroupCache.slice(startIndex, endIndex);

  res.json(paginatedResults);
});

router.get('/incontext', async (req, res) => {
  var messageId = req.query.messageId
  var messageAfter = req.query.messageAfter
  var messagesBefore = []
  var messagesAfter = []
  var temp = await inContext(groupMeId, messageId, messageAfter, accessToken)
  console.log(temp[2])
  res.render('incontext', {messagesBefore: temp[0], messagesAfter: temp[1], message: temp[2]})

})

module.exports = router;
