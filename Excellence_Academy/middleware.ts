import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

type Role = keyof typeof roleBasedPrivateRoutes;

const authRoutes = ["/login", "/register"];

const roleBasedPrivateRoutes = {
  ADMIN: [/^\/dashboard\/admin/],
  STUDENT: [/^\/dashboard\/student/],
  TEACHER: [/^\/dashboard\/teacher/],
};

const roleDashboardPaths = {
  ADMIN: "/dashboard/admin",
  STUDENT: "/dashboard/student",
  TEACHER: "/dashboard/teacher",
};

interface DecodedToken {
  id: string;
  email: string;
  role?: Role;
  exp?: number;
  iat?: number;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get(
    "bf_access_token"
  )?.value;
console.log(accessToken)
  console.log("Access Token:", accessToken);

let userInfo: DecodedToken | null = null;

if (accessToken) {
  try {
    userInfo = jwtDecode<DecodedToken>(accessToken);
  } catch (error) {
    console.log("Decode Error:", error);
  }
}

console.log("FINAL USER:", userInfo);

  // login/register
  if (authRoutes.includes(pathname)) {
    if (userInfo?.role) {
      return NextResponse.redirect(
        new URL(
          roleDashboardPaths[userInfo.role],
          request.url
        )
      );
    }

    return NextResponse.next();
  }


  // dashboard protection
  if (
    pathname.startsWith("/dashboard") &&
    !userInfo
  ) {
    return NextResponse.redirect(
      new URL(
        `/login?redirectPath=${pathname}`,
        request.url
      )
    );
  }


  // /dashboard redirect
  if (
    pathname === "/dashboard" &&
    userInfo?.role
  ) {
    return NextResponse.redirect(
      new URL(
        roleDashboardPaths[userInfo.role],
        request.url
      )
    );
  }


  // role protection
  if (userInfo?.role) {
    const allowedRoutes =
      roleBasedPrivateRoutes[userInfo.role];

    if (
      allowedRoutes.some((route) =>
        route.test(pathname)
      )
    ) {
      return NextResponse.next();
    }

    return NextResponse.redirect(
      new URL(
        roleDashboardPaths[userInfo.role],
        request.url
      )
    );
  }


  return NextResponse.next();
}


export const config = {
  matcher: [
    "/login",
    "/register",
    "/dashboard",
    "/dashboard/:path*",
  ],
};