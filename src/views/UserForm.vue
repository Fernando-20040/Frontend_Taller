<template>
  <v-container>
    <v-card class="pa-4" max-width="640">
      <h2 class="text-h6 mb-4">{{ isEdit ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>

      <v-form v-model="valid" @submit.prevent="onSubmit">
        <v-text-field
          v-model="form.nombre"
          label="Nombre"
          :rules="[rules.req]"
          density="comfortable"
          clearable
        />
        <v-text-field
          v-model="form.email"
          label="Email"
          type="email"
          :rules="[rules.req, rules.email]"
          density="comfortable"
          clearable
        />
        <v-select
          v-model="form.rol"
          :items="['admin','usuario']"
          label="Rol"
          :rules="[rules.req]"
          density="comfortable"
        />
        <v-text-field
          v-if="!isEdit"
          v-model="form.password"
          label="Password"
          type="password"
          :rules="[rules.min6]"
          density="comfortable"
          clearable
        />

        <v-alert
          v-if="errorMsg"
          type="error"
          variant="tonal"
          class="mb-3"
          :text="errorMsg"
        />

        <div class="d-flex ga-2">
          <v-btn :loading="loading" color="primary" type="submit">
            Guardar
          </v-btn>
          <v-btn variant="tonal" @click="$router.back()">Cancelar</v-btn>
        </div>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!id.value)

const valid = ref(false)
const loading = ref(false)
const errorMsg = ref('')

const form = ref({
  nombre: '',
  email: '',
  password: '',
  rol: 'usuario' as 'admin' | 'usuario',
})

const rules = {
  req: (v:string) => !!v || 'Requerido',
  email: (v:string) => /.+@.+\..+/.test(v) || 'Email inválido',
  min6: (v:string) => (v?.length ?? 0) >= 6 || 'Mínimo 6 caracteres',
}

const onSubmit = async () => {
  errorMsg.value = ''
  loading.value = true
  try {
    if (isEdit.value) {
      // PUT /api/usuarios/updateUser/{id}
      await api.put(`/usuarios/updateUser/${id.value}`, {
        nombre: form.value.nombre,
        email: form.value.email,
        password: '', // según tu ejemplo de Postman
        rol: form.value.rol,
      })
    } else {
      // POST /api/usuarios/addUser
      await api.post('/usuarios/addUser', form.value)
    }
    router.push({ name: 'usuarios' })
  } catch (e:any) {
    errorMsg.value = e?.response?.data?.message
      || e?.response?.data?.errors?.email?.[0]
      || 'No se pudo guardar el usuario.'
  } finally {
    loading.value = false
  }
}
</script>
