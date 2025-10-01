import { j as json } from './index-DgaSZy_D.js';
import { p as pool } from './config-uUQ8gdZy.js';
import 'pg';
import 'dotenv';

async function POST({ request }) {
  try {
    const { username } = await request.json();
    if (!username) {
      return json({ success: false, error: "Username is required" }, { status: 400 });
    }
    const query = `
            SELECT starting_page 
            FROM USERS 
            WHERE username = $1
        `;
    const result = await pool.query(query, [username]);
    if (result.rows.length === 0) {
      return json({ success: false, error: "User not found" }, { status: 404 });
    }
    return json({
      success: true,
      starting_page: result.rows[0].starting_page
    });
  } catch (err) {
    console.error("Database error:", err);
    return json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export { POST };
//# sourceMappingURL=_server.ts-5kQdTaix.js.map
