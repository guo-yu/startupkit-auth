var url = require('url'),
    sys = require('./package.json');

var joinUrl = function(refer, token) {
    if (refer.indexOf('http') !== 0) return '/404';
    var parsed = url.parse(refer);
    return [parsed.href, parsed.query ? '&' : '?', 'token=', token].join();
};

module.exports = function(app, sessionStore, ctrlers) {

    app.locals.sys = sys;

    // home
    app.get('/', function(req, res, next) {
        var ret = {};
        ret.callback = req.query.callback ? req.query.callback : 'none';
        if (!req.session.user) return res.render('signin', ret);
        var referer = req.query.callback ? req.query.callback : req.headers.referer;
        if (!referer) return next(new Error('callback url required!'));
        res.redirect(joinUrl(referer, req.session.id));
    });

    // signup
    app.post('/signup', function(req, res, next){
        if (req.session.user) return next(new Error('already signined'));
        if (!req.body.username || !req.body.password) return next(new Error('username or password missing'));
        var baby = req.body;
        baby.password = md5(baby.password);
        ctrlers.user.create(baby, function(err, user){
            if (err) return next(err);
            return res.json(user);
        });
    });

    // signin
    app.post('/signin', function(req, res, next) {
        if (req.session.user) return next(new Error('already signined'));
        if (!req.body.username || !req.body.password) return next(new Error('username or password missing'));
        var callback = req.query.callback;
        ctrlers.user.findOne({
            name: req.body.username
        }, function(err, user){
            if (err) return next(err);
            if (user.password !== md5(req.body.password)) return next(new Error('password not match'));
            req.session.user = result.user;
            if (callback && callback != 'none') return res.redirect(joinUrl(callback, req.session.id));
            return next(new Error('callback url required!'));
        });
    });

    // signout
    app.get('/signout', function(req, res, next) {
        if (req.session.user) delete req.session.user;
        return res.redirect('back');
    });

    // access token
    app.get('/token/:token', function(req, res, next) {
        if (!req.params.token) return next(new Error('token requied'));
        if (!sessionStore) return next(new Error('sessionStore not found ! please contact admin.'));
        sessionStore.get(req.params.token, function(err, result) {
            if (err) return next(err);
            if (!(result && result.user)) return next(new Error('token not found.'));
            return res.json({
                stat: 'ok',
                user: result.user,
                token: result.token
            });
        });
    });

}