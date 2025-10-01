import { p as pool } from "../../../../../chunks/config.js";
const POST = async ({ request }) => {
  try {
    const { targetid, page, captureddata } = await request.json();
    if (!targetid || !page || !captureddata) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }
    const query = `
            INSERT INTO captureddata (targetid, page, captureddata)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
    const values = [targetid, page, captureddata];
    const result = await pool.query(query, values);
    return new Response(JSON.stringify(result.rows[0]), {
      headers: { "Content-Type": "application/json" },
      status: 201
    });
  } catch (err) {
    console.error("Database error:", err);
    return new Response(JSON.stringify({ error: "Database error" }), { status: 500 });
  }
};
export {
  POST
};
