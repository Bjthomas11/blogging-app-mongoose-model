"use strict";

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const authorSchema = mongoose.Schema({
    firstName: "string",
    lastName: "string",
    userName: {
        type: "string",
        unique: true
    }
});

const commentSchema = mongoose.Schema({
    content: "string"
});

const bpSchema = mongoose.Schema({
    author: {
        firstName: String,
        lastName: String
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String
    },
    created: {
        type: Date,
        default: Date.now
    }
});

bpSchema.pre("find", function(next){
    this.populate("author");
    next();
});

bpSchema.pre("findOne", function(next){
    this.populate("author");
    next();
});

bpSchema.virtual("authorName").get(function(){
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

bpSchema.methods.serialize = function(){
    return {
        id: this._id,
        author: this.authorName,
        content: this.content,
        title: this.title,
        created: this.created
    }
}

const Author = mongoose.model("Author", authorSchema);
const BlogPost = mongoose.model("BlogPost",bpSchema);

module.exports = {Author, BlogPost};