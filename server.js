const dotenv = require("dotenv");
const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { nanoid } = require('nanoid');
var validUrl = require('valid-url');
const app = express();

// Basic Configuration
dotenv.config({ path: "./config.env" });
const URL = require("./models/URL");
const port = process.env.PORT || 3000;
// Basic Configuration
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(cors()); 
app.use(express.json());

mongoose
  .connect(process.env.DB, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB successfully connected");
  });

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl/new', async(req, res) => {
  const { url } = req.body;

  if (!validUrl.isUri(url)){
    return res.json({"error":"invalid url"});
  }

  const urlObj = await URL.findOne({
    original_url: url,
  });

  if(urlObj){
    return res.json({
      original_url: urlObj.original_url,
      short_url: urlObj.short_url,
      })
  }else{
    const original_url = url;
    const short_url = nanoid(4);
    const newUrlObj = await URL.create({
      original_url,
      short_url,
  })
  
  res.json({
    original_url: newUrlObj.original_url,
    short_url: newUrlObj.short_url,
  })
  }
})

app.get("/api/shorturl/:short_url", async (req, res) => {
  
const url = await URL.findOne({
  short_url: req.params.short_url,
});

if (url) {
  res.redirect(url.original_url);
} else {
  res.json({error:"invalid url"});
}
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

