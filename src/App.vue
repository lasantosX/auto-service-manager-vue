<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-icon">ASM</div>

        <div class="brand-text">
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
        <RouterLink to="/operations">Operations</RouterLink>
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
  grid-template-columns: 340px 1fr;
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
  align-items: center;
  gap: 14px;
  margin-bottom: 36px;
}

.brand-icon {
  align-items: center;
  background: #2563eb;
  border-radius: 12px;
  color: white;
  display: flex;
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 800;
  height: 56px;
  justify-content: center;
  width: 56px;
}

.brand-text {
  min-width: 0;
}

.brand h1 {
  color: white;
  font-size: 21px;
  line-height: 1.15;
  margin: 0;
  white-space: nowrap;
}

.brand p {
  color: #cbd5e1;
  font-size: 15px;
  margin: 4px 0 0;
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
  min-width: 0;
}

@media (max-width: 900px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
  }

  .brand h1 {
    white-space: normal;
  }

  .nav {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}
</style>
