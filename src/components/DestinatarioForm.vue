<template>
    <div class="form-stack">
        <div class="form-row cols-2">
            <div class="form-group">
                <label>Nome completo / Razão social</label>
                <input v-model="local.full_name" placeholder="Ex: Maria Souza" required />
            </div>
            <div class="form-group">
                <label>CPF / CNPJ</label>
                <input v-model="local.tax_document" placeholder="000.000.000-00" />
            </div>
        </div>
        <div class="form-row cols-2">
            <div class="form-group">
                <label>E-mail</label>
                <input v-model="local.email" type="email" placeholder="email@exemplo.com" />
            </div>
            <div class="form-group">
                <label>Telefone</label>
                <input v-model="local.phone" placeholder="(00) 00000-0000" />
            </div>
        </div>
        <div class="divider" />
        <div class="form-row cols-2">
            <div class="form-group">
                <label>CEP</label>
                <input v-model="local.zip_code" placeholder="00000-000" maxlength="9" @input="maskCep" required />
            </div>
            <div class="form-group">
                <label>Número</label>
                <input v-model="local.street_number" placeholder="123" required />
            </div>
        </div>
        <div class="form-group">
            <label>Logradouro</label>
            <input v-model="local.street" placeholder="Rua, Avenida…" required />
        </div>
        <div class="form-row cols-2">
            <div class="form-group">
                <label>Bairro</label>
                <input v-model="local.neighborhood" placeholder="Centro" />
            </div>
            <div class="form-group">
                <label>Complemento</label>
                <input v-model="local.complemento" placeholder="Apto 12" />
            </div>
        </div>
        <div class="form-row cols-2">
            <div class="form-group">
                <label>Cidade</label>
                <input v-model="local.city" placeholder="São Paulo" required />
            </div>
            <div class="form-group">
                <label>Estado</label>
                <select v-model="local.state" required>
                    <option value="">UF</option>
                    <option v-for="uf in estados" :key="uf" :value="uf">{{ uf }}</option>
                </select>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
    modelValue: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['update:modelValue'])

const estados = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']

const local = reactive({
    full_name: '', tax_document: '', email: '', phone: '',
    zip_code: '', street: '', street_number: '', neighborhood: '', complement: '', city: '', state: '',
    ...props.modelValue
})

watch(local, (val) => emit('update:modelValue', { ...val }), { deep: true })

function maskCep(e) {
    let v = e.target.value.replace(/\D/g, '')
    if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5, 8)
    local.zip_code = v
}
</script>