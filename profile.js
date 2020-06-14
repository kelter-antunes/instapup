const puppeteer = require('puppeteer');
const fs = require('fs');

var username = process.env.username || 'xxx';
var password = process.env.password || 'xxx';


module.exports = function(url) {
    return new Promise((resolve, reject) => {;
        (async () => {

            const browser = await puppeteer.launch({
                headless: true, // debug only
                args: ['--no-sandbox']
                //userDataDir: './user_data'
            });

            const rand = function() { return Math.floor(1000 + Math.random() * 2000) };

            const page = await browser.newPage();

            
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
            await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');

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

            await page.goto(url, {
                waitUntil: ['load', 'networkidle0', 'domcontentloaded']
            });

            //wait 1 sec
            page.waitFor(rand());


            

            // Write Cookies
            const cookiesObject = await page.cookies()
            fs.writeFileSync(cookiesPath, JSON.stringify(cookiesObject));
            console.log('Session has been saved to ' + cookiesPath);
          


            await page.emulateMedia('screen');
            let sharedData = await page.evaluate(() => {
                return window._sharedData.entry_data.ProfilePage[0].graphql.user;
            });

            await browser.close();

            resolve(sharedData)
        })()
    })
}