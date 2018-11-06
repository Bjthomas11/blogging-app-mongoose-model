"use strict";

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

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

const blogPost = mongoose.model("blogPost",bpSchema);

module.exports = blogPost;