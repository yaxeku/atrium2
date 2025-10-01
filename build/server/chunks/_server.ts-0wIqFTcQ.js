import { j as json } from './index-DgaSZy_D.js';
import { p as pool } from './config-uUQ8gdZy.js';
import 'pg';
import 'dotenv';

async function POST({ request }) {
  try {
    const { guild, setting, value } = await request.json();
    if (!guild || setting === void 0 || value === void 0) {
      return json({ success: false, error: "Missing required parameters" }, { status: 400 });
    }
    console.log("Received request:", { guild, setting, value });
    if (setting === "displaySeeds") {
      console.log("Executing query with values:", { guild, hideseed: !value });
      const updateResult = await pool.query(
        `UPDATE GUILDSETTINGS 
                 SET hideseed = $2 
                 WHERE guild = $1
                 RETURNING *`,
        [guild, !value]
      );
      if (updateResult.rowCount === 0) {
        const insertResult = await pool.query(
          `INSERT INTO GUILDSETTINGS (guild, hideseed)
                     VALUES ($1, $2)
                     RETURNING *`,
          [guild, !value]
        );
        console.log("Inserted new row:", insertResult.rows[0]);
      } else {
        console.log("Updated existing row:", updateResult.rows[0]);
      }
    } else if (setting === "telegram") {
      const { token, chatId } = value;
      const updateResult = await pool.query(
        `UPDATE GUILDSETTINGS
                 SET telegram_bot_token = $2, telegram_chat_id = $3
                 WHERE guild = $1
                 RETURNING *`,
        [guild, token, chatId]
      );
      if (updateResult.rowCount === 0) {
        await pool.query(
          `INSERT INTO GUILDSETTINGS (guild, telegram_bot_token, telegram_chat_id)
                     VALUES ($1, $2, $3)`,
          [guild, token, chatId]
        );
      }
    }
    return json({ success: true });
  } catch (err) {
    const error = err;
    console.error("Detailed error:", {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    return json({
      success: false,
      error: "Internal server error",
      detail: error.message
    }, { status: 500 });
  }
}

export { POST };
//# sourceMappingURL=_server.ts-0wIqFTcQ.js.map
