import { redirect } from "@sveltejs/kit";
const load = async ({ cookies }) => {
  cookies.delete("authToken", { path: "/" });
  throw redirect(303, "/login");
};
export {
  load
};
