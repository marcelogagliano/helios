var request = require('request');
var cheerio = require('cheerio');
var nlp = require('compromise');
var Tokenizer = require('sentence-tokenizer');
var tokenizer = new Tokenizer('Chuck');
var infoNodeModel = require('../models/infonode.model');
const mongoose = require('mongoose');
const dev_db_url = 'mongodb://heliosapp:admin2018@ds045622.mlab.com:45622/helios';
const mongoDB = process.env.MONGODB_URI || dev_db_url;


class Crawler {

    constructor(url) {
        this._url = url;
        this._content = "";
        this._sentenceArray = [];
        this._nounSet = new Set();
        this._verbSet = new Set();
        this._topicSet = new Set();
        this._peopleSet = new Set();
    }

    run() {
        var x = processData(this._url).then(result => {
            this._content = result;
            var output = parseData(result);
            this._sentenceArray = output[0];
            this._nounSet = output[1];
            this._verbSet = output[2];
            this._topicSet = output[3];
            this._peopleSet = output[4];

            //console.log(this._sentenceArray);
            //console.log(this._nounSet);
            //console.log(this._verbSet);
            //console.log(this._topicSet);
            console.log(this._peopleSet);
            //console.log("x");
        }).catch(err => {
            console.log(err);
        });
    }


    getContent() {
        return this._content;
    }

    getVerbs() {
        return this._verbSet;
    }

    getNouns() {
        return this._nounSet;
    }

    getTopics() {
        return this._topicSet;
    }

    getPeople() {
        return this._peopleSet;
    }

}

async function captureHTML(url) {
    return new Promise(function (resolve, reject) {
        var sentenceArray = [];
        request(url, function (error, response, html) {
            if (!error && response.statusCode == 200)
                resolve(html);
        });

    });
}

async function processData(url) {
    var a = await captureHTML(url);
    //console.log(a);
    return a;
}

function parseData(result) {
    var sentenceArray = [];
    var transitionArray = [];
    var nounSet = new Set();
    var verbSet = new Set();
    var topicSet = new Set();
    var peopleSet = new Set();
    var $ = cheerio.load(result);

    $('p').each(function (i, element) {
        var content = $(this).prev();
        var element = content.text().replace(/\n/g, '').replace(/ *\[[^\]]*]+/, '').split(/[.?!]/);

        for (var k = 0; k < element.length; k++)
            if (element[k].indexOf(" ") > 0)
                transitionArray.push(element[k]);
    });

    for (var j = 0; j < transitionArray.length; j++) {
        var nounSubArray = nlp(transitionArray[j]).nouns().normalize().out('array');
        var verbSubArray = nlp(transitionArray[j]).verbs().normalize().out('array');
        var topicSubArray = nlp(transitionArray[j]).topics().normalize().out('array');
        var peopleSubArray = nlp(transitionArray[j]).people().normalize().out('array');

        if (verbSubArray.length > 0) {
            for (var a = 0; a < nounSubArray.length; a++)
                nounSet.add(nounSubArray[a].replace(/ *\[[^\]]*]/, ''));

            for (var b = 0; b < verbSubArray.length; b++)
                verbSet.add(verbSubArray[b].replace(/ *\[[^\]]*]/, ''));

            for (var c = 0; c < topicSubArray.length; c++)
                topicSet.add(topicSubArray[c].replace(/ *\[[^\]]*]/, ''));

            for (var d = 0; d < peopleSubArray.length; d++)
                peopleSet.add(peopleSubArray[d].replace(/ *\[[^\]]*]/, ''));

            sentenceArray.push(transitionArray[j]);
        }
    }
    //sentenceArray = transitionArray;
    //console.log(sentenceArray);
    return ([sentenceArray, nounSet, verbSet, topicSet, peopleSet]);
}

function instantiateEntity(id, name, target, category) {
    var nodalPoint = new infoNodeModel({
        id: id,
        name: name,
        target: target,
        category: category
    });
    // Set up mongoose connection
    //https://mlab.com/databases/helios/collections/infonodes
    

    mongoose.connect(mongoDB, {
        useNewUrlParser: true
    });
    mongoose.Promise = global.Promise;

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));

    nodalPoint.save(function (err, infonode) {
        if (err) return console.error(err);
        console.log(infonode.name + " saved to helios collection.");
    });
}

function retrieveEntity(){
    //var mongoose = require('mongoose');
    //var dev_db_url = 'mongodb://heliosapp:admin2018@ds045622.mlab.com:45622/helios';
    //var mongoDB = process.env.MONGODB_URI || dev_db_url;
    
    var MongoClient = require('mongodb').MongoClient;

    MongoClient.connect(dev_db_url, { useNewUrlParser: true }, function(err, db) {
      if (err) throw err;
      var dbo = db.db("helios");
      dbo.collection("infonodes").findOne({}, function(err, result) {
        if (err) throw err;
        console.log(result);
        db.close();
      });
    });
}

instantiateEntity(3, "test", 1, "new");
retrieveEntity();
console.log("a");
const c = new Crawler('https://en.wikipedia.org/wiki/Proteus');
c.run();
