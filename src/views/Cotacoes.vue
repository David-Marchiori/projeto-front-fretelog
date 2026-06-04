<template>
  <div>
    <div class="page-header">
      <div>
        <h1>Cotações</h1>
        <p class="page-sub">Histórico de todas as cotações realizadas</p>
      </div>
      <RouterLink to="/cotacao" class="btn-primary btn-link">+ Nova Cotação</RouterLink>
    </div>

    <div v-if="loading" class="loading-state">Carregando…</div>

    <div v-else-if="!items.length" class="empty-state card">
      <span class="empty-icon">📋</span>
      <p>Nenhuma cotação realizada ainda.</p>
      <RouterLink to="/cotacao" class="btn-ghost btn-link">Fazer primeira cotação</RouterLink>
    </div>

    <div v-else class="table-wrap card">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Origem</th>
            <th>Destino</th>
            <th>Peso</th>
            <th>Status</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td class="mono muted">{{ item.id }}</td>
            <td>
              <p class="cep">{{ item.origin_postal_code }}</p>
              <p class="street">{{ item.origin_street }}</p>
            </td>
            <td>
              <p class="cep">{{ item.destination_postal_code }}</p>
              <p class="street">{{ item.destination_street }}</p>
            </td>
            <td class="mono">{{ item.weight_kg }} kg</td>
            <td><span :class="['badge', badgeClass(item.status)]">{{ statusLabel(item.status) }}</span></td>
            <td class="muted">{{ formatDate(item.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { cotacaoService } from '../services/api'

const items = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await cotacaoService.list()
    items.value = Array.isArray(data) ? data : (data?.data || [])
  } finally {
    loading.value = false
  }
})

function statusLabel(status) {
  const map = { pending: 'Pendente', approved: 'Aprovada', rejected: 'Recusada', completed: 'Concluída' }
  return map[status] || status
}

function badgeClass(status) {
  const map = { pending: 'badge-warning', approved: 'badge-success', completed: 'badge-success', rejected: 'badge-danger' }
  return map[status] || 'badge-info'
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
h1 { font-size: 22px; font-weight: 600; letter-spacing: -0.02em; }
.page-sub { font-size: 14px; color: var(--text-3); margin-top: 4px; }

.btn-link { display: inline-flex; align-items: center; text-decoration: none; padding: 10px 16px; }

.table-wrap { padding: 0; overflow: hidden; }

table { width: 100%; border-collapse: collapse; font-size: 13px; }
thead tr { border-bottom: 1px solid var(--border); }
th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 600; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap; }
td { padding: 14px 16px; border-bottom: 1px solid var(--border); vertical-align: middle; }
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover td { background: var(--bg-3); }

.cep { font-family: var(--mono); font-size: 13px; font-weight: 500; color: var(--text); }
.street { font-size: 11px; color: var(--text-3); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
.mono { font-family: var(--mono); }
.muted { color: var(--text-3); }

.loading-state { color: var(--text-3); font-size: 14px; padding: 24px; }

.empty-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; text-align: center; padding: 48px 24px; color: var(--text-3);
}
.empty-icon { font-size: 32px; }
.empty-state p { font-size: 14px; }
</style>