import { bndesFetch } from "./bndes.client"
import {
  BndesInstallmentRequest,
  BndesInstallmentResponse,
} from "./bndes.types"

export function fetchBndesInstallments(
  token: string,
  payload: BndesInstallmentRequest
): Promise<BndesInstallmentResponse> {
  return bndesFetch<BndesInstallmentResponse>(
    "/parcelamento", // endpoint do Postman
    token,
    payload
  )
}
