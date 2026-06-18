<template>
  <div>
    <div class="page-header">
      <h1>Cotação de Frete</h1>
      <p class="page-sub">Calcule o custo de envio preenchendo os dados abaixo</p>
    </div>

    <div class="layout-grid">
      <!-- Formulário -->
      <div class="card">
        <h2 class="section-title">Dados do Envio</h2>
        <form @submit.prevent="calcular" class="form-stack">

          <DestinatarioForm v-model="destinatarioData" />

          <div class="divider" />

          <p class="field-group-title">Dimensões do Pacote</p>
          <div class="form-row cols-3">
            <div class="form-group">
              <label>Largura (cm)</label>
              <input v-model.number="formShipment.width" type="number" min="1" placeholder="Ex: 20" required />
            </div>
            <div class="form-group">
              <label>Altura (cm)</label>
              <input v-model.number="formShipment.height" type="number" min="1" placeholder="Ex: 15" required />
            </div>
            <div class="form-group">
              <label>Comprimento (cm)</label>
              <input v-model.number="formShipment.length" type="number" min="1" placeholder="Ex: 30" required />
            </div>
          </div>

          <div class="form-row cols-2">
            <div class="form-group">
              <label>Peso (gramas)</label>
              <input v-model.number="formShipment.weight" type="number" min="0.1" step="0.1" placeholder="Ex: 2.5"
                required />
            </div>
            <div class="form-group">
              <label>Valor declarado (R$)</label>
              <input v-model.number="formShipment.declared_value" type="number" min="0" step="0.01"
                placeholder="Ex: 150.00" />
            </div>
          </div>

          <div class="divider" />



          <Transition name="fade">
            <div v-if="erro" class="alert-error">{{ erro }}</div>
          </Transition>


        </form>

        <button @click="calcular" class="btn-primary btn-calc" :disabled="loading">
          <span v-if="loading">Calculando…</span>
          <span v-else>Calcular Frete</span>
        </button>
      </div>

      <!-- Resultado -->
      <div>
        <Transition name="fade">
          <div v-if="resultado" class="card resultado-card">
            <div class="resultado-header">
              <span class="badge badge-success">✓ Cotação disponível</span>
              <span class="resultado-prazo">{{ resultado.delivery_days }} dias úteis</span>
            </div>

            <div class="resultado-price">
              <span class="price-label">Valor estimado</span>
              <span class="price-value">{{ formatCurrency(resultado.price) }}</span>
            </div>

            <div class="divider" />

            <div class="resultado-details">
              <div class="detail-row">
                <span>Peso cubado</span>
                <span class="mono">{{ resultado.weight_used || '—' }} kg</span>
              </div>
            </div>

            <!-- <div class="save-shipment-btn">
              <button class="btn-secondary" @click="saveShipment">Salvar Cotação</button>
            </div> -->

            <div v-if="resultado.servicos && resultado.servicos.length" class="servicos-list">
              <p class="field-group-title" style="margin-top:16px">Outras opções</p>
              <div v-for="s in resultado.servicos" :key="s.codigo" class="servico-item">
                <div>
                  <p class="servico-nome">{{ s.nome }}</p>
                  <p class="servico-prazo">{{ s.prazo_dias }} dias úteis</p>
                </div>
                <span class="servico-valor">{{ formatCurrency(s.valor) }}</span>
              </div>
            </div>
          </div>
        </Transition>
        <div v-if="resultado" class="btn-save-shipment">
          <button @click="saveQuote" class="btn-primary btn-calc" :disabled="loading">
            <span v-if="loading">Calculando…</span>
            <span v-else>Calcular Frete</span>
          </button>
        </div>
        <div v-if="!resultado" class="empty-state card">
          <span class="empty-icon">📦</span>
          <p>Preencha o formulário e clique em <strong>Calcular Frete</strong> para ver as opções de envio.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { cotacaoService, remetenteService, destinatarioService } from '../services/api'
import DestinatarioForm from '../components/DestinatarioForm.vue'

const resultado = ref(null)
const destinatarioData = reactive({})
const loading = ref(false)
const erro = ref(null)



const formShipment = reactive({
  width: '', height: '', length: '', weight: '',
  declared_value: '', zip_code: '',
})

async function calcular() {
  loading.value = true
  erro.value = null
  resultado.value = null
  try {
    const payload = { ...formShipment, zip_code: destinatarioData.zip_code }
    const { data } = await cotacaoService.calcular(payload)
    resultado.value = data?.data || data
  } catch (e) {
    erro.value = e.response?.data?.message || 'Erro ao calcular o frete. Verifique os dados.'
  } finally {
    loading.value = false
  }
}

function formatCurrency(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
}

async function saveQuote() {
  if (!resultado.value) return
  const shipmentData = { ...resultado.value, zip_code: destinatarioData.zip_code }
  try {
    await destinatarioService.create(destinatarioData)
    await cotacaoService.saveQuote(shipmentData)
    alert('Cotação salva com sucesso!')
  } catch (e) {
    alert('Erro ao salvar a cotação. Tente novamente.')
  }
}



</script>

<style scoped>
.page-header {
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

.layout-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  align-items: start;
}

@media (max-width: 900px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 20px;
}

.field-group-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 12px;
}

.form-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.btn-calc {
  width: 100%;
  padding: 13px;
  font-size: 14px;
}

.alert-error {
  background: var(--danger-dim);
  border: 1px solid rgba(248, 113, 113, 0.2);
  color: var(--danger);
  border-radius: var(--radius);
  padding: 10px 14px;
  font-size: 13px;
}

.resultado-card {
  display: flex;
  flex-direction: column;
}

.resultado-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.resultado-prazo {
  font-size: 13px;
  color: var(--text-2);
}

.resultado-price {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 4px;
}

.price-label {
  font-size: 11px;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.price-value {
  font-size: 32px;
  font-weight: 600;
  color: var(--success);
  letter-spacing: -0.03em;
  font-family: var(--mono);
}

.resultado-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.detail-row>span:first-child {
  color: var(--text-3);
}

.servico-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--bg-3);
  border-radius: var(--radius);
  margin-top: 8px;
}

.servico-nome {
  font-size: 13px;
  font-weight: 500;
}

.servico-prazo {
  font-size: 11px;
  color: var(--text-3);
  margin-top: 2px;
}

.servico-valor {
  font-size: 14px;
  font-weight: 600;
  font-family: var(--mono);
  color: var(--accent);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  padding: 40px 24px;
  color: var(--text-3);
}

.empty-icon {
  font-size: 32px;
}

.empty-state p {
  font-size: 13px;
  line-height: 1.6;
}

.empty-state strong {
  color: var(--text-2);
}
</style>
