<template>
  <div>
    <div class="page-header">
      <div>
        <h1>Destinatários</h1>
        <p class="page-sub">Gerencie os endereços de destino dos envios</p>
      </div>
      <button class="btn-primary" @click="openModal()">+ Novo Destinatário</button>
    </div>

    <div v-if="loading" class="loading-state">Carregando…</div>

    <div v-else-if="!items.length" class="empty-state card">
      <span class="empty-icon">📍</span>
      <p>Nenhum destinatário cadastrado ainda.</p>
      <button class="btn-ghost" @click="openModal()">Cadastrar primeiro destinatário</button>
    </div>

    <div v-else class="items-list">
      <div v-for="item in items" :key="item.id" class="item-card card">
        <div class="item-info">
          <div class="item-avatar dest">{{ initials(item.full_name) }}</div>
          <div>
            <p class="item-name">{{ item.full_name }}</p>
            <p class="item-detail">{{ item.tax_document }} • {{ item.phone }}</p>
            <p class="item-address">{{ formatAddress(item) }}</p>
          </div>
        </div>
        <div class="item-actions">
          <button class="btn-ghost btn-sm" @click="openModal(item)">Editar</button>
          <button class="btn-delete btn-sm" @click="deleteItem(item)">Excluir</button>
        </div>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="modal.open" class="modal-backdrop" @click.self="closeModal">
        <div class="modal-box card">
          <div class="modal-header">
            <h2>{{ modal.editing ? 'Editar' : 'Novo' }} Destinatário</h2>
            <button class="btn-close" @click="closeModal">✕</button>
          </div>

          <DestinatarioForm v-model="modal.form" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { destinatarioService } from '../services/api'
import DestinatarioForm from '../components/DestinatarioForm.vue'

const items = ref([])
const loading = ref(true)
const estados = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']

const modal = reactive({
  open: false, editing: null, saving: false, erro: null,
  form: emptyForm()
})

function emptyForm() {
  return { full_name: '', tax_document: '', email: '', phone: '', zip_code: '', street: '', street_number: '', neighborhood: '', complement: '', city: '', state: '' }
}

onMounted(fetchItems)

async function fetchItems() {
  loading.value = true
  try {
    const { data } = await destinatarioService.list()
    items.value = data?.data || data || []
  } finally {
    loading.value = false
  }
}

function openModal(item = null) {
  modal.editing = item
  modal.form = item ? { ...item } : emptyForm()
  modal.erro = null
  modal.open = true
}

function closeModal() { modal.open = false }

function maskCep(e) {
  let v = e.target.value.replace(/\D/g, '')
  if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5, 8)
  modal.form.cep = v
}

async function saveItem() {
  modal.saving = true
  modal.erro = null
  try {
    if (modal.editing) {
      await destinatarioService.update(modal.editing.id, modal.form)
    } else {
      await destinatarioService.create(modal.form)
    }
    await fetchItems()
    closeModal()
  } catch (e) {
    modal.erro = e.response?.data?.message || 'Erro ao salvar. Verifique os dados.'
  } finally {
    modal.saving = false
  }
}

async function deleteItem(item) {
  if (!confirm(`Excluir ${item.nome}?`)) return
  await destinatarioService.delete(item.id)
  await fetchItems()
}

function initials(nome) {
  return (nome || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function formatAddress(item) {
  const parts = [item.logradouro, item.numero, item.bairro, item.cidade, item.estado].filter(Boolean)
  return parts.join(', ') || 'Endereço não informado'
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
}

h1 {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.page-sub {
  font-size: 14px;
  color: var(--text-3);
  margin-top: 4px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.item-info {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.item-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--success-dim);
  color: var(--success);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
}

.item-detail {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 2px;
  font-family: var(--mono);
}

.item-address {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 2px;
}

.item-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn-sm {
  padding: 7px 12px;
  font-size: 12px;
}

.btn-delete {
  background: transparent;
  color: var(--text-3);
  font-size: 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 7px 12px;
}

.btn-delete:hover {
  background: var(--danger-dim);
  color: var(--danger);
  border-color: transparent;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  padding: 48px 24px;
  color: var(--text-3);
}

.empty-icon {
  font-size: 32px;
}

.empty-state p {
  font-size: 14px;
}

.loading-state {
  color: var(--text-3);
  font-size: 14px;
  padding: 24px;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}

.modal-box {
  width: 100%;
  max-width: 580px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h2 {
  font-size: 16px;
  font-weight: 600;
}

.btn-close {
  background: transparent;
  color: var(--text-3);
  font-size: 16px;
  padding: 4px 8px;
}

.btn-close:hover {
  color: var(--text);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

.form-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.alert-error {
  background: var(--danger-dim);
  border: 1px solid rgba(248, 113, 113, 0.2);
  color: var(--danger);
  border-radius: var(--radius);
  padding: 10px 14px;
  font-size: 13px;
}
</style>
