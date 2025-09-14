<template>
<v-btn variant="tonal" @click="$router.back()">Cancelar</v-btn>
</div>
</v-form>
</v-card>
</v-container>
</template>


<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'


const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!id.value)


const valid = ref(false)
const loading = ref(false)
const errorMsg = ref('')


const form = ref({ nombre: '', email: '', password: '' })


const rules = {
req: (v:string) => !!v || 'Requerido',
email: (v:string) => /.+@.+\..+/.test(v) || 'Email inválido',
min6: (v:string) => (v?.length ?? 0) >= 6 || 'Mínimo 6 caracteres',
}


onMounted(async () => {
if (isEdit.value) {
try {
const { data } = await api.get(`/usuarios/${id.value}`)
form.value.nombre = data?.nombre || ''
form.value.email = data?.email || ''
} catch {}
}
})


const onSubmit = async () => {
errorMsg.value = ''
loading.value = true
try {
if (isEdit.value) {
await api.put(`/usuarios/${id.value}`, { nombre: form.value.nombre, email: form.value.email })
} else {
// Endpoint de CREACIÓN → **cumple el punto 1 del PDF**
await api.post('/usuarios', form.value)
}
router.push({ name: 'usuarios' })
} catch (e:any) {
errorMsg.value = e?.response?.data?.message || 'No se pudo guardar el usuario.'
} finally {
loading.value = false
}
}
</script>