<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Meilisearch } from 'meilisearch'
import instanceInfo from '../components/InstanceInfo.vue'
import JsonViewer from '../components/JsonViewer.vue'
import IndexesList from '../components/IndexesList.vue'
import Multiselect from 'vue-multiselect'
import DynamicTable from '../components/DynamicTable.vue'
import FacetModal from '../components/FacetModal.vue'
import { debounce } from '@/utils/debounce'

interface SearchObject {
    filter: any
    sort?: string[]
    limit: number,
    offset: number
}

// Use localStorage for viewType
const viewType = useLocalStorage<'table' | 'raw'>('viewType', 'table')
const errorVisible = ref<string>()

const route = useRoute()
const instanceId = route.params.id

const instances = useLocalStorage('instances', [])
const instance = instances.value.find((instance: any) => instance.id == instanceId) || { url: '', key: '' }

const client = new Meilisearch({
    host: instance.url,
    apiKey: instance.key
})

const selectedIndex = useLocalStorage<string>('selectedIndex', '')
const indexes = ref<object | any>([])
const documents = ref<object | any>([])

const sortableAttributes = ref<any>([])
const filterableAttributes = ref<any>([])
const facets = ref<any>([])

const searchQuery = ref<string>('')
const filters = ref<string>('')
const sort = ref<string[]>([])

const timeTaken = ref<number>(0)
const totalResults = ref<number>(0)
const shownResults = ref<number>(0)

const limit = ref<number>(20);
const offset = ref<number>(0);

const debouncedUpdateSearch = debounce((index) => {
    if (index !== null) {
        updateSearch(index);
    }
}, 200);

watch([filters, sort, searchQuery, offset, limit], () => {
    debouncedUpdateSearch(selectedIndex.value);
}, { deep: true });

async function updateSortableAttributes() {
    try {
        const sortables: string[] = await client.index(selectedIndex.value).getSortableAttributes()

        sortableAttributes.value = []

        sortables.forEach((sortable: string) => {
            if (sortable === '_geo') {
                return
            }

            sortableAttributes.value.push({
                value: `${sortable}:asc`,
                label: `${sortable} (asc)`
            })

            sortableAttributes.value.push({
                value: `${sortable}:desc`,
                label: `${sortable} (desc)`
            })
        })
    } catch (error) {
        console.error('Error fetching sortable attributes:', error)
    }
}

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
        updateSearch(selectedIndex.value.length > 0 ? selectedIndex.value : meiliIndexes.results[0].uid)
    }
}

async function updateFilterableAttributes() {
    let attributes = await client.index(selectedIndex.value).getFilterableAttributes();
    filterableAttributes.value = attributes;
}

async function updateFaces() {
    facets.value = await client.index(selectedIndex.value).getFaceting();
}

async function updateSearch(uid: string, changeOfIndex: boolean = false) {
    try {
        selectedIndex.value = uid
        updateSortableAttributes()
        updateFilterableAttributes()
        updateFaces();

        if (changeOfIndex) {
            filters.value = '';
            sort.value = [];
        }

        let formattedFilters = filters.value
            .split(',')
            .map((filter) => filter.trim())
            .filter((filter) => {
                return /^(\w+)\s*=\s*(.+)$/.test(filter)
            })

        let searchObject: SearchObject = {
            filter: formattedFilters,
            offset: offset.value,
            limit: limit.value,
        }

        if (sort.value.length > 0) {

            let sortFields = sort.value.map((sortItem: any) => sortItem.value);

            sortFields.filter((sortField) => {
                return /^\w+:(asc|desc)$/.test(sortField)
            })

            searchObject['sort'] = sortFields
        }

        let docs = await client.index(uid).search(searchQuery.value, searchObject)

        documents.value = docs.hits
        timeTaken.value = docs.processingTimeMs
        totalResults.value = docs.estimatedTotalHits
        shownResults.value = docs.hits.length
        errorVisible.value = '';
    } catch (meiliError: any) {
        errorVisible.value = meiliError.toString().split('.')[0].split(':')[1];
    }
}

onMounted(() => {
    getIndexes()
})
</script>

<template>
    <div class="container-fluid">
        <instanceInfo :client="client" />
        <div class="row d-flex">
            <div class="col-3">
                <IndexesList :indexes="indexes" :selectedIndex="selectedIndex" @update-search="updateSearch" />
            </div>
            <div class="col-9 mb-1">
                <div class="card mb-2">
                    <div class="card-header">
                        <div class="card-title font-monospace">Documents</div>
                        <div class="ms-auto d-flex gap-2">
                            <FacetModal :facet="facets"></FacetModal>
                            <select name="viewType" v-model="viewType" id="viewType" class="form-select">
                                <option value="raw">Raw</option>
                                <option value="table">Table</option>
                            </select>
                        </div>
                    </div>
                    <div class="card-body overflow-auto">
                        <div class="card mb-2">
                            <div class="card-body">
                                <label for="filters">Search</label>
                                <div class="input-group mb-2">
                                    <span class="input-group-text bg-dark">
                                        <i class="fa fa-search"></i>
                                    </span>
                                    <input type="text" v-model="searchQuery" class="form-control bg-dark"
                                        placeholder="" />
                                </div>
                                <div class="d-flex gap-2">
                                    <div class="d-flex w-75 gap-2 mb-2">
                                        <div class="d-flex flex-column w-100">
                                            <label for="filters">Filters</label>
                                            <div class="input-group dropdown">
                                                <span class="input-group-text bg-dark" data-bs-toggle="dropdown"
                                                    aria-expanded="false">
                                                    <i class="fa fa-filter"></i>
                                                </span>
                                                <input type="text" v-model="filters" name="filters" id="filters"
                                                    class="form-control bg-dark" />
                                                <div class="dropdown-menu p-2 overflow-auto" style="max-height: 10rem;">
                                                    <p class="fw-bold mb-2">Filterable attributes</p>
                                                    <p v-for="(attribute, index) in filterableAttributes" :key="index">
                                                        {{ attribute }}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="d-flex flex-column w-100">
                                            <label for="sort">Sort</label>
                                            <div class="input-group">
                                                <span class="input-group-text bg-dark">
                                                    <i class="fa fa-sort"></i>
                                                </span>
                                                <multiselect v-model="sort" :options="sortableAttributes"
                                                    :searchable="true" :multiple="true" label="label" track-by="value"
                                                    class="form-control multiselect"></multiselect>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="d-flex w-25 gap-2">
                                        <div class="d-flex flex-column w-100">
                                            <label for="sort">Limit</label>
                                            <input type="number" name="limit" id="limit" v-model="limit"
                                                class="form-control bg-dark">
                                        </div>
                                        <div class="d-flex flex-column w-100">
                                            <label for="sort">Offset</label>
                                            <input type="number" name="offset" id="offset" v-model="offset"
                                                class="form-control bg-dark">
                                        </div>
                                    </div>
                                </div>
                                <div class="d-flex"></div>
                                <p class="invalid-feedback d-block"> {{ errorVisible }}</p>
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

                        <div v-for="(document, index) in documents" :key="index" v-if="viewType == 'raw'">
                            <div class="card mb-2">
                                <div class="card-body">
                                    <JsonViewer :data="document ?? {}"></JsonViewer>
                                </div>
                            </div>
                        </div>
                        <div v-if="documents != null">
                            <div class="table-responsive" v-if="viewType == 'table'">
                                <DynamicTable :data="documents ?? {}"></DynamicTable>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
