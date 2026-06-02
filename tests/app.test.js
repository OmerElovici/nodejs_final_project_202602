const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const logsApp = require('../logs_service');
const usersApp = require('../users_service');
const costsApp = require('../costs_service');
const aboutApp = require('../about_service');

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
          firstName: 'mosh',
          lastName: 'israeli',
          birthday: '1990-01-01'
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(123123);
      expect(res.body.firstName).toEqual('mosh');
    });

    it('should fail to add a user with missing fields', async () => {
      const res = await request(usersApp)
        .post('/api/add')
        .send({
          id: 999999,
          firstName: 'incomplete'
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.id).toEqual('error');
      expect(res.body.message).toEqual('lastName is required');
    });

    it('should fail to add a user with a duplicate ID', async () => {
      const res = await request(usersApp)
        .post('/api/add')
        .send({
          id: 123123,
          firstName: 'duplicate',
          lastName: 'user',
          birthday: '1990-01-01'
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.id).toEqual('error');
      expect(res.body.message).toEqual('User ID already exists');
    });

    it('should fail to add a user with invalid data types', async () => {
      const res = await request(usersApp)
        .post('/api/add')
        .send({
          id: 'not-a-number',
          firstName: 'invalid',
          lastName: 'user',
          birthday: '1990-01-01'
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.id).toEqual('error');
      expect(res.body.message).toEqual('id must be a number');
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

    it('should add a new user successfully with non-standard casing (UPPERCASE & kebab-case)', async () => {
      const res = await request(usersApp)
        .post('/api/add')
        .send({
          "ID": 987654,
          "first-name": "Test",
          "LAST_NAME": "User",
          "birth-day": "1995-05-15"
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(987654);
      expect(res.body.firstName).toEqual('Test');
      expect(res.body.lastName).toEqual('User');
    });
  });

  describe('Costs Service', () => {
    it('should fail to add a cost for a non-existent user', async () => {
      const res = await request(costsApp)
        .post('/api/add')
        .send({
          description: 'ghost milk',
          category: 'food',
          userId: 999999,
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
          userId: 123123,
          sum: 8
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.id).toEqual('error');
      expect(res.body.message).toEqual('description is required');
    });

    it('should fail to add a cost with an invalid category', async () => {
      const res = await request(costsApp)
        .post('/api/add')
        .send({
          description: 'gas',
          category: 'car',
          userId: 123123,
          sum: 50
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.id).toEqual('error');
      expect(res.body.message).toEqual('category must be one of: food, health, housing, sports, education');
    });

    it('should fail to add a cost with a past date', async () => {
      const res = await request(costsApp)
        .post('/api/add')
        .send({
          description: 'old milk',
          category: 'food',
          userId: 123123,
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
          userId: 123123,
          sum: 8
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.description).toEqual('milk');
      expect(res.body.sum).toEqual(8);
    });

    it('should add a cost item successfully with lowercase userid', async () => {
      const res = await request(costsApp)
        .post('/api/add')
        .send({
          description: 'milk 9',
          category: 'food',
          userid: 123123,
          sum: 8
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.description).toEqual('milk 9');
      expect(res.body.sum).toEqual(8);
      expect(res.body.userId).toEqual(123123);
    });

    it('should add another cost item to test grouping', async () => {
      const res = await request(costsApp)
        .post('/api/add')
        .send({
          description: 'bread',
          category: 'food',
          userId: 123123,
          sum: 12
        });
      expect(res.statusCode).toEqual(200);
    });

    it('should reflect the new total in user details', async () => {
      const res = await request(usersApp)
        .get('/api/users/123123');
      expect(res.statusCode).toEqual(200);
      expect(res.body.total).toEqual(28);
    });

    it('should fail to get a report with missing parameters', async () => {
      const res = await request(costsApp)
        .get('/api/report?id=123123&month=1');
      expect(res.statusCode).toEqual(400);
      expect(res.body.id).toEqual('error');
    });

    it('should get a monthly report and group costs correctly', async () => {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      
      const res = await request(costsApp)
        .get(`/api/report?id=123123&year=${currentYear}&month=${currentMonth}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.userId).toEqual(123123);
      expect(res.body.year).toEqual(currentYear);
      expect(res.body.month).toEqual(currentMonth);
      
      const foodCategory = res.body.costs.find(c => c.food);
      expect(foodCategory).toBeDefined();
      expect(foodCategory.food.length).toEqual(3);
      
      const healthCategory = res.body.costs.find(c => c.health);
      expect(healthCategory).toBeDefined();
      expect(healthCategory.health.length).toEqual(0);
    });

    it('should list all costs', async () => {
      const res = await request(costsApp)
        .get('/api/costs');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toEqual(3);
    });

    it('should list all reports', async () => {
      const res = await request(costsApp)
        .get('/api/reports');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });

    it('should add a cost item successfully with kebab-case keys (user-id, desc, amount)', async () => {
      const res = await request(costsApp)
        .post('/api/add')
        .send({
          "user-id": 123123,
          "desc": "kebab-case test",
          "category": "housing",
          "amount": 250
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.userId).toEqual(123123);
      expect(res.body.description).toEqual('kebab-case test');
      expect(res.body.sum).toEqual(250);
    });

    it('should add a cost item successfully with snake_case keys (user_id, created_at)', async () => {
      const res = await request(costsApp)
        .post('/api/add')
        .send({
          "user_id": 123123,
          "description": "snake_case test",
          "category": "sports",
          "sum": 45,
          "created_at": new Date().toISOString()
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.userId).toEqual(123123);
    });

    it('should reject a cost item with a non-numeric sum', async () => {
      const res = await request(costsApp)
        .post('/api/add')
        .send({
          userId: 123123,
          description: "text sum test",
          category: "food",
          sum: "ten dollars"
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('sum must be a number');
    });

    it('should reject a cost item with a negative sum', async () => {
      const res = await request(costsApp)
        .post('/api/add')
        .send({
          userId: 123123,
          description: "negative sum test",
          category: "food",
          sum: -5
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('cost cannot be negetive number');
    });

    it('should reject a NoSQL query injection block in userId', async () => {
      const res = await request(costsApp)
        .post('/api/add')
        .send({
          userId: {"$ne": null},
          description: "NoSQL Injection Test",
          category: "food",
          sum: 10
        });
      expect(res.statusCode).toEqual(400);
    });

    it('should fail with 404 for wrong HTTP method on add cost route', async () => {
      const res = await request(costsApp)
        .get('/api/add');
      expect(res.statusCode).toEqual(404);
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
      expect(res.body[0].firstName).toEqual('Omer');
      expect(res.body[0].lastName).toEqual('Elovici');
      expect(res.body[1].firstName).toEqual('David');
      expect(res.body[1].lastName).toEqual('Yakhin');
    });

    it('should verify CORS header is present', async () => {
      const res = await request(aboutApp)
        .get('/api/about');
      expect(res.headers['access-control-allow-origin']).toEqual('*');
    });
  });
});
