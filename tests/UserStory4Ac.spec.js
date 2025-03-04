/*

(User Story 4) As the system owner, I want to provide an API that creates a working class hero with vouchers.
*/

import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import exp from 'constants';
import mysql from 'mysql2/promise';
import { dbConfig } from '../config/dbConfig.js';

const todayDate = new Date().toISOString().split('T')[0];

test('POST /api/v1/hero/vouchers - AC-1 Create hero with vouchers', async ({ request }) => {
    const natid = `natid-${faker.number.int({ min: 0, max: 9999999 })}`;
    const name = faker.person.fullName();
    const gender = "MALE";
    const birthDate = "2020-01-01T23:59:59";
    const deathDate = null;
    const salary = 10.00;
    const taxPaid = 1;
    const browniePoints = 9;
    const vouchers = [
        {
            voucherName: "VOUCHER 1",
            voucherType: "TRAVEL"
        },
        {
            voucherName: "VOUCHER 2",
            voucherType: "FOOD"
        }
    ];
    const heroPayload = {
        natid,
        name,
        gender,
        birthDate,
        deathDate,
        salary,
        taxPaid,
        browniePoints,
        vouchers 
    };
    const response = await request.post('/api/v1/hero/vouchers', {
        data: heroPayload
    });
    expect(response.status()).toBe(200);

});

const testData = [
    { vouchers: null },
    { vouchers: [] }
];

test('POST /api/v1/hero/vouchers -AC2- Request Input validation ', async ({ request }) => {
    const natid = `natid-${faker.number.int({ min: 0, max: 9999999 })}`;
    const name = faker.person.fullName();
    const gender = faker.helpers.arrayElement(['MALE', 'FEMALE']);
    const birthDate = faker.date.past({ years: 10 }).toISOString().split('T')[0] + 'T23:59:59';
    const salary = 10.00;
    const taxPaid = faker.number.float({ min: 0, max: 100, precision: 0.01 });
    const browniePoints = faker.number.int({ min: 1, max: 100 });
    const deathDate =null;
    const vouchers = [
        {
            voucherName: "VOUCHER 1",
            voucherType: "TRAVEL"
        },
        {
            voucherName: "VOUCHER 2",
            voucherType: "FOOD"
        }
    ];
    // Send the POST request
    const response = await request.post('/api/v1/hero/vouchers', {
        headers: { 'Content-Type': 'application/json' },
        data: {
            natid,
            name,
            gender,
            birthDate,
            deathDate,
            salary,
            taxPaid,
            browniePoints,
            vouchers
        }
    });

    expect(response.status()).toBe(200);
});

test.describe('POST /api/v1/hero/vouchers - AC-3 Create hero with empty or null vouchers', () => {
    for (const data of testData) {
        test(`with empty vouchers: ${JSON.stringify(data.vouchers)}`, async ({ request }) => {
            const natid = `natid-${faker.number.int({ min: 0, max: 9999999 })}`;
            const name = faker.person.fullName();
            const gender = "MALE";
            const birthDate = "2020-01-01T23:59:59";
            const deathDate = null;
            const salary = 10.00;
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
                browniePoints,
                vouchers: data.vouchers
            };
            const response = await request.post('/api/v1/hero/vouchers', {
                data: heroPayload
            });
            const responseBody = await response.json();
            console.log(responseBody); 
            expect(response.status()).toBe(400);
            expect(responseBody.errorMsg).toContain("vouchers cannot be null or empty");
        });
    }
});

test('POST /api/v1/hero/vouchers - AC-4 Verify Voucher Table after successful creation', async ({ request }) => {
    const natid = `natid-${faker.number.int({ min: 0, max: 9999999 })}`;
    const name = faker.person.fullName();
    const gender = "MALE";
    const birthDate = "2020-01-01T23:59:59";
    const deathDate = null;
    const salary = 10.00;
    const taxPaid = 1;
    const browniePoints = 9;
    var randomnumber = faker.number.int({ min: 1, max: 1000});
    const vouchersText='VOUCHER '+randomnumber;
    const vouchers = [
        {
            voucherName: vouchersText,
            voucherType: "TRAVEL"
        }];
        const heroPayload = {
        natid,
        name,
        gender,
        birthDate,
        deathDate,
        salary,
        taxPaid,
        browniePoints,
        vouchers 
    };
    const response = await request.post('/api/v1/hero/vouchers', {
        data: heroPayload
    });
    expect(response.status()).toBe(200);
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
        `SELECT * from testdb.vouchers WHERE name =
            ?`, [vouchersText]
    );
    console.log(rows);
    expect(rows.length).toBe(1);
    expect(rows[0].name).toBe(vouchersText);
    expect(rows[0].voucher_type).toBe("TRAVEL");
});


test.describe('POST /api/v1/hero/vouchers - AC-5 If any validation fails, nothing is persisted.', () => {
    for (const data of testData) {
        test(`with empty vouchers: ${JSON.stringify(data.vouchers)}`, async ({ request }) => {
            const natid = `natid-${faker.number.int({ min: 0, max: 9999999 })}`;
            const name = faker.person.fullName();
            const gender = "MALE";
            const birthDate = "2020-01-01T23:59:59";
            const deathDate = null;
            const salary = 10.00;
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
                browniePoints,
                vouchers: data.vouchers
            };
            const response = await request.post('/api/v1/hero/vouchers', {
                data: heroPayload
            });
            const responseBody = await response.json();
            console.log(responseBody); 
            expect(response.status()).toBe(400);
        });
    }
});