const axios = require('axios');

const accessToken = '?token=prraXW47Lw8MODGw5ND1VH0ou0mwa9HCkoiXBTyj';
const choloID = '44332781';
var responsesArray = []
var lastID = 170702090068488782;

//var date = new Date(unix_timestamp * 1000);
async function groupmeFunc(){
for(let i=0; i<300; i++){
await axios.get('https://api.groupme.com/v3/groups/'+choloID+'/messages'+accessToken, {
    params: {
        limit: '100',
        before_id: lastID.toString()
      }
    
})
  .then((response) => {

    //console.log(response.data.response.messages.forEach())
    
    var i = 0;
    response.data.response.messages.forEach((messages) => {
        /*
        if(i%10==0){
        console.log("Author:", messages.name);
        console.log("Text:", messages.text, '\n');
                //console.log(messageDate)
        }
        */
        i++
        var messageDate = new Date(messages.created_at * 1000)
        var groupme = {
            date: (messageDate.getMonth()+1).toString()+'/'+messageDate.getDate().toString()+'/'+messageDate.getFullYear().toString(),
            author: messages.name,
            text: messages.text,
            likes: messages.favorited_by.length
        }
        /*
        if(groupme.text == null){
            groupme.Img = messages.attachments[0].url
        }
        */
        responsesArray.push(groupme)
        //console.log(groupme)
    /*
        if(messages.favorited_by.length > 10 && messageDate < new Date("01/01/2022")){
            console.log("Date:", (messageDate.getMonth()+1).toString()+'/'+messageDate.getDate().toString()+'/'+messageDate.getFullYear().toString())
            console.log("Author:", messages.name);
            console.log("Text:", messages.text);
            if(messages.text==null){
                console.log("Img:", messages.attachments[0].url)
            }
            console.log("Likes:", messages.favorited_by.length, '\n')
        }
        */
        lastID = messages.id
      }); 
      
  })
  .catch((error) => { 
    console.error(error);
  });
}
}

async function runInOrder() {
    await groupmeFunc(); 
    responsesArray.sort((a, b) => b.likes - a.likes)
    for(let i=0; i<50; i++){
        console.log(responsesArray[i])
    }
  }

  runInOrder()

//for(let i=0; i<30; i++){
 //   console.log(responsesArray[i])
//}