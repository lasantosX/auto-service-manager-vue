import httpClient from '../api/httpClient'

export interface Customer {
  customerId: number
  firstName: string
  lastName: string
  email: string
  phone?: string
}

export interface CreateCustomerRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
}

export interface UpdateCustomerRequest {
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

export async function createCustomer(customer: CreateCustomerRequest): Promise<Customer> {
  const response = await httpClient.post<Customer>('/Customers', customer)
  return response.data
}

export async function updateCustomer(
  customerId: number,
  customer: UpdateCustomerRequest,
): Promise<void> {
  await httpClient.put(`/Customers/${customerId}`, customer)
}

export async function deleteCustomer(customerId: number): Promise<void> {
  await httpClient.delete(`/Customers/${customerId}`)
}
