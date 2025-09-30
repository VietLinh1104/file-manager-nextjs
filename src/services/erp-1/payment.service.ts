// services/payment.service.ts
import api from "@/lib/axios"
import { DataResponse } from "@/types/dev-tool/data-response"
import { AxiosResponse } from "axios"

export async function getPayments<T>(
  page = 1,
  pageSize = 5
): Promise<AxiosResponse<DataResponse<T>>> {
  return api.get<DataResponse<T>>("/api/erp-1/payments", {
    params: { page, pageSize },
  })
}
