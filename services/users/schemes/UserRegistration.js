module.exports = {
    title: "User registration form",
    description: "",
    type: "object",
    properties: {
        login: {type: 'string', format: 'email', maxLength: 100, default: 'a@a.ru'}
    },
    required: ['login'],
    additionalProperties: false
};