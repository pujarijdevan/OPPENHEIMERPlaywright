import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { dbConfig } from '../config/dbConfig.js';

test.beforeEach(async ({ page }) => {
    await page.goto('/login');
});

test('Ac-1/Ac-2/Ac-3 Verify user downlaod the tax releif file and validate content of file in format >natid>, <taxrelif> followed by footer with content and empty content', async ({ page }) => {
    
    // Login as Book Keeper
    await page.getByRole('textbox', { name: 'username' }).fill('bk');
    await page.getByRole('textbox', { name: 'password' }).fill('bk');
    await page.getByRole('button', { name: 'Submit' }).click();

    // Generate Tax Relief File
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Generate Tax Relief File' }).click();
    
    // Wait for download to complete
    const download = await downloadPromise;

    // Define download path
    const downloadPath = path.join(__dirname, 'testData', 'taxrelief.txt');
    await download.saveAs(downloadPath);

    // Validate that file exists
    expect(fs.existsSync(downloadPath)).toBeTruthy();
    console.log("File downloaded successfully!");

    //  Read and validate file content
    const fileContent = fs.readFileSync(downloadPath, 'utf8').trim();
    console.log("📄 File Content:\n", fileContent); 
    const lines = fileContent.split('\n').map(line => line.trim());
    const footer = parseInt(lines[lines.length - 1]);
    expect(lines.length - 1).toBe(footer);
    console.log(`File footer correctly shows total records: ${footer}`);
    if (lines.length > 1) {
        // If records exist, validate format "<natid>, <tax relief amount>"
        for (let i = 0; i < lines.length - 1; i++) {
            const parts = lines[i].split(',').map(part => part.trim());
            expect(parts.length).toBe(2); 
            expect(parts[0]).toMatch(/^natid-\d+$/);   // natid should be a number
            expect(!isNaN(parts[1])).toBeTruthy(); // tax relief amount should be a number
        }
    }
        console.log(" File contains valid tax relief records.");
        if (footer === 0) {
            expect(lines.length).toBe(1); // Only footer should be present
            console.log(" No records found, only footer exists in the file.");
        }
});


test('Ac-5 Verify tax relief file process in database', async ({ page }) => {
    // Login as Book Keeper
    await page.getByRole('textbox', { name: 'username' }).fill('bk');
    await page.getByRole('textbox', { name: 'password' }).fill('bk');
    await page.getByRole('button', { name: 'Submit' }).click();

    // Generate Tax Relief File
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Generate Tax Relief File' }).click();
    
    // Wait for download to complete
    const download = await downloadPromise;

    const downloadPath = path.join(__dirname, 'testData', 'taxrelief.txt');
    await download.saveAs(downloadPath);
    // Wait for database entry to be created
    await page.waitForTimeout(5000); // Wait for DB update

      expect(fs.existsSync(downloadPath)).toBeTruthy();
      console.log("File downloaded successfully!");
  
      //Read and validate file content
      const fileContent = fs.readFileSync(downloadPath, 'utf8').trim();
      console.log("📄 File Content:\n", fileContent); 
      const lines = fileContent.split('\n').map(line => line.trim());
        const totalRecords = lines.length - 1;
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(`
        SELECT file_type, file_status, total_count
        FROM testdb.file where file_type='TAX_RELIEF' ORDER BY updated_at DESC
        LIMIT 1;
    `);

    // Ensure a record was found
    expect(rows.length).toBeGreaterThan(0);
    const fileEntry = rows[0];

    console.log("📄 Database Entry:", fileEntry);

    // Validate file status is COMPLETED or ERROR
    expect(['COMPLETED']).toContain(fileEntry.file_status);

    // Validate total_count is a number
    expect(fileEntry.total_count).toBe(totalRecords);

    // Close the database connection
    await connection.end();
});




