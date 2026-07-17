import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

// Backend sends uppercase roles: ADMIN, TEACHER, STUDENT
type BackendRole = "ADMIN" | "TEACHER" | "STUDENT";
// Frontend uses lowercase roles: admin, teacher, student
type FrontendRole = "admin" | "teacher" | "student";

const authRoutes = ["/login", "/register"];

const roleBasedPrivateRoutes: Record<BackendRole, RegExp[]> = {
  ADMIN: [/^\/dashboard\/admin/],
  STUDENT: [/^\/dashboard\/student/],
  TEACHER: [/^\/dashboard\/teacher/],
};

const roleDashboardPaths: Record<BackendRole, string> = {
  ADMIN: "/dashboard/admin",
  STUDENT: "/dashboard/student",
  TEACHER: "/dashboard/teacher",
};

interface DecodedToken {
  id: string;
  email: string;
  role?: BackendRole; // Changed from FrontendRole to BackendRole
  exp?: number;
  iat?: number;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get(
    "bf_access_token"
  )?.value;

  console.log("=== MIDDLEWARE DEBUG ===");
  console.log("Path:", pathname);
  console.log("Access Token:", accessToken);

  let userInfo: DecodedToken | null = null;

  if (accessToken) {
    try {
      userInfo = jwtDecode<DecodedToken>(accessToken);
      console.log("Decoded Token:", userInfo);
    } catch (error) {
      console.log("Decode Error:", error);
    }
  }

  console.log("FINAL USER ROLE:", userInfo?.role);
  console.log("========================");

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
      console.log("✅ Access granted to:", pathname);
      return NextResponse.next();
    }

    console.log("❌ Access denied. User role:", userInfo.role, "Path:", pathname);
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