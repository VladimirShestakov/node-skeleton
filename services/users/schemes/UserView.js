/**
 * User
 * @author Vladimir Shestakov <boolive@yandex.ru>
 * @version 1.0
 * @created 07.12.2016
 */
module.exports = {
    title: "UserView",
    description: "",
    type: "object",
    properties: {
        _id: {type: 'string'},
        createDate: {type: 'integer'},
        visitDate: {type: 'integer'},
        nickname: {type: 'string', default: ''},
        name: {type: 'string', default: ''},
        email: {type: 'string', default: ''},
        phone: {type: 'string', default: ''},
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
