import { j as json } from './index-DgaSZy_D.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { p as pool } from './config-uUQ8gdZy.js';
import 'pg';

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET;
async function POST({ request, cookies }) {
  if (!SECRET_KEY) {
    console.error("JWT_SECRET is not defined. Please set it in your .env file.");
    return json({ success: false, error: "Internal server error: JWT secret not configured" }, { status: 500 });
  }
  try {
    const { userName, passWord } = await request.json();
    const query = "SELECT password FROM admins WHERE username = $1";
    const values = [userName];
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return json({ success: false, error: "Invalid username or password" }, { status: 401 });
    }
    const dbPassword = result.rows[0].password;
    console.log("Password received from user:", passWord);
    console.log("Hashed password from database:", dbPassword);
    const passwordMatch = await bcrypt.compare(passWord, dbPassword);
    console.log("Password match result:", passwordMatch);
    if (!passwordMatch) {
      return json({ success: false, error: "Invalid username or password" }, { status: 401 });
    }
    const token = jwt.sign({ userName }, SECRET_KEY, { expiresIn: "1h" });
    cookies.set("authTokenAdmin", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 3600,
      path: "/"
    });
    return json({ success: true, token });
  } catch (error) {
    console.error("Error during authentication:", error);
    return json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export { POST };
//# sourceMappingURL=_server.ts-CUb6qedL.js.map
