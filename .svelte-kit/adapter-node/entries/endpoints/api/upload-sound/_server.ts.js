import { json } from "@sveltejs/kit";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
async function POST(event) {
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined. Please set it in your .env file.");
    return json({ error: "Internal server error: JWT secret not configured" }, { status: 500 });
  }
  try {
    const formData = await event.request.formData();
    const soundFile = formData.get("sound");
    const soundName = formData.get("name");
    const username = formData.get("username");
    const cookies = event.request.headers.get("cookie");
    if (!cookies) {
      return json({ error: "No authorization cookie provided" }, { status: 401 });
    }
    const authToken = cookies.split("; ").find((row) => row.startsWith("authToken="))?.split("=")[1];
    if (!authToken) {
      return json({ error: "No authorization token found in cookies" }, { status: 401 });
    }
    const decodedToken = jwt.verify(authToken, JWT_SECRET);
    if (decodedToken.userName !== username) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!soundFile || !soundName || !username) {
      return json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!soundFile.type.startsWith("audio/")) {
      return json({ error: "Invalid file type. Must be audio." }, { status: 400 });
    }
    const uploadsDir = path.join(process.cwd(), "static", "uploads", username);
    fs.mkdirSync(uploadsDir, { recursive: true });
    const existingFiles = fs.readdirSync(uploadsDir);
    for (const file of existingFiles) {
      if (file.endsWith(".mp3")) {
        fs.unlinkSync(path.join(uploadsDir, file));
      }
    }
    const randomName = crypto.randomBytes(16).toString("hex");
    const fileName = `${randomName}.mp3`;
    const arrayBuffer = await soundFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);
    const mappingPath = path.join(uploadsDir, "sound-mappings.json");
    const mappings = {
      [soundName]: fileName
    };
    fs.writeFileSync(mappingPath, JSON.stringify(mappings, null, 2));
    return json({
      success: true,
      message: "Sound uploaded successfully",
      fileName,
      displayName: soundName
    });
  } catch (error) {
    console.error("Error uploading sound:", error);
    return json({
      error: "Internal server error"
    }, { status: 500 });
  }
}
export {
  POST
};
