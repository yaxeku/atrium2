import { json } from "@sveltejs/kit";
import { p as pool } from "../../../../../chunks/config.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
async function POST({ request }) {
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined. Please set it in your .env file.");
    return json({ success: false, error: "Internal server error: JWT secret not configured" }, { status: 500 });
  }
  try {
    const { username, userid, password, rank, starting_page, guild } = await request.json();
    const cookies = request.headers.get("cookie");
    if (!cookies) {
      return json({ error: "No authorization cookie provided" }, { status: 401 });
    }
    const authToken = cookies.split("; ").find((row) => row.startsWith("authTokenAdmin="))?.split("=")[1];
    if (!authToken) {
      return json({ error: "No authorization token found in cookies" }, { status: 401 });
    }
    let decodedToken;
    try {
      decodedToken = jwt.verify(authToken, JWT_SECRET);
    } catch (err) {
      return json({ error: "Invalid or expired authorization token" }, { status: 401 });
    }
    if (!username || !userid || !password || !rank || !starting_page || !guild) {
      return json({ success: false, error: "Missing required parameters" }, { status: 400 });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const query = `
            INSERT INTO USERS (username, userid, password, rank, starting_page, guild)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
    const result = await pool.query(query, [username, userid, hashedPassword, rank, starting_page, guild]);
    return json({
      success: true,
      user: result.rows[0]
    });
  } catch (err) {
    console.error("Database error:", err);
    return json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
export {
  POST
};
