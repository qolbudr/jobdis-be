import { ApiMethod, apiV1 } from "@/utils/api";
import { User } from "@/types/user";

export class UserRepository {
    static getAll = async (): Promise<Array<User> | undefined> => {
        try {
            const response = await apiV1<Array<User>>({
                path: '/api/users', method: ApiMethod.GET,
            })

            return response;
        } catch (e) {
            throw e;
        }
    }

    static createUser = async (): Promise<User | undefined> => {
        try {
            const response = await apiV1<User>({
                path: '/api/user', method: ApiMethod.POST,
            })

            return response;
        } catch (e) {
            throw e;
        }
    }
}