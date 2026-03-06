import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL("/admin/login", request.url);
  const res = NextResponse.redirect(url);
  res.cookies.delete("admin_auth");
  return res;
}
