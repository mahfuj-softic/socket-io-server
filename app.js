const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");
const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const port = process.env.PORT || 6001;
const index = require("./routes/index");
const app = express();
app.use(index);
const server = http.createServer(app);
const io = socketIo(server);





// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

async function listMajors(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '1UOJtVEOI30GkaVVLGdQZzyvwNU8zLO6pqWr7rCw4YPg',
    range: 'A2:Q',
  });
  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  console.log('Name, Major:');
  rows.forEach((row) => {
    // Print columns A and E, which correspond to indices 0 and 4.
    console.log(`${row[0]}, ${row[4]}`);
  });
}



io.on("connection", socket => {
  console.log("New client connected"), 
  setInterval(
    () => getApiAndEmit(socket),
    10000
  );
  socket.on("disconnect", () => console.log("Client disconnected"));
});
const getApiAndEmit = async socket => {
  try {
    // const res = await axios.get(
    //   "https://jsonplaceholder.typicode.com/posts"
    // );
    // console.log(`Response: ${res.data[0].title}`)
    // socket.emit("FromAPI", res.data);

    // let x = Math.floor((Math.random() * 1000000) + 1);


    authorize().then(listMajors).catch(console.error);



    axios({
        url: 'http://localhost:5000/graphql',
        method: 'post',
        data: {
         query: `mutation{
            createTemp(input:{test: ${x}, text: "${res.data[1].title+x}"}){
                test
          }
        }
         `
        }
       })
        .then(res => {
         console.log(res.data);
        })
        .catch(err => {
         console.log(err.message);
        });


//     const query = `
//     mutation createTemp($test: Int,$text:String){
//         createTemp(test: $test,text: $text) {
//             test
//           }
//       }
//   `


//     fetch('http://localhost:5000/graphql', {
//   method: 'POST',
//   headers: {
//     'content-type': 'application/json'
//   },
//   body: JSON.stringify({
//     query,
//     variables: {
//       test: 17700,
//       text:"656567ff"
//     }
//   })
// })
//   .then(res => res.json())
//   .then(data => console.log(data))
//   .error(err => console.log(err))

  } catch (error) {
    console.error(`Error: ${error}`);
  }
};




server.listen(port, () => console.log(`Listening on port ${port}`));