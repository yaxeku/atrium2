import { j as json } from './index-DgaSZy_D.js';
import { p as pool } from './config-uUQ8gdZy.js';
import 'pg';
import 'dotenv';

async function POST({ request }) {
  try {
    const { id, guild } = await request.json();
    if (!id || !guild) {
      return json({ success: false, error: "Missing required parameters" }, { status: 400 });
    }
    const result = await pool.query(
      "DELETE FROM CASHOUTS WHERE id = $1 AND guild = $2",
      [id, guild]
    );
    if (result.rowCount === 0) {
      return json({ success: false, error: "Cashout not found" }, { status: 404 });
    }
    return json({ success: true });
  } catch (err) {
    console.error("Database error:", err);
    return json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export { POST };
//# sourceMappingURL=_server.ts-ChivvmPs.js.map
