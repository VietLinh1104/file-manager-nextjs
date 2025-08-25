import api from "@/lib/axios"
import { AxiosResponse } from "axios"
import { DataResponse } from "@/types/dev-tool/data-response"

export interface PaginationParams {
  page?: number
  pageSize?: number
  [key: string]: unknown // cho phép thêm filter khác
}

/**
 * CrudService<T>
 * Generic service cho CRUD API
 */
export class CrudService<T> {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  // GET list with pagination
  async getAll(params: PaginationParams = {}): Promise<AxiosResponse<DataResponse<T>>> {
    return api.get<DataResponse<T>>(this.baseUrl, { params })
  }

  // GET by id
  async getById(id: string | number): Promise<AxiosResponse<T>> {
    return api.get<T>(`${this.baseUrl}/${id}`)
  }

  // CREATE
  async create(data: Partial<T>): Promise<AxiosResponse<T>> {
    return api.post<T>(this.baseUrl, data)
  }

  // UPDATE
  async update(id: string | number, data: Partial<T>): Promise<AxiosResponse<T>> {
    return api.put<T>(`${this.baseUrl}/${id}`, data)
  }

  // DELETE
  async delete(id: string | number): Promise<AxiosResponse<void>> {
    return api.delete<void>(`${this.baseUrl}/${id}`)
  }
}
