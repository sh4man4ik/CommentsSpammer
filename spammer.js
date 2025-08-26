import { chromium } from 'playwright';
import fs from 'fs';

let page;
let userCommentsArray;
let browserOptions = {
	headless: false,
	userAgent:
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0 [ip:151.36.75.51]',
	args: ['--disable-blink-features=AutomationControlled', '--disable-infobars']
};
const userChromeProfile = './profile';
const tiktokLoginURL = 'https://www.tiktok.com/login';

async function swipeToNextVideo() {
	await page.mouse.wheel(0, 100);
}

async function writeRandomComment() {
	let randomComment = userCommentsArray[Math.floor(Math.random() * userCommentsArray.length)].trim();
	let commentInputText = page.locator('div[contenteditable="true"]').last();
	await commentInputText.fill(randomComment);
}

async function findAndClickCommentInputField() {
	let commentInputElements = page.locator('.public-DraftEditorPlaceholder-root');
	let commentInput = commentInputElements.last();
	await commentInput.click();
}

async function findElementBySelector(selector) {
	await page.locator(selector).last().click();
}

async function waitFor(ms) {
	await page.waitForTimeout(ms);
}

async function waitForTargetURL() {
	await page.waitForURL('https://www.tiktok.com/foryou?lang=en'); //language is ENG
}

async function loginToTikTokAccount() {
	await page.goto(tiktokLoginURL, { waitUntil: 'load' });
}

function setupPage() {
	//both 12 hours
	page.setDefaultTimeout(43200000);
	page.setDefaultNavigationTimeout(43200000);
}

function loadComments() {
	let userComments = fs.readFileSync('./comments.txt', 'utf8');
	userCommentsArray = userComments.split('$');
}

async function createBrowser() {
	const context = await chromium.launchPersistentContext(userChromeProfile, browserOptions);
	page = await context.newPage();
}

async function setup() {
	await createBrowser();
	setupPage();
	loadComments();
}

async function login() {
	await loginToTikTokAccount();
	await waitForTargetURL();
}

async function sendComment() {
	await findElementBySelector('[data-e2e="comment-icon"]');
	await findAndClickCommentInputField();
	await writeRandomComment();
	await findElementBySelector('[data-e2e="comment-post"]');
	await findElementBySelector('[aria-label="exit"]');
}

async function main() {
	await setup();
	await login();

	while (true) {
		await waitFor(5000);
		await sendComment();
		await swipeToNextVideo();
		await waitFor(10000);
	}
}

main();
