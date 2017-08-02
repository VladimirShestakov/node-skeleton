/**
 * User
 * @author Vladimir Shestakov <boolive@yandex.ru>
 * @version 1.0
 * @created 07.12.2016
 */
module.exports = {
    title: "User",
    description: "",
    type: "object",
    properties: {
        _id: {type: 'string'},
        createDate: {type: 'integer'},
        nickname: {type: 'string', maxLength: 20, default: ''},
        name: {type: 'string', maxLength: 20, default: ''},
        email: {"oneOf": [{type: 'string', format: 'email', maxLength: 100}, {constant: ''}], default: ''},
        phone: {"oneOf": [{type: 'string', pattern: '^\\+[0-9]{10,20}$'}, {constant: ''}], default: ''},
        avatar: {type: 'string', default: ''},
        rating: {type: 'number', default: 0},
        statusText: {type: 'string', default: ''},
        city: {type: 'string', default: ''},
        lang: {type: 'string', default: 'RU'},
        fb_id: {type: 'string'},
        gl_id: {type: 'string'}
    },
    additionalProperties: false
};
