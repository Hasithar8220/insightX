const express = require('express');
const open = require('open');
require('dotenv').config();


const GPTService = require('./services/AIGPT/GPTService.js');
const InsightService = require('./services/insightservice.js');


const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static("./"));
app.use(express.json());

//to resolve angularjs 404 issue
    //In angular side we have added route config to eliminate "#!". That url change causes 404 
    app.use(function (req, res, next) {

        var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        //console.log(fullUrl);
        //Only for non api request calls
        if (!fullUrl.includes('/api/', 0)) {
            //console.log(true);
            var d = res.status(404);
            if (d) {
                res.sendfile('index.html');
            }
        } else {
            next();
        }
    });

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

app.post("/api/polls/savemetadata", async function (req, res) {

    let IS = new InsightService(); 
    let json;
    if (req.body) {
        json = req.body;
        //console.log(json);
    } 
    let i = await IS.saveInsight(json);
    res.json(i);
  });

  app.post("/api/polls/getmetadata", async function (req, res) {

    let IS = new InsightService();
  
    let json;
    if (req.body) {
        json = req.body;
        //console.log(json);
    }
  
    let i = await IS.getInsight(json);
    res.json(i);
  });


  app.post("/api/polls/vote", async function (req, res) {

    let IS = new InsightService(); 
    let json;
    if (req.body) {
        json = req.body;
        //console.log(json);
    } 
    let i = await IS.vote(json);
    res.json(i);
  });







