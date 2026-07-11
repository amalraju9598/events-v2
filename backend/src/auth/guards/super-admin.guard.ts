import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserType } from '../../../generated/prisma';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || user.user_type !== UserType.super_admin) {
      throw new ForbiddenException('Access denied: Super Admin only.');
    }
    return true;
  }
}
