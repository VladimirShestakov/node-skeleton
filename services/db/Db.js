const MongoClient = require('mongodb').MongoClient;
const Db = require('mongodb').Db;
const ObjectID = require('mongodb').ObjectID;
/**
 * Создание коллекции с индексами
 * Если коллекции нет, то создаётся
 * Если указанного индекса нет, то создаётся
 * Не указанные индексы не удаляются из коллекции!
 * Обновление индекса не выполняется!
 * @param name
 * @param indexes
 * @param options
 * @returns {Promise}
 */
Db.prototype.initCollection = async function(name, indexes={}, options = {}){
    const collection = await (new Promise((resolve, reject) => {
        options.strict = true;
        this.collection(name, options, (err, coll) => {
            if (err !== null){
                this.createCollection(name, {}, (err, coll) => {
                    if (err === null){
                        console.log(`Created new collection "${name}"`);
                        resolve(coll);
                    }else{
                        reject(err);
                    }
                });
            }else {
                resolve(coll);
            }
        });
    }));
    const indexKeys = Object.keys(indexes);
    for (let key of indexKeys){
        if (!indexes[key][1]){
            indexes[key].push({});
        }
        if (!indexes[key][1].name){
            indexes[key][1].name = key;
        }
        if (!await collection.indexExists(indexes[key][1].name)) {
            collection.createIndex(indexes[key][0], indexes[key][1]);
        }
    }
    return collection;
};

Db.prototype.ObjectID = ObjectID;

class Database {

    constructor(){

    }

    async init(config, services){
        this.config = config;
        //this.services = services;
        return await MongoClient.connect(this.config.url);
    }

}

module.exports = Database;