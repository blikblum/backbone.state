var setup = require('./setup');
var config = require('../../package.json').to5BoilerplateOptions;

global.Promise = require('es6-promise').Promise;
global.Backbone = require('backbone');

global[config.exportVarName] = require('../../src/' + config.entryFileName);
global.chai = require('chai');
global.sinon = require('sinon');
global.chai.use(require('sinon-chai'));
setup();