import httpClient from '../api/httpClient'

export interface Technician {
  technicianId: number
  fullName: string
  email: string
  isActive: boolean
}

export interface CreateTechnicianRequest {
  fullName: string
  email: string
}

export interface UpdateTechnicianRequest {
  fullName: string
  email: string
  isActive: boolean
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

export async function getTechnicians(): Promise<Technician[]> {
  const response = await httpClient.get<PagedResult<Technician>>('/Technicians')
  return response.data.items
}

export async function createTechnician(technician: CreateTechnicianRequest): Promise<Technician> {
  const response = await httpClient.post<Technician>('/Technicians', technician)
  return response.data
}

export async function updateTechnician(
  technicianId: number,
  technician: UpdateTechnicianRequest,
): Promise<void> {
  await httpClient.put(`/Technicians/${technicianId}`, technician)
}

export async function deactivateTechnician(technicianId: number): Promise<void> {
  await httpClient.patch(`/Technicians/${technicianId}/deactivate`)
}
