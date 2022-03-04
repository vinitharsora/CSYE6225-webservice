import express from 'express';
import supertest from 'supertest';
import routes from '../routes.js';

const app = express();
app.use('/', routes);

describe('GET /healthz', function () {
    it('should return 200 Status', (done) => {
        supertest(app)
            .get('/healthz')
            .expect(200).end((err, res) => {
                done(err || undefined);
            });
    });

    it('should not return 200 Status', (done) => {
        supertest(app)
            .get('/healthzA')
            .expect(404).end((err, res) => {
                done(err || undefined);
            });
    });
});