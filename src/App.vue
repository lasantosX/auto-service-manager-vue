<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-icon">ASM</div>
        <div>
          <h1>AutoService Manager</h1>
          <p>Vue Frontend</p>
        </div>
      </div>

      <nav class="nav">
        <RouterLink to="/">Dashboard</RouterLink>
        <RouterLink to="/customers">Customers</RouterLink>
        <RouterLink to="/vehicles">Vehicles</RouterLink>
        <RouterLink to="/technicians">Technicians</RouterLink>
        <RouterLink to="/service-orders">Service Orders</RouterLink>
      </nav>
    </aside>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 280px 1fr;
  background: #f4f6f8;
  color: #111827;
}

.sidebar {
  background: #111827;
  color: white;
  padding: 28px 24px;
}

.brand {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 36px;
}

.brand-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: #2563eb;
  display: grid;
  place-items: center;
  font-weight: 800;
}

.brand h1 {
  font-size: 20px;
  margin: 0;
}

.brand p {
  margin: 4px 0 0;
  color: #cbd5e1;
  font-size: 14px;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav a {
  color: #e5e7eb;
  text-decoration: none;
  padding: 14px 16px;
  border-radius: 10px;
  font-size: 16px;
}

.nav a:hover {
  background: #1f2937;
}

.nav a.router-link-active {
  background: #2563eb;
  color: white;
}

.content {
  padding: 40px;
  overflow-x: hidden;
}
</style>
