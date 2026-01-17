import { Roles } from '../enums/roles';

export interface LoginResponse {
  token: string;
  role: Roles;
}
