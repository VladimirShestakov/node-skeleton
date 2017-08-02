const type = 'Must be a string';
const maxLength = 'Maximum length is 20';

module.exports = {
    title: "User",
    description: "",
    type: "object",
    properties: {
        nickname: {type: 'string', maxLength: 20, errors: {type, maxLength}},
        name: {type: 'string', maxLength: 20, errors: {type, maxLength}},
        avatar: {type: 'string', errors: {type}},
        lang: {type: 'string', errors: {type, maxLength}},
        city: {type: 'string', maxLength: 20, errors: {maxLength, type}},
        statusText: {type: 'string', maxLength: 100, errors: {type, maxLength}},
    },
    additionalProperties: false
};
