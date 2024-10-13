import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { serverGetRequest } from "@utils/api/serverSideRequests";

export async function middleware(req: NextRequest) {
  try {
    if (req.nextUrl.pathname.startsWith("/admin")) {
      const sid = req.cookies.get("__session")?.value;

      if (!sid && !req.nextUrl.pathname.includes("/login")) {
        const response = NextResponse.redirect(
          new URL("/admin/login", req.url)
        );
        response.cookies.delete("x-profile-data");
        return response;
      }

      const userInfo = await serverGetRequest("/api/auth/me", {
        next: {
          revalidate: 3600,
        },
      });

      const userInfoStringify = JSON.stringify(userInfo.payload);

      if (req.nextUrl.pathname.includes("/login")) {
        const response = NextResponse.redirect(new URL("/admin", req.nextUrl));
        response.cookies.set("x-profile-data", userInfoStringify, {
          httpOnly: true,
          secure: process.env.NEXT_PUBLIC_VERCEL_ENV === "production",
        });
        return response;
      } else {
        let response = NextResponse.next();
        response.cookies.set("x-profile-data", userInfoStringify, {
          httpOnly: true,
          secure: true,
        });

        return response;
      }
    }
  } catch (error) {
    if (!req.nextUrl.pathname.includes("/login")) {
      return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
    }

    const response = NextResponse.next();
    response.cookies.delete("x-profile-data");
    response.cookies.delete("__session");
    return response;
  }
}
