var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");
var PORT = 3000;

var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/newscrape", {useNewUrlParser:true});

app.get("/scrape", function(req, res) {
    axios.get("https://www.livescience.com/news").then(function(response) {
        var $ = cheerio.load(response.data);

        $(".search-item").each(function(i, element) {
            var result = {};

            result.title = $(this)
                .children().children().children("a").text();
            result.link = $(this)
                .children("a").attr("href");
            
            result.summary = $(this)
                .children("p").text();

            db.Article.create(result)
                .then(function(dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function(err) {
                    return res.json(err);
                });
        });

        res.send("Scrape Complete!");
    });
});

app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    }); 
});

app.get("/articles/:id", function(req, res) {
  var article = req.params.id;

  db.Article.findOne({_id: article})
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    });
});

app.post("/articles/:id", function(req, res) {
  
  var article = req.params.id;

  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.update({_id: article}, {$push: {note: dbNote._id}}, {new: true});
    })
    .then(function(article) {
      res.json(article);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
