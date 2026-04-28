<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  getTechnicians,
  createTechnician,
  updateTechnician,
  deactivateTechnician,
  type Technician,
  type CreateTechnicianRequest,
} from '../services/technicianService'

const technicians = ref<Technician[]>([])
const searchText = ref('')
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const editingTechnicianId = ref<number | null>(null)

const form = ref<CreateTechnicianRequest>({
  fullName: '',
  email: '',
})

const filteredTechnicians = computed(() => {
  const term = searchText.value.trim().toLowerCase()

  if (!term) {
    return technicians.value
  }

  return technicians.value.filter((technician) => {
    const text = [
      technician.fullName,
      technician.email,
      technician.isActive ? 'active' : 'inactive',
    ]
      .join(' ')
      .toLowerCase()

    return text.includes(term)
  })
})

async function loadTechnicians() {
  try {
    isLoading.value = true
    errorMessage.value = ''
    technicians.value = await getTechnicians()
  } catch (error) {
    console.error('Technician API error:', error)
    errorMessage.value = 'Unable to load technicians. Please verify the API is running.'
  } finally {
    isLoading.value = false
  }
}

function resetForm() {
  editingTechnicianId.value = null
  form.value = {
    fullName: '',
    email: '',
  }
}

function clearMessages() {
  successMessage.value = ''
  errorMessage.value = ''
}

function startEdit(technician: Technician) {
  editingTechnicianId.value = technician.technicianId
  form.value = {
    fullName: technician.fullName,
    email: technician.email,
  }

  clearMessages()
}

async function handleSubmitTechnician() {
  try {
    isSaving.value = true
    clearMessages()

    if (editingTechnicianId.value) {
      const currentTechnician = technicians.value.find(
        (technician) => technician.technicianId === editingTechnicianId.value,
      )

      await updateTechnician(editingTechnicianId.value, {
        fullName: form.value.fullName,
        email: form.value.email,
        isActive: currentTechnician?.isActive ?? true,
      })

      successMessage.value = 'Technician updated successfully.'
    } else {
      await createTechnician({
        fullName: form.value.fullName,
        email: form.value.email,
      })

      successMessage.value = 'Technician created successfully.'
    }

    resetForm()
    await loadTechnicians()
  } catch (error: any) {
    console.error('Save technician error:', error)

    if (error.response?.data?.errors) {
      errorMessage.value = Object.values(error.response.data.errors).flat().join(' ')
    } else if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else if (error.response?.data?.title) {
      errorMessage.value = error.response.data.title
    } else {
      errorMessage.value = 'Unable to save technician. Please verify the form data and API.'
    }
  } finally {
    isSaving.value = false
  }
}

async function handleDeactivateTechnician(technician: Technician) {
  const confirmed = window.confirm(`Are you sure you want to deactivate ${technician.fullName}?`)

  if (!confirmed) {
    return
  }

  try {
    clearMessages()

    await deactivateTechnician(technician.technicianId)

    successMessage.value = 'Technician deactivated successfully.'
    await loadTechnicians()

    if (editingTechnicianId.value === technician.technicianId) {
      resetForm()
    }
  } catch (error: any) {
    console.error('Deactivate technician error:', error)

    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else if (error.response?.data?.title) {
      errorMessage.value = error.response.data.title
    } else {
      errorMessage.value = 'Unable to deactivate technician. Please verify the API.'
    }
  }
}

onMounted(loadTechnicians)
</script>

<template>
  <section>
    <div class="page-header">
      <div>
        <h2>Technicians</h2>
        <p>Technician records loaded from the AutoService Manager API.</p>
      </div>

      <button @click="loadTechnicians">Refresh</button>
    </div>

    <form class="form-card" @submit.prevent="handleSubmitTechnician">
      <div class="form-title">
        <h3>{{ editingTechnicianId ? 'Edit Technician' : 'Add Technician' }}</h3>

        <button
          v-if="editingTechnicianId"
          type="button"
          class="secondary-button"
          @click="resetForm"
        >
          Cancel Edit
        </button>
      </div>

      <div class="form-grid">
        <input v-model="form.fullName" type="text" placeholder="Full name" required />
        <input v-model="form.email" type="email" placeholder="Email" required />
      </div>

      <button type="submit" :disabled="isSaving">
        {{
          isSaving ? 'Saving...' : editingTechnicianId ? 'Update Technician' : 'Create Technician'
        }}
      </button>
    </form>

    <div v-if="successMessage" class="success-card">
      {{ successMessage }}
    </div>

    <div v-if="isLoading" class="status-card">Loading technicians...</div>

    <div v-else-if="errorMessage" class="error-card">
      {{ errorMessage }}
    </div>

    <div v-else class="table-card">
      <div class="table-toolbar">
        <div>
          <h3>Technician List</h3>
          <p>
            Showing {{ filteredTechnicians.length }} of {{ technicians.length }} technician{{
              technicians.length === 1 ? '' : 's'
            }}.
          </p>
        </div>

        <div class="search-box">
          <input v-model="searchText" type="text" placeholder="Search name, email, status..." />

          <button v-if="searchText" type="button" class="secondary-button" @click="searchText = ''">
            Clear
          </button>
        </div>
      </div>

      <table v-if="filteredTechnicians.length > 0">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th class="actions-column">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="technician in filteredTechnicians" :key="technician.technicianId">
            <td>{{ technician.fullName }}</td>
            <td>{{ technician.email }}</td>
            <td>
              <span :class="technician.isActive ? 'status-active' : 'status-inactive'">
                {{ technician.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="actions">
              <button type="button" class="secondary-button" @click="startEdit(technician)">
                Edit
              </button>

              <button
                type="button"
                class="danger-button"
                :disabled="!technician.isActive"
                @click="handleDeactivateTechnician(technician)"
              >
                Deactivate
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="empty-state">
        <h4>No technicians found</h4>
        <p>Try adjusting your search or create a new technician.</p>
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

.status-active,
.status-inactive {
  display: inline-block;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 13px;
}

.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-inactive {
  background: #fee2e2;
  color: #991b1b;
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
  width: 220px;
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
