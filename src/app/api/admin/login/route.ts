import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (password === process.env.ADMIN_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin_auth", password, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
      sameSite: "strict",
    });
    return res;
  }

  return NextResponse.json({ ok: false }, { status: 401 });
}
