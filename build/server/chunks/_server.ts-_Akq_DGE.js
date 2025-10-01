import { j as json } from './index-DgaSZy_D.js';
import 'pg';
import { p as pool } from './config-uUQ8gdZy.js';
import 'dotenv';

async function GET({ url }) {
  try {
    const username = url.searchParams.get("username");
    if (!username) {
      return json({ error: "Username parameter is required" }, { status: 400 });
    }
    const query = "SELECT guild FROM admins WHERE username = $1";
    const result = await pool.query(query, [username]);
    if (result.rowCount === 0) {
      return json({ error: "Admin not found" }, { status: 404 });
    }
    return json({ guild: result.rows[0].guild });
  } catch (error) {
    console.error("Error fetching guild:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}

export { GET };
//# sourceMappingURL=_server.ts-_Akq_DGE.js.map
