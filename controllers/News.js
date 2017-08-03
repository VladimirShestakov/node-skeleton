module.exports = async (router, s) => {

    const news = await s.getNews();

    router.get('/api/news', async (req, res) => {
        try {
            const {time_from, from, count, filter_type, filter} = req.query;
            const result = await news.getList({filter_type, filter, from: from || time_from}, count);
            res.json(result);
        } catch (e) {
            res.status(400).json({message: e.message});
        }
    });

    router.get('/api/news/:id', async (req, res, next) => {
        let result = await news.getOne({_id: req.params.id});
        if (result) {
            res.json(result);
        } else {
            res.sendStatus(404);
        }
    });

    router.put('/api/news/:id', async (req, res, next) => {
        // if (await services.users.isAdmin(req.user._id)) {
        //     let result = await services.news.editNews(
        //         req.params.id,
        //         req.body,
        //         req.user._id
        //     );
        //     res.json(result);
        // } else {
        //     res.status(403).json({error: {message: 'You have not permissions to that action.'}});
        // }
    });
};