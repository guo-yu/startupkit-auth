var server = require('express-scaffold'),
    configs = require('./configs.json'),
    models = require('./models'),
    routes = require('./routes');

new server(configs)
    .models(models)
    .ctrlers(ctrlers)
    .routes(routes)
    .run();