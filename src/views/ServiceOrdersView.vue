<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  getServiceOrders,
  createServiceOrder,
  updateServiceOrderStatus,
  closeServiceOrder,
  type ServiceOrder,
  type CreateServiceOrderRequest,
} from '../services/serviceOrderService'

const serviceOrders = ref<ServiceOrder[]>([])
const searchText = ref('')
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const editingServiceOrderId = ref<number | null>(null)

const form = ref<CreateServiceOrderRequest>({
  vehicleId: 1,
})

const statusForm = ref({
  status: 1,
})

const filteredServiceOrders = computed(() => {
  const term = searchText.value.trim().toLowerCase()

  if (!term) {
    return serviceOrders.value
  }

  return serviceOrders.value.filter((order) => {
    const text = [
      order.serviceOrderId.toString(),
      order.vehicleId.toString(),
      order.orderNumber,
      getStatusLabel(order.status),
      formatCurrency(order.totalAmount),
    ]
      .join(' ')
      .toLowerCase()

    return text.includes(term)
  })
})

function getStatusLabel(status: number): string {
  const statuses: Record<number, string> = {
    1: 'Open',
    2: 'In Progress',
    3: 'Completed',
    4: 'Closed',
  }

  return statuses[status] ?? `Status ${status}`
}

function getStatusClass(status: number): string {
  if (status === 4) {
    return 'status-closed'
  }

  if (status === 3) {
    return 'status-completed'
  }

  if (status === 2) {
    return 'status-progress'
  }

  return 'status-open'
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

function formatDate(value?: string | null): string {
  if (!value) {
    return '-'
  }

  return new Date(value).toLocaleString()
}

async function loadServiceOrders() {
  try {
    isLoading.value = true
    errorMessage.value = ''
    serviceOrders.value = await getServiceOrders()
  } catch (error) {
    console.error('Service Order API error:', error)
    errorMessage.value = 'Unable to load service orders. Please verify the API is running.'
  } finally {
    isLoading.value = false
  }
}

function clearMessages() {
  successMessage.value = ''
  errorMessage.value = ''
}

function resetForm() {
  form.value = {
    vehicleId: 1,
  }
}

function startStatusEdit(order: ServiceOrder) {
  editingServiceOrderId.value = order.serviceOrderId

  statusForm.value = {
    status: order.status === 1 ? 2 : order.status,
  }

  clearMessages()
}

function cancelStatusEdit() {
  editingServiceOrderId.value = null
  statusForm.value = {
    status: 1,
  }
}

async function handleCreateServiceOrder() {
  try {
    isSaving.value = true
    clearMessages()

    await createServiceOrder({
      vehicleId: Number(form.value.vehicleId),
    })

    successMessage.value = 'Service order created successfully.'
    resetForm()
    await loadServiceOrders()
  } catch (error: any) {
    console.error('Create service order error:', error)

    if (error.response?.status === 404) {
      errorMessage.value = `Vehicle ID ${form.value.vehicleId} was not found. Please use an existing vehicle.`
    } else if (error.response?.data?.errors) {
      errorMessage.value = Object.values(error.response.data.errors).flat().join(' ')
    } else if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else if (error.response?.data?.title) {
      errorMessage.value = error.response.data.title
    } else {
      errorMessage.value = 'Unable to create service order. Please verify the vehicle ID and API.'
    }
  } finally {
    isSaving.value = false
  }
}

async function handleUpdateStatus() {
  if (!editingServiceOrderId.value) {
    return
  }

  try {
    isSaving.value = true
    clearMessages()

    const currentOrder = serviceOrders.value.find(
      (order) => order.serviceOrderId === editingServiceOrderId.value,
    )

    if (!currentOrder) {
      errorMessage.value = 'Service order was not found.'
      return
    }

    if (currentOrder.status === Number(statusForm.value.status)) {
      errorMessage.value = 'Please select a different status before updating.'
      return
    }

    await updateServiceOrderStatus(editingServiceOrderId.value, {
      status: Number(statusForm.value.status),
    })

    successMessage.value = 'Service order status updated successfully.'
    cancelStatusEdit()
    await loadServiceOrders()
  } catch (error: any) {
    console.error('Update service order status error:', error)

    if (error.response?.data?.errors) {
      errorMessage.value = Object.values(error.response.data.errors).flat().join(' ')
    } else if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else if (error.response?.data?.title) {
      errorMessage.value = error.response.data.title
    } else {
      errorMessage.value = 'Unable to update service order status.'
    }
  } finally {
    isSaving.value = false
  }
}

async function handleCloseServiceOrder(order: ServiceOrder) {
  const confirmed = window.confirm(`Are you sure you want to close ${order.orderNumber}?`)

  if (!confirmed) {
    return
  }

  try {
    clearMessages()

    await closeServiceOrder(order.serviceOrderId)

    successMessage.value = 'Service order closed successfully.'
    await loadServiceOrders()

    if (editingServiceOrderId.value === order.serviceOrderId) {
      cancelStatusEdit()
    }
  } catch (error: any) {
    console.error('Close service order error:', error)

    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else if (error.response?.data?.title) {
      errorMessage.value = error.response.data.title
    } else {
      errorMessage.value = 'Unable to close service order. Please verify the API.'
    }
  }
}

onMounted(loadServiceOrders)
</script>

<template>
  <section>
    <div class="page-header">
      <div>
        <h2>Service Orders</h2>
        <p>Service order records loaded from the AutoService Manager API.</p>
      </div>

      <button @click="loadServiceOrders">Refresh</button>
    </div>

    <form class="form-card" @submit.prevent="handleCreateServiceOrder">
      <div class="form-title">
        <h3>Create Service Order</h3>
      </div>

      <div class="form-grid">
        <input
          v-model.number="form.vehicleId"
          type="number"
          placeholder="Existing Vehicle ID"
          required
        />
      </div>

      <button type="submit" :disabled="isSaving">
        {{ isSaving ? 'Saving...' : 'Create Service Order' }}
      </button>
    </form>

    <form v-if="editingServiceOrderId" class="form-card" @submit.prevent="handleUpdateStatus">
      <div class="form-title">
        <h3>Update Service Order Status</h3>

        <button type="button" class="secondary-button" @click="cancelStatusEdit">
          Cancel Edit
        </button>
      </div>

      <div class="form-grid">
        <select v-model.number="statusForm.status" required>
          <option :value="2">In Progress</option>
          <option :value="3">Completed</option>
          <option :value="4">Closed</option>
        </select>
      </div>

      <button type="submit" :disabled="isSaving">
        {{ isSaving ? 'Saving...' : 'Update Status' }}
      </button>
    </form>

    <div v-if="successMessage" class="success-card">
      {{ successMessage }}
    </div>

    <div v-if="isLoading" class="status-card">Loading service orders...</div>

    <div v-else-if="errorMessage" class="error-card">
      {{ errorMessage }}
    </div>

    <div v-else class="table-card">
      <div class="table-toolbar">
        <div>
          <h3>Service Order List</h3>
          <p>
            Showing {{ filteredServiceOrders.length }} of {{ serviceOrders.length }} service order{{
              serviceOrders.length === 1 ? '' : 's'
            }}.
          </p>
        </div>

        <div class="search-box">
          <input
            v-model="searchText"
            type="text"
            placeholder="Search order number, vehicle, status..."
          />

          <button v-if="searchText" type="button" class="secondary-button" @click="searchText = ''">
            Clear
          </button>
        </div>
      </div>

      <table v-if="filteredServiceOrders.length > 0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Order Number</th>
            <th>Vehicle ID</th>
            <th>Status</th>
            <th>Opened</th>
            <th>Closed</th>
            <th>Labor</th>
            <th>Parts</th>
            <th>Total</th>
            <th class="actions-column">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="order in filteredServiceOrders" :key="order.serviceOrderId">
            <td>{{ order.serviceOrderId }}</td>
            <td>{{ order.orderNumber }}</td>
            <td>{{ order.vehicleId }}</td>
            <td>
              <span :class="getStatusClass(order.status)">
                {{ getStatusLabel(order.status) }}
              </span>
            </td>
            <td>{{ formatDate(order.openedAtUtc) }}</td>
            <td>{{ formatDate(order.closedAtUtc) }}</td>
            <td>{{ formatCurrency(order.totalLaborAmount) }}</td>
            <td>{{ formatCurrency(order.totalPartsAmount) }}</td>
            <td>{{ formatCurrency(order.totalAmount) }}</td>
            <td class="actions">
              <button
                type="button"
                class="secondary-button"
                :disabled="order.status === 4"
                @click="startStatusEdit(order)"
              >
                Status
              </button>

              <button
                type="button"
                class="danger-button"
                :disabled="order.status === 4"
                @click="handleCloseServiceOrder(order)"
              >
                Close
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="empty-state">
        <h4>No service orders found</h4>
        <p>Try adjusting your search or create a new service order.</p>
      </div>
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
  opacity: 0.55;
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

.table-card {
  overflow-x: auto;
}

.form-title,
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
}

.form-title h3,
.table-toolbar h3 {
  margin: 0 0 4px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.search-box {
  display: flex;
  gap: 10px;
  min-width: 420px;
}

input,
select {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 11px 12px;
  outline: none;
  background: white;
}

input:focus,
select:focus {
  border-color: #2563eb;
}

.error-card {
  color: #b91c1c;
}

.success-card {
  color: #166534;
}

.status-open,
.status-progress,
.status-completed,
.status-closed {
  display: inline-block;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 13px;
}

.status-open {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-progress {
  background: #fef3c7;
  color: #92400e;
}

.status-completed {
  background: #dcfce7;
  color: #166534;
}

.status-closed {
  background: #e5e7eb;
  color: #374151;
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
  white-space: nowrap;
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

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: #6b7280;
}

.empty-state h4 {
  color: #111827;
  margin: 0 0 8px;
}

@media (max-width: 900px) {
  .table-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .search-box {
    min-width: 0;
  }
}
</style>
