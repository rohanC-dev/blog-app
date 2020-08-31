var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");
var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/blog_app", { useNewUrlParser: true, useUnifiedTopology: true });

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(expressSanitizer());


app.use(methodOverride("_method"));



var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {
        type: Date,
        default: Date.now
    }
});
var Blog = mongoose.model("Blog", blogSchema);

// ROOT ROUTE (MAIN PAGE/LANDING PAGE)
app.get("/", function(req, res){
    res.redirect("/blogs");
});

// SHOWS ALL BLOGS
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err);
        }else{
            res.render(("index"), {blogs: blogs});
        }
    });
});

// SHOWS FORM
app.get("/blogs/new", function(req, res){
    res.render("new");
});

// ADDS POST TO DATABASE
app.post("/blogs", function(req, res){
    Blog.create({title: req.sanitize(req.body.title), image: req.sanitize(req.body.image), body: req.sanitize(req.body.body)}, function(err){
        if(err){
            console.log("there was an error adding a post to database");
        }
    });
    res.redirect("/blogs");
});

// SHOWS MORE INFO ABOUT SPECIFC POST

app.get("/blogs/:id", function(req, res){
    Blog.findById(req.params.id, function(err, blog){
        if(err){
            console.log("there was a problem finding the post");
            res.redirect("/blogs")
        }else{
            res.render("show", {blog: blog});
        }
    });
});

// SHOWS FORM TO EDIT POST

app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, blog){
        if(err){
            console.log("there was a problem finding the post");
            res.redirect("/blogs")
        }else{
            res.render("edit", {blog: blog});
        }
    });
});

// UPDATES FORM
app.put("/blogs/:id", function(req, res){
    //console.log({title: req.body.title, image: req.body.image, body: req.body.body});
    //console.log(req.body.blog);
    Blog.findByIdAndUpdate(req.params.id, {title: req.sanitize(req.body.title), image: req.sanitize(req.body.image), body: req.sanitize(req.body.body)}, function(err, updatedBlog){
        if(err){
            //res.send("there was a problem error");
            console.log(err);
            res.send(err);
        }else{
            res.redirect("/blogs/" + req.params.id);
        }
    });
    
});

// DELETES FORM

app.delete("/blogs/:id", function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.send("could not delete");
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs");
        }
    });
});



app.listen(process.env.IP || 3000, process.env.IP, function () {
    console.log("server started");
});