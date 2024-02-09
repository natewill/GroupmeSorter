const axios = require("axios");

const accessToken = "?token=prraXW47Lw8MODGw5ND1VH0ou0mwa9HCkoiXBTyj";
const choloID = "44332781";

exports.groupmeFunc = async function(author, bD, aD, sT) {
  var lastID = 170702090068488782;
  var responsesArray = [];
  var beforeDate = new Date(bD)
  var afterDate = new Date(aD)
  if(afterDate=="Invalid Date"){
    afterDate = new Date("12/01/2020")
  }

  var groupStartDate = await axios.get("https://api.groupme.com/v3/groups/"+choloID+accessToken).created_at
  var searchText = sT
  for (let i = 0; i < 700; i++) {
    await axios
      .get(
        "https://api.groupme.com/v3/groups/" +
          choloID +
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
          if(groupmeDateToUnix <= new Date(groupStartDate)){
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

function rankFunc(responsesArray){
  
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
