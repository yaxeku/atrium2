import { j as json } from './index-DgaSZy_D.js';
import { p as pool } from './config-uUQ8gdZy.js';
import 'pg';
import 'dotenv';

async function POST({ request }) {
  try {
    const { username, amount, totalAmount, percentage_cut, date_registered, status, guild } = await request.json();
    if (!username || !amount || !totalAmount || !percentage_cut || !date_registered || !guild) {
      return json({ success: false, error: "Missing required parameters" }, { status: 400 });
    }
    const result = await pool.query(
      `INSERT INTO CASHOUTS (username, amount, percentage_cut, date_registered, status, guild)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
      [username, amount, percentage_cut, date_registered, status || "pending", guild]
    );
    return json({
      success: true,
      cashout: result.rows[0]
    });
  } catch (err) {
    console.error("Database error:", err);
    return json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export { POST };
//# sourceMappingURL=_server.ts-CjbYY3Yg.js.map
