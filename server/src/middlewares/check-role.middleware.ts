import { AuthorizationError } from "../utils/error-handler";

export const checkRole =
  (role: string[]) => (req: any, res: any, next: any) => {
    if (!role.includes(req.user.role)) {
      throw new AuthorizationError("You are not authorized");
    }
    next();
  };
