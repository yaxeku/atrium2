import { j as json } from './index-DgaSZy_D.js';
import { p as pool } from './config-uUQ8gdZy.js';
import 'pg';
import 'dotenv';

async function POST({ request }) {
  try {
    const { id, status, guild } = await request.json();
    if (!id || !status || !guild) {
      return json({ success: false, error: "Missing required parameters" }, { status: 400 });
    }
    const validStatuses = ["pending", "completed", "rejected"];
    if (!validStatuses.includes(status)) {
      return json({ success: false, error: "Invalid status" }, { status: 400 });
    }
    const result = await pool.query(
      `UPDATE CASHOUTS 
             SET status = $1
             WHERE id = $2 AND guild = $3
             RETURNING *`,
      [status, id, guild]
    );
    if (result.rowCount === 0) {
      return json({ success: false, error: "Cashout not found" }, { status: 404 });
    }
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
//# sourceMappingURL=_server.ts-Sx2KdFsP.js.map
