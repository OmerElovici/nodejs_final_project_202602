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

describe('Cost Manager API - Comprehensive Tests', () => {
  
  describe('Users Service', () => {
    it('should add a new user successfully', async () => {
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
      expect(res.body.first_name).toEqual('mosh');
    });

    it('should fail to add a user with missing fields', async () => {
      const res = await request(usersApp)
        .post('/api/add')
        .send({
          id: 999999,
          first_name: 'incomplete'
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.id).toEqual('error');
    });

    it('should fail to add a user with a duplicate ID', async () => {
      const res = await request(usersApp)
        .post('/api/add')
        .send({
          id: 123123,
          first_name: 'duplicate',
          last_name: 'user',
          birthday: '1990-01-01'
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.id).toEqual('error');
    });

    it('should fail to add a user with invalid data types', async () => {
      const res = await request(usersApp)
        .post('/api/add')
        .send({
          id: 'not-a-number',
          first_name: 'invalid',
          last_name: 'user',
          birthday: '1990-01-01'
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.id).toEqual('error');
    });

    it('should get user details and calculate total costs', async () => {
      const res = await request(usersApp)
        .get('/api/users/123123');
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(123123);
      expect(res.body.total).toEqual(0);
    });

    it('should return 404 for a non-existent user', async () => {
      const res = await request(usersApp)
        .get('/api/users/999999');
      expect(res.statusCode).toEqual(404);
      expect(res.body.id).toEqual('error');
    });

    it('should list all users', async () => {
      const res = await request(usersApp)
        .get('/api/users');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('Costs Service', () => {
    it('should fail to add a cost for a non-existent user', async () => {
      const res = await request(costsApp)
        .post('/api/add')
        .send({
          description: 'ghost milk',
          category: 'food',
          userid: 999999,
          sum: 10
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.id).toEqual('error');
      expect(res.body.message).toEqual('User does not exist');
    });

    it('should fail to add a cost with missing fields', async () => {
      const res = await request(costsApp)
        .post('/api/add')
        .send({
          category: 'food',
          userid: 123123,
          sum: 8
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.id).toEqual('error');
    });

    it('should fail to add a cost with an invalid category', async () => {
      const res = await request(costsApp)
        .post('/api/add')
        .send({
          description: 'gas',
          category: 'car',
          userid: 123123,
          sum: 50
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.id).toEqual('error');
    });

    it('should fail to add a cost with a past date', async () => {
      const res = await request(costsApp)
        .post('/api/add')
        .send({
          description: 'old milk',
          category: 'food',
          userid: 123123,
          sum: 8,
          createdAt: '2000-01-01T00:00:00Z'
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.id).toEqual('error');
      expect(res.body.message).toEqual('Cannot add costs with dates in the past');
    });

    it('should add a cost item successfully', async () => {
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
      expect(res.body.sum).toEqual(8);
    });

    it('should add another cost item to test grouping', async () => {
      const res = await request(costsApp)
        .post('/api/add')
        .send({
          description: 'bread',
          category: 'food',
          userid: 123123,
          sum: 12
        });
      expect(res.statusCode).toEqual(200);
    });

    it('should reflect the new total in user details', async () => {
      const res = await request(usersApp)
        .get('/api/users/123123');
      expect(res.statusCode).toEqual(200);
      expect(res.body.total).toEqual(20);
    });

    it('should fail to get a report with missing parameters', async () => {
      const res = await request(costsApp)
        .get('/api/report?id=123123&month=1');
      expect(res.statusCode).toEqual(500);
      expect(res.body.id).toEqual('error');
    });

    it('should get a monthly report and group costs correctly', async () => {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      
      const res = await request(costsApp)
        .get(`/api/report?id=123123&year=${currentYear}&month=${currentMonth}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.userid).toEqual(123123);
      expect(res.body.year).toEqual(currentYear);
      expect(res.body.month).toEqual(currentMonth);
      
      const foodCategory = res.body.costs.find(c => c.food);
      expect(foodCategory).toBeDefined();
      expect(foodCategory.food.length).toEqual(2);
      
      const healthCategory = res.body.costs.find(c => c.health);
      expect(healthCategory).toBeDefined();
      expect(healthCategory.health.length).toEqual(0);
    });

    it('should list all costs', async () => {
      const res = await request(costsApp)
        .get('/api/costs');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toEqual(2);
    });

    it('should list all reports', async () => {
      const res = await request(costsApp)
        .get('/api/reports');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });

  describe('Logs Service', () => {
    it('should get all logs', async () => {
      const res = await request(logsApp)
        .get('/api/logs');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });

  describe('About Service', () => {
    it('should get team details', async () => {
      const res = await request(aboutApp)
        .get('/api/about');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body[0].first_name).toEqual('Omer');
      expect(res.body[0].last_name).toEqual('Elovici');
      expect(res.body[1].first_name).toEqual('David');
      expect(res.body[1].last_name).toEqual('Yakhin');
    });
  });
});
