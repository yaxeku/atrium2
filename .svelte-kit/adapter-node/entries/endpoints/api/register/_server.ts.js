import { json } from "@sveltejs/kit";
import { p as pool } from "../../../../chunks/config.js";
import bcrypt from "bcrypt";
const saltRounds = 10;
async function POST({ request }) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return json({ success: false, error: "Missing required parameters" }, { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await pool.query(
      `INSERT INTO users (username, password)
             VALUES ($1, $2)`,
      [username, hashedPassword]
    );
    return json({ success: true });
  } catch (err) {
    const error = err;
    console.error("Detailed error:", {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    return json({
      success: false,
      error: "Internal server error",
      detail: error.message
    }, { status: 500 });
  }
}
export {
  POST
};
