module.exports = {
    title: "News",
    description: "For view",
    type: "object",
    properties: {
        _id: {type: 'string'},
        title: {type: 'string'},
        date: {type: 'number'},
        image: {type: 'string'},
        link: {type: 'string'},
        resource: {type: 'string'},
        tags: {type: 'array'},
    },
    additionalProperties: false
};