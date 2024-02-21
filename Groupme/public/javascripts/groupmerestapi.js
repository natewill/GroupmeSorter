const axios = require("axios");
const { response } = require("express");

const accessToken = "?token=prraXW47Lw8MODGw5ND1VH0ou0mwa9HCkoiXBTyj";

exports.groupmeFunc = async function(groupMeId, author, bD, aD, searchText) {
  var lastID = "";
  var messagesPerPage = 100;
  var groupMeNumberOfMessages = 0;
  var responsesArray = [];
  var beforeDate = new Date(bD)
  var afterDate = new Date(aD)
  var members = []
  if(afterDate=="Invalid Date"){
    afterDate = new Date("12/01/2020")
  }

  await axios.get("https://api.groupme.com/v3/groups/"+groupMeId+accessToken).then((response) => {
    lastId = response.data.response.messages.last_message_id
    groupMeNumberOfMessages = response.data.response.messages.count
    if(response.data.response.messages.count < 100){
      messagesPerPage = response.data.response.messages.count
    }
  }).catch((error) => {
    console.error(error);
  })

  for (let i = 0; i < 1000; i++) {
    await axios
      .get(
        "https://api.groupme.com/v3/groups/" +
          groupMeId +
          "/messages" +
          accessToken,
        {
          params: {
            limit: messagesPerPage.toString(),
            before_id: lastID.toString(),
          },
        }
      )
      .then((response) => {
        for(let messages of response.data.response.messages) {
          var messageDate = new Date(messages.created_at * 1000);
          var groupme = {
            date:
              (messageDate.getMonth() + 1).toString() +
              "/" +
              messageDate.getDate().toString() +
              "/" +
              messageDate.getFullYear().toString(),
            author: messages.name,
            text: messages.text,
            likes: messages.favorited_by.length,
          };

          if (groupme.text == null) {
            groupme.img = messages.attachments[0].url;
          }

          var groupmeDateToUnix = new Date(groupme.date)
          if ((author!= "" && groupme.author.includes(author))||(author=="") 
            && ((beforeDate!="Invalid Date"&&groupmeDateToUnix < beforeDate)||(beforeDate=="Invalid Date")) 
            && ((afterDate!="Invalid Date"&&groupmeDateToUnix > afterDate)||(afterDate=="Invalid Date"))
            && ((searchText!=""&&groupme.text!=null&&groupme.text.includes(searchText))||(searchText==""))) {
              responsesArray.push(groupme);
              doneCounter = 0;
            }

          groupMeNumberOfMessages--
          if(groupMeNumberOfMessages < 100){
            messagesPerPage = groupMeNumberOfMessages
          }
          if(responsesArray.length >= groupMeNumberOfMessages){
            i=1000
            return responsesArray
          }

          lastID = messages.id;
          
        };
      })
      .catch((error) => {
        console.error(error);
      });
  }
  return responsesArray
}

exports.sortResponses = function(rank, responsesArray, author, bD, aD, sT) {
  var beforeDate = new Date(bD)
  var afterDate = new Date(aD)
  var searchText = sT;
  var newResponses = []

  for(let i=0; i<responsesArray.length; i++){
    groupme = responsesArray[i]
    var groupmeDateToUnix = new Date(groupme.date)
    if ((author!= "" && groupme.author.includes(author))||(author=="") 
      && ((beforeDate!="Invalid Date"&&groupmeDateToUnix < beforeDate)||(beforeDate=="Invalid Date")) 
      && ((afterDate!="Invalid Date"&&groupmeDateToUnix > afterDate)||(afterDate=="Invalid Date"))
      && ((searchText!=""&&groupme.text!=null&&groupme.text.includes(searchText))||(searchText==""))) {
        newResponses.push(groupme);
        doneCounter = 0;
      }
    }

    if(rank){
      newResponses.sort((a, b) => b.likes - a.likes);
    }
    return newResponses;
}

exports.getUsers = async function(groupMeId){
  var members = []
  await axios.get("https://api.groupme.com/v3/groups/"+groupMeId+accessToken).then((response) => {
    members = response.data.response.members
  }).catch((error) => {
    console.error(error);
  })
  return members
}

//change per page eventually because people could have more than 100 groups ig.
exports.getGroups = async function(accessToken){
  var groups = []
  await axios.get("https://api.groupme.com/v3/groups"+accessToken, {params: {
    per_page: 100,
    omit: 'memberships'
  }}).then((response) => {
    for(let group of response.data.response){
      groups.push({'id' : group.id, 'name' :group.name})
    }
  }).catch((error) => {
    console.error(error);
  })
  return groups
}

