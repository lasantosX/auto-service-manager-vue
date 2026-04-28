<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  getOperationsByServiceOrder,
  createOperation,
  updateOperation,
  deleteOperation,
  type ServiceOrderOperation,
  type CreateOperationRequest,
} from '../services/operationService'
import { getServiceOrders, type ServiceOrder } from '../services/serviceOrderService'
import { getTechnicians, type Technician } from '../services/technicianService'
import { getApiErrorMessage } from '../utils/apiError'

const operations = ref<ServiceOrderOperation[]>([])
const serviceOrders = ref<ServiceOrder[]>([])
const technicians = ref<Technician[]>([])

const selectedServiceOrderId = ref<number | null>(null)
const searchText = ref('')
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const editingOperationId = ref<number | null>(null)

const form = ref<CreateOperationRequest>({
  technicianId: 0,
  opCode: '',
  description: '',
  laborHours: 1,
  laborRate: 100,
})

const statusForm = ref({
  status: 1,
})

const openServiceOrders = computed(() => serviceOrders.value.filter((order) => order.status !== 4))

const activeTechnicians = computed(() =>
  technicians.value.filter((technician) => technician.isActive),
)

const selectedServiceOrder = computed(() =>
  serviceOrders.value.find((order) => order.serviceOrderId === selectedServiceOrderId.value),
)

const filteredOperations = computed(() => {
  const term = searchText.value.trim().toLowerCase()

  if (!term) {
    return operations.value
  }

  return operations.value.filter((operation) => {
    const text = [
      operation.serviceOrderOperationId.toString(),
      operation.serviceOrderId.toString(),
      operation.technicianId.toString(),
      operation.opCode,
      operation.description,
      getStatusLabel(operation.status),
      formatCurrency(operation.laborAmount),
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
  if (status === 4) return 'status-closed'
  if (status === 3) return 'status-completed'
  if (status === 2) return 'status-progress'
  return 'status-open'
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

function clearMessages() {
  successMessage.value = ''
  errorMessage.value = ''
}

function resetForm() {
  editingOperationId.value = null

  form.value = {
    technicianId: activeTechnicians.value[0]?.technicianId ?? 0,
    opCode: '',
    description: '',
    laborHours: 1,
    laborRate: 100,
  }

  statusForm.value = {
    status: 1,
  }
}

async function loadLookups() {
  serviceOrders.value = await getServiceOrders()
  technicians.value = await getTechnicians()

  const firstOpenServiceOrder = openServiceOrders.value[0]

  if (!selectedServiceOrderId.value && firstOpenServiceOrder) {
    selectedServiceOrderId.value = firstOpenServiceOrder.serviceOrderId
  }

  const firstActiveTechnician = activeTechnicians.value[0]

  if (!form.value.technicianId && firstActiveTechnician) {
    form.value.technicianId = firstActiveTechnician.technicianId
  }
}

async function loadOperations() {
  if (!selectedServiceOrderId.value) {
    errorMessage.value = 'Please select an open service order.'
    return
  }

  try {
    isLoading.value = true
    clearMessages()

    operations.value = await getOperationsByServiceOrder(Number(selectedServiceOrderId.value))
  } catch (error: unknown) {
    console.error('Operation API error:', error)

    errorMessage.value = getApiErrorMessage(
      error,
      `Unable to load operations for Service Order ID ${selectedServiceOrderId.value}.`,
    )
  } finally {
    isLoading.value = false
  }
}

function startEdit(operation: ServiceOrderOperation) {
  editingOperationId.value = operation.serviceOrderOperationId

  form.value = {
    technicianId: operation.technicianId,
    opCode: operation.opCode,
    description: operation.description,
    laborHours: operation.laborHours,
    laborRate: operation.laborRate,
  }

  statusForm.value = {
    status: operation.status,
  }

  clearMessages()
}

async function handleSubmitOperation() {
  if (!selectedServiceOrderId.value) {
    errorMessage.value = 'Please select an open service order before creating an operation.'
    return
  }

  if (!form.value.technicianId) {
    errorMessage.value = 'Please select an active technician.'
    return
  }

  if (selectedServiceOrder.value?.status === 4) {
    errorMessage.value = 'Cannot add operations to a closed service order.'
    return
  }

  try {
    isSaving.value = true
    clearMessages()

    const payload = {
      technicianId: Number(form.value.technicianId),
      opCode: form.value.opCode,
      description: form.value.description,
      laborHours: Number(form.value.laborHours),
      laborRate: Number(form.value.laborRate),
    }

    if (editingOperationId.value) {
      await updateOperation(editingOperationId.value, {
        ...payload,
        status: Number(statusForm.value.status),
      })

      successMessage.value = 'Operation updated successfully.'
    } else {
      await createOperation(Number(selectedServiceOrderId.value), payload)
      successMessage.value = 'Operation created successfully.'
    }

    resetForm()
    await loadOperations()
    await loadLookups()
  } catch (error: unknown) {
    console.error('Save operation error:', error)

    errorMessage.value = getApiErrorMessage(
      error,
      'Unable to save operation. The service order may be closed or the data is invalid.',
    )
  } finally {
    isSaving.value = false
  }
}

async function handleDeleteOperation(operation: ServiceOrderOperation) {
  const confirmed = window.confirm(`Are you sure you want to delete ${operation.opCode}?`)

  if (!confirmed) {
    return
  }

  try {
    clearMessages()

    await deleteOperation(operation.serviceOrderOperationId)

    successMessage.value = 'Operation deleted successfully.'
    await loadOperations()
  } catch (error: unknown) {
    console.error('Delete operation error:', error)

    errorMessage.value = getApiErrorMessage(
      error,
      'Unable to delete operation. Please verify the API.',
    )
  }
}

async function initializePage() {
  try {
    isLoading.value = true
    clearMessages()

    await loadLookups()

    if (selectedServiceOrderId.value) {
      await loadOperations()
    }
  } catch (error: unknown) {
    console.error('Initialize operations page error:', error)

    errorMessage.value = getApiErrorMessage(error, 'Unable to initialize operations page.')
  } finally {
    isLoading.value = false
  }
}

onMounted(initializePage)
</script>

<template>
  <section>
    <div class="page-header">
      <div>
        <h2>Operations</h2>
        <p>Repair operations loaded by open service order.</p>
      </div>

      <button @click="initializePage">Refresh</button>
    </div>

    <div class="form-card">
      <div class="form-title">
        <h3>Select Service Order</h3>
      </div>

      <div class="form-grid">
        <label>
          Open Service Order
          <select v-model.number="selectedServiceOrderId" required>
            <option disabled :value="null">Select an open service order</option>
            <option
              v-for="order in openServiceOrders"
              :key="order.serviceOrderId"
              :value="order.serviceOrderId"
            >
              #{{ order.serviceOrderId }} - {{ order.orderNumber }} - Vehicle {{ order.vehicleId }}
            </option>
          </select>
        </label>
      </div>

      <button type="button" @click="loadOperations">Load Operations</button>
    </div>

    <form class="form-card" @submit.prevent="handleSubmitOperation">
      <div class="form-title">
        <h3>{{ editingOperationId ? 'Edit Operation' : 'Add Operation' }}</h3>

        <button v-if="editingOperationId" type="button" class="secondary-button" @click="resetForm">
          Cancel Edit
        </button>
      </div>

      <div class="form-grid">
        <label>
          Technician
          <select v-model.number="form.technicianId" required>
            <option disabled :value="0">Select technician</option>
            <option
              v-for="technician in activeTechnicians"
              :key="technician.technicianId"
              :value="technician.technicianId"
            >
              #{{ technician.technicianId }} - {{ technician.fullName }}
            </option>
          </select>
        </label>

        <label>
          Op Code
          <input v-model="form.opCode" type="text" placeholder="Example: DIAG" required />
        </label>

        <label>
          Description
          <input
            v-model="form.description"
            type="text"
            placeholder="Operation description"
            required
          />
        </label>

        <label>
          Labor Hours
          <input
            v-model.number="form.laborHours"
            type="number"
            step="0.1"
            min="0"
            placeholder="Labor hours"
            required
          />
        </label>

        <label>
          Labor Rate
          <input
            v-model.number="form.laborRate"
            type="number"
            step="0.01"
            min="0"
            placeholder="Labor rate"
            required
          />
        </label>

        <label v-if="editingOperationId">
          Status
          <select v-model.number="statusForm.status" required>
            <option :value="1">Open</option>
            <option :value="2">In Progress</option>
            <option :value="3">Completed</option>
            <option :value="4">Closed</option>
          </select>
        </label>
      </div>

      <button type="submit" :disabled="isSaving || !selectedServiceOrderId">
        {{ isSaving ? 'Saving...' : editingOperationId ? 'Update Operation' : 'Create Operation' }}
      </button>
    </form>

    <div v-if="successMessage" class="success-card">
      {{ successMessage }}
    </div>

    <div v-if="isLoading" class="status-card">Loading operations...</div>

    <div v-else-if="errorMessage" class="error-card">
      {{ errorMessage }}
    </div>

    <div v-else class="table-card">
      <div class="table-toolbar">
        <div>
          <h3>Operation List</h3>
          <p>
            Showing {{ filteredOperations.length }} of {{ operations.length }} operation{{
              operations.length === 1 ? '' : 's'
            }}.
          </p>
        </div>

        <div class="search-box">
          <input
            v-model="searchText"
            type="text"
            placeholder="Search op code, description, technician..."
          />

          <button v-if="searchText" type="button" class="secondary-button" @click="searchText = ''">
            Clear
          </button>
        </div>
      </div>

      <table v-if="filteredOperations.length > 0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Op Code</th>
            <th>Description</th>
            <th>Technician ID</th>
            <th>Status</th>
            <th>Hours</th>
            <th>Rate</th>
            <th>Labor Amount</th>
            <th class="actions-column">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="operation in filteredOperations" :key="operation.serviceOrderOperationId">
            <td>{{ operation.serviceOrderOperationId }}</td>
            <td>{{ operation.opCode }}</td>
            <td>{{ operation.description }}</td>
            <td>{{ operation.technicianId }}</td>
            <td>
              <span :class="getStatusClass(operation.status)">
                {{ getStatusLabel(operation.status) }}
              </span>
            </td>
            <td>{{ operation.laborHours }}</td>
            <td>{{ formatCurrency(operation.laborRate) }}</td>
            <td>{{ formatCurrency(operation.laborAmount) }}</td>
            <td class="actions">
              <button type="button" class="secondary-button" @click="startEdit(operation)">
                Edit
              </button>

              <button type="button" class="danger-button" @click="handleDeleteOperation(operation)">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="empty-state">
        <h4>No operations found</h4>
        <p>Select an open service order and create a new operation.</p>
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

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
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
