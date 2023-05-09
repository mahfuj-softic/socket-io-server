const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");
const port = process.env.PORT || 6001;
const index = require("./routes/index");
const app = express();
app.use(index);
const server = http.createServer(app);
const io = socketIo(server);





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
    const res = await axios.get(
      "https://jsonplaceholder.typicode.com/posts"
    );
    console.log(`Response: ${res.data[0].title}`)
    socket.emit("FromAPI", res.data);

    let x = Math.floor((Math.random() * 1000000) + 1);



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