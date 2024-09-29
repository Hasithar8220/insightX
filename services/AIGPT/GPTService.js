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