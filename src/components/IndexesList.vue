<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const emits = defineEmits(['updateSearch'])

function updateSearch(index: string) {
    emits('updateSearch', index)
}

const props = defineProps<{
    indexes: Array<any>
    selectedIndex: string
}>()

function formatDate(isoDate: string) {
    const date = new Date(isoDate)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0') // getMonth() is zero-based
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
}
</script>

<template>
    <div class="card">
        <div class="card-header">
            <div class="card-title font-monospace">Indexes</div>
        </div>
        <div class="card-body overflow-auto mb-1" style="max-height: 75vh">
            <div v-for="(meiliIndex, index) of props.indexes" :key="index">
                <div
                    class="card card-hover mb-2"
                    @click="updateSearch(meiliIndex.uid)"
                    :class="{
                        'border-secondary': meiliIndex.uid === props.selectedIndex
                    }"
                >
                    <div class="card-body">
                        <p class="d-flex align-items-center">
                            {{ meiliIndex.uid }} <span class="ms-2 badge bg-secondary">{{ new Intl.NumberFormat('nl-NL').format(meiliIndex.numberOfDocuments) }} documents</span>
                        </p>
                        <small class="text-muted">Last update: {{ formatDate(meiliIndex.updatedAt) }}</small>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
