import { j as json } from './index-DgaSZy_D.js';
import { p as pool } from './config-uUQ8gdZy.js';
import 'pg';
import 'dotenv';

async function GET({ url }) {
  const guild = url.searchParams.get("guild");
  if (!guild) {
    return json({ success: false, error: "Guild parameter is required" }, { status: 400 });
  }
  try {
    const result = await pool.query(
      "SELECT * FROM CASHOUTS WHERE guild = $1 ORDER BY id DESC",
      [guild]
    );
    return json({
      success: true,
      cashouts: result.rows
    });
  } catch (err) {
    console.error("Database error:", err);
    return json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export { GET };
//# sourceMappingURL=_server.ts-DqV_zUAv.js.map
