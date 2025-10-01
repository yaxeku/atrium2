import { j as json } from './index-DgaSZy_D.js';
import { p as pool } from './config-uUQ8gdZy.js';
import 'pg';
import 'dotenv';

async function POST({ request }) {
  try {
    const { guild, url } = await request.json();
    if (!guild || !url) {
      return json({ success: false, error: "Missing guild or url" }, { status: 400 });
    }
    const query = `
            DELETE FROM GUILDDOMAINS 
            WHERE guild = $1 AND url = $2 
            RETURNING *`;
    const values = [guild, url];
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return json({ success: false, error: "Domain not found" }, { status: 404 });
    }
    return json({
      success: true,
      message: "Domain removed successfully",
      domain: result.rows[0]
    });
  } catch (error) {
    console.error("Error removing domain:", error);
    return json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export { POST };
//# sourceMappingURL=_server.ts-DVwij8KU.js.map
