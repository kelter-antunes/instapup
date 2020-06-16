const Instagram = require('instagram-web-api')
const FileCookieStore = require('tough-cookie-filestore2')

const NodeCache = require("node-cache");

const ttl = 60 * 60 * 2; // cache for 2 Hour
const cache = new NodeCache({ stdTTL: ttl });


var username = process.env.username || 'xxx';
var password = process.env.password || 'xxx';

const cookieStore = new FileCookieStore('./cookies.json');
const client = new Instagram({ username, password, cookieStore });

;
(async () => {
    const { authenticated, user } = await client.login();
    console.log('authenticated: ' + authenticated);
})()

exports.get = (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    // res.status(200).json({ status: 'ok' });

    const user = req.query.user;
    const key = user;

    value = cache.get(key);
    if (value == undefined) {
        // handle miss!
        console.log('cache miss: ' + key);


        let instagram;;
        (async () => {
            try {
                instagram = await client.getUserByUsername({ username: user })
                value = instagram;
                cache.set(key, value);
                console.log('set cache for: ' + key)
                res.send(value);
            } catch (error) {
                console.log('error while getting instagram for: ' + key);
                res.status(503).send({
                    error: "Instagram error, please try again later."
                });
            }


        })()

    } else {
        console.log('cache hit: ' + key)
        res.send(value);
    }

};


/*
exports.getById = (req, res, next) => {
    res.status(200).send('Requisição recebida com sucesso!');
};



exports.post = (req, res, next) => {
    res.status(201).send('Requisição recebida com sucesso!');
};


exports.put = (req, res, next) => {
    let id = req.params.id;
    res.status(201).send(`Requisição recebida com sucesso! ${id}`);
};

exports.delete = (req, res, next) => {
    let id = req.params.id;
    res.status(200).send(`Requisição recebida com sucesso! ${id}`);
};
*/