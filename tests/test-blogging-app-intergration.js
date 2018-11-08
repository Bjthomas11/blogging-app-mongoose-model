"use strict";

const chai = require("chai");
const chaiHttp = require("chai-http");
const faker = require("faker");
const mongoose = require("mongoose");

const should = chai.should;

const {BlogPost} = require("../models");
const {runServer, app, closeServer} = require("../server");
const {TEST_DATABASE_URL} = require("..config");

chai.use(chaiHttp);

// Function deletes the database, call in within the afterEach block to make data from a test does not stay around for the next one
function tearDownDb(){
    return new Promise((resolve,reject) => {
        console.warn("Deleting a database");
        mongoose.connection.dropDatabase()
            .then(results => resolve(results))
            .catch(err => reject(err));
    });
}

// put random docs in database, use faker library to generate random placeholder values for author title and content, then insert into mongo
function seedBlogPostData(){
    console.log("seeding blog post data");
    const seedData = [];
    for (let i = 1; i <= 10;
        i++){
            seedData.push({
                author: {
                    firstName: faker.name.firstName(),
                    lastName: faker.name.lastName()
                },
                title: faker.lorem.sentence(),
                content: faker.lorem.text()
            });
        }
        // returns a promise
        return BlogPost.insertMany(seedData);
}

describe("blog posts API", function(){
    before(function(){
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function(){
        return seedBlogPostData();
    });

    afterEach(function(){
        return tearDownDb();
    });

    after(function(){
        return closeServer();
    });

describe("GET endpoint", function(){
        it("should return all posts", function(){
            let res;
            return chai.request(app)
                .get("/posts")
                .then(_res => {
                    res = _res;
                    res.should.have.status(200);
                    res.body.should.have.lengthOf.at.least(1);

                    return BlogPost.count();
                })
                .then(count => {
                    res.body.should.have.lengthOf(count);
                });
        });

        it("should return posts with correct fields", function(){
            let resPosts;
            return chai.request(app)
            .get("/posts")
            .then(function(res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a("array");
                res.body.should.have.lengthOf.at.least(1);

                res.body.forEach(function(post){
                    post.should.be.a("object");
                    post.should.include.keys("id", "title", "content", "author", "created");
                });
                resPosts = res.body[0];
                return BlogPost.findById(resPosts.id);
            })
            .then(post => {
                resPosts.title.should.equal(post.title);
                resPosts.content.should.equal(post.content);
                resPosts.author.should.equal(post.author);
            });
        });
    });

    describe("POST endpoint", function(){
        it("should add blog post", function(){
            const newPost = {
                title: faker.lorem.sentence(),
                author: {
                    firstName: faker.name.firstName(),
                    lastName: faker.name.lastName(),
                },
                content: faker.lorem.text()
            }
            return chai.request(app)
                .post("/post")
                .send(newPosts)
                .then(function(res){
                    res.should.have.status(201);
                    res.should.be.json;
                    res.body.should.be.a("object");
                    res.body.should.include.keys("id", "title","content", "author", "created");
                    res.body.title.should.equal(neePost.title);
                    res.body.id.should.not.be.null;
                    res.body.author.should.equal(`${newPost.author.firstName} ${newPost.author.lastName}`);
                    res.body.content.should.equal(newPost.content);
                    return BlogPost.findById(res.body.id);
                })
                .then(function(post){
                    post.title.should.equal(newPost.title);
                    post.content.should.equal(newPost.content);
                    post.author.firstName.should.equal(newPost.author.firstName);
                    post.author.lastName.should.equal(newPost.author.lastName);
                });
        });
    });

    describe("PUT endpoint", function(){
        it("should update certain fields its sent over", function(){
            const updatedData = {
                title: "some updated info",
                content: "some more updated content",
                author: {
                    firstName: "Brian",
                    lastName: "Thomas"
                }
            }
            return BlogPost
                .findOne()
                .then(post => {
                    updatedData.id = post.id;
                    return chai.request(app)
                        .put(`/post/${post.id}`)
                        .send(updatedData);
                })
                .then(res => {
                    res.should.have.status(204);
                    return BlogPost.findById(updatedData.id);
                })
                .then(post => {
                    post.title.should.equal(updatedData.title);
                    post.content.should.equal(updatedData.content);
                    post.author.firstName.should.equal(updatedData.author.firstName);
                    post.author.lastName.should.equal(updatedData.author.lastName);
                });
        });
    });

    describe("DELETE endpoint", function(){
        it("should delete blog post from id", function(){
            let post;
            return BlogPost
                .findOne()
                .then(_post => {
                    post = _post;
                    return chai.request(app).delete(`/posts/${post.id}`);
                })
                .then(res => {
                    res.should.have.status(204);
                    return BlogPost.findById(post.id);
                })
                .then(_post => {
                    should.not.exist(_post);
                });
        });
    });
});
