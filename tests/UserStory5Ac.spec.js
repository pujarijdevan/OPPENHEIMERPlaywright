import { test, expect } from '@playwright/test';

test('Ac-1 GET request /api/v1/hero/owe-money with query parameter natid=', async ({ request }) => {
    
    const response = await request.get('http://localhost:5002/api/v1/hero/owe-money?natid=1');

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    console.log(responseBody);
    expect(responseBody).toHaveProperty("message");
    expect(responseBody.message).toHaveProperty("data", "natid-1");
    expect(responseBody.message).toHaveProperty("status", "OWE");
    expect(responseBody).toHaveProperty("timestamp");
});

test('Ac-2: GET request /api/v1/hero/owe-money/{natid} - Invalid natid type', async ({ request }) => {
    const natid = "abc"; // Invalid non-numeric natid

    const response = await request.get(`http://localhost:5002/api/v1/hero/owe-money?natid=${natid}`);
    expect(response.status()).toBe(400);
});

test('Ac-3: Validate the system resposne', async ({ request }) => {

    const natid = 1; // Invalid non-numeric natid
    const response = await request.get(`http://localhost:5002/api/v1/hero/owe-money?natid=${natid}`);
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    console.log(responseBody);
    expect(responseBody).toHaveProperty("message");
    expect(responseBody.message).toHaveProperty("data", `natid-${natid}`);
    expect(responseBody.message).toHaveProperty("status", "OWE");
});

test('Ac-4 - /api/v1/hero/owe-money - Verify complete response', async ({ request }) => {
    const natid = 1;
    const response = await request.get(`http://localhost:5002/api/v1/hero/owe-money?natid=${natid}`);
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    console.log(responseBody);
    expect(responseBody).toHaveProperty("message");
    expect(responseBody.message).toHaveProperty("data", `natid-${natid}`);
    expect(responseBody.message).toHaveProperty("status", "OWE");
    expect(responseBody).toHaveProperty("timestamp");
});




