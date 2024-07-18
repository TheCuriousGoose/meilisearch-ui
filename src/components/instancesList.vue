<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const emits = defineEmits(['openUpdateInstance'])

const props = defineProps<{
    instances: Object | any
}>()

function handleClick(id: number) {
    emits('openUpdateInstance', id)
}
</script>

<template>
    <div v-for="instance in props.instances" :key="instance.id">
        <div class="card mb-2">
            <div class="card-body py-2">
                <div class="d-flex">
                    <div
                        class="me-2 rounded-2"
                        :class="{
                            'bg-success': instance.status === 'Online',
                            'bg-warning': instance.status === 'Checking...',
                            'bg-danger': instance.status === 'Offline'
                        }"
                        style="width: 0.25rem; height: 3rem"
                    ></div>
                    <div>
                        <p class="fw-bold">{{ instance.name }}</p>
                        <span class="text-muted">Status: {{ instance.status }}</span>
                    </div>
                    <div class="ms-auto d-flex align-items-center">
                        <button class="btn btn-secondary text-white me-2" @click="handleClick(instance.id)" data-bs-toggle="modal" data-bs-target="#updateInstanceModal">
                            <i class="fa fa-edit"></i>
                        </button>
                        <RouterLink :to="`/detail/${instance.id}`" class="btn btn-primary me-2">
                            <i class="fa fa-eye"></i>
                        </RouterLink>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
