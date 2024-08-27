import {chromium, test} from "@playwright/test"

test("Login test successfully", async () => {

    const browser = await chromium.launch({ headless: false});

    const context = await browser.newContext();
    const page = await context.newPage();
     // Ignore certificate errors
     ignoreHTTPSErrors: true

    await page.goto('https://gsos.invinsense.io:9011/',{ waitUntil: 'load' } );
    await page.waitForTimeout(5000);


    //Test 1: Fill in email and password , toggle password visiblility and check if password toggles
    await page.locator('xpath=//*[@id="email_address"]').fill('admin@infopercept.com');//Fill in email
    await page.locator('xpath= //*[@id="password-field"]').fill('Admin@123');//Fill in password

    // Step 1: Hover over the eye icon to toggle password visibility
    await page.hover('#eyeion toggle-password'); // Replace with the actual selector for the eye icon

    // Step 2: Check if the password is now visible
    let passwordType = await page.getAttribute('xpath= //*[@id="password-field"', 'type');
    console.log('After hover, Password visibility:', passwordType === 'text' ? 'Visible' : 'Hidden');

    // Test 2: Click on Forgot Password and verify window opens and elements are present
    await page.click('text="Forgot Password"');
    await page.waitForSelector('input#email'); // Verify Forgot Password email input
    await page.click('.btn btn-sm btn-secondary'); // Close Forgot Password window
    await page.waitForTimeout(10000);

    // Test 3: Check CAPTCHA is displayed and fill it
    const captchaImage = await page.$('img##captcha_code'); // Assuming there is a CAPTCHA image
    const captchaSrc = await captchaImage.getAttribute('src');
    console.log('Captcha image src:', captchaSrc);

    // Using manual input for CAPTCHA due to complexity
    const captchaText = await page.evaluate(() => prompt("Captcha:"));
    await page.fill('input#c#captcha_code', captchaText);

    // Test 4: Check Remember ID checkbox and attempt to login
    await page.check('input#remember');
    await page.click('button#sign-in-btn');

    // Test 5: Verify login errors (e.g., wrong CAPTCHA or missing fields)
    const loginError = await page.$('div.login-error'); 
    if (loginError) {
        const errorText = await loginError.textContent();
        console.log('Please enter valid Email/Password/Captcha :', errorText);
        await page.waitForTimeout(5000);
    } else {
        console.log('Login attempted, no immediate errors.');
    
    }
    
    const page1= await context.newPage();
    await page1.goto("https://gsos.invinsense.io:9011/index");
    await page.waitForTimeout(10000);

    // Cleanup
    await browser.close();

})