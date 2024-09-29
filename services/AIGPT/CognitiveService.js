"use strict";
//var mysql = require('openai');
const config = require('../../config.json');
const MySQLService = require('../db/MySQLService.js');
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
const sentiment = require('sentiment');


class CognitiveService {

    constructor() {
       
        
        const configuration = new Configuration({
            apiKey: process.env.CGPT_APIKEY,  // Use process.env to access the API key
        });
          this.client = new OpenAIApi(configuration);
          this.DB = new MySQLService();
    }

    async embedText(text) {
        const response = await this.client.createEmbedding({
            model: "text-embedding-ada-002", // Choose the appropriate model
            input: text,
        });
    
        return response.data.data[0].embedding;
    }


    async getReviews(json, limit = 5000) {

        console.log('limit',limit);
        let sql = `
            SELECT respondentid, response_text
            FROM text_survey_responses 
            WHERE eventid = ? AND pollid = ?
            LIMIT ${limit};
        `;
    
        try {
            let results = await this.DB.runquery(sql, [json.eventid, json.pollid]);
    
            if (results.length === 0) {
                return { success: false };
            }
    
            return {
                success: true,
                reviews: results
            };
    
        } catch (error) {
            console.error('Error fetching respondent scores:', error);
            throw error;
        }
    }
    

     //Saving text answers as vectors for sentiment analyzer
     async TiDBVectorSaving(eventid, pollid, responseText,respondentid) {

        console.log(eventid, pollid, responseText,respondentid);
        if(!responseText){
            return;
        }
        
        try {
        const cognitiveservice = new CognitiveService();   
        const vector = await cognitiveservice.embedText(responseText);
        let sc = await cognitiveservice.analyzeSentiment(responseText); 

        console.log(vector,sc);

        if(!sc){
            return;
        }

        let sql = 'INSERT INTO text_survey_responses (eventid, pollid, response_text, response_vector, sentiment_score, respondentid, tokens) VALUES (?, ?, ?, ?, ?, ?,?)';
        let params = [eventid, pollid, responseText, JSON.stringify(vector), sc.score,respondentid, JSON.stringify(sc.tokens) ];
          
            let result = await this.DB.runquery(sql, params);
            return result;
        } catch (error) {
            console.error('Error inserting data:', error);
            //throw error;
        }
    }
    


    async analyzeSentiment(text) {
            
        try {
         
            // Use a sentiment analysis library or service
            const sentimentAnalyzer = new sentiment();
            const result = sentimentAnalyzer.analyze(text);

            return result;
            
        } catch (error) {
            console.error('Error analyzing sentiment:', error);
            throw error;
        }
    }
    
    async clusterSimilarSentiments(json, limit = 5000) {
        // Step 1: Get a random seed vector
        let seedSql = `
            SELECT respondentid, response_vector
            FROM text_survey_responses
            WHERE eventid = ? AND pollid = ?
            ORDER BY RAND()
            LIMIT 1;
        `;
        let seedResult;
        try {
            seedResult = await this.DB.runquery(seedSql, [json.eventid, json.pollid]);
        } catch (error) {
            console.error('Error selecting seed vector:', error);
            throw error;
        }
    
        if (seedResult.length === 0) {
            return { success: false };
        }
    
        const seedVector = seedResult[0].response_vector;

        
    
        // Step 2: Find similar vectors
        let clusterSql = `
            SELECT 
                respondentid, response_vector, response_text,
                vec_cosine_distance(response_vector, ?) AS similarity
            FROM text_survey_responses
            WHERE eventid = ? AND pollid = ?
            ORDER BY similarity ASC
            LIMIT ${limit};
        `;

        console.log(seedVector,clusterSql);
        
        try {
            let results = await this.DB.runquery(clusterSql, [seedVector, json.eventid, json.pollid]);
            return {
                success: true,
                clusters: results
            };
        } catch (error) {
            console.error('Error clustering sentiments:', error);
            throw error;
        }
    }
    

    async searchSimilarResponses(json, limit = 5000) {
        // Step 1: Get the vector for the selected response
        let sql = `
            SELECT 
                response_vector, response_text
            FROM text_survey_responses
            WHERE eventid = ? AND pollid = ? AND respondentid = ?;
        `;
        
        let seedResult = await this.DB.runquery(sql, [json.eventid, json.pollid, json.respondentid]);
        const seedVector = seedResult[0].response_vector;
        const selectedResponseText = seedResult[0].response_text;
        
        // Step 2: Find similar vectors excluding the selected response
        let clusterSql = `
            SELECT 
                respondentid, response_vector, response_text,
                vec_cosine_distance(response_vector, ?) AS similarity
            FROM text_survey_responses
            WHERE eventid = ? AND pollid = ? AND respondentid != ?
            ORDER BY similarity ASC
            LIMIT ${limit};
        `;
        
        try {
            let results = await this.DB.runquery(clusterSql, [seedVector, json.eventid, json.pollid, json.respondentid]);
            
            return {
                success: true,
                clusters: results,
                selectedResponse: selectedResponseText
            };
        } catch (error) {
            console.error('Error clustering sentiments:', error);
            throw error;
        }
    }
    
    
  
        async analyzeResponses(json, limit = 5000) {
            
            const cognitiveservice = new CognitiveService(); 
            let seedSql = `
                SELECT 
                    response_vector, response_text, sentiment_score, tokens
                FROM text_survey_responses
                WHERE eventid = ? AND pollid = ? AND respondentid = ?;
            `;
        
            console.log(json);
        
            let seedResult = await this.DB.runquery(seedSql, [json.eventid, json.pollid, json.respondentid]);
            let seedVector = seedResult[0].response_vector;
            const isPositive = seedResult[0].sentiment_score > 0;
            const tokens = seedResult[0].tokens;
    
           
        
            console.log(isPositive);
        
            let query;
        
            switch (json.criteria) {
                case 'similarity':
                    query = `
                        SELECT respondentid, response_vector, response_text, sentiment_score,
                               vec_cosine_distance(response_vector, ?) AS similarity
                        FROM text_survey_responses
                        WHERE eventid = ? AND pollid = ?
                        AND respondentid != ?
                        ORDER BY similarity ASC
                        LIMIT ${limit};
                    `;
                    break;
        
                case 'sentiment_similarity':
                    if (isPositive) {
                        query = `
                            SELECT respondentid, response_vector, response_text, sentiment_score,
                                   vec_cosine_distance(response_vector, ?) AS similarity
                            FROM text_survey_responses
                            WHERE eventid = ? AND pollid = ?
                            AND respondentid != ?
                            ORDER BY sentiment_score DESC, similarity ASC
                            LIMIT ${limit};
                        `;
                    } else {
                        query = `
                            SELECT respondentid, response_vector, response_text, sentiment_score,
                                   vec_cosine_distance(response_vector, ?) AS similarity
                            FROM text_survey_responses
                            WHERE eventid = ? AND pollid = ?
                            AND respondentid != ?
                            ORDER BY sentiment_score ASC, similarity ASC
                            LIMIT ${limit};
                        `;
                    }
                    break;
        
                case 'thematic_clustering':
                    query = `
                        SELECT respondentid, response_vector, response_text,sentiment_score,
                               vec_cosine_distance(response_vector, ?) AS similarity
                        FROM text_survey_responses
                        WHERE eventid = ? AND pollid = ?
                        ORDER BY similarity ASC
                        LIMIT ${limit};
                    `;
                    break;
        
                default:
                    throw new Error('Invalid analysis criteria provided');
            }
        
            try {
                let results;
                if(json.criteria == 'thematic_clustering'){
                    if(json.searchcluster){
                    const vector = await cognitiveservice.embedText(json.searchcluster);
                    seedVector = JSON.stringify(vector);
                    console.log(json.criteria,seedVector);
                    }
                    results = await this.DB.runquery(query, [seedVector, json.eventid, json.pollid]);
                }else{
                    results = await this.DB.runquery(query, [seedVector, json.eventid, json.pollid, json.respondentid]);
                }
        
                // Add sentiment color and text
                results = results.map(result => {
                    const sentiment = this.sentimentToColor(result.sentiment_score);
                    return {
                        ...result,
                        sentimentColor: sentiment.color,
                        sentimentText: sentiment.text
                    };
                });
        
                return {
                    success: true,
                    analysisType: json.criteria,
                    clusters: results,
                    selectedresponse: seedResult[0].response_text,
                    tokens: tokens
                };
            } catch (error) {
                console.error('Error analyzing responses:', error);
                throw error;
            }
        }
    
    async analyzeOverallSentiment(json) {

        let sql = `
            SELECT 
                SUM(sentiment_score) / COUNT(1) AS overallSentiment,
                COUNT(1) AS totalResponses
            FROM text_survey_responses 
            WHERE eventid = ? AND pollid = ?;
        `;
    
        try {
            let results = await this.DB.runquery(sql, [json.eventid, json.pollid]);
    
            if (results.length === 0 || results[0].totalResponses === 0) {
                return { success: false };
            }
    
            const overallSentiment = results[0].overallSentiment;
            const sentimentPercentage = this.sentimentToPercentage(overallSentiment).toFixed(2);
            const sentimentColor = this.sentimentToColor(overallSentiment);
    
            return {
                success: true,
                overallSentiment: overallSentiment,
                sentimentPercentage: sentimentPercentage,
                sentimentColor: sentimentColor,
                dataset: await this.getRespondentScores(json, 5000)
            };
    
        } catch (error) {
            console.error('Error analyzing overall sentiment:', error);
            throw error;
        }
    }
    
    async getRespondentScores(json, limit = 5000) {

        console.log('limit',limit);
        let sql = `
            SELECT respondentid, sentiment_score
            FROM text_survey_responses 
            WHERE eventid = ? AND pollid = ?
            LIMIT ${limit};
        `;
    
        try {
            let results = await this.DB.runquery(sql, [json.eventid, json.pollid]);
    
            if (results.length === 0) {
                return { success: false };
            }
    
            return {
                success: true,
                respondentScores: results
            };
    
        } catch (error) {
            console.error('Error fetching respondent scores:', error);
            throw error;
        }
    }
    

     sentimentToPercentage(score) {
        const maxPossibleScore = 5;
        const minPossibleScore = -5;
        const normalizedScore = (score - minPossibleScore) / (maxPossibleScore - minPossibleScore);
        return normalizedScore * 100; // Percentage
    }

    sentimentToColor(score) {
        if (score > 1) {
            return {color: 'rgba(43, 182, 76, 1)', text: 'Good'};
        } else if (score >= -1 && score <= 1) {
            return {color: 'rgba(233, 194, 68, 1)', text: 'Average'} ;
        } else {
            return {color: 'rgba(233, 70, 68, 1)', text: 'Poor'} ;
        }
    }

    
    

}
module.exports = CognitiveService;