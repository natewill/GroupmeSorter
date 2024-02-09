const axios = require("axios");
const { response } = require("express");

const accessToken = "?token=prraXW47Lw8MODGw5ND1VH0ou0mwa9HCkoiXBTyj";

exports.groupmeFunc = async function(groupMeId, author, bD, aD, searchText) {
  var lastID = "";
  var groupMessageLength = 0;
  var responsesArray = [];
  var beforeDate = new Date(bD)
  var afterDate = new Date(aD)

  if(afterDate=="Invalid Date"){
    afterDate = new Date("12/01/2020")
  }

  await axios.get("https://api.groupme.com/v3/groups/"+groupMeId+accessToken).then((response) => {
    groupMessageLength = response.data.response.messages.count
    lastId = response.data.response.messages.last_message_id
  }).catch((error) => {
    console.error(error);
  })

  MainLoop:
  for (let i = 0; i < 400; i++) {
    await axios
      .get(
        "https://api.groupme.com/v3/groups/" +
          groupMeId +
          "/messages" +
          accessToken,
        {
          params: {
            limit: "100",
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
          if(responsesArray.length >= groupMessageLength){
            i=400
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
