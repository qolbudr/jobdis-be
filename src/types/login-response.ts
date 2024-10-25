import { User } from "./user";

export type LoginResponse = {
    message?: string,
    user?: User,
    token?: string,
  }