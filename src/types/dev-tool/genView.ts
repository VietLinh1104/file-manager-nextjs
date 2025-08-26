export type ViewType = "table" | "input"

export interface ViewConfig {
  id: number
  name: string
  type: ViewType
  apiEndpoint: string
  dataTypeId: number
  fieldMappings: FieldMapping[]
  createdAt: string
}

export interface FieldMapping {
  fieldId: number
  fieldName: string
  label: string
  component?: string   // ví dụ: "text", "select", "date" (nếu là input)
  visible?: boolean
}
