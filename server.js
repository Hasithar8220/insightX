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


app.post("/api/sentimentanalyzer",  async function (req, res) {


  let json;
  if (req.body) {
      json = req.body;
      //console.log(json);
  }

  let cs = new CognitiveService();
  let out = await cs.analyzeOverallSentiment(json);
  res.json(out);

});

app.post("/api/clustersimilarsentiments",  async function (req, res) {


  let json;
  if (req.body) {
      json = req.body;
      //console.log(json);
  }

  let cs = new CognitiveService();
  let out = await cs.clusterSimilarSentiments(json);
  res.json(out);

});

app.post("/api/searchsimilarresponses",  async function (req, res) {


  let json;
  if (req.body) {
      json = req.body;
      //console.log(json);
  }

  let cs = new CognitiveService();
  //let out = await cs.searchSimilarResponses(json);
  let out = await cs.analyzeResponses(json);
  res.json(out);

});

app.post("/api/getreviews",  async function (req, res) {


  let json;
  if (req.body) {
      json = req.body;
  }

  let cs = new CognitiveService();
  let out = await cs.getReviews(json);
  res.json(out);

});


app.post("/api/addreview",  async function (req, res) {


  let json;
  if (req.body) {
      json = req.body;
      //console.log(json);
  }

  let cs = new CognitiveService();
  //let out = await cs.searchSimilarResponses(json);
  let out = await cs.TiDBVectorSaving(json.eventid, json.pollid, json.responsetext, json.respondentid);
  res.json(out);

});

