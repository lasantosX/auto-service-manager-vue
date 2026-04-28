<template>
  <section>
    <h2>Dashboard</h2>
    <p class="subtitle">
      Frontend application for managing customers, vehicles, technicians, service orders, and repair
      operations.
    </p>

    <div class="cards">
      <div class="card">
        <h3>Customers</h3>
        <p>Manage customer information and contact details.</p>
      </div>

      <div class="card">
        <h3>Vehicles</h3>
        <p>Track vehicles associated with customers.</p>
      </div>

      <div class="card">
        <h3>Technicians</h3>
        <p>Manage service technicians and specialties.</p>
      </div>

      <div class="card">
        <h3>Service Orders</h3>
        <p>Create and manage automotive service workflows.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
h2 {
  font-size: 32px;
  margin-bottom: 8px;
}

.subtitle {
  color: #6b7280;
  margin-bottom: 24px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  max-width: 1200px;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
}

.card h3 {
  margin: 0 0 8px;
}

.card p {
  color: #6b7280;
  margin: 0;
}
</style>
