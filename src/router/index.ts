import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CustomersView from '../views/CustomersView.vue'
import VehiclesView from '../views/VehiclesView.vue'
import TechniciansView from '../views/TechniciansView.vue'
import ServiceOrdersView from '../views/ServiceOrdersView.vue'
import OperationsView from '../views/OperationsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: HomeView,
    },
    {
      path: '/customers',
      name: 'customers',
      component: CustomersView,
    },
    {
      path: '/vehicles',
      name: 'vehicles',
      component: VehiclesView,
    },
    {
      path: '/technicians',
      name: 'technicians',
      component: TechniciansView,
    },
    {
      path: '/service-orders',
      name: 'service-orders',
      component: ServiceOrdersView,
    },
    {
      path: '/operations',
      name: 'operations',
      component: OperationsView,
    },
  ],
})

export default router
