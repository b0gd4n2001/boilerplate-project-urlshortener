require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('node:dns');
const mongoose = require('mongoose');
const ShortURLModel = require('./models/model.js')

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(express.json());

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

async function urlAndShortUrlCreator(url) {
  const exists = await ShortURLModel.findOne({ original_url: url });
  if (exists) {
    return exists.short_url
  } else {
    const surl = await ShortURLModel.findOne().sort({ short_url: -1 });
    const surlnum = surl ? surl['short_url'] + 1 : 1;
    await ShortURLModel.create({ original_url: url, short_url: surlnum });
    return surlnum;
  }
};

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

app.post('/api/shorturl', bodyParser.urlencoded({ extended: false }), async function (req, res) {
  try {
    const host = new URL(req.body.url).host;
    dns.lookup(host, async function (err, address, family) {
      if (err) {
        res.json({ error: 'invalid url' })
      } else {
        const shortUrlNum = await urlAndShortUrlCreator(req.body.url);
        res.json({ original_url: req.body.url, short_url: shortUrlNum })
      }
    });
  } catch (error) {
    try {
      const host = req.body.url;
      dns.lookup(host, async function (err, address, family) {
        if (err) {
          res.json({ error: 'invalid url' })
        } else {
          const shortUrlNum = await urlAndShortUrlCreator(req.body.url);
          res.json({ original_url: req.body.url, short_url: shortUrlNum })
        }
      });
    } catch {
      res.json({ error: 'invalid url' })
    }
  }
})

app.get('/api/shorturl/:url_number', async function (req, res) {
  if (isNaN(req.params.url_number)) {
    res.json({ "error": "Wrong format" })
  } else {
    const shortUrl = await ShortURLModel.findOne({ short_url: Number(req.params.url_number) });
    if (shortUrl) {
      try {
        new URL(shortUrl.original_url);
        res.redirect(shortUrl.original_url);
      } catch (error) {
        res.redirect('http://' + shortUrl.original_url);
      }
    } else {
      res.json({ "error": "No short URL found for the given input" })
    }
  }

})
