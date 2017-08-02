const Ajv = require('ajv');

class Validator extends Ajv{

    constructor(config, services) {
        config = Object.assign({}, config, {
            v5: true,
            removeAdditional: true,
            useDefaults: true,
            coerceTypes: true,

            messages: true,
            allErrors: true,
            verbose: true
        });
        super(config);
        this.config = config;
        this.services = services;
    }

    async init() {
        // this.addSchema(require('./schemes/Email'), 'Email');
        // this.addSchema(require('./schemes/Phone'), 'Phone');
        return this;
    }

    customErrors(){
        const getMessage = (key, schema, property)=>{
            if (schema && schema.errors){
                if (typeof schema.errors === 'string'){
                    return schema.errors.replace('{key}', property);
                } else {
                    if (schema.errors[key]){
                        return schema.errors[key].replace('{key}', property);
                    }
                }
            }
            return null;
        };
        let result = {};
        this.errors.map(({keyword, params, dataPath, schema, parentSchema, message}) => {
            let key = dataPath.split('.').pop();
            switch (keyword){
                case 'required':
                    key = params.missingProperty;
                    result[key] = getMessage(keyword, schema[key], key) || message;
                    break;
                default:
                    result[key] = getMessage(keyword, parentSchema, key) || message;
            }
        });
        return result;
    };
}

module.exports = Validator;