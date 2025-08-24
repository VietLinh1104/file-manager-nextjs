import { Meta } from "@/types/gen/Meta"
import { Data } from "@/types/gen/Data"

export interface MyBO {
  status: string;
  message: string;
  meta: Meta;
  data: Data[];
}