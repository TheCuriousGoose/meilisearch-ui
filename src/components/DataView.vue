<script setup lang="ts">
import JsonViewer from '../components/JsonViewer.vue'
import DynamicTable from './DynamicTable.vue';

const props = defineProps<{
    viewType: 'table' | 'raw' | 'cards';
    documents: object | any[];
}>();

const imageExtensions = ['.jpg', '.png', '.jpeg', '.webp'];

const getImage = (document: object) => {
    const match = Object.entries(document).find(([key, value]) =>
        typeof value === 'string' && imageExtensions.some(ext => value.endsWith(ext))
    );

    const matchValue = match ? match[1] : null;

    return matchValue;
}

const getEverythingButImage = (document: object) => {
    const filteredDocument = Object.fromEntries(
        Object.entries(document).filter(([key, value]) => {
            if (value !== 'string') {
                return true;
            } else {
                return !imageExtensions.some(ext => value.endsWith(ext))
            }
        })
    )

    return filteredDocument;
}

</script>

<template>
    <div v-if="viewType == 'raw'">
        <div v-for="(document, index) in documents" :key="index">
            <div class="card mb-2">
                <div class="card-body">
                    <JsonViewer :data="document ?? {}"></JsonViewer>
                </div>
            </div>
        </div>
    </div>
    <div v-if="documents != null">
        <div class="table-responsive" v-if="viewType == 'table'">
            <DynamicTable :data="documents ?? {}"></DynamicTable>
        </div>
    </div>
    <div v-if="viewType == 'cards'">
        <div v-for="(document, index) in documents" :key="index">
            <div class="card mb-2">
                <div class="card-body">
                    <div class="row">
                        <div class="col-3">
                            <img :src="getImage(document)" alt="" style="height: 25rem;">
                        </div>
                        <div class="col-9">
                            <table class="table table-transparent-striped">
                                <tr v-for="(documentWithoutImage, index) in getEverythingButImage(document)"
                                :key="index">
                                    <td class="w-25 p-2x    ">{{ index }}</td>
                                    <td class="w-75">{{ documentWithoutImage }}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>