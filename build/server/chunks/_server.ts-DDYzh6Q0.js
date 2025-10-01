import { j as json } from './index-DgaSZy_D.js';
import { p as pool } from './config-uUQ8gdZy.js';
import 'pg';
import 'dotenv';

async function POST({ request }) {
  try {
    const { url, template, guild } = await request.json();
    if (!url || !template || !guild) {
      return json({ success: false, error: "Missing required fields" }, { status: 400 });
    }
    const query = `
            INSERT INTO GUILDDOMAINS (url, template, guild)
            VALUES ($1, $2, $3)
            RETURNING id`;
    const values = [url, template, guild];
    const result = await pool.query(query, values);
    const newDomainId = result.rows[0].id;
    return json({
      success: true,
      message: "Domain added successfully",
      domain: {
        ID: newDomainId,
        URL: url,
        Template: template,
        guild
      }
    });
  } catch (error) {
    console.error("Error adding domain:", error);
    return json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export { POST };
//# sourceMappingURL=_server.ts-DDYzh6Q0.js.map
