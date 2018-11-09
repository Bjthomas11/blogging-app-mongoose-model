'use strict';


// config values for mongo database url
exports.DATABASE_URL = process.env.MONGODB_URI || "mongodb://localhost/blogging-app";

// config values for test intergration database url
exports.TEST_DATABASE_URL = process.env.MONGODB_URI || "mongodb://localhost/test-blogging-app";

// config values for port 
exports.PORT = process.env.PORT || 8080;