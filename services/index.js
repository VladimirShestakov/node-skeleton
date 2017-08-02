const Db = require('./db/Db.js');
const nodemailer = require('nodemailer');
const Users = require('./users/Users');
const News = require('./news/News');
const Validator = require('./validator/Validator.js');

class Services {

    async init(config){
        this.config = config;
    }

    async getDb(){
        return this.db ? this.db : (this.db = await new Db().init(this.config.db, this));
    }

    async getValidator() {
        return this.validator ? this.validator : (this.validator = await new Validator().init(this.config.validator, this));
    }

    async getUsers(){
        return this.users ? this.users : (this.users = await (new Users()).init(this.config.users, this));
    }

    async getNews(){
        return this.news ? this.news : (this.news = await (new News()).init(this.config.news, this));
    }

    async getMail(){
        return this.mail ? this.mail : (this.mail = nodemailer.createTransport(this.config.mail.transport, this.config.mail.defaults));
    }
}

module.exports = new Services();