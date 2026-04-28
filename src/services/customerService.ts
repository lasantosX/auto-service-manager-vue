import httpClient from '@/api/httpClient'

export interface Customer {
  customerId: number
  firstName: string
  lastName: string
  email: string
  phone?: string
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

export async function getCustomers(): Promise<Customer[]> {
  const response = await httpClient.get<PagedResult<Customer>>('/Customers')
  return response.data.items
}
