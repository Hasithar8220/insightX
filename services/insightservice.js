"use strict";
const config = require('../config.json');
const MySQLService = require('./db/MySQLService.js');



class InsightService {

    constructor() {
       
        this.DB = new MySQLService();
    
    }

    async saveInsight(json){

        try{
       console.log(json);
            let d = new Date();
            d = this.getmysqldatetime(d);

            //create link
            json.publiclink='https://insightx.live/polls?id='+json.pollhash;

        //Store record in local DB
        var sql = `INSERT INTO insights (title, description, hash, publiclink,jsonobj, datetime) VALUES (?,?,?,?,?,?) `;
        console.log(sql);
        const results = await this.DB.runquery(sql, [json.title,json.description, json.pollhash, json.publiclink,JSON.stringify(json), d]);
        return results;
        }catch(err){
            console.log(err);
            return false;
        }
      
    }

    async getInsight(json){

        try{
       console.log(json);
     
        //Store record in local DB
        var sql = `SELECT * FROM insights WHERE hash=?`;
        console.log(sql);
        const results = await this.DB.runquery(sql, [json.pollHash]);
        return results[0];
        }catch(err){
            console.log(err);
            return false;
        }
      
    }

    async vote(json){

        try{
       console.log(json);
            let d = new Date();
            d = this.getmysqldatetime(d);

            

        //Store record in local DB
        var sql = `INSERT INTO votes (vote, pollhash, datetime) VALUES (?,?,?) `;
        console.log(sql);
        const results = await this.DB.runquery(sql, [json.vote, json.pollhash, d]);
        return results;
        }catch(err){
            console.log(err);
            return false;
        }
      
    }

    getmysqldatetime(d) {
        return d.toISOString().slice(0, 19).replace('T', ' ');
      }

}

module.exports = InsightService;