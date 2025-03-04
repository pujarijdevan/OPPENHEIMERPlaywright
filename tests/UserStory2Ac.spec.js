import { test,expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { dbConfig } from '../config/dbConfig.js';
import { time } from 'console';

test.beforeAll(async () => {
    console.log("🧹 Cleaning up database before test execution...");
    const connection = await mysql.createConnection(dbConfig);

    const natidsToDelete = ["natid-12", "natid-13"];

    // Execute DELETE for each `natid`
    for (const natid of natidsToDelete) {
        await connection.execute(`DELETE FROM working_class_heroes WHERE natid = ?`, [natid]);
        console.log(`✅ Deleted existing record with natid: ${natid}`);
    }
    await connection.end();
});

test('AC-1/AC-3 User should be able to create multiple heroes by uploading a CSV file', async ({ page }) => {
    //  Navigate to login page
    await page.goto('/login');

    //  Login as Clerk
    await page.getByRole('textbox', { name: 'username' }).fill('clerk');
    await page.getByRole('textbox', { name: 'password' }).fill('clerk');
    await page.getByRole('button', { name: 'Submit' }).click();

    //  Navigate to Upload CSV Page
    await page.getByRole('button', { name: 'Add a hero' }).click();
    await page.getByRole('link', { name: 'Upload a csv file' }).click();

    //  Define CSV File Path
    const csvFilePath = path.join(process.cwd(), 'testData', 'sample-data.csv');

    //  Ensure the file input field is available
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('textbox', { name: 'Upload CSV file' }).click(); // Click the file input field
    const fileChooser = await fileChooserPromise;
    
    //  Upload the CSV File
    await fileChooser.setFiles(csvFilePath);
    console.log(`Uploaded CSV file from: ${csvFilePath}`);

    //  Click the Create button
    await page.getByRole('button', { name: 'Create' }).click();
    console.log(" Clicked Create button to process the uploaded file.");

    await expect(page.getByText('Created Successfully')).toBeVisible({ timeout: 5000 });
});


test('AC-2 Generate CSV file with already existing test data ', async () => {

    const csvFilePath = path.join(process.cwd(), 'testData', 'sample-data.csv');
    if (!fs.existsSync(path.dirname(csvFilePath))) {
        fs.mkdirSync(path.dirname(csvFilePath), { recursive: true });
    }
    const csvContent = [
        `"natid-12", "hello", "MALE", "2020-01-01T23:59:59", "null", "10.00", "1", "9"`,
        `"natid-13", "world", "FEMALE", "1995-05-15T10:30:00", "null", "2000.50", "150", "12"`
    ].join('\n');

    fs.writeFileSync(csvFilePath, csvContent);

    console.log(`✅ CSV file generated at: ${csvFilePath}`);
});

test('AC-4 User should be not able to create multiple heroes by uploading natid already exist in system', async ({ page }) => {
    //  Navigate to login page
    await page.goto('/login');

    //  Login as Clerk
    await page.getByRole('textbox', { name: 'username' }).fill('clerk');
    await page.getByRole('textbox', { name: 'password' }).fill('clerk');
    await page.getByRole('button', { name: 'Submit' }).click();

    //  Navigate to Upload CSV Page
    await page.getByRole('button', { name: 'Add a hero' }).click();
    await page.getByRole('link', { name: 'Upload a csv file' }).click();

    //  Define CSV File Path
    const csvFilePath = path.join(process.cwd(), 'testData', 'sample-data.csv');

    //  Ensure the file input field is available
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('textbox', { name: 'Upload CSV file' }).click(); // Click the file input field
    const fileChooser = await fileChooserPromise;
    
    //  Upload the CSV File
    await fileChooser.setFiles(csvFilePath);
    console.log(`Uploaded CSV file from: ${csvFilePath}`);

    //  Click the Create button
    await page.getByRole('button', { name: 'Create' }).click();
    console.log(" Clicked Create button to process the uploaded file.");
    await expect(page.getByRole('heading', { name: 'Unable to create hero!' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('There are 1 records which were not persistent , please contact customer support')).toBeVisible({timeout:5000});
});