import { j as json } from './index-DgaSZy_D.js';
import { p as pool } from './config-uUQ8gdZy.js';
import 'pg';
import 'dotenv';

async function POST({ request }) {
  try {
    const { targID } = await request.json();
    const query = "DELETE FROM targets WHERE id = $1";
    await pool.query(query, [targID]);
    return json({ success: true });
  } catch (error) {
    console.error("Error deleting target:", error);
    return json({ success: false, error: "Failed to delete target" }, { status: 500 });
  }
}

export { POST };
//# sourceMappingURL=_server.ts-D6QdjIKf.js.map
