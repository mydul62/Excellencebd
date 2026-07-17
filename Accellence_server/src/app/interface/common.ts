import { Role } from "@prisma/client";

export type IAuthUser = {
    id:string,
    email:string,
    role: Role
} | null