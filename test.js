let chai = require('chai');
let chaiHTTP = require('chai-http');
var should = chai.should();

const app = require('./index');
chai.use(chaiHTTP);

describe('Test health', () => {
    it('health should be 200 OK', (done) => {
        chai.request(app)
            .get('/gethealthz')
            .end((err, res) => {
                (res).should.have.status(200);
                done();
            });
    });
});