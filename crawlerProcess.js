var request = require('request');
var cheerio = require('cheerio');
var nlp = require('compromise');
var Tokenizer = require('sentence-tokenizer');
var tokenizer = new Tokenizer('Chuck');
var infoNodeModel = require('./models/infonode.model');
var sentenceArray = [];
var transitionArray = [];
var nounSet = new Set();
var verbSet = new Set();
var topicSet = new Set();
var peopleSet = new Set();
var placeSet = new Set();
var organizationSet = new Set();
var knowledgeSet = new Set();
var urlSet = new Set();
const mongoose = require('mongoose');
const dev_db_url = 'mongodb://heliosapp:admin2018@ds045622.mlab.com:45622/helios';
const mongoDB = process.env.MONGODB_URI || dev_db_url;


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
    var $ = cheerio.load(result);

    $('p').each(function (i, element) {
        var content = $(this).prev();
        var item = content.text().replace(/\n/g, '').replace(/ *\[[^\]]*]+/, '').split(/[.?!]/);

        for (var k = 0; k < item.length; k++) {
            if (item[k].includes(" ")) {
                transitionArray.push(item[k]);
            }
        }
    });


    $('a').each(function (i, link) {
        var urlAddress = new String($(link).attr('href'));

        if (urlAddress.includes("https://en.wikipedia.org")) {
            urlSet.add(urlAddress.replace("String", ""));
        }
        if (urlAddress.startsWith("/wiki")) {
            urlSet.add("https://en.wikipedia.org" + urlAddress.replace("String", ""));
        }
    });


    for (var j = 0; j < transitionArray.length; j++) {
        var sentenceNLP = nlp(transitionArray[j]);
        //console.log(sentenceNLP + " -->  " + sentenceNLP.sentences().isQuestion());

        if (sentenceNLP.sentences().isQuestion().length < 1) {
            var nounSubArray = sentenceNLP.nouns().normalize().out('array');
            var verbSubArray = sentenceNLP.verbs().normalize().out('array');
            var topicSubArray = sentenceNLP.topics().normalize().out('array');
            var peopleSubArray = sentenceNLP.people().normalize().out('array');
            var placeSubArray = sentenceNLP.places().normalize().out('array');
            var organizationSubArray = sentenceNLP.organizations().normalize().out('array');

            if (verbSubArray.includes("is")) {
                //console.log(verbSubArray);
                //console.log(transitionArray[j]);
                if ((topicSubArray.length > 0) || (peopleSubArray.length > 0)) {
                    //console.log(peopleSubArray + " vs " + topicSubArray);

                    for (var a = 0; a < nounSubArray.length; a++)
                        nounSet.add(nounSubArray[a].replace(/ *\[[^\]]*]/, ''));

                    for (var b = 0; b < verbSubArray.length; b++)
                        verbSet.add(verbSubArray[b].replace(/ *\[[^\]]*]/, ''));

                    for (var c = 0; c < topicSubArray.length; c++)
                        topicSet.add(topicSubArray[c].replace(/ *\[[^\]]*]/, ''));

                    for (var d = 0; d < peopleSubArray.length; d++)
                        peopleSet.add(peopleSubArray[d].replace(/ *\[[^\]]*]/, ''));

                    for (var e = 0; e < placeSubArray.length; e++)
                        placeSet.add(placeSubArray[e].replace(/ *\[[^\]]*]/, ''));

                    for (var f = 0; f < organizationSubArray.length; f++)
                        organizationSet.add(organizationSubArray[f].replace(/ *\[[^\]]*]/, ''));

                    sentenceArray.push(transitionArray[j]);


                    var knowledgeNode = {
                        sentence: transitionArray[j],
                        source: "",
                        target: ""
                    };
                }

            }
        }
    }
    //sentenceArray = transitionArray;
    //console.log(urlSet);
    //console.log([sentenceArray, nounSet, verbSet, topicSet, peopleSet, placeSet, organizationSet,urlSet]);
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
        db.close();
    });
}

function retrieveEntity() {
    //var mongoose = require('mongoose');
    //var dev_db_url = 'mongodb://heliosapp:admin2018@ds045622.mlab.com:45622/helios';
    //var mongoDB = process.env.MONGODB_URI || dev_db_url;

    var MongoClient = require('mongodb').MongoClient;

    MongoClient.connect(dev_db_url, {
        useNewUrlParser: true
    }, function (err, db) {
        if (err) throw err;
        var dbo = db.db("helios");
        dbo.collection("infonodes").findOne({}, function (err, result) {
            if (err) throw err;
            console.log(result);
            db.close();
        });
    });
}

//instantiateEntity(7, "test", 1, "new");
//retrieveEntity();

processData('https://en.wikipedia.org/wiki/Proteus').then(result => {
    parseData(result);
    //process.exit(1);
}).catch(err => {
    console.log(err);
});