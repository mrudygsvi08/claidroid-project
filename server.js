require("dotenv").config()

const express = require("express")
const AWS = require("aws-sdk")
const multer = require("multer")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

/* AWS CONFIG */
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION
})

const s3 = new AWS.S3({
  signatureVersion: "v4"
})

/* MULTER CONFIG */
const upload = multer({
  storage: multer.memoryStorage()
})

/* UPLOAD FILE */
app.post("/upload", upload.single("file"), async (req, res) => {
  try {

    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: req.file.originalname,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    }

    await s3.upload(params).promise()

    const fileUrl = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${req.file.originalname}`

    res.json({
      message: "File uploaded successfully",
      url: fileUrl
    })

  } catch (error) {
    res.status(500).json(error)
  }
})



/* GET FILES */
app.get("/files", async (req, res) => {
  try {

    const params = {
      Bucket: process.env.AWS_BUCKET
    }

    const data = await s3.listObjectsV2(params).promise()

    const files = data.Contents.map(file => ({
      name: file.Key,
      url: `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.Key}`
    }))

    res.json(files)

  } catch (error) {
    res.status(500).json(error)
  }
})



/* DELETE FILE */
app.delete("/delete/:key", async (req, res) => {
  try {

    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: req.params.key
    }

    await s3.deleteObject(params).promise()

    res.json({
      message: "File deleted successfully"
    })

  } catch (error) {
    res.status(500).json(error)
  }
})



app.listen(5000, () => {
  console.log("Server running on port 5000")
})