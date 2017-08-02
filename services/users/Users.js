const ObjectID = require('mongodb').ObjectID;
const request = require('request');
const bluebird = require('bluebird');
const crypto = require('crypto');
bluebird.promisifyAll(crypto);
const escapeRegexp = require('escape-string-regexp');
const ADMIN_PASSWORD = "admin12345";

class Users {

    constructor(config, services) {
        this.config = config;
        this.services = services;
        this.dbUsers = null;
    }

    async init() {
        const db = await this.services.getDb();
        this.validator = await this.services.getValidator();

        this.dbUsers = await db.initCollection('users', {
            // phone: [{"phone": 1}, {"unique": true}],
            // email: [{"email": 1}, {"unique": true}]
        });
        this.dbChats = await db.initCollection('chats',{});
        this.validator.addSchema(require('./schemes/UserView'), 'UserView');
        this.validator.addSchema(require('./schemes/User'), 'User');
        this.validator.addSchema(require('./schemes/UserRegistration'), 'UserRegistration');
        this.validator.addSchema(require('./schemes/UserProfileEdit'), 'UserProfileEdit');
        this.validator.addSchema(require('./schemes/DeviceEdit'), 'DeviceEdit');

        this.notifications = await this.services.getNotifications();
        this.quotes = await this.services.getQuotes();
        return this;
    }

    async getOne(cond = {}, currentUser = {}){
        if (cond._id) cond._id = ObjectID(cond._id);
        let user = await this.dbUsers.findOne(cond);
        if (user) {
            if (user.favourites) {
                user.favourite = user.favourites.some(function (id) {
                    return id.equals(currentUser._id);
                });
            } else {
                user.favourite = false;
            }
            return this.exportUserPublic(user);
        }
        return null;
    }

    async getList(cond = {}, offset, count, currentUser = {}){
        // По  имени и нику
        if (cond.search) {
            const regex = new RegExp(escapeRegexp(cond.search), 'i');
            cond['$or'] = [{name: regex}, {nickname: regex}, {email: regex}];
        }
        delete cond.search;


        let users = await this.dbUsers.find(cond).sort({nickname:1, name:1}).skip(parseInt(offset)||0).limit(parseInt(count)||100).toArray();
        return users.map(user => {
            return this.exportUserPublic(user);
        });
    }

    async requestFacebook(access_token){
        return await new Promise(function (resolve, reject) {
            request.get('https://graph.facebook.com/v2.8/me', {
                qs: {
                    access_token,
                    fields: 'id,name,email,picture.width(300).height(300)'
                }
            }, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    const response = JSON.parse(res.body);
                    if (response.error) {
                        reject(response.error);
                    } else {
                        resolve(response);
                    }
                }
            });
        });
    }

    async requestGoogle(access_token){
        return new Promise(function (resolve, reject) {
            request.get('https://www.googleapis.com/oauth2/v1/userinfo', {
                qs: {
                    access_token
                }
            }, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    const response = JSON.parse(res.body);
                    if (response.error) {
                        reject(response.error);
                    } else {
                        resolve(response);
                    }
                }
            });
        });
    }

    async oauthLink(user, access_token, network) {
        let updateValues = {};
        let oUser = null;
        if (network === 'facebook'){
            oUser = await this.requestFacebook(access_token);

            updateValues.fb_id = `${oUser.id}`;
            if (!user.name && oUser.name) updateValues.name = oUser.name;
            if (!user.avatar && oUser.picture && oUser.picture.data) updateValues.avatar = oUser.picture.data.url;
            if (!user.currency && oUser.currency) updateValues.currency = oUser.currency.user_currency;

            // Отвязка от других пользователей
            await this.dbUsers.updateOne({fb_id: updateValues.fb_id}, {$set: {fb_id:""}});
        } else
        if (network === 'google'){
            oUser = await this.requestGoogle(access_token);

            updateValues.gl_id = `${oUser.id}`;
            if (!user.name && oUser.name) updateValues.name = oUser.name;
            if (!user.avatar && oUser.picture) updateValues.avatar = oUser.picture;
            if (!user.lang && oUser.locale) updateValues.lang = oUser.locale;

            // Отвязка от других пользователей
            await this.dbUsers.updateOne({gl_id: updateValues.gl_id}, {$set: {gl_id:""}});
        } else {
            throw new Error("Unsupported network");
        }
        // @todo привязка мыла, если оно никем ещё не используется

        await this.dbUsers.updateOne({_id: user._id}, {$set: updateValues});
        return this.exportUser(Object.assign(user, updateValues));
    }

    async oauthUnlink(user, network) {
        let updateValues = {};
        if (network === 'facebook') {
            updateValues.fb_id = '';
        } else
        if (network === 'google'){
            updateValues.gl_id = '';
        } else {
            throw new Error("Unsupported network");
        }
        await this.dbUsers.updateOne({_id: user._id}, {$set: updateValues});
        return this.exportUser(Object.assign(user, updateValues));
    }

    async loginOauth(access_token, network) {
        let user = null;
        let updateValues = {};
        let oUser = null;
        const token = await this.generateToken();

        if (network === 'facebook'){
            oUser = await this.requestFacebook(access_token);
            user = await this.dbUsers.findOne({fb_id: `${oUser.id}`});
            // if (!user){
            //     user = await this.dbUsers.findOne({email: oUser.email.toLowerCase()});
            // }
            if (user) {
                // Привязка
                updateValues.fb_id = `${oUser.id}`;
                if (!user.name && oUser.name) updateValues.name = oUser.name;
                if (!user.avatar && oUser.picture && oUser.picture.data) updateValues.avatar = oUser.picture.data.url;
                if (!user.currency && oUser.currency) updateValues.currency = oUser.currency.user_currency;
                await this.dbUsers.updateOne({_id: user._id}, {$set: updateValues, $push: {tokens: token}});
                return {
                    user: this.exportUser(Object.assign(user, updateValues)),
                    token
                };
            } else {
                // Регистрация
                user = {fb_id: `${oUser.id}`};
                //if (oUser.email) user.email = oUser.email.toLowerCase();
                if (oUser.name) user.name = oUser.name;
                if (oUser.picture && oUser.picture.data) user.avatar = oUser.picture.data.url;
                if (oUser.currency) user.currency = oUser.currency.user_currency;
                user.tokens = [token];
                if (this.validator.validate('User', user)) {
                    await this.dbUsers.insertOne(user);

                    // Общие чаты
                    await this.dbChats.joinPublicChat(user);

                    // Котировки по умолчанию
                    let quotes = await this.quotes.getDefaultList();
                    await Promise.all(quotes.map(async (quote) => {
                        await this.quotes.addQuoteFavourite(quote._id, user._id)
                    }));

                    return {
                        user: this.exportUser(user),
                        token
                    };
                } else {
                    throw this.validator.customErrors();
                }
            }
        } else
        if (network === 'google'){
            oUser = await this.requestGoogle(access_token);
            user = await this.dbUsers.findOne({gl_id: `${oUser.id}`});
            if (!user){
                user = await this.dbUsers.findOne({email: oUser.email.toLowerCase()});
            }
            if (user) {
                // Привязка
                updateValues.gl_id = `${oUser.id}`;
                if (!user.name && oUser.name) updateValues.name = oUser.name;
                if (!user.avatar && oUser.picture) updateValues.avatar = oUser.picture;
                if (!user.lang && oUser.locale) updateValues.lang = oUser.locale;
                await this.dbUsers.updateOne({_id: user._id}, {$set: updateValues, $push: {tokens: token}});
                return {
                    user: this.exportUser(Object.assign(user, updateValues)),
                    token
                };
            } else {
                // Регистрация
                user = {gl_id: `${oUser.id}`};
                if (oUser.email) user.email = oUser.email.toLowerCase();
                if (oUser.name) user.name = oUser.name;
                if (oUser.picture) user.avatar = oUser.picture;
                if (oUser.locale) updateValues.lang = oUser.locale;
                user.tokens = [token];
                if (this.validator.validate('User', user)) {
                    await this.dbUsers.insertOne(user);
                    return {
                        user: this.exportUser(user),
                        token
                    };
                }else{
                    throw this.validator.customErrors();
                }
            }
        } else {
            throw new Error("Unsupported network");
        }
    }

    async addDevice(user, device) {
        if (this.validator.validate('DeviceEdit', device)) {
            // Удаление устройства от других уккаунтов
            await this.dbUsers.updateMany({_id: {$ne: user._id}}, {$unset: {[`devices.${device.uuid}`]: ""}});
            // Добавление/обновление устройства
            await this.dbUsers.updateOne({_id: user._id}, {$set: {[`devices.${device.uuid}`]: device}});
        } else {
            throw this.validator.customErrors();
        }
    }

    exportUser(user) {
        this.validator.validate('UserView', user);
        return user;
    }

    exportUserPublic(user) {
        if (!user.phoneShow) user.phone = '';
        if (!user.emailShow) user.email = '';
        if (!user.cityShow) user.cityShow = '';
        this.validator.validate('UserView', user);
        return user;
    }

    async generateToken() {
        return (await crypto.randomBytes(32)).toString('hex');
    }
}

module.exports = Users;