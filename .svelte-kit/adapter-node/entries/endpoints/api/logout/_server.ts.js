import { json } from "@sveltejs/kit";
async function POST({ cookies }) {
  cookies.delete("authToken", { path: "/" });
  cookies.delete("authTokenAdmin", { path: "/" });
  return json({ success: true });
}
export {
  POST
};
