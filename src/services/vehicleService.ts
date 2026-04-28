import httpClient from '../api/httpClient'

export interface Vehicle {
  vehicleId: number
  customerId: number
  vin: string
  make: string
  model: string
  year: number
  plateNumber?: string
  unitNumber?: string
}

export interface CreateVehicleRequest {
  customerId: number
  vin: string
  make: string
  model: string
  year: number
  plateNumber?: string
  unitNumber?: string
}

export interface UpdateVehicleRequest {
  customerId: number
  vin: string
  make: string
  model: string
  year: number
  plateNumber?: string
  unitNumber?: string
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

export async function getVehiclesByCustomer(customerId: number): Promise<Vehicle[]> {
  const response = await httpClient.get<PagedResult<Vehicle>>(`/customers/${customerId}/vehicles`)

  return response.data.items
}

export async function createVehicle(vehicle: CreateVehicleRequest): Promise<Vehicle> {
  const response = await httpClient.post<Vehicle>(
    `/customers/${vehicle.customerId}/vehicles`,
    vehicle,
  )

  return response.data
}

export async function updateVehicle(
  vehicleId: number,
  vehicle: UpdateVehicleRequest,
): Promise<void> {
  await httpClient.put(`/vehicles/${vehicleId}`, vehicle)
}

export async function deleteVehicle(vehicleId: number): Promise<void> {
  await httpClient.delete(`/vehicles/${vehicleId}`)
}
