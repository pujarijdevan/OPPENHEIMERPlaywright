import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import mysql from 'mysql2/promise';
import { dbConfig } from '../config/dbConfig.js';

const todayDate = new Date().toISOString().split('T')[0];


test('POST /api/v1/hero -AC1- Create a hero-200-ok', async ({ request }) => {
    const natid = `natid-${faker.number.int({ min: 0, max: 9999999 })}`;
    const response = await request.post('/api/v1/hero', {
        data: {
            natid: natid,
            name: faker.person.fullName(),
            gender: "MALE",
            birthDate: "1990-01-01T23:59:59",
            deathDate: null,
            salary: 1000.00,
            taxPaid: 1,
            browniePoints: 9
        }
    });
    const responseBody = await response.json();
    console.log(responseBody);
    expect(response.status()).toBe(200);
    expect(responseBody.message).toBeNull();
    expect(responseBody.timestamp).toContain(todayDate);
});

test('POST /api/v1/hero -AC2- Request Input validation ', async ({ request }) => {
    const natid = `natid-${faker.number.int({ min: 0, max: 9999999 })}`;
    const name = faker.person.fullName();
    const gender = faker.helpers.arrayElement(['MALE', 'FEMALE']);
    const birthDate = faker.date.between({ from: '1950-01-01T00:00:00', to: '2000-01-01T00:00:00' });
    const salary = 1000.00;
    const taxPaid = faker.number.float({ min: 0, max: 100, precision: 0.01 });
    const browniePoints = faker.number.int({ min: 1, max: 100 });
    const formatDate = (date) => date.toISOString().split('.')[0];
    // Send the POST request
    const response = await request.post('/api/v1/hero', {
        headers: { 'Content-Type': 'application/json' },
        data: {
            natid,
            name,
            gender,
            birthDate:formatDate(birthDate),
            deathDate:null,
            salary,
            taxPaid,
            browniePoints
        }
    });
    const responseBody = await response.json();
    console.log(responseBody);
    expect(response.status()).toBe(200);
    expect(responseBody.message).toBeNull();
    expect(responseBody.timestamp).toContain(todayDate);
});

test('Post -  /api/v1/hero - AC3-Return 400 when natid already exists', async ({ request }) => {
    const natid = `natid-${faker.number.int({ min: 0, max: 9999999 })}`;
    const name = faker.person.fullName();
    const heroPayload = {
        natid: natid,
        name: name, 
        gender: "MALE",
        birthDate: "2020-01-01T23:59:59",
        deathDate: null,
        salary: 10000.00,
        taxPaid: 1,
        browniePoints: 9
    };
    const response1 = await request.post('/api/v1/hero', {
        headers: { 'Content-Type': 'application/json' },  // ✅ Added headers
        data: heroPayload
    });
    expect(response1.status()).toBe(200);
    const response2 = await request.post('/api/v1/hero', {
        headers: { 'Content-Type': 'application/json' },
        data: heroPayload
    });
    expect(response2.status()).toBe(400);

});

test('POST /api/v1/hero -AC-4 Verify record is created in WORKING_CLASS_HEROES', async ({ request }) => {
    const natid = `natid-${faker.number.int({ min: 0, max: 9999999 })}`;
    const name = faker.person.fullName();
    const gender = "MALE";
    const birthDate = "2020-01-01T23:59:59";
    const deathDate = null;
    const salary = 1000.00;
    const taxPaid = 1;
    const browniePoints = 9;

    const heroPayload = {
        natid,
        name,
        gender,
        birthDate,
        deathDate,
        salary,
        taxPaid,
        browniePoints
    };

    console.log(`📤 Sending API request to create hero: ${natid}`);
    const response = await request.post('/api/v1/hero', {
        headers: { 'Content-Type': 'application/json' },
        data: heroPayload
    });

    expect(response.status()).toBe(200);
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
        `SELECT * FROM working_class_heroes WHERE natid = ?`, 
        [natid]
    );

    await connection.end();
    expect(rows.length).toBe(1);
    console.log(`Record found in MySQL:`, rows[0]);
    expect(rows[0].natid).toBe(natid);
    expect(rows[0].name).toBe(name);
    expect(rows[0].gender).toBe(gender);
    expect(rows[0].salary).toBe(salary);
    expect(rows[0].tax_paid).toBe(taxPaid);
    expect(rows[0].brownie_points).toBe(browniePoints); 
});