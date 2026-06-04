<template>
  <div class="login-wrap">
    <div class="login-box">
      <div class="login-brand">
        <span class="logo-icon">◈</span>
        <span class="logo-text">FreteLog</span>
      </div>
      <p class="login-sub">Plataforma de gestão de fretes</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>E-mail</label>
          <input v-model="form.email" type="email" placeholder="seu@email.com" required autofocus />
        </div>
        <div class="form-group">
          <label>Senha</label>
          <input v-model="form.password" type="password" placeholder="••••••••" required />
        </div>

        <Transition name="fade">
          <div v-if="auth.error" class="error-msg">{{ auth.error }}</div>
        </Transition>

        <button type="submit" class="btn-primary btn-full" :disabled="auth.loading">
          <span v-if="auth.loading">Entrando…</span>
          <span v-else>Entrar</span>
        </button>
      </form>

      <p class="login-hint">
        Configure sua base URL da API em <span class="mono">src/services/api.js</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const form = reactive({ email: '', password: '' })

async function handleLogin() {
  const ok = await auth.login(form.email, form.password)
  if (ok) router.push('/')
}
</script>

<style scoped>
.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--bg);
}
.login-box {
  width: 100%;
  max-width: 400px;
  background: var(--bg-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 40px 36px;
}
.login-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.logo-icon {
  font-size: 24px;
  color: var(--accent);
}
.logo-text {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.02em;
}
.login-sub {
  font-size: 13px;
  color: var(--text-3);
  margin-bottom: 32px;
}
.login-form { display: flex; flex-direction: column; gap: 16px; }
.btn-full { width: 100%; justify-content: center; }
.error-msg {
  background: var(--danger-dim);
  border: 1px solid rgba(248,113,113,0.2);
  color: var(--danger);
  border-radius: var(--radius);
  padding: 10px 14px;
  font-size: 13px;
}
.login-hint {
  margin-top: 24px;
  font-size: 12px;
  color: var(--text-3);
  text-align: center;
  line-height: 1.5;
}
</style>
