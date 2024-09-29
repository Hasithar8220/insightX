const express = require('express');
const open = require('open');
require('dotenv').config();


const GPTService = require('./services/AIGPT/GPTService.js');
const CognitiveService = require('./services/AIGPT/CognitiveService.js');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static("./"));
app.use(express.json());

 app.get("/", function (req, res) {
    res.sendFile('index.html', { root: '.' })
 });

app.listen(PORT, function () {
    console.log("Express server listening... ", PORT);
    (async () => {
        await open('http://localhost:'+PORT);
    })();
}


);


app.post("/api/polls/aiassistant", async function (req, res) {

  let GPT = new GPTService();

  let json;
  if (req.body) {
      json = req.body;
      //console.log(json);
  }

  let ai = await GPT.connect(json);
  
  res.json(ai);
});









