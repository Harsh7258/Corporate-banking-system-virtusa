// src/app/core/models/user.model.ts
import { Roles } from '../enums/roles';

export interface User {
  id: string;
  username: string;
  email: string;
  role: Roles;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
