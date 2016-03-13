process.env.NODE_ENV = 'test';

var chai            = require('chai');
var chaiAsPromised  = require('chai-as-promised');
var Promise         = require('bluebird');
var sinon           = require('sinon')

var client = require('../client/client');
var server = require('../server/server');
var logger = require('../config').logger

chai.use(chaiAsPromised);
var expect = chai.expect;
var should = chai.should();

describe('Client side', function() {
    it('can send UDP packet', function() {
        client.sendPacket(new Buffer('packet')).should.eventually.be.fulfilled;
    });
});

describe('Server side', function() {
    it('can receive UDP packet', function() {

    });
});
