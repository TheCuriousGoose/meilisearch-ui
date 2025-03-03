<script setup lang="ts">
import { defineProps, ref, onMounted, watch } from 'vue'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import InformationCard from './InformationCard.vue'

const DBSize = ref<number>(0)
const documents = ref<number>(0)
const version = ref<string>('')

const props = defineProps({
    client: Object
})

async function getStats() {
    let meiliSize = await (props.client ?? {}).getStats()
    DBSize.value = meiliSize['databaseSize']

    let statsIndexes = Object.values(meiliSize['indexes'])
    let numberOfDocuments = 0

    for (const index of statsIndexes) {
        const anyIndex = index as any
        numberOfDocuments += anyIndex.numberOfDocuments
    }

    documents.value = numberOfDocuments

    let meiliVersion = await (props.client ?? {}).getVersion()
    version.value = meiliVersion['pkgVersion']
}

function formatSize(bytes: number) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Byte'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

const isExpanded = useLocalStorage<boolean>('infoCard', true)

onMounted(() => {
    getStats()
})

function toggleCollapse() {
    isExpanded.value = !isExpanded.value
}
</script>

<template>
    <div class="card mb-2">
        <div class="card-header d-flex">
            <div class="card-title font-monospace">Information</div>
            <div class="ms-auto" @click="toggleCollapse" :aria-expanded="isExpanded">
                <i :class="isExpanded ? 'fa fa-caret-up' : 'fa fa-caret-down'"></i>
            </div>
        </div>
        <div class="card-body collapse" :class="{ show: isExpanded }" id="informationCollapse">
            <div class="d-flex gap-2">
                <InformationCard>
                    {{ formatSize(DBSize) }}
                    <template #description> Database size</template>
                </InformationCard>
                <InformationCard>
                    {{ new Intl.NumberFormat('nl-NL').format(documents) }}
                    <template #description>Amount of documents</template>
                </InformationCard>
                <InformationCard>
                    {{ version }}
                    <template #description>Meilisearch version</template>
                </InformationCard>
                <InformationCard>
                    {{ props?.client?.config.host ?? 'Trouble getting URL...' }}
                    <template #description>Host URL</template>
                </InformationCard>
            </div>
        </div>
    </div>
</template>
