import { ApiMethod, apiV1 } from "@/utils/api";
import { LoginResponse } from "./type";

export class AuthRepository {
    static login = async ({ email, password }: { email: string, password: string }): Promise<LoginResponse | undefined> => {
        try {
            const response = await apiV1<LoginResponse>({
                path: '/api/auth/login', method: ApiMethod.POST, body: {
                    email: email,
                    password: password,
                },
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            return response;
        } catch (e) {
            throw e;
        }
    }
}