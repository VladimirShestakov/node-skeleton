module.exports = {
    title: "User device",
    description: "For update",
    type: "object",
    properties: {
        token: {type: "string"},
        uuid: {type: "string"},
        type: {enum: ["ios", "android"]},
        name: {type: "string"}
    },
    required: ['token', 'uuid', 'type', 'name'],
    additionalProperties: false
};