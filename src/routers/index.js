const user = require('./User');

function route(app){
    app.use('/user', user);
}

module.exports = route;