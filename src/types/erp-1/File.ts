import { User } from "@/types/erp-1/User"

export interface File {
  name?: string;
  path?: string;
  size?: number;
  test?: boolean;
  date?: Date;
  checkbox?: boolean;
  user?: User;
}