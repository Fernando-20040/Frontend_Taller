<template>
  <v-data-table
    :items="decorated"
    :headers="headers"
    :loading="loading"
    class="elevation-1"
  >
    <template #no-data>
      <div class="pa-6 text-center">No hay usuarios para mostrar.</div>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'

type Usuario = {
  id:number; nombre:string; email:string; rol:'admin'|'usuario'; created_at?: string
}

const props = defineProps<{ searchTerm?: string }>()
const items = ref<Usuario[]>([])
const loading = ref(false)

const headers = [
  { title: 'Nombre', value: 'nombre' },
  { title: 'Email',  value: 'email' },
  { title: 'Rol',    value: 'rol' },
  { title: 'Creado', value: 'created_at' },
]

const fetchUsers = async () => {
  loading.value = true
  try {
    const { data } = await api.get<Usuario[]>('/usuarios/listUsers')
    items.value = data
  } finally {
    loading.value = false
  }
}

onMounted(fetchUsers)

function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  try {
    return new Intl.DateTimeFormat('es-GT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

const decorated = computed(() => {
  const q = (props.searchTerm || '').toLowerCase().trim()
  let list = items.value.map(u => ({
    ...u,
    created_at: formatDate(u.created_at),
  }))
  if (!q) return list
  return list.filter(u =>
    u.nombre.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q)  ||
    u.rol.toLowerCase().includes(q)    ||
    (u.created_at || '').toLowerCase().includes(q)
  )
})
</script>
