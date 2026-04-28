import httpClient from '../api/httpClient'

export interface ServiceOrderOperation {
  serviceOrderOperationId: number
  serviceOrderId: number
  technicianId: number
  opCode: string
  description: string
  laborHours: number
  laborRate: number
  laborAmount: number
  status: number
}

export interface CreateOperationRequest {
  technicianId: number
  opCode: string
  description: string
  laborHours: number
  laborRate: number
}

export interface UpdateOperationRequest {
  technicianId: number
  opCode: string
  description: string
  laborHours: number
  laborRate: number
  status: number
}

interface PagedResult<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export async function getOperationsByServiceOrder(
  serviceOrderId: number,
): Promise<ServiceOrderOperation[]> {
  const response = await httpClient.get<PagedResult<ServiceOrderOperation>>(
    `/service-orders/${serviceOrderId}/operations`,
  )

  return response.data.items
}

export async function createOperation(
  serviceOrderId: number,
  operation: CreateOperationRequest,
): Promise<ServiceOrderOperation> {
  const response = await httpClient.post<ServiceOrderOperation>(
    `/service-orders/${serviceOrderId}/operations`,
    operation,
  )

  return response.data
}

export async function updateOperation(
  operationId: number,
  operation: UpdateOperationRequest,
): Promise<void> {
  await httpClient.put(`/operations/${operationId}`, operation)
}

export async function deleteOperation(operationId: number): Promise<void> {
  await httpClient.delete(`/operations/${operationId}`)
}
