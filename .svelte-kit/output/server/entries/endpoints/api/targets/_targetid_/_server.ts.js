import { json } from "@sveltejs/kit";
import { p as pool } from "../../../../../chunks/config.js";
async function GET({ params }) {
  const { targetid } = params;
  try {
    console.log(targetid);
    const result = await pool.query(
      "SELECT targetid, page, captureddata FROM captureddata WHERE targetid = $1",
      [targetid]
    );
    const capturedLogs = result.rows.map((row) => ({
      targetid: row.targetid,
      page: row.page,
      captureddata: row.captureddata
    }));
    return json(capturedLogs);
  } catch (err) {
    console.error("Database query error:", err);
    return json({ error: "Failed to fetch captured data" }, { status: 500 });
  }
}
export {
  GET
};
