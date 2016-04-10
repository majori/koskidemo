process.env.NODE_ENV = 'test';

var chai            = require('chai');
var chaiAsPromised  = require('chai-as-promised');
var Promise         = require('bluebird');

var client      = require('../client/client');
var database    = require('../client/database');
var logger      = require('../logger');

chai.use(chaiAsPromised);
var expect = chai.expect;
var should = chai.should();

describe('UDP', function() {
    it('can send UDP packet', function() {
        client.sendPacket(new Buffer('packet')).should.eventually.be.fulfilled;
    });
});

describe('Database', function() {
    before(function() {
       // Clean test database
    });

    it('can register new guild', function() {

    });
});
