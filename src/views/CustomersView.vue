<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  type Customer,
  type CreateCustomerRequest,
} from '../services/customerService'

const customers = ref<Customer[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const editingCustomerId = ref<number | null>(null)

const form = ref<CreateCustomerRequest>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
})

async function loadCustomers() {
  try {
    isLoading.value = true
    errorMessage.value = ''
    customers.value = await getCustomers()
  } catch (error) {
    console.error('Customer API error:', error)
    errorMessage.value = 'Unable to load customers. Please verify the API is running.'
  } finally {
    isLoading.value = false
  }
}

function resetForm() {
  editingCustomerId.value = null
  form.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  }
}

function startEdit(customer: Customer) {
  editingCustomerId.value = customer.customerId
  form.value = {
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phone: customer.phone || '',
  }

  successMessage.value = ''
  errorMessage.value = ''
}

async function handleSubmitCustomer() {
  try {
    isSaving.value = true
    errorMessage.value = ''
    successMessage.value = ''

    if (editingCustomerId.value) {
      await updateCustomer(editingCustomerId.value, {
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        email: form.value.email,
        phone: form.value.phone || undefined,
      })

      successMessage.value = 'Customer updated successfully.'
    } else {
      await createCustomer({
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        email: form.value.email,
        phone: form.value.phone || undefined,
      })

      successMessage.value = 'Customer created successfully.'
    }

    resetForm()
    await loadCustomers()
  } catch (error) {
    console.error('Save customer error:', error)
    errorMessage.value = 'Unable to save customer. Please verify the form data and API.'
  } finally {
    isSaving.value = false
  }
}

async function handleDeleteCustomer(customer: Customer) {
  const confirmed = window.confirm(
    `Are you sure you want to delete ${customer.firstName} ${customer.lastName}?`,
  )

  if (!confirmed) {
    return
  }

  try {
    errorMessage.value = ''
    successMessage.value = ''

    await deleteCustomer(customer.customerId)

    successMessage.value = 'Customer deleted successfully.'
    await loadCustomers()

    if (editingCustomerId.value === customer.customerId) {
      resetForm()
    }
  } catch (error) {
    console.error('Delete customer error:', error)
    errorMessage.value = 'Unable to delete customer. Please verify the API.'
  }
}

onMounted(loadCustomers)
</script>

<template>
  <section>
    <div class="page-header">
      <div>
        <h2>Customers</h2>
        <p>Customer records loaded from the AutoService Manager API.</p>
      </div>

      <button @click="loadCustomers">Refresh</button>
    </div>

    <form class="form-card" @submit.prevent="handleSubmitCustomer">
      <div class="form-title">
        <h3>{{ editingCustomerId ? 'Edit Customer' : 'Add Customer' }}</h3>

        <button v-if="editingCustomerId" type="button" class="secondary-button" @click="resetForm">
          Cancel Edit
        </button>
      </div>

      <div class="form-grid">
        <input v-model="form.firstName" type="text" placeholder="First name" required />
        <input v-model="form.lastName" type="text" placeholder="Last name" required />
        <input v-model="form.email" type="email" placeholder="Email" required />
        <input v-model="form.phone" type="text" placeholder="Phone" />
      </div>

      <button type="submit" :disabled="isSaving">
        {{ isSaving ? 'Saving...' : editingCustomerId ? 'Update Customer' : 'Create Customer' }}
      </button>
    </form>

    <div v-if="successMessage" class="success-card">
      {{ successMessage }}
    </div>

    <div v-if="isLoading" class="status-card">Loading customers...</div>

    <div v-else-if="errorMessage" class="error-card">
      {{ errorMessage }}
    </div>

    <div v-else class="table-card">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th class="actions-column">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="customer in customers" :key="customer.customerId">
            <td>{{ customer.firstName }} {{ customer.lastName }}</td>
            <td>{{ customer.email }}</td>
            <td>{{ customer.phone || '-' }}</td>
            <td class="actions">
              <button type="button" class="secondary-button" @click="startEdit(customer)">
                Edit
              </button>

              <button type="button" class="danger-button" @click="handleDeleteCustomer(customer)">
                Delete
              </button>
            </td>
          </tr>

          <tr v-if="customers.length === 0">
            <td colspan="4" class="empty">No customers found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

h2 {
  font-size: 32px;
  margin: 0 0 8px;
}

p {
  color: #6b7280;
  margin: 0;
}

button {
  background: #2563eb;
  color: white;
  border: 0;
  border-radius: 10px;
  padding: 10px 16px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.secondary-button {
  background: #e5e7eb;
  color: #111827;
}

.danger-button {
  background: #dc2626;
  color: white;
}

.form-card,
.table-card,
.status-card,
.error-card,
.success-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

.form-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.form-title h3 {
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

input {
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 11px 12px;
  outline: none;
}

input:focus {
  border-color: #2563eb;
}

.error-card {
  color: #b91c1c;
}

.success-card {
  color: #166534;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: left;
  padding: 14px 12px;
  border-bottom: 1px solid #e5e7eb;
}

th {
  color: #374151;
  font-size: 14px;
}

.actions-column {
  width: 180px;
}

.actions {
  display: flex;
  gap: 8px;
}

.empty {
  text-align: center;
  color: #6b7280;
}
</style>
