<script setup lang="ts">
import { defineProps, computed, ref } from 'vue';
import JsonViewerModal from '../components/JsonViewerModal.vue';

const isJson = (value: any) => {
    let firstSymbol;

    if (typeof value == 'string') {
        firstSymbol = value[0];
    } else {
        value = JSON.stringify(value);
        if (value) {
            firstSymbol = value[0];
        }
    }

    if (firstSymbol == '{' || firstSymbol == '[') {
        if (value.length > 20) {
            return true;
        }

        return false;
    }
};

const jsonData = ref<any>({});

const props = defineProps<{
    data: object | any[];
}>();

const columns = computed(() => {
    if (Array.isArray(props.data) && props.data.length > 0) {
        return Object.keys(props.data[0]);
    }
    return [];
});

const formatJSON = (data: string | object) => {
    let preview;
    let dataLength;

    if (typeof data == 'string') {
        preview = data.substring(0, 20);
        dataLength = data.length;

    } else {
        let stringified = JSON.stringify(data)
        preview = stringified.substring(0, 20);
        dataLength = stringified.length;
    }

    if (dataLength > 20) {
        preview += '...';
    }

    return preview;
}

const showJsonModal = (data: any) => {
    jsonData.value = data;
};

const formatText = (text: string): string => {
    const regex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{6}))?Z$/;

    if (regex.test(text)) {
        const match = text.match(regex);
        if (match) {
            const [, year, month, day, hours, minutes, seconds] = match;
            const date = new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`);
            if (!isNaN(date.getTime())) {
                return [
                    `${year}-${month}-${day}`,
                    `${hours}:${minutes}:${seconds}`
                ].join(' ');
            }
        }
    }

    return text ?? null;
};
</script>

<template>
    <div class="table-container">
        <table class="table table-transparent-striped">
            <thead>
                <tr>
                    <th scope="col" v-for="(column, index) in columns" :key="index">{{ column }}</th>
                    <th>actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in props.data" :key="index">
                    <td v-for="(column, colIndex) in columns" :key="colIndex" style="text-wrap: nowrap;" class="me-2">
                        <template v-if="isJson(item[column])">
                            <span style="cursor: pointer;" class="text-decoration-underline"
                                @click="showJsonModal(item[column])" data-bs-toggle="modal"
                                data-bs-target="#jsonModal">{{
                                    formatJSON(item[column]) }}</span>
                        </template>
                        <template v-else>
                            {{ formatText(item[column]) }}
                        </template>
                    </td>
                    <td>
                        <button class="btn btn-primary btn-sm text-nowrap d-flex align-items-center">
                            <i class="fas fa-eye me-2"></i>
                            Edit
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
        <JsonViewerModal :jsonData="jsonData" />
    </div>
</template>
