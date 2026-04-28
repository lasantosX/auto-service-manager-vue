import httpClient from '../api/httpClient'

export interface ServiceOrder {
  serviceOrderId: number
  vehicleId: number
  orderNumber: string
  status: number
  openedAtUtc: string
  closedAtUtc?: string | null
  totalLaborAmount: number
  totalPartsAmount: number
  totalAmount: number
}

export interface CreateServiceOrderRequest {
  vehicleId: number
}

export interface UpdateServiceOrderStatusRequest {
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

export async function getServiceOrders(): Promise<ServiceOrder[]> {
  const response = await httpClient.get<PagedResult<ServiceOrder>>('/ServiceOrders')
  return response.data.items
}

export async function createServiceOrder(
  serviceOrder: CreateServiceOrderRequest,
): Promise<ServiceOrder> {
  const response = await httpClient.post<ServiceOrder>('/ServiceOrders', serviceOrder)
  return response.data
}

export async function updateServiceOrderStatus(
  serviceOrderId: number,
  request: UpdateServiceOrderStatusRequest,
): Promise<void> {
  await httpClient.put(`/ServiceOrders/${serviceOrderId}/status`, request)
}

export async function closeServiceOrder(serviceOrderId: number): Promise<void> {
  await httpClient.post(`/ServiceOrders/${serviceOrderId}/close`)
}
