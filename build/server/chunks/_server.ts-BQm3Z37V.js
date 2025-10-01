import { j as json } from './index-DgaSZy_D.js';
import { p as pool } from './config-uUQ8gdZy.js';
import 'pg';
import 'dotenv';

async function GET({ url }) {
  const guild = url.searchParams.get("guild");
  const username = url.searchParams.get("username");
  if (!guild || !username) {
    return json({ success: false, error: "Guild and username parameters are required" }, { status: 400 });
  }
  try {
    const result = await pool.query(
      "SELECT * FROM CASHOUTS WHERE guild = $1 AND username = $2 ORDER BY id DESC",
      [guild, username]
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
//# sourceMappingURL=_server.ts-BQm3Z37V.js.map
