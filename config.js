var config = {};

config.mongoUri = process.env.MONGOLAB_URI ||
    	          process.env.MONGOHQ_URL ||
                   'mongodb://localhost/fritter';;

module.exports = config;
