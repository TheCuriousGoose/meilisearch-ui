<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Meilisearch } from 'meilisearch'
import instanceInfo from '../components/InstanceInfo.vue'
import JsonViewer from '../components/JsonViewer.vue'
import IndexesList from '../components/IndexesList.vue'

const route = useRoute()
const instanceId = route.params.id

const instances = useLocalStorage('instances', [])
const instance = instances.value.find((instance: any) => instance.id == instanceId) || { url: '', key: '' }

const client = new Meilisearch({
    host: instance.url,
    apiKey: instance.key
})

const selectedIndex = ref<string>('')
const indexes = ref<object | any>([])
const documents = ref<object | any>([])

const searchQuery = ref<string>('')
const filters = ref<string>('')
const sort = ref<string>('')

const timeTaken = ref<number>(0)
const totalResults = ref<number>(0)
const shownResults = ref<number>(0)

watch(
    searchQuery,
    debounce(() => {
        if (selectedIndex.value) {
            updateSearch(selectedIndex.value)
        }
    }, 200)
)

function debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
    let timerId: ReturnType<typeof setTimeout>

    return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
        const context = this
        clearTimeout(timerId)
        timerId = setTimeout(() => {
            func.apply(context, args)
        }, delay)
    }
}

watch(filters, () => {
    if (selectedIndex.value) {
        updateSearch(selectedIndex.value)
    }
})

async function getIndexes() {
    let meiliStats = await client.getStats()
    let meiliIndexes = await client.getRawIndexes()

    indexes.value = meiliStats.indexes

    meiliIndexes.results.forEach((index: any) => {
        let extraIndex = indexes.value[index.uid]

        if (extraIndex) {
            index.numberOfDocuments = extraIndex.numberOfDocuments
        }
    })

    indexes.value = meiliIndexes.results

    if (meiliIndexes.results.length > 0) {
        updateSearch(meiliIndexes.results[0].uid)
    }
}

async function updateSearch(uid: string) {
    try {
        selectedIndex.value = uid

        let formattedFilters = filters.value
            .split(',')
            .map((filter) => filter.trim())
            .filter((filter) => {
                return /^(\w+)\s*=\s*(.+)$/.test(filter)
            })

        let docs = await client.index(uid).search(searchQuery.value, {
            filter: formattedFilters
            // sort: sort.value
        })

        documents.value = docs.hits
        timeTaken.value = docs.processingTimeMs
        totalResults.value = docs.estimatedTotalHits
        shownResults.value = docs.hits.length
    } catch (error) {
        // console.error('Error in search operation:', error);
        // documents.value = [];
        // timeTaken.value = 0;
        // totalResults.value = 0;
        // shownResults.value = 0;
    }
}

onMounted(() => {
    getIndexes()
})
</script>

<template>
    <div class="container-fluid" style="max-height: 100vh">
        <instanceInfo :client="client" />
        <div class="row">
            <div class="col-3">
                <IndexesList :indexes="indexes" :selectedIndex="selectedIndex" @update-search="updateSearch" />
            </div>
            <div class="col-9">
                <div class="card mb-2" style="max-height: 75vh">
                    <div class="card-header">
                        <div class="card-title font-monospace">Documents</div>
                    </div>
                    <div class="card-body overflow-auto">
                        <div class="card mb-2">
                            <div class="card-body">
                                <label for="filters">Search</label>
                                <div class="input-group mb-2">
                                    <span class="input-group-text bg-dark">
                                        <i class="fa fa-search"></i>
                                    </span>
                                    <input type="text" v-model="searchQuery" class="form-control bg-dark" placeholder="" />
                                </div>
                                <div class="d-flex gap-2 mb-2">
                                    <div class="d-flex flex-column w-100">
                                        <label for="filters">Filters</label>
                                        <div class="input-group">
                                            <span class="input-group-text bg-dark">
                                                <i class="fa fa-filter"></i>
                                            </span>
                                            <input type="text" v-model="filters" name="filters" id="filters" class="form-control bg-dark" />
                                        </div>
                                    </div>
                                    <div class="d-flex flex-column w-100">
                                        <label for="sort">Sort</label>
                                        <div class="input-group">
                                            <span class="input-group-text bg-dark">
                                                <i class="fa fa-sort"></i>
                                            </span>
                                            <input type="text" class="form-control bg-dark" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="d-flex justify-content-between">
                            <p class="fs-5 d-flex align-items-center">
                                Results <span class="ms-2 fs-6 text-muted">(Time spent: {{ timeTaken }}ms)</span>
                            </p>
                            <div>
                                <p class="text-muted">{{ shownResults }} shown out of {{ totalResults }} results</p>
                            </div>
                        </div>

                        <div v-for="(document, index) in documents" :key="index">
                            <div class="card mb-2">
                                <div class="card-body">
                                    <JsonViewer :data="document"></JsonViewer>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
