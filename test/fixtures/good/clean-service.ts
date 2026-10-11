import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['admin', 'user'])
});

export type User = z.infer<typeof UserSchema>;

export class UserService {
  public static validateUser(input: unknown): User {
    return UserSchema.parse(input);
  }

  public static formatDisplayName(user: User): string {
    return `${user.email} (${user.role.toUpperCase()})`;
  }
}
