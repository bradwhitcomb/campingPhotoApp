var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");
var PORT = process.env.PORT || 8080;

app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

// mongoose.connect('mongodb://localhost/appalachian_trail_blog');
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost.appalachian_trail_blog"
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {useMongoClient:true});

var appTrailSchema = new mongoose.Schema ({
    title: String,
    image:String,
    comment:String,
    created: {type:Date, default: Date.now}
});


var TrailStory = mongoose.model("TrailStory", appTrailSchema);
// TrailStory.create({
//     title:"Follow the trail",
//     image: "https://images.unsplash.com/uploads/1412533519888a485b488/bb9f9777?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=e4fb967339f62a08d4e60ced03bfdcd0&auto=format&fit=crop&w=800&q=60",
//     comment:"There are lots of way to walk this path!"
// });

app.get("/", function(req, res){
    res.redirect("/trailStories");
});

app.get("/trailStories", function (req, res){
    TrailStory.find({}).sort({'created':-1}).exec (function(err, data){
        if(err){
            console.log("oops something went wrong")
        } else{
            res.render("index",{trailStories:data});
        }
    });
    
});

app.get("/trailStories/new", function(req, res){
    res.render("new");
});

app.post("/trailStories", function(req, res){
    req.body.story.comment = req.sanitize(req.body.story.comment)
    TrailStory.create(req.body.story, function(err, newTrailStory){
        
            if(err){
                res.render("new");
            } else {
                res.redirect("/trailStories");
            }
    });
    });

 //show page
 
 app.get("/trailStories/:id", function(req, res){
     
    TrailStory.findById(req.params.id, function(err, theRequestedStory){
        if(err){
            res.redirect("/trailStories");
        } else {
            res.render("show", {story:theRequestedStory});
        }
    });
 });

 app.get("/trailStories/:id/edit", function (req, res){
     TrailStory.findById(req.params.id, function(err, theRequestStory){
         if(err){
             res.redirect("/trailStories");
         } else {
             res.render("edit", {story:theRequestStory});
         }
     })
    
 });

 app.put("/trailStories/:id", function (req, res){
     req.body.story.comment = req.sanitize(req.body.story.comment)
     TrailStory.findByIdAndUpdate(req.params.id, req.body.story, function(err, upDatedStory){
        if(err){
            res.redirect("/trailStories");
        } else {
            res.redirect("/trailStories/"+ req.params.id);
        }
     });
 });

 app.delete("/trailStories/:id", function (req, res){
     TrailStory.findByIdAndRemove(req.params.id, function(err){
         if(err){
             res.redirect("/trailStories");
         } else {
            res.redirect("/trailStories");

         }
     });
 });

 
 

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });

// app.listen(8080, function(){
//     console.log('hiking magic on port 8080');
// })
