const assert = require('assert');
const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const until = require('selenium-webdriver/lib/until');
const uuid = require("uuid");

// Test parameters
const LOGIN_URL = 'https://login.yahoo.com/?.src=ym&pspid=159600001&activity=mail-direct&.lang=en-GB&.intl=gb&.done=https%3A%2F%2Fmail.yahoo.com%2Fd';
const USER = 'ifeoma.arm_test@yahoo.com';
const PASSWORD = 'Cz#R3UM4Sm-Qn&W';
const EMAIL_SUBJECT = 'Hi';
const RANDOM_IDENTIFIER = uuid.v1();
const EMAIL_BODY = `Automation test. Identifier: ${RANDOM_IDENTIFIER}`; // Add a random identifier to ensure we are looking at the correct email

(async function sendEmailTest() {
  try {
    let options = new chrome.Options();
    options.addArguments("--start-fullscreen"); // Starts chrome in fullscreen mode
    let driver = await new Builder()
      .setChromeOptions(options)
      .forBrowser('chrome')
      .build();
    await driver.get(LOGIN_URL);

    // Login screen enter email
    let emailInputBox = await driver.findElement(By.id('login-username'));
    emailInputBox.sendKeys(USER);
    let nextButton = await driver.findElement(By.id('login-signin'));
    nextButton.click();

    await driver.manage().setTimeouts({ implicit: 1000 });

    // Login screen enter password
    let passwordInputBox = await driver.findElement(By.id('login-passwd'));
    passwordInputBox.sendKeys(PASSWORD);
    nextButton = await driver.findElement(By.id('login-signin'));
    await nextButton.click();

    await driver.manage().setTimeouts({ implicit: 1000 });

    // Email dashboard, click compose
    let composeButton = await driver.findElement(By.linkText('Compose'));
    await composeButton.click();

    await driver.manage().setTimeouts({ implicit: 1000 });

    // New email screen, enter email details
    let toInputBox = await driver.findElement(By.id('message-to-field'));
    toInputBox.sendKeys(USER);

    let subjectBox = await driver.findElement(By.css('input[data-test-id="compose-subject"]'));
    subjectBox.sendKeys(EMAIL_SUBJECT);

    let bodyInputBox = await driver.findElement(By.css('div[aria-label="Message body"]'));
    bodyInputBox.sendKeys(EMAIL_BODY);

    // Send email
    let sendButton = await driver.findElement(By.css('button[data-test-id="compose-send-button"]'));
    await sendButton.click();

    await driver.manage().setTimeouts({ implicit: 5000 });

    // Click inbox link to go back to inbox folder
    let inboxLink = await driver.findElement(By.css('a[data-test-folder-name="Inbox"]'));
    assert((await inboxLink.getAttribute('aria-label')).includes('unread'), 'Inbox link should display an unread label');
    await inboxLink.click();

    // Wait until the sent message is received
    let receivedMessage = await driver.wait(until.elementLocated(By.css('a[data-test-read="false"]')), 300000);
    await receivedMessage.click();

    // Assert the email sender is correct
    let receivedMessageFrom = await driver.wait(until.elementLocated(By.css('span[data-test-id="email-pill"] > span > span')), 10000);
    assert((await receivedMessageFrom.getText()).includes(USER), 'Email sender does not match sent email');

    // Assert the email subject is correct
    let receivedMessageSubject = await driver.wait(until.elementLocated(By.css('span[data-test-id="message-group-subject-text"]')), 10000);
    assert.deepStrictEqual(await receivedMessageSubject.getText(), EMAIL_SUBJECT, 'Email subject does not match sent email');

    // Assert the email body is correct and includes our random identifier
    let receivedMessageText = await driver.wait(until.elementLocated(By.css('div[data-test-id="message-view-body-content"] div[dir="ltr"]')), 10000);
    assert.deepStrictEqual(await receivedMessageText.getText(), EMAIL_BODY, 'Email body does not match sent email');

    // Exit
    await driver.quit();
  } catch (error) {
    // Log any errors encountered during testing below
    console.error(error)
  }
})();