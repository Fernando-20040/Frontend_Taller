<template>
  <v-container>
    <v-row>
      <!-- Formulario -->
      <v-col cols="12" md="5">
        <v-card class="pa-4">
          <h3 class="text-subtitle-1 mb-3">Crear Tarea</h3>
          <v-form v-model="valid" @submit.prevent="createTask">
            <v-text-field
              v-model="task.titulo"
              label="Título"
              :rules="[rules.req]"
              density="comfortable"
              clearable
            />
            <v-select
              v-model="task.estado"
              :items="estados"
              label="Estado"
              density="comfortable"
            />
            <v-textarea
              v-model="task.descripcion"
              label="Descripción"
              rows="3"
              density="comfortable"
              clearable
            />
            <v-text-field
              v-model="task.fecha_vencimiento"
              label="Fecha de vencimiento"
              type="date"
              :rules="[rules.req]"
              density="comfortable"
            />
            <v-select
              v-model="task.user_id"
              :items="userItems"
              item-title="nombre"
              item-value="id"
              label="Asignar a"
              :rules="[rules.req]"
              density="comfortable"
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
                Guardar Tarea
              </v-btn>
              <v-btn variant="tonal" @click="resetForm">Limpiar</v-btn>
            </div>
          </v-form>
        </v-card>
      </v-col>

      <!-- Tabla -->
      <v-col cols="12" md="7">
        <div class="d-flex justify-end mb-2">
          <!-- Tu botón original: exporta PENDIENTES -->
          <v-btn color="primary" prepend-icon="mdi-download" class="mr-2" @click="downloadPending">
            DESCARGAR PENDIENTES
          </v-btn>

          <!-- NUEVO BOTÓN: exporta TODAS -->
          <v-btn color="teal" prepend-icon="mdi-download" @click="downloadAll">
            DESCARGAR TODAS
          </v-btn>
        </div>
        <v-data-table
          :items="decoratedTasks"
          :headers="headers"
          :loading="loadingTasks"
          class="elevation-1"
        >
          <template #no-data>
            <div class="pa-6 text-center">No hay tareas para mostrar.</div>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'

type Usuario = { id: number; nombre: string }
type Tarea = {
  id: number
  titulo: string
  estado: string
  descripcion?: string
  fecha_vencimiento?: string
  user?: Usuario
  user_name?: string
}

const valid = ref(false)
const loading = ref(false)
const loadingTasks = ref(false)
const errorMsg = ref('')

// ✅ Reglas para Vuetify (boolean | string)
const rules = {
  req: (v: unknown) => (!!v || v === 0) || 'Requerido',
}

const estados = ['pendiente', 'en_progreso', 'completada']
const task = ref({
  titulo: '',
  descripcion: '',
  estado: 'pendiente',
  fecha_vencimiento: '',
  user_id: '' as unknown as number,
})

const userItems = ref<Usuario[]>([])
const tasks = ref<Tarea[]>([])

const headers = [
  { title: '#', value: 'id' },
  { title: 'Título', value: 'titulo' },
  { title: 'Estado', value: 'estado' },
  { title: 'Asignado a', value: 'asignado' },
  { title: 'Vence', value: 'fecha_vencimiento' },
]

const decoratedTasks = computed(() =>
  tasks.value.map(t => ({
    ...t,
    asignado: t.user?.nombre || t.user_name || '',
  }))
)

async function fetchUsers() {
  try {
    const { data } = await api.get<Usuario[]>('/usuarios/listUsers')
    userItems.value = data
  } catch (e) {
    console.error('fetchUsers error', e)
  }
}

async function fetchTasks() {
  loadingTasks.value = true
  try {
    const { data } = await api.get<Tarea[]>('/tareas') // si aún no existe, captura el error
    tasks.value = data
  } catch (e) {
    console.warn('Aún no hay endpoint GET /tareas. La tabla quedará vacía.')
    tasks.value = []
  } finally {
    loadingTasks.value = false
  }
}

async function createTask() {
  errorMsg.value = ''
  loading.value = true
  try {
    await api.post('/tareas', task.value) // requiere endpoint en backend
    resetForm()
    await fetchTasks()
  } catch (e: any) {
    errorMsg.value = e?.response?.data?.message || 'No se pudo crear la tarea.'
  } finally {
    loading.value = false
  }
}

function resetForm() {
  task.value = {
    titulo: '',
    descripcion: '',
    estado: 'pendiente',
    fecha_vencimiento: '',
    user_id: '' as unknown as number,
  }
}

async function downloadPending() {
  try {
    const res = await api.get('/tareas/reporte', {
      params: { estado: 'pendiente' },
      responseType: 'blob',
    })
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tareas_pendientes_${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch {
    alert('No se pudo descargar el reporte (¿endpoint no implementado?).')
  }
}

async function downloadAll() {
  try {
    const res = await api.get('/tareas/reporte', {
      // puedes omitir params y tu backend exporta todas por defecto,
      // pero lo envío explícito por claridad:
      params: { estado: 'todas' },
      responseType: 'blob',
    })
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `todas_las_tareas_${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch {
    alert('No se pudo descargar el reporte de TODAS las tareas.')
  }
}

onMounted(async () => {
  await Promise.all([fetchUsers(), fetchTasks()])
})
</script>
