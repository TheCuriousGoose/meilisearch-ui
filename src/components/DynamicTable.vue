<script setup lang="ts">
import { defineProps, computed, ref } from 'vue';
import JsonViewerModal from '../components/JsonViewerModal.vue';

const isJson = (value: any) => {
    const firstSymbol = JSON.stringify(value)[0]
    console.log(firstSymbol);
    if (firstSymbol == '{' || firstSymbol == '[') {
        try {
            return true;
        } catch (e) {
            return false;
        }
    }
};

const jsonData = ref<any>(null);

type TableData = Array<Record<string, any>>;

const props = defineProps<{
    data: TableData;
}>();

const columns = computed(() => {
    if (Array.isArray(props.data) && props.data.length > 0) {
        return Object.keys(props.data[0]);
    }
    return [];
});

const showJsonModal = (data: any) => {
    jsonData.value = data;
};
</script>

<template>
    <div class="table-container">
        <table class="table table-striped table-bordered">
            <thead>
                <tr>
                    <th v-for="(column, index) in columns" :key="index">{{ column }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in props.data" :key="index">
                    <td v-for="(column, colIndex) in columns" :key="colIndex">
                        <template v-if="isJson(item[column])">
                            <span style="cursor: pointer;" class="text-decoration-underline" @click="showJsonModal(item[column])"
                                data-bs-toggle="modal" data-bs-target="#jsonModal">{{
                                    JSON.stringify(item[column]).substring(0, 20) + '...' }}</span>
                        </template>
                        <template v-else>
                            {{ item[column] ? item[column] : 'null' }}
                        </template>
                    </td>
                </tr>
            </tbody>
        </table>
        <JsonViewerModal :jsonData="jsonData" />
    </div>
</template>
