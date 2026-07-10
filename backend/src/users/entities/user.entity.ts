import { UserType } from '../../../generated/prisma';

export class User {
  id: string;
  name: string;
  email: string;
  mobile: string | null;
  password: string;
  username: string | null;
  user_type: UserType;
  email_verified_at: Date | null;
  phone_verified_at: Date | null;
  created_at: Date;
  updated_at: Date;
}
