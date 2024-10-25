import { User } from "@/types/user"

export type LoginResponse = {
    message?: string,
    user?: User,
    token?: string,
  }