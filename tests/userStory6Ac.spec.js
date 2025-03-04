import { test, expect } from '@playwright/test';

test('Validate mock API response for vouchers', async ({ request }) => {
    const response = await request.get('http://localhost:5002/api/v1/voucher/by-person-and-type');

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    console.log(responseBody);
    expect(responseBody).toHaveProperty("data");
    expect(Array.isArray(responseBody.data)).toBe(true);
    expect(responseBody.data[0]).toHaveProperty("name", "John Doe");
    expect(responseBody.data[0]).toHaveProperty("voucherType", "Food");
    expect(responseBody.data[0]).toHaveProperty("count", 3);
    expect(responseBody.data[1]).toHaveProperty("name", "Jane Smith");
    expect(responseBody.data[1]).toHaveProperty("voucherType", "Travel");
    expect(responseBody.data[1]).toHaveProperty("count", 5);
    console.log("Voucher API Test Passed!");
});
