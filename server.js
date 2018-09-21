var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var app = express();

var db = require("./models");
var PORT = process.env.PORT || 3000;

require("dotenv").config();

//var exphbs = require("express-handlebars");
// app.engine("handlebars", exphbs({defaultLayout: "main"}));
// app.set("view engine", "handlebars");

app.use(logger("dev"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// app.get("/", function(req, res) {
//     res.render("index", {db: Article});
// });

app.get("/scrape", function(req, res) {
    axios.get("http://blogs.discovermagazine.com/").then(function(response) {
        var $ = cheerio.load(response.data);

        $("div.entry.clearfix").each(function(i, element) {
            var result = {};

            result.title = $(this).children("h2").children("a").text();
            result.link = $(this).children("h2").children("a").attr("href");
            result.authorDate = $(this).children("div.meta").children("span").text();
            result.summary = $(this).children("p").text();
            result.image = $(this).children("div.post-thumb").children("img").attr("src");

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
    })
    .catch(function(err) {
        res.json(err);
    });
});

app.post("/articles/:id", function(req, res) {
  
  var article = req.params.id;

  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.update({_id: article}, {$push: {note: dbNote._id}}, {new: true});
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.delete("/articles/", function(req, res) {
    var articles = req.body.data;

    db.Article.deleteMany({})
        .then(function(articles) {
            res.send(articles);
        })
        .catch(function(err) {
            res.json(err);
        });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
