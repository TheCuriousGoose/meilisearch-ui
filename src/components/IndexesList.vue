<script setup lang="ts">
import type { Client } from 'meilisearch/dist/types/clients/client';
import { ref, defineEmits, onMounted, watch, onUnmounted } from 'vue'

const emits = defineEmits(['updateSearch'])

function updateSearch(index: string, changeOfIndex: boolean) {
    if (index !== props.selectedIndex) {
        updateIndexStats(index);
        emits('updateSearch', index, changeOfIndex);
    }
}

const indexDetails = ref<object>({})

const props = defineProps<{
    indexes: Array<any>
    selectedIndex: string,
    client: Client
}>()

function formatDate(isoDate: string) {
    const date = new Date(isoDate)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
}

const interval = 5; // In seconds
let intervalId: number | undefined;

async function updateIndexStats(index: string|null = null) {
    index = index ?? props.selectedIndex;

    let tasks = await props.client.index(index).getTasks({ limit: 999999999 });
    let succeededTasks = tasks.results.filter(task => task.status === 'succeeded').length;
    let queuedTasks = tasks.results.filter(task => task.status === 'enqueued');
    let queuedDocuments = queuedTasks.flatMap(task => task.details.receivedDocuments).reduce((sum, document) => sum ?? 0 + (document ?? 0), 0);
    let processingTasks = tasks.results.filter(task => task.status === 'processing');
    let processingDocuments = processingTasks.flatMap(task => task.details.receivedDocuments).reduce((sum, document) => sum ?? 0 + (document ?? 0), 0);

    let indexInfo = await props.client.index(index).fetchInfo();
    let lastUpdate = indexInfo.updatedAt?.toString();

    indexDetails.value = {
        succeededTasks: succeededTasks,
        queuedTasks: queuedTasks.length,
        queuedDocuments: queuedDocuments,
        processingTasks: processingTasks.length,
        processingDocuments: processingDocuments,
        lastUpdate: formatDate(lastUpdate ?? '')
    }
}

function startInterval() {
    if (intervalId !== undefined) {
        clearInterval(intervalId);
    }
    intervalId = setInterval(() => {
        updateIndexStats();
    }, 1000 * interval) as unknown as number;
}

onMounted(() => {
    startInterval();
});

watch(() => props.selectedIndex, () => {
    startInterval();
});

updateIndexStats();

onUnmounted(() => {
    if (intervalId !== undefined) {
        clearInterval(intervalId);
    }
});

function formatPropertyName(text: string): string {
    return text
        .replace(/([A-Z])/g, ' $1') 
        .toLowerCase()              
        .trim();                   
}
</script>

<template>
    <div class="card">
        <div class="card-header">
            <div class="card-title font-monospace">Indexes</div>
        </div>
        <div class="card-body overflow-auto mb-1">
            <div v-for="(meiliIndex, index) of props.indexes" :key="index">
                <div class="card card-hover mb-2" @click="updateSearch(meiliIndex.uid, true)" :class="{
                    'border-secondary': meiliIndex.uid === props.selectedIndex
                }">
                    <div class="card-body">
                        <p class="d-flex align-items-center">
                            {{ meiliIndex.uid }} <span class="ms-2 badge bg-secondary">{{ new
                                Intl.NumberFormat('nl-NL').format(meiliIndex.numberOfDocuments) }} documents</span>
                        </p>
                        <div class="table-responsive" v-if="meiliIndex.uid === props.selectedIndex">
                            <table class="table table-transparent-striped">
                                <thead>
                                    <tr>
                                        <th>Property</th>
                                        <th>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(value, property) in indexDetails" :key="property">
                                        <td>{{ formatPropertyName(property) }}</td>
                                        <td>{{ value }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
