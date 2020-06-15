const puppeteer = require('puppeteer');
const fs = require('fs');

const pup = puppeteer.launch({
    headless: true, // debug only
    args: ['--no-sandbox']
    //userDataDir: './user_data'
});

const rand = function() { return Math.floor(200 + Math.random() * 1000) };

module.exports = function(user) {
    return new Promise((resolve, reject) => {;
        (async () => {

            var username = process.env.username || 'xxx';
            var password = process.env.password || 'xxx';
            console.log('Username: ' + username);

            const browser = await pup;

            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                if (['image', 'stylesheet', 'font'].indexOf(request.resourceType()) !== -1) {
                    request.abort();
                } else {
                    request.continue();
                }
            });



            const cookiesPath = './insta-session.json';

            // If the cookies file exists, read the cookies.
            const previousSession = fs.existsSync(cookiesPath)
            if (previousSession) {
                const content = fs.readFileSync(cookiesPath);
                const cookiesArr = JSON.parse(content);
                if (cookiesArr.length !== 0) {
                    for (let cookie of cookiesArr) {
                        await page.setCookie(cookie)
                    }
                    console.log('Session has been loaded in the browser')
                }
            }


            // set viewport and user agent (just in case for nice viewing)
            await page.setViewport({ width: 1366, height: 768 });
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36');

            // Wait until page has loaded
            await page.goto('https://www.instagram.com/', {
                waitUntil: 'networkidle0',
            });

            var isLoggedIn;

            if (await page.$('html.logged-in') !== null) {
                console.log('logged-in');
                isLoggedIn = true;
            } else {
                console.log('without loggin');
                isLoggedIn = false;
            }


            //need to login?  
            if (!isLoggedIn) {

                // Wait until page has loaded
                await page.goto('https://www.instagram.com/accounts/login/', {
                    waitUntil: 'networkidle0',
                });

                // Wait for log in form
                await Promise.all([
                    page.waitForSelector('[name="username"]'),
                    page.waitForSelector('[name="password"]'),
                    page.waitForSelector('[type="submit"]'),
                ]);

                // Enter username and password
                await page.type('[name="username"]', username, { delay: 150 });
                await page.type('[name="password"]', password, { delay: 150 });

                // Submit log in credentials and wait for navigation
                await Promise.all([
                    page.click('[type="submit"]'),
                    page.waitForNavigation({
                        waitUntil: 'networkidle0',
                    }),
                ]);


            }

            let url = 'https://www.instagram.com/' + user + '/'
            await page.goto(url, {
                waitUntil: ['load', 'networkidle0', 'domcontentloaded']
            });

            //wait 1 sec
            page.waitFor(rand());


            // Write Cookies
            const cookiesObject = await page.cookies()
            fs.writeFileSync(cookiesPath, JSON.stringify(cookiesObject));
            console.log('Session has been saved to ' + cookiesPath);

            let sharedData = {
                id: 0,
            };
            try {
                sharedData = await page.evaluate(() => {
                    return window._sharedData.entry_data.ProfilePage[0].graphql.user;
                });
            } catch (e) {
                console.log('main program error:' + e);
            }


            // await browser.close();
            await page.close();

            resolve(sharedData)
        })()
    })
}