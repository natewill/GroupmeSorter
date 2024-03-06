const axios = require("axios");
const { response } = require("express");

const accessToken = "?token=prraXW47Lw8MODGw5ND1VH0ou0mwa9HCkoiXBTyj";

exports.groupmeFunc = async function(groupMeId) {
  const numberOfMessages = 1000 // times 100
  var messagesPerPage = 100;

  var lastID = "";
  var groupMeNumberOfMessages;
  var responsesArray = []
  var members = []
  var lastMessageInLoop;

  await axios.get("https://api.groupme.com/v3/groups/"+groupMeId+accessToken).then((response) => {
    lastId = response.data.response.messages.last_message_id
    groupMeNumberOfMessages = response.data.response.messages.count
    if(response.data.response.messages.count < 100){
      messagesPerPage = response.data.response.messages.count
    }
  }).catch((error) => {
    console.error(error);
  })

  for (let i = 0; i < numberOfMessages; i++) {
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
        for(let message of response.data.response.messages) {
          var messageDate = new Date(message.created_at * 1000);
          var groupme = {
            id: message.id,
            date:
              (messageDate.getMonth() + 1).toString() +
              "/" +
              messageDate.getDate().toString() +
              "/" +
              messageDate.getFullYear().toString(),
            author: message.name,
            authorId: message.user_id,
            text: message.text,
            likes: message.favorited_by.length,
          };
          if (groupme.text == null) {
            groupme.img = message.attachments[0].url;
          }

          responsesArray.push(groupme);
          groupMeNumberOfMessages--

          if(groupMeNumberOfMessages < 100){
            messagesPerPage = groupMeNumberOfMessages
          }

          console.log(groupMeNumberOfMessages)
          if(groupMeNumberOfMessages <= 0){
            i=numberOfMessages
          }

          //functionality for in context shitty code just leave me alone
          groupme['messageAfter'] = lastID
          lastID = message.id;
        };
      })
      .catch((error) => {
        console.error(error);
      });

      
  }
  return responsesArray
}

exports.sortResponses = function(rank, responsesArray, authorId, bD, aD, sT) {
  var beforeDate = new Date(bD)
  var afterDate = new Date(aD)
  var searchText = sT;
  var newResponses = []

  for(let i=0; i<responsesArray.length; i++){
    groupme = responsesArray[i]
    var groupmeDateToUnix = new Date(groupme.date)
    if ((authorId!= "" && groupme.authorId==authorId)||(authorId=="") 
      && ((beforeDate!="Invalid Date"&&groupmeDateToUnix < beforeDate)||(beforeDate=="Invalid Date")) 
      && ((afterDate!="Invalid Date"&&groupmeDateToUnix > afterDate)||(afterDate=="Invalid Date"))
      && ((searchText!=""&&groupme.text!=null&&groupme.text.toLowerCase().includes(searchText.toLowerCase()))||(searchText==""))) {
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

//inefficent but i don't give a fuck to be honest
//gotta change the limit because potential 304 errors
exports.inContext = async function(groupMeId, messageId, messageAfter){
  var messagesBefore = []
  var messagesAfter = []
  var message = []
  await axios.get(
    "https://api.groupme.com/v3/groups/" +
      groupMeId +
      "/messages" +
      accessToken,
    {
      params: {
        limit: 5,
        before_id: messageId,
      },
    }
  ).then((response) => {
    for(let messages of response.data.response.messages){
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
      messagesBefore.push(groupme)
    }
  }).catch((error) => {
    console.error(error);
  })

  await axios.get(
    "https://api.groupme.com/v3/groups/" +
      groupMeId +
      "/messages" +
      accessToken,
    {
      params: {
        limit: 5,
        after_id: messageId,
      },
    }
  ).then((response) => {
    for(let messages of response.data.response.messages){
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
      messagesAfter.push(groupme)
    }
  }).catch((error) => {
    console.error(error);
  })

  await axios.get(
    "https://api.groupme.com/v3/groups/" +
      groupMeId +
      "/messages" +
      accessToken,
    {
      params: {
        limit: 2,
        after_id: messageAfter
      },
    }
  ).then((response) => {
    for(let messages of response.data.response.messages){
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
      message.push(groupme)
    }
  }).catch((error) => {
    console.error(error);
  })

  messagesBefore = messagesBefore.reverse()
  return [messagesBefore, messagesAfter, message]
}

