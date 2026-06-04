<template>
  <div>
    <div class="page-header">
      <div>
        <h1>Remetentes</h1>
        <p class="page-sub">Gerencie os endereços de origem dos envios</p>
      </div>
      <button class="btn-primary" @click="openModal()">+ Novo Remetente</button>
    </div>

    <div v-if="loading" class="loading-state">Carregando…</div>

    <div v-else-if="!items.length" class="empty-state card">
      <span class="empty-icon">👤</span>
      <p>Nenhum remetente cadastrado ainda.</p>
      <button class="btn-ghost" @click="openModal()">Cadastrar primeiro remetente</button>
    </div>

    <div v-else class="items-list">
      <div v-for="item in items" :key="item.id" class="item-card card">
        <div class="item-info">
          <div class="item-avatar">{{ initials(item.nome) }}</div>
          <div>
            <p class="item-name">{{ item.nome }}</p>
            <p class="item-detail">{{ item.documento }} • {{ item.telefone }}</p>
            <p class="item-address">{{ formatAddress(item) }}</p>
          </div>
        </div>
        <div class="item-actions">
          <button class="btn-ghost btn-sm" @click="openModal(item)">Editar</button>
          <button class="btn-delete btn-sm" @click="deleteItem(item)">Excluir</button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Transition name="fade">
      <div v-if="modal.open" class="modal-backdrop" @click.self="closeModal">
        <div class="modal-box card">
          <div class="modal-header">
            <h2>{{ modal.editing ? 'Editar' : 'Novo' }} Remetente</h2>
            <button class="btn-close" @click="closeModal">✕</button>
          </div>

          <form @submit.prevent="saveItem" class="form-stack">
            <div class="form-row cols-2">
              <div class="form-group">
                <label>Nome completo / Razão social</label>
                <input v-model="modal.form.nome" placeholder="Ex: João da Silva" required />
              </div>
              <div class="form-group">
                <label>CPF / CNPJ</label>
                <input v-model="modal.form.documento" placeholder="000.000.000-00" required />
              </div>
            </div>
            <div class="form-row cols-2">
              <div class="form-group">
                <label>E-mail</label>
                <input v-model="modal.form.email" type="email" placeholder="email@exemplo.com" />
              </div>
              <div class="form-group">
                <label>Telefone</label>
                <input v-model="modal.form.telefone" placeholder="(00) 00000-0000" />
              </div>
            </div>
            <div class="divider" />
            <div class="form-row cols-2">
              <div class="form-group">
                <label>CEP</label>
                <input v-model="modal.form.cep" placeholder="00000-000" maxlength="9" @input="maskCep" />
              </div>
              <div class="form-group">
                <label>Número</label>
                <input v-model="modal.form.numero" placeholder="123" />
              </div>
            </div>
            <div class="form-group">
              <label>Logradouro</label>
              <input v-model="modal.form.logradouro" placeholder="Rua, Avenida…" />
            </div>
            <div class="form-row cols-2">
              <div class="form-group">
                <label>Bairro</label>
                <input v-model="modal.form.bairro" placeholder="Centro" />
              </div>
              <div class="form-group">
                <label>Complemento</label>
                <input v-model="modal.form.complemento" placeholder="Apto 12" />
              </div>
            </div>
            <div class="form-row cols-2">
              <div class="form-group">
                <label>Cidade</label>
                <input v-model="modal.form.cidade" placeholder="São Paulo" />
              </div>
              <div class="form-group">
                <label>Estado</label>
                <select v-model="modal.form.estado">
                  <option value="">UF</option>
                  <option v-for="uf in estados" :key="uf" :value="uf">{{ uf }}</option>
                </select>
              </div>
            </div>

            <Transition name="fade">
              <div v-if="modal.erro" class="alert-error">{{ modal.erro }}</div>
            </Transition>

            <div class="modal-footer">
              <button type="button" class="btn-ghost" @click="closeModal">Cancelar</button>
              <button type="submit" class="btn-primary" :disabled="modal.saving">
                {{ modal.saving ? 'Salvando…' : 'Salvar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { remetenteService } from '../services/api'

const items = ref([])
const loading = ref(true)

const estados = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const modal = reactive({
  open: false, editing: null, saving: false, erro: null,
  form: emptyForm()
})

function emptyForm() {
  return { nome:'', documento:'', email:'', telefone:'', cep:'', logradouro:'', numero:'', bairro:'', complemento:'', cidade:'', estado:'' }
}

onMounted(fetchItems)

async function fetchItems() {
  loading.value = true
  try {
    const { data } = await remetenteService.list()
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
  if (v.length > 5) v = v.slice(0,5) + '-' + v.slice(5,8)
  modal.form.cep = v
}

async function saveItem() {
  modal.saving = true
  modal.erro = null
  try {
    if (modal.editing) {
      await remetenteService.update(modal.editing.id, modal.form)
    } else {
      await remetenteService.create(modal.form)
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
  await remetenteService.delete(item.id)
  await fetchItems()
}

function initials(nome) {
  return (nome || '?').split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()
}

function formatAddress(item) {
  const parts = [item.logradouro, item.numero, item.bairro, item.cidade, item.estado].filter(Boolean)
  return parts.join(', ') || 'Endereço não informado'
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
h1 { font-size: 22px; font-weight: 600; letter-spacing: -0.02em; }
.page-sub { font-size: 14px; color: var(--text-3); margin-top: 4px; }

.items-list { display: flex; flex-direction: column; gap: 12px; }
.item-card { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.item-info { display: flex; align-items: flex-start; gap: 14px; flex: 1; min-width: 0; }
.item-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--accent-dim); color: var(--accent);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; flex-shrink: 0;
}
.item-name { font-size: 14px; font-weight: 500; color: var(--text); }
.item-detail { font-size: 12px; color: var(--text-3); margin-top: 2px; font-family: var(--mono); }
.item-address { font-size: 12px; color: var(--text-3); margin-top: 2px; }
.item-actions { display: flex; gap: 8px; flex-shrink: 0; }

.btn-sm { padding: 7px 12px; font-size: 12px; }
.btn-delete {
  background: transparent; color: var(--text-3); font-size: 12px;
  border: 1px solid var(--border); border-radius: var(--radius);
  padding: 7px 12px;
}
.btn-delete:hover { background: var(--danger-dim); color: var(--danger); border-color: transparent; }

.empty-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; text-align: center; padding: 48px 24px; color: var(--text-3);
}
.empty-icon { font-size: 32px; }
.empty-state p { font-size: 14px; }

.loading-state { color: var(--text-3); font-size: 14px; padding: 24px; }

.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; padding: 16px;
}
.modal-box { width: 100%; max-width: 580px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.modal-header h2 { font-size: 16px; font-weight: 600; }
.btn-close { background: transparent; color: var(--text-3); font-size: 16px; padding: 4px 8px; }
.btn-close:hover { color: var(--text); }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
.form-stack { display: flex; flex-direction: column; gap: 14px; }
.alert-error {
  background: var(--danger-dim); border: 1px solid rgba(248,113,113,0.2);
  color: var(--danger); border-radius: var(--radius); padding: 10px 14px; font-size: 13px;
}
</style>
