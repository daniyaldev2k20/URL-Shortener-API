const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const validUrl = require("valid-url");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();

dotenv.config({ path: "./config.env" });
const URL = require("./models/URL");
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(cors());
app.use(express.json());

const DB = process.env.MONGO_URI;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB successfully connected");
  });

app.use("/public", express.static(process.cwd() + "/public"));
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl/new", async (req, res) => {
  const url = req.body.url;

  // check if the url is valid or not
  if (validUrl.isWebUri(url)) {
    try {
      // check if its already in the database
      await URL.findOne(
        {
          original_url: url,
        },
        async (err, data) => {
          if (data) {
            const number = data.short_url + 1;
            res.json({
              original_url: data.original_url,
              short_url: number,
            });
          } else {
            // if its not exist yet then create new one and response with the result
            data = new URL({
              original_url: url,
              short_url: 1,
            });
            await data.save();
            res.json({
              original_url: data.original_url,
              short_url: data.short_url,
            });
          }
        }
      );
    } catch (err) {
      console.error(err);
      res.status(500).json("Error from Server side");
    }
  } else {
    res.status(401).json({
      error: "invalid url",
    });
  }
});

app.get("/api/shorturl/:short_url?", async (req, res) => {
  try {
    const urlParams = await URL.findOne({
      short_url: req.params.short_url,
    });
    if (urlParams) {
      return res.redirect(urlParams.original_url);
    } else {
      return res.status(404).json("error: 'invalid url");
    }
  } catch (err) {
    console.log(err);
    res.status(500).json("Error from Server side");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port : ${port}`);
});
