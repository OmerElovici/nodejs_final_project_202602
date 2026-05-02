const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const logsApp = require('../logs-service');
const usersApp = require('../users-service');
const costsApp = require('../costs-service');
const aboutApp = require('../about-service');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Cost Manager API', () => {
  it('should add a user', async () => {
    const res = await request(usersApp)
      .post('/api/add')
      .send({
        id: 123123,
        first_name: 'mosh',
        last_name: 'israeli',
        birthday: '1990-01-01'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(123123);
  });

  it('should add a cost item', async () => {
    const res = await request(costsApp)
      .post('/api/add')
      .send({
        description: 'milk',
        category: 'food',
        userid: 123123,
        sum: 8
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.description).toEqual('milk');
  });

  it('should get a monthly report', async () => {
    const res = await request(costsApp)
      .get('/api/report?id=123123&year=2026&month=1');
    expect(res.statusCode).toEqual(200);
    expect(res.body.userid).toEqual(123123);
    expect(res.body.costs).toBeDefined();
  });

  it('should get user details', async () => {
    const res = await request(usersApp)
      .get('/api/users/123123');
    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(123123);
    expect(res.body.total).toEqual(8);
  });

  it('should get about details', async () => {
    const res = await request(aboutApp)
      .get('/api/about');
    expect(res.statusCode).toEqual(200);
    expect(res.body[0].first_name).toEqual('mosh');
  });
});
