import { Role } from "../../generated/prisma";

export type IAuthUser = {
    id:string,
    email:string,
    role: Role
} | null