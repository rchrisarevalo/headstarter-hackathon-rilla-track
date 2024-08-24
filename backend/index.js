const express = require("express");
const serverless = require("serverless-http");
const openai = require('openai')
const multer = require('multer')
const port = 3001;
const app = express();

// Set up multer configuration.
const storage = multer.memoryStorage()
const upload = multer({ storage })

// Load environment variable files.
require('dotenv').config()

app.use(express.json())

const ai_instance = new openai.OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const getResponse = async (comments) => {
  const completion = await ai_instance.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: process.env.SYSTEM_PROMPT
      },
      ...comments
    ],
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' }
  })

  return JSON.parse(completion.choices[0].message.content)
}

app.get("/hello", (req, res) => {
  res.send("Hello World!");
});

app.get('/api/audios', async (req, res) => {
  // Database operations to retrieve audio data.
  // LOGIC HERE.
  const ai_res = await getResponse([{
    role: 'user',
    content: 'Summarize the following transcript: This product does not do as it was advertised. I might consider filing a complaint and a lawsuit for false advertising.'
  }])

  if (ai_res) {
    return res.status(200).json({ summary: ai_res })
  } else {
    return res.status(500).json({ summary: "Unable to retrieve AI response. Please try again." })
  }

  // return res.status(200).json([
  //   {
  //     id: "audio-file1",
  //     name: "Introduction",
  //     transcription: "My name is Ruben, and I am a software engineer fellow at Headstarter.",
  //     summary: "Ruben is introducing himself as a software engineer.",
  //     comments: [
  //       {
  //         text: "It is good!",
  //         type: "positive",
  //         highlight: [0, 10]
  //       }
  //     ]
  //   },
  //   {
  //     id: "audio-file2",
  //     name: "Bad Sales Review",
  //     transcription: "This product does not do as it was advertised. I might consider filing a complaint and a lawsuit for false advertising.",
  //     summary: "The customer is not happy with the product and is planning to take legal action against the seller and the product maker.",
  //     comments: [
  //       {
  //         text: "It is a serious matter to attend to. You might want to consider pursuing appropriate legal action against them.",
  //         type: "negative",
  //         highlight: [10, 21]
  //       }
  //     ]
  //   },
  // ])
})

app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ summary: "There was no file uploaded!" })
  }

  // Database operations to upload the files or similar
  // to DynamoDB.
})

app.listen(port, () => {
  console.log(`You are listening to port ${port}!`)
})

module.exports.handler = serverless(app);