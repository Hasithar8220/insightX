"use strict";
const config = require('../config.json');
const MySQLService = require('./db/MySQLService.js');



class InsightService {

    constructor() {
       
        this.DB = new MySQLService();
    
    }

    async saveInsight(json){
        try{
       
        //Store record in local DB
        var sql = "UPDATE clients SET imgdata='"+json.imgdata+"'  WHERE guid='" + json.clientid + "'";
        console.log(sql);
        await this.DB.runquery(sql);
        //incentivise
        //await this.resolvedatarankincentivisation(null,json.did,'dp');
        }catch(err){
            console.log(err);
            return false;
        }
        return true;
    }

}

module.exports = InsightService;