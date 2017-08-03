const ObjectID = require('mongodb').ObjectID;
const moment = require('moment');

class News {

    async init(config, services) {
        this.config = config;
        this.services = services;

        const db = await this.services.getDb();
        // Коллекция нововстей
        this.dbNews = await db.initCollection('news', {
            key: [{"key": 1}, {"unique": true}],
            tags: [{"tags": 1}, {}],
            date: [{"date": -1}, {}]
        });
        this.validator = await this.services.getValidator();
        this.validator.addSchema(require('./schemes/NewsView'), 'NewsView');
        this.validator.addSchema(require('./schemes/NewsEdit'), 'NewsEdit');
        return this;
    }

    async getOne(cond = {}) {
        if (cond._id) cond._id = ObjectID(cond._id);
        let news = await this.dbNews.findOne(cond);
        if (news) {
            this.validator.validate('NewsView', news);
            return news;
        }
        return null;
    }

    /**
     *
     * @param cond {from, count, filter_type, filter}
     * @param count
     * @returns {Promise.<void>}
     */
    async getList(cond = {}, count) {
        let filter = {};
        if (cond.search) {
            const regex = new RegExp(escapeRegexp(cond.search), 'i');
            filter['$or'] = [{title: regex}, {text: regex}];
        }

        let news = await this.dbNews.find(filter).sort({date: -1}).limit(parseInt(count) || 100).toArray();
        return news.map(item => {
            this.validator.validate('NewsView', item);
            return item;
        });
    }
}

module.exports = News;