"use strict";

const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const {DATABASE_URL, PORT} = require("./config");
const blogPosts = require("./models");

const app = express();

app.use(morgan("common"));
app.use(express.json());

app.get('/posts', (req, res) => {
    blogPosts
      .find()
      .then(posts => {
        res.json(posts.map(post => post.serialize()));
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'something went terribly wrong' });
      });
  });

app.get('/posts/:id', (req, res) => {
    blogPosts
      .findById(req.params.id)
      .then(post => res.json(post.serialize()))
      .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'something went wrong' });
      });
  });

app.post("/posts", (req,res) => {
    const reqFields = ["title", "content", "author"];
    for(let i = 0; i <reqFields.length; i++) {
        const field = reqFields[i];
        if(!(field in req.body)) {
            const msg = `no ${field} in request body`;
            console.error(msg);
            return res.status(400).send(msg);
        }
    }

    blogPosts
        .create({
            title: req.body.title,
            content: req.body.content,
            author: req.body.author
        })
        .then(blogPostsThen => res.status(201).json(blogPostsThen.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json(
                {
                    error: "Something is wrong"
                }
            )
        });
});

app.delete("/posts/:id", (req,res) => {
    blogPosts
        .findByIdAndRemove(req.params.id)
        .then(() => {
            res.status(204).json({msg:"Everything was successful"});
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({error: "Something went wrong"});
        });
}); 

app.put("/posts/:id", (req,res) => {
    if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
       res.status(400).json(
           {
               error: "Request Path id and request body id values must match"
           }
       );
    }
    const updated = {};
    const updateFields = ["title", "content", "author"];
    updateFields.forEach(field => {
        if(field in req.body){
            updated[field]=req.body[field];
        }
    });
    blogPosts
        .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
        .then(updatedPost => res.status(204).end())
        .catch(err => res.status(500).json({ msg: 'Something went wrong' }));
});

app.delete('/:id', (req, res) => {
    blogPosts
        .findByIdAndRemove(req.params.id)
        .then(() => {
            console.log(`Deleted blog post with id ${req.params.id}`);
            res.status(204).end();
      });
  });

let server;

function runServer(DATABASE_URL, port = PORT) {
    return new Promise((resolve, reject) => {
      mongoose.connect(DATABASE_URL, err => {
        if (err) {
          return reject(err);
        }
        server = app.listen(port, () => {
          console.log(`Your app is listening on port ${port}`);
          resolve();
        })
          .on('error', err => {
            mongoose.disconnect();
            reject(err);
          });
      });
    });
  }

  function closeServer() {
    return mongoose.disconnect().then(() => {
      return new Promise((resolve, reject) => {
        console.log('Closing server');
        server.close(err => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    });
  }

  if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
  }

  module.exports = { runServer, app, closeServer};