// Auto-generated API service for acc
import { CrudService } from "@/services/dev-tool/api/crud.service"
import { User } from "@/types/erp-1/User"

export const accService = new CrudService<User>("acc")


// Extra custom methods
import api from "@/lib/axios"
import { AxiosResponse } from "axios"

export class AccExtraService extends CrudService<User> {
  async acNum(): Promise<AxiosResponse<number[]>> {
    return api.get<number[]>(`acc/acNum`, {})
  }
}

export const accExtraService = new AccExtraService("acc")
