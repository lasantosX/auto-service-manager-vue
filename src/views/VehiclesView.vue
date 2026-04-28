<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  getVehiclesByCustomer,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  type Vehicle,
  type CreateVehicleRequest,
} from '../services/vehicleService'

const vehicles = ref<Vehicle[]>([])
const searchText = ref('')
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const editingVehicleId = ref<number | null>(null)

const form = ref<CreateVehicleRequest>({
  customerId: 1,
  vin: '',
  make: '',
  model: '',
  year: new Date().getFullYear(),
  plateNumber: '',
  unitNumber: '',
})

const filteredVehicles = computed(() => {
  const term = searchText.value.trim().toLowerCase()

  if (!term) {
    return vehicles.value
  }

  return vehicles.value.filter((vehicle) => {
    const text = [
      vehicle.vin,
      vehicle.make,
      vehicle.model,
      vehicle.year.toString(),
      vehicle.plateNumber ?? '',
      vehicle.unitNumber ?? '',
      vehicle.customerId.toString(),
    ]
      .join(' ')
      .toLowerCase()

    return text.includes(term)
  })
})

async function loadVehicles() {
  try {
    isLoading.value = true
    errorMessage.value = ''
    vehicles.value = await getVehiclesByCustomer(Number(form.value.customerId))
  } catch (error) {
    console.error('Vehicle API error:', error)
    errorMessage.value = 'Unable to load vehicles. Please verify the API is running.'
  } finally {
    isLoading.value = false
  }
}

function resetForm() {
  editingVehicleId.value = null
  form.value = {
    customerId: 1,
    vin: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    plateNumber: '',
    unitNumber: '',
  }
}

function clearMessages() {
  successMessage.value = ''
  errorMessage.value = ''
}

function startEdit(vehicle: Vehicle) {
  editingVehicleId.value = vehicle.vehicleId
  form.value = {
    customerId: vehicle.customerId,
    vin: vehicle.vin,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    plateNumber: vehicle.plateNumber || '',
    unitNumber: vehicle.unitNumber || '',
  }

  clearMessages()
}

async function handleSubmitVehicle() {
  try {
    isSaving.value = true
    clearMessages()

    const payload = {
      customerId: Number(form.value.customerId),
      vin: form.value.vin,
      make: form.value.make,
      model: form.value.model,
      year: Number(form.value.year),
      plateNumber: form.value.plateNumber || undefined,
      unitNumber: form.value.unitNumber || undefined,
    }

    if (editingVehicleId.value) {
      await updateVehicle(editingVehicleId.value, payload)
      successMessage.value = 'Vehicle updated successfully.'
    } else {
      await createVehicle(payload)
      successMessage.value = 'Vehicle created successfully.'
    }

    resetForm()
    await loadVehicles()
  } catch (error) {
    console.error('Save vehicle error:', error)
    errorMessage.value = 'Unable to save vehicle. Please verify the form data and API.'
  } finally {
    isSaving.value = false
  }
}

async function handleDeleteVehicle(vehicle: Vehicle) {
  const confirmed = window.confirm(
    `Are you sure you want to delete ${vehicle.year} ${vehicle.make} ${vehicle.model}?`,
  )

  if (!confirmed) {
    return
  }

  try {
    clearMessages()

    await deleteVehicle(vehicle.vehicleId)

    successMessage.value = 'Vehicle deleted successfully.'
    await loadVehicles()

    if (editingVehicleId.value === vehicle.vehicleId) {
      resetForm()
    }
  } catch (error) {
    console.error('Delete vehicle error:', error)
    errorMessage.value = 'Unable to delete vehicle. Please verify the API.'
  }
}

onMounted(loadVehicles)
</script>

<template>
  <section>
    <div class="page-header">
      <div>
        <h2>Vehicles</h2>
        <p>Vehicle records loaded from the AutoService Manager API.</p>
      </div>

      <button @click="loadVehicles">Refresh</button>
    </div>

    <form class="form-card" @submit.prevent="handleSubmitVehicle">
      <div class="form-title">
        <h3>{{ editingVehicleId ? 'Edit Vehicle' : 'Add Vehicle' }}</h3>

        <button v-if="editingVehicleId" type="button" class="secondary-button" @click="resetForm">
          Cancel Edit
        </button>
      </div>

      <div class="form-grid">
        <input v-model.number="form.customerId" type="number" placeholder="Customer ID" required />
        <input v-model="form.vin" type="text" placeholder="VIN" required />
        <input v-model="form.make" type="text" placeholder="Make" required />
        <input v-model="form.model" type="text" placeholder="Model" required />
        <input v-model.number="form.year" type="number" placeholder="Year" required />
        <input v-model="form.plateNumber" type="text" placeholder="Plate number" />
        <input v-model="form.unitNumber" type="text" placeholder="Unit number" />
      </div>

      <button type="submit" :disabled="isSaving">
        {{ isSaving ? 'Saving...' : editingVehicleId ? 'Update Vehicle' : 'Create Vehicle' }}
      </button>
    </form>

    <div v-if="successMessage" class="success-card">
      {{ successMessage }}
    </div>

    <div v-if="isLoading" class="status-card">Loading vehicles...</div>

    <div v-else-if="errorMessage" class="error-card">
      {{ errorMessage }}
    </div>

    <div v-else class="table-card">
      <div class="table-toolbar">
        <div>
          <h3>Vehicle List</h3>
          <p>
            Showing {{ filteredVehicles.length }} of {{ vehicles.length }} vehicle{{
              vehicles.length === 1 ? '' : 's'
            }}.
          </p>
        </div>

        <div class="search-box">
          <input v-model="searchText" type="text" placeholder="Search VIN, make, model, plate..." />

          <button v-if="searchText" type="button" class="secondary-button" @click="searchText = ''">
            Clear
          </button>
        </div>
      </div>

      <table v-if="filteredVehicles.length > 0">
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>VIN</th>
            <th>Customer ID</th>
            <th>Plate</th>
            <th>Unit</th>
            <th class="actions-column">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="vehicle in filteredVehicles" :key="vehicle.vehicleId">
            <td>{{ vehicle.year }} {{ vehicle.make }} {{ vehicle.model }}</td>
            <td>{{ vehicle.vin }}</td>
            <td>{{ vehicle.customerId }}</td>
            <td>{{ vehicle.plateNumber || '-' }}</td>
            <td>{{ vehicle.unitNumber || '-' }}</td>
            <td class="actions">
              <button type="button" class="secondary-button" @click="startEdit(vehicle)">
                Edit
              </button>

              <button type="button" class="danger-button" @click="handleDeleteVehicle(vehicle)">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="empty-state">
        <h4>No vehicles found</h4>
        <p>Try adjusting your search or create a new vehicle.</p>
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

input {
  width: 100%;
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
