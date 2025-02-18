const moduleAlias = require('module-alias');
const path = require('path');

moduleAlias.addAliases({
    '@Utils': path.join(__dirname, 'dist/utils'),
    '@Middleware': path.join(__dirname, 'dist/middleware'),
    '@Modules': path.join(__dirname, 'dist/modules'),
    '@Config': path.join(__dirname, 'dist/config'),
    '@Constant': path.join(__dirname, 'dist/constants'),
    '@Entity': path.join(__dirname, 'dist/entity'),
    '@Subscriber': path.join(__dirname, 'dist/subscriber'),
    '@Types': path.join(__dirname, 'dist/types'),
    '@Validator': path.join(__dirname, 'dist/validator'),
});

require('./dist/app.js');