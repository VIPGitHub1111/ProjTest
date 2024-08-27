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
    await page.locator('xpath=//*[@id="email_address"]').fill('admin@infopercept.com');
    await page.locator('xpath= //*[@id="password-field"]').fill('Admin@123');

    // Step 1: Hover over the eye icon to toggle password visibility
    await page.hover('.eyeion.toggle-password');

    // Step 2: Click the icon to toggle password visibility
    await page.click('.eyeion.toggle-password');

    // Step 3: Check if the password is now visible
    const passwordType = await page.getAttribute('xpath= //*[@id="password-field"', 'type');
    console.log('After hover, Password visibility:', passwordType === 'text' ? 'Visible' : 'Hidden');

    // Test 2: Click on Forgot Password Hyperlink and verify window opens and elements are present
    await page.click('.cursor-pointer form-label-link');

    // Wait for the Forgot Password modal to appear
    await page.waitForSelector('.modal-title', { timeout: 5000 }); // Adjust timeout as needed

    // Extract and log the title of the modal i.e Forgot Password
    const modalTitle = await page.textContent('.modal-title');
    console.log('Forgot Password Modal Title:', modalTitle);

    // Optionally, you can interact with other elements in the modal
    // Example: Fill in the email address in the modal
    await page.fill('#email', 'admin@infopercept.com'); 
    await page.click('[data-test-id="forgot_password"]');
    await page.click('.btn btn-sm btn-secondary'); 
    await page.waitForTimeout(5000);

    // Test 3: Check CAPTCHA is displayed and fill it
    const captchaImage = await page.$('#captcha_code'); 
    const captchaSrc = await captchaImage.getAttribute('src');
    console.log('Captcha image src:', captchaSrc);

    // Using manual input for CAPTCHA due to complexity
    const captchaText = await page.evaluate(() => prompt("Captcha"));
    await page.fill('#captcha_code', captchaText);

    // Test 4: Check Remember ID checkbox and attempt to login
    await page.check('#remember');
    await page.click('#sign-in-btn');

    // Test 5: Verify login errors (e.g., wrong CAPTCHA or missing fields)
    const toastSelector = '.toastify.toastify-left.toastify-bottom';
    try {
        // Wait for the toast notification to appear
        await page.waitForSelector(toastSelector, { timeout: 5000 });

        // Capture the toast notification element
        const loginError = await page.$(toastSelector);
        if (loginError) {
            // Extract the error text from the toast notification
            const errorText = await loginError.textContent();
            console.log('Login Error:', errorText.trim()); 
            await page.waitForTimeout(5000); 
        } else {
            // If no error, Login successfully and proceed to open a new page
            const page1 = await page.context().newPage();
            await page1.goto('https://gsos.invinsense.io:9011/index'); 
            await page1.waitForTimeout(10000); 
    }
    } catch (error) 
    {
        // Handle cases where the toast does not appear within the timeout
        console.log('No toast notification appeared:', error.message);
}

    // Cleanup
    await browser.close();

})