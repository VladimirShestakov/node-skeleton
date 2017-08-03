module.exports = {
    server: {
        host: 'localhost',
        port: 8010
    },
    db: {
        url: 'mongodb://localhost:27017/project-db'
    },
    mail: {
        transport: {
            host: 'smtp.yandex.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: '',
                pass: ''
            }
        },
        defaults: {
            from: 'ShestakovVladimir <boolive@yandex.ru>',
            replyTo: "boolive@yandex.ru"
        }
    },
    validator: {},
    users: {}
};
