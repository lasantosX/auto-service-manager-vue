<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getCustomers, type Customer } from '@/services/customerService'

const customers = ref<Customer[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

async function loadCustomers() {
  try {
    isLoading.value = true
    errorMessage.value = ''
    customers.value = await getCustomers()
  } catch (error) {
    errorMessage.value = 'Unable to load customers. Please verify the API is running.'
    console.error(error)
  } finally {
    isLoading.value = false
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
          </tr>
        </thead>

        <tbody>
          <tr v-for="customer in customers" :key="customer.customerId">
            <td>{{ customer.firstName }} {{ customer.lastName }}</td>
            <td>{{ customer.email }}</td>
            <td>{{ customer.phone || '-' }}</td>
          </tr>

          <tr v-if="customers.length === 0">
            <td colspan="3" class="empty">No customers found.</td>
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

.table-card,
.status-card,
.error-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
}

.error-card {
  color: #b91c1c;
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

.empty {
  text-align: center;
  color: #6b7280;
}
</style>
