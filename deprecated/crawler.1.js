var request = require('request');
var cheerio = require('cheerio');
var nlp = require('compromise');
var Tokenizer = require('sentence-tokenizer');
var tokenizer = new Tokenizer('Chuck');
var nounSet = new Set();
var verbSet = new Set();
var topicSet = new Set();
var peopleSet = new Set();

request('https://en.wikipedia.org/wiki/Proteus', function (error, response, html) {
    if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        $('p').each(function (i, element) {
            var a = $(this).prev();

            tokenizer.setEntry(a.text());
            var sentenceArray = tokenizer.getSentences();
            
            for(var i = 0; i < sentenceArray.length; i++){
                var nounSubArray = nlp(sentenceArray[i]).nouns().normalize().out('array');
                for(var j = 0; j < nounSubArray.length; j++)
                nounSet.add(nounSubArray[j].replace(/ *\[[^\]]*]/, ''));
            }

            for(var i = 0; i < sentenceArray.length; i++){
                var verbSubArray = nlp(sentenceArray[i]).verbs().normalize().out('array');
                for(var j = 0; j < verbSubArray.length; j++)
                verbSet.add(verbSubArray[j].replace(/ *\[[^\]]*]/, ''));
            }

            for(var i = 0; i < sentenceArray.length; i++){
                var topicSubArray = nlp(sentenceArray[i]).topics().normalize().out('array');
                for(var j = 0; j < topicSubArray.length; j++)
                topicSet.add(topicSubArray[j].replace(/ *\[[^\]]*]/, ''));
            }

            for(var i = 0; i < sentenceArray.length; i++){
                var peopleSubArray = nlp(sentenceArray[i]).people().normalize().out('array');
                for(var j = 0; j < peopleSubArray.length; j++)
                peopleSet.add(peopleSubArray[j].replace(/ *\[[^\]]*]/, ''));
            }
        });
    }
    console.log(nounSet);
    console.log("--------------------");
    console.log(verbSet);
    console.log("--------------------");
    console.log(topicSet);
    console.log("--------------------");
    console.log(peopleSet);
    console.log("--------------------");

});

