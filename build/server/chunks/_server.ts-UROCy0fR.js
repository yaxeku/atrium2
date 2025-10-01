import { j as json } from './index-DgaSZy_D.js';
import { p as pool } from './config-uUQ8gdZy.js';
import 'pg';
import 'dotenv';

async function GET({ url }) {
  const guild = url.searchParams.get("guild");
  if (!guild) {
    return json({ error: "Guild parameter is required" }, { status: 400 });
  }
  try {
    const domains = await pool.query(
      "SELECT * FROM GUILDDOMAINS WHERE guild = $1",
      [guild]
    );
    return json(domains.rows);
  } catch (error) {
    console.error("Database error:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}

export { GET };
//# sourceMappingURL=_server.ts-UROCy0fR.js.map
