process.env.NODE_ENV = 'test';

var chai            = require('chai');
var chaiAsPromised  = require('chai-as-promised');
var Promise         = require('bluebird');

var server = require('../server/server');
var logger = require('../logger');

chai.use(chaiAsPromised);
var expect = chai.expect;
var should = chai.should();

describe('UDP', function() {
    it('can receive UDP packet', function() {

    });
});
