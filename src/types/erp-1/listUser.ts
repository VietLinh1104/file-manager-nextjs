import { meta } from "@/types/erp-1/meta"
import { User } from "@/types/erp-1/User"

export interface listUser {
  status: string;
  message: string;
  meta: meta;
  data: User;
}