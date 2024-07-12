<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Meilisearch } from 'meilisearch'

const route = useRoute()
const instanceId = route.params.id

const instances = useLocalStorage('instances', [])
const instance = instances.value.find((instance) => instance.id == instanceId)

const client = new Meilisearch({
    host: instance.url,
    apiKey: instance.key
})

const indexes = ref('')
const DBSize = ref('')
const documents = ref('')

async function getStats() {
    let meiliSize = await client.getStats()
    DBSize.value = meiliSize['databaseSize']

    console.log(meiliSize)

    let statsIndexes = Object.values(meiliSize['indexes'])
    let numberOfDocuments = 0

    for (const index of statsIndexes) {
        numberOfDocuments += index.numberOfDocuments
    }

    documents.value = numberOfDocuments
}

async function getIndexes() {
    let meiliIndexes = await client.getRawIndexes()
    indexes.value = meiliIndexes['results']
}

function formatSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Byte'
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

function formatDate(isoDate) {
    const date = new Date(isoDate)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0') // getMonth() is zero-based
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
}

onMounted(() => {
    getIndexes()
    getStats()
})
</script>

<template>
    <div class="container-fluid" style="max-height: 100vh">
        <div class="row">
            <div class="col-3">
                <div class="card">
                    <div class="card-header">
                        <div class="card-title font-monospace">Indexes</div>
                    </div>
                    <div class="card-body overflow-auto mb-1" style="max-height: 83vh">
                        <div v-for="(meiliIndex, index) of indexes" :key="index">
                            <div class="card mb-2">
                                <div class="card-body">
                                    <p>{{ meiliIndex.uid }}</p>
                                    <small class="text-muted">Last update: {{ formatDate(meiliIndex.updatedAt) }}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-9">
                <div class="card mb-2">
                    <div class="card-header">
                        <div class="card-title font-monospace">Information</div>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-2">
                                <div class="card">
                                    <div class="card-body">
                                        <p class="fs-5">{{ formatSize(DBSize) }}</p>
                                        <small class="text-muted">Database size</small>
                                    </div>
                                </div>
                            </div>
                            <div class="col-2">
                                <div class="card">
                                    <div class="card-body">
                                        <p class="fs-5">{{ documents }}</p>
                                        <small class="text-muted">Amount of documents</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card mb-2">
                    <div class="card-header">
                        <div class="card-title font-monospace">Documents</div>
                    </div>
                    <div class="card-body"></div>
                </div>
            </div>
        </div>
    </div>
</template>
