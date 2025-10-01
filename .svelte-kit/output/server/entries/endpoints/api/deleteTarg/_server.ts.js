import { json } from "@sveltejs/kit";
import { p as pool } from "../../../../chunks/config.js";
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
export {
  POST
};
