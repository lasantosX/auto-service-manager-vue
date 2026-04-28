import axios from 'axios'

export function getApiErrorMessage(error: unknown, fallbackMessage: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data

    if (data?.errors) {
      return Object.values(data.errors).flat().join(' ')
    }

    if (data?.message) {
      return data.message
    }

    if (data?.title) {
      return data.title
    }

    if (error.response?.status === 404) {
      return 'The requested resource was not found.'
    }

    if (error.response?.status === 400) {
      return 'The request was invalid. Please verify the form data.'
    }
  }

  return fallbackMessage
}
