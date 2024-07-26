<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Meilisearch } from 'meilisearch'
import instancesList from '../components/InstancesList.vue'

// Define the type for the instance
interface Instance {
    id: number;
    name: string;
    url: string;
    key: string;
    status?: string;
}

let form = ref({
    name: 'Default',
    url: 'http://localhost:7700',
    key: ''
})

let instanceToUpdate = 0

// Use the defined type
const instances = useLocalStorage<Instance[]>('instances', [])

function openUpdateInstance(id: number) {
    const index = instances.value.findIndex((instance) => instance.id === id)

    instanceToUpdate = id

    if (index !== -1) {
        form.value = {
            name: instances.value[index].name,
            url: instances.value[index].url,
            key: instances.value[index].key
        }
    }
}

function deleteInstance() {
    const index = instances.value.findIndex((instance) => instance.id === instanceToUpdate)

    if (index !== -1) {
        instances.value.splice(index, 1)
    }

    form.value = {
        name: 'Default',
        url: 'http://localhost:7700',
        key: ''
    }

    checkInstances()
}

function updateInstance() {
    const index = instances.value.findIndex((instance) => instance.id === instanceToUpdate)

    if (index !== -1) {
        instances.value[index].name = form.value.name
        instances.value[index].url = form.value.url
        instances.value[index].key = form.value.key

        form.value = {
            name: 'Default',
            url: 'http://localhost:7700',
            key: ''
        }
    }

    checkInstances()
}

function addNewInstance() {
    instances.value.push({
        id: instances.value.length + 1,
        name: form.value.name,
        url: form.value.url,
        key: form.value.key,
        status: 'Checking...'
    })

    form.value = {
        name: 'Default',
        url: 'http://localhost:7700',
        key: ''
    }

    checkInstances()
}

async function checkInstances() {
    for (let i = 0; i < instances.value.length; i++) {
        instances.value[i].status = 'Checking...'

        try {
            const client = new Meilisearch({
                host: instances.value[i].url,
                apiKey: instances.value[i].key
            })

            if (await client.isHealthy()) {
                instances.value[i].status = 'Online'
            } else {
                instances.value[i].status = 'Offline'
            }
        } catch (error) {
            console.error(`Error checking instance ${instances.value[i].url}:`, error)
        }
    }
}

onMounted(async () => {
    checkInstances()
})
</script>

<template>
    <div class="container">
        <div class="row d-flex justify-content-center">
            <div class="col-6">
                <div class="card">
                    <div class="card-header">
                        <div class="card-title fs-5 my-2">Please select your instance</div>
                    </div>
                    <div class="card-body">
                        <instancesList :instances="instances" @open-update-instance="openUpdateInstance" />
                    </div>
                    <div class="card-body d-flex flex-column">
                        <button class="btn btn-light w-100" data-bs-toggle="modal" data-bs-target="#newInstanceModal">
                            <i class="fa-solid fa-plus fa-xl me-2"></i>
                            Add new instance
                        </button>
                    </div>
                </div>
            </div>
            <div class="modal fade" id="newInstanceModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <form @submit.prevent="addNewInstance" class="modal-content">
                        <div class="modal-header">
                            <div class="modal-title">Add new instance</div>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-2">
                                <label for="instanceName" class="form-label">Instance name</label>
                                <input type="text" id="instanceName" v-model="form.name" class="form-control" />
                            </div>
                            <div class="mb-2">
                                <label for="instanceUrl" class="form-label">Instance URL</label>
                                <input type="text" id="instanceUrl" v-model="form.url" class="form-control" />
                            </div>
                            <div class="mb-2">
                                <label for="instanceKey" class="form-label">Instance key</label>
                                <input type="text" id="instanceKey" v-model="form.key" class="form-control" />
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="submit" data-bs-dismiss="modal" class="btn btn-primary">Add instance</button>
                        </div>
                    </form>
                </div>
            </div>
            <div class="modal fade" id="updateInstanceModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <form @submit.prevent="updateInstance" class="modal-content">
                        <div class="modal-header">
                            <div class="modal-title">Update instance</div>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-2">
                                <label for="instanceName" class="form-label">Instance name</label>
                                <input type="text" id="instanceName" v-model="form.name" class="form-control" />
                            </div>
                            <div class="mb-2">
                                <label for="instanceUrl" class="form-label">Instance URL</label>
                                <input type="text" id="instanceUrl" v-model="form.url" class="form-control" />
                            </div>
                            <div class="mb-2">
                                <label for="instanceKey" class="form-label">Instance key</label>
                                <input type="text" id="instanceKey" v-model="form.key" class="form-control" />
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" data-bs-dismiss="modal" class="btn btn-danger" @click="deleteInstance">Delete instance</button>
                            <button type="submit" data-bs-dismiss="modal" class="btn btn-primary">Update instance</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>
