const axios = require("axios");

exports.groupmeFunc = async function(groupMeId, accessToken, beforeDate=0) {
  const numberOfMessages = 300; //* 10^2
  let messagesPerPage = 100;
  let lastID = "";
  let groupMeNumberOfMessages;
  let groupMeCreationDate = "";
  const responsesArray = [];

  try {
    const response = await axios.get(`https://api.groupme.com/v3/groups/${groupMeId}${accessToken}`);
    lastID = response.data.response.messages.last_message_id;
    groupMeNumberOfMessages = response.data.response.messages.count;
    groupMeCreationDate = response.data.response.created_at;
    if (response.data.response.messages.count < 100) {
      messagesPerPage = response.data.response.messages.count;
    }
  } catch (error) {
    console.error(error);
  }

  for (let i = 0; i < numberOfMessages; i++) {
    if(groupMeNumberOfMessages < 100) {
      messagesPerPage = groupMeNumberOfMessages-1;
    }
    try {
      const response = await axios.get(`https://api.groupme.com/v3/groups/${groupMeId}/messages${accessToken}`, {
        params: {
          limit: messagesPerPage.toString(),
          before_id: lastID.toString(),
        },
      });

      for (const message of response.data.response.messages) {
        const messageDate = new Date(message.created_at * 1000);
        const groupme = {
          id: message.id,
          date: `${messageDate.getMonth() + 1}/${messageDate.getDate()}/${messageDate.getFullYear()}`,
          author: message.name,
          authorId: message.user_id,
          text: message.text,
          likes: message.favorited_by.length,
          messageAfter: lastID,
        };

        if (groupme.text == null) {
          groupme.img = message.attachments[0].url;
        }

        
        //i think this works? i hope so
        if(new Date(groupme.date) <= new Date(beforeDate*1000)){
          i = numberOfMessages
          break
        }
        
        responsesArray.push(groupme);
        groupMeNumberOfMessages--;

        if (groupMeNumberOfMessages < 100) {
          messagesPerPage = groupMeNumberOfMessages;
        }

        
        
        if (responsesArray.length >= numberOfMessages * 100 || groupMeNumberOfMessages <= 1 || new Date(groupme.date) <= new Date("12/01/2020")) {
          i = numberOfMessages;
          break;
        }
        lastID = message.id;
      }
    } catch (error) {
      console.error(error);
      i = numberOfMessages;
    }
  }

  return responsesArray;
};

exports.sortResponses = function(rank, responsesArray, authorId, bD, aD, sT) {
  const beforeDate = new Date(bD);
  const afterDate = new Date(aD);
  const searchText = sT;
  const newResponses = [];

  for(let i=0; i<responsesArray.length; i++){
    groupme = responsesArray[i]
    var groupmeDateToUnix = new Date(groupme.date)
    if (((authorId != [] && authorId.includes(groupme.authorId))|| (authorId==[]) )
      && ((beforeDate!="Invalid Date"&&groupmeDateToUnix < beforeDate)||(beforeDate=="Invalid Date")) 
      && ((afterDate!="Invalid Date"&&groupmeDateToUnix > afterDate)||(afterDate=="Invalid Date"))
      && ((searchText!=""&&groupme.text!=null&&groupme.text.toLowerCase().includes(searchText.toLowerCase()))||(searchText==""))) {
      newResponses.push(groupme);
    }
  }

  if (rank) {
    newResponses.sort((a, b) => b.likes - a.likes);
  }
  return newResponses;
};

exports.getUsers = async function(groupMeId, accessToken) {
  try {
    const response = await axios.get(`https://api.groupme.com/v3/groups/${groupMeId}${accessToken}`);
    return response.data.response.members;
  } catch (error) {
    console.error(error);
    return [];
  }
};

exports.getGroups = async function(accessToken) {
  try {
    const response = await axios.get(`https://api.groupme.com/v3/groups${accessToken}`, {
      params: {
        per_page: 100,
        omit: "memberships",
      },
    });

    const groups = [];
    for (const group of response.data.response) {
      groups.push({ id: group.id, name: group.name });
    }

    return groups;
  } catch (error) {
    console.error(error);
    return [];
  }
};

exports.inContext = async function(groupMeId, messageId, messageAfter, accessToken) {
  const messagesBefore = [];
  const messagesAfter = [];
  const message = [];

  try {
    const responseBefore = await axios.get(`https://api.groupme.com/v3/groups/${groupMeId}/messages${accessToken}`, {
      params: {
        limit: 5,
        before_id: messageId,
      },
    });

    for (const messages of responseBefore.data.response.messages) {
      const messageDate = new Date(messages.created_at * 1000);
      const groupme = {
        date: `${messageDate.getMonth() + 1}/${messageDate.getDate()}/${messageDate.getFullYear()}`,
        author: messages.name,
        text: messages.text,
        likes: messages.favorited_by.length,
      };
      messagesBefore.push(groupme);
    }
  } catch (error) {
    console.error(error);
  }

  try {
    const responseAfter = await axios.get(`https://api.groupme.com/v3/groups/${groupMeId}/messages${accessToken}`, {
      params: {
        limit: 5,
        after_id: messageId,
      },
    });

    for (const messages of responseAfter.data.response.messages) {
      const messageDate = new Date(messages.created_at * 1000);
      const groupme = {
        date: `${messageDate.getMonth() + 1}/${messageDate.getDate()}/${messageDate.getFullYear()}`,
        author: messages.name,
        text: messages.text,
        likes: messages.favorited_by.length,
      };
      messagesAfter.push(groupme);
    }
  } catch (error) {
    console.error(error);
  }

  try {
    const responseMessage = await axios.get(`https://api.groupme.com/v3/groups/${groupMeId}/messages${accessToken}`, {
      params: {
        limit: 1,
        before_id: messageAfter,
      },
    });
    
    for (const messages of responseMessage.data.response.messages) {
      const messageDate = new Date(messages.created_at * 1000);
      const groupme = {
        date: `${messageDate.getMonth() + 1}/${messageDate.getDate()}/${messageDate.getFullYear()}`,
        author: messages.name,
        text: messages.text,
        likes: messages.favorited_by.length,
      };
      message.push(groupme);
    }
  } catch (error) {
    console.error(error);
  }

  messagesBefore.reverse();
  return [messagesBefore, messagesAfter, message];
};

//the before date functionality isnt perfect because it checks if the *days* of the two messages are
//equal, even if the exact time is different
exports.checkIsUpToDate = async function(groupMeId, accessToken, currCachedData){
  try {
    if(currCachedData == undefined){
      return true
    }
    const response = await axios.get(`https://api.groupme.com/v3/groups/${groupMeId}${accessToken}`);

    last_message_created_at= response.data.response.messages.last_message_created_at;
    if(new Date(last_message_created_at*1000).toDateString() == new Date(currCachedData[0].date).toDateString()){
      return true
    } 
    return false
  } catch (error) {
    console.error(error);
    return [];
  }
}