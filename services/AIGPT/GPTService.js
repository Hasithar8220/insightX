"use strict";
//var mysql = require('openai');
const config = require('../../config.json');
const { Configuration, OpenAIApi } = require("openai");
const {
  PORT,
  NODE_ENV,
  OWNER,
  DOMAIN,
  zj,
  PW,
  DBuser,
  DBPW
} = require('../../config');

const MySQLService = require('../db/MySQLService.js');
const axios = require('axios');

var openai;

class GPTService {

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.CGPT_APIKEY,
    });
    openai = new OpenAIApi(configuration);
    const mySQLService = new MySQLService();
  
  }

  async connect(c) {

    try {

     if(!c.numberofquestions){
      c.numberofquestions =12;
     }

      let messages = [
        {
          "role": "user", "content": `I need a single poll question STRICTLY in JSON format, in a given poll topic and objectives. POLL topic: ${c.name}.  POLL objectives: ${c.description}. 
          Please refer this example: {"question":"What percentage of your workforce is currently working remotely?","Options":["0-25%", "26-50%", "51-75%", "76-100%"]}` }
      ];
     
      const chat = await openai.createChatCompletion({
        //model: "gpt-3.5-turbo",
        model: "gpt-3.5-turbo",
        temperature: 1,
        messages: messages,
      });
     
      return chat.data.choices[0].message.content;

    } catch (error) {
      // Consider adjusting the error handling logic for your use case
      if (error.response) {
        console.error(error.response.status, error.response.data);
        // res.status(error.response.status).json(error.response.data);
      } else {
        console.error(`Error with OpenAI API request: ${error.message}`);
    
      }
    }

  }


  async  embedText(text) {
    const response = await openai.createEmbedding({
        model: "text-embedding-ada-002", // Specify the model you want to use
        input: text,
    });

    return response.data.data[0].embedding;
}


   validateJSON(jsonString) {
    try {
      JSON.parse(jsonString);
      return true;
    } catch (error) {
      console.error("Invalid JSON: "+jsonString, error);
      return false;
    }
  }


}

module.exports = GPTService;