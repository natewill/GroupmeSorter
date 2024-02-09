const axios = require("axios");
const { response } = require("express");

const accessToken = "?token=prraXW47Lw8MODGw5ND1VH0ou0mwa9HCkoiXBTyj";

exports.groupmeFunc = async function(groupMeId, author, bD, aD, sT) {
  var lastID = "";
  var responsesArray = [];
  var beforeDate = new Date(bD)
  var afterDate = new Date(aD)
  
  if(afterDate=="Invalid Date"){
    afterDate = new Date("12/01/2020")
  }
  var groupStartDate = ""
  await axios.get("https://api.groupme.com/v3/groups/"+groupMeId+accessToken).then((response) => {
    groupStartDate = response.data.response.created_at
    lastId = response.data.response.messages.last_message_id
  }).catch((error) => {
    console.error(error);
  })
  var searchText = sT
  for (let i = 0; i < 700; i++) {
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
        var i = 0;
        response.data.response.messages.forEach((messages) => {
          i++;

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

          //big if statement gotta check that
          //if(searchText!=""&&groupme.text!=null&&groupme.text.includes(searchText)){
          //}
          var groupmeDateToUnix = new Date(groupme.date)
          if ((author!= "" && groupme.author.includes(author))||(author=="") 
            && ((beforeDate!="Invalid Date"&&groupmeDateToUnix < beforeDate)||(beforeDate=="Invalid Date")) 
            && ((afterDate!="Invalid Date"&&groupmeDateToUnix > afterDate)||(afterDate=="Invalid Date"))
            && ((searchText!=""&&groupme.text!=null&&groupme.text.includes(searchText))||(searchText==""))) {
              responsesArray.push(groupme);
              doneCounter = 0;
            }
          if(groupmeDateToUnix <= new Date(groupStartDate * 1000)){
            return responsesArray
          }

          lastID = messages.id;
        });
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
