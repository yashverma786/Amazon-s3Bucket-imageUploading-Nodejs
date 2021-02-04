const express = require("express");
const app = express();
require("dotenv/config");
const multer = require("multer");
const AWS = require("aws-sdk");
const port = 3000;
const uuid = require("uuid/v4"); // this package genet=rate random string  and we append this string at the end of image name  so the two images with same wont conflict
const s3 = new AWS.S3({
  accesskeyId: process.env.AWS_ID,
  secretAccesskey: process.env.AWS_SECRET,
});
const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "path");
  },
});

//setup middleware
const upload = multer({ storage: storage }).single("image"); //single file is uploading

app.post("/", upload, (req, res) => {
  let myFile = req.file.originalname.split(".");
  const fileType = myFile[myFile.length - 1];

  console.log(req.file); //object ayega isme ,filename, originalname,encoding,buffer hoga
  res.send({ message: "hello World" });

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    key: `${uuid()}.${fileType}`, //image rename
    Body: req.file.buffer,
  };

  s3.upload(params, (error, data) => {
    if (error) {
      res.status(500).send(error);
    }
    res.status(200).send(data);
  });
});

app.listen(port, () => {
  console.log(`server is up`);
});
