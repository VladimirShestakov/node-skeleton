module.exports = async (router, services) => {

    const users = await services.getUsers();

    /**
     * Авторизация запроса по токену
     */
    router.use('/api', async (req, res, next) => {
        let token = req.get('X-Token');
        if (token) {
            req.user = await users.getOne({tokens: token});
            if (!req.user) {
                res.status(404).json({message: 'User not found by token.'});
            } else {
                req.token = token;
                next();
            }
        } else {
            res.status(403).json({message: 'X-Token header must be provided.'});
        }
    });

    /**
     * Вход по логину
     */
    router.post('/api/auth', async (req, res, next) => {
        res.status(400).json({message: 'login field can not be empty or undefined.'});
    });

    /**
     * Выход. Удаляется текущий токен из базы пользователя
     * С параметром all удаляются все токены (выход со всех устройств)
     */
    router.delete('/api/auth', async (req, res, next) => {
        res.status(200);
    });

    /**
     * Users
     */
    router.get('/api/users', async (req, res) => {
        try {
            const result = await users.getList({
                    search: req.query.search
                },
                req.query.offset,
                req.query.count,
                req.user
            );
            res.json(result);
        } catch (e) {
            res.status(500).json(e);
        }
    });

    router.get('/api/users/:id', async (req, res) => {
        const user = await users.getOne({_id: req.params.id}, req.user);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({message: 'User not found.'});
        }
    });


    /**
     * OAuth
     */
    router.post('/api/oauth', async (req, res) => {
        try {
            const {access_token, network} = req.body;
            const result = await users.loginOauth(access_token, network);
            res.json(result);
        } catch (error) {
            console.log(error);
            res.status(400).json({message: error.message});
        }
    });

    router.put('/api/oauth', async (req, res) => {
        try {
            const {access_token, network} = req.body;
            const result = await users.oauthLink(req.user, access_token, network);
            res.json(result);
        } catch (error) {
            res.status(400).json({message: error.message});
        }
    });

    router.delete('/api/oauth', async (req, res) => {
        try {
            const {network} = req.query;
            const result = await users.oauthUnlink(req.user, network);
            res.json(result);
        } catch (error) {
            res.status(400).json({message: error.message});
        }
    });

    /**
     * Устройства
     */
    router.post('/api/account/devices', async (req, res) => {
        try {
            await users.addDevice(req.user, req.body);
            res.json({message: 'success'});
        } catch (e) {
            res.status(500).json(e);
        }
    });
};