module.exports = {
    title: "News",
    description: "For update",
    type: "object",
    properties: {
        title: {type: 'string', maxLength: 100},
        image: {type: 'string', maxLength: 1000},
        link: {type: 'string', maxLength: 1000},
        resource: {type: 'string', maxLength: 50},
        tags: {type: 'array'},
    },
    additionalProperties: false
};