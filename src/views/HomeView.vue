<script setup lang="ts">
const modules = [
  {
    title: 'Customers',
    description: 'Manage customer information, contact details, and customer records.',
    route: '/customers',
  },
  {
    title: 'Vehicles',
    description: 'Track customer vehicles, VINs, plates, and unit numbers.',
    route: '/vehicles',
  },
  {
    title: 'Technicians',
    description: 'Manage technicians, active status, and service assignments.',
    route: '/technicians',
  },
  {
    title: 'Service Orders',
    description: 'Create service orders, update workflow status, and close orders.',
    route: '/service-orders',
  },
  {
    title: 'Operations',
    description: 'Manage repair operations, labor hours, labor rates, and totals.',
    route: '/operations',
  },
]
</script>

<template>
  <section>
    <div class="hero">
      <p class="eyebrow">AutoService Manager</p>
      <h2>Dashboard</h2>
      <p class="subtitle">
        Frontend application for managing customers, vehicles, technicians, service orders, and
        repair operations.
      </p>
    </div>

    <div class="cards">
      <RouterLink v-for="module in modules" :key="module.title" :to="module.route" class="card">
        <div>
          <h3>{{ module.title }}</h3>
          <p>{{ module.description }}</p>
        </div>

        <span class="card-action">Open →</span>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.hero {
  margin-bottom: 28px;
}

.eyebrow {
  color: #2563eb;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin: 0 0 8px;
  text-transform: uppercase;
}

h2 {
  font-size: 36px;
  margin: 0 0 10px;
}

.subtitle {
  color: #6b7280;
  font-size: 17px;
  line-height: 1.6;
  margin: 0;
  max-width: 760px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(5, minmax(180px, 1fr));
  gap: 20px;
  max-width: 1440px;
}

.card {
  background: white;
  border: 1px solid #eef2f7;
  border-radius: 18px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
  color: inherit;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 170px;
  padding: 22px;
  text-decoration: none;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.card:hover {
  border-color: #bfdbfe;
  box-shadow: 0 16px 35px rgba(37, 99, 235, 0.14);
  transform: translateY(-3px);
}

.card h3 {
  font-size: 20px;
  margin: 0 0 10px;
}

.card p {
  color: #6b7280;
  font-size: 15px;
  line-height: 1.5;
  margin: 0;
}

.card-action {
  color: #2563eb;
  font-weight: 700;
  margin-top: 22px;
}

@media (max-width: 1300px) {
  .cards {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
}

@media (max-width: 700px) {
  h2 {
    font-size: 30px;
  }

  .subtitle {
    font-size: 15px;
  }
}
</style>
