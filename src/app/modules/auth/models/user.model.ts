import { AuthModel } from "./auth.model";

export class UserModel extends AuthModel {
    userId?: number;
    isAuthenticated?: boolean;
    email?: string;
    roles?: string[];
    userFullName?: string;
    password?: string;







    setUser(user: any) {
        this.password = user.password || '';
      }
}