const express = require("express");
const serverless = require("serverless-http");
const openai = require("openai");
const multer = require("multer");
const AWS = require("aws-sdk");
const path = require("path");
const os = require("os");
const fs = require("fs");
const cors = require('cors');
const port = 3001;
const app = express();

// Set up multer configuration.
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Configure the region in which the instance is hosted at.
AWS.config.update({
  region: "us-east-2",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
});

// Set up DynanoDB client.
const dynamoDBClient = new AWS.DynamoDB.DocumentClient();

// Load environment variable files.
require("dotenv").config();

app.use(express.json());
app.use(cors())

const ai_instance = new openai.OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getResponse = async (comments) => {
  const completion = await ai_instance.chat.completions.create({
    messages: [
      {
        role: "system",
        content: process.env.SYSTEM_PROMPT,
      },
      ...comments,
    ],
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
  });

  return JSON.parse(completion.choices[0].message.content);
};

const getAudioTranscription = async (file_path) => {
  const audio_transcription = await ai_instance.audio.transcriptions.create({
    file: fs.createReadStream(file_path),
    model: "whisper-1",
    language: "en",
  });

  return audio_transcription.text;
};

// DynamoDB operations.
// ================================================
// Insert record into table.
const insertRecord = async (record) => {
  const params = {
    TableName: "User_Comments",
    Item: record,
  };

  console.log(params)

  return dynamoDBClient.put(params).promise();
};

// Retrieve record from table storing user comments about
// a transcript, as well as other information, such as
// which portions of text should be highlighted as key
// points.
const retrieveRecord = async () => {
  const params = {
    TableName: "User_Comments",
  };

  return (await dynamoDBClient.scan(params).promise()).Items;
};

// Retrieve a specific sales transcript from the DynamoDB
// table.
const retrieveIDRecord = async (audio_id) => {
  const params = {
    TableName: 'User_Comments',
    Key: `${audio_id}`
  };

  return dynamoDBClient.get(params).promise()
}
// ================================================

app.get("/hello", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/audios", async (req, res) => {
  // Database operations to retrieve audio data.
  // LOGIC HERE.
  try {
    // const prom = await insertRecord(ai_res, dynamoDBClient)
    const retrieve_data = await retrieveRecord();

    if (retrieve_data) {
      return res.status(200).json(retrieve_data);
    } else {
      return res
        .status(500)
        .json({ summary: "Unable to retrieve AI response. Please try again." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ summary: "Unable to run route." });
  }
});

app.post("/api/audios/:audioID/summary", async (req, res) => {
  const id = await req.params.audioID

  try {
    const retrieve_ID_record = await retrieveIDRecord(id)
    
    if (retrieve_ID_record) {
      return res.status(200).json(retrieve_ID_record)
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ summary: "Unable to retrieve transcript record." })
  }
})

app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ summary: "There was no file uploaded!" });
  }

  try {
    // Create a buffer instance to store the temporary audio
    // file in when feeding it to the OpenAI Whisper API.
    const fileBuffer = req.file.buffer;

    // Temporarily create a new file and save it in memory.
    const tempFilePath = path.join(
      os.tmpdir(),
      "uploaded_transcript_audio.m4a"
    );
    fs.writeFileSync(tempFilePath, fileBuffer);

    const transcribed_text = await getAudioTranscription(tempFilePath);

    const ai_res = await getResponse([
      {
        role: "user",
        content: `Summarize the following transcript: ${transcribed_text}`,
      },
    ]);

    const insert_res = await insertRecord(ai_res)
    console.log(insert_res)

    res.status(200).json(ai_res);
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ message: "Failed to transcribe audio. Please try again." });
  }
});

app.listen(port, () => {
  console.log(`You are listening to port ${port}!`);
});

module.exports.handler = serverless(app);
