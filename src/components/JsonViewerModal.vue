<script setup lang="ts">
import { defineProps } from 'vue';
import JsonViewer from '../components/JsonViewer.vue';

const props = defineProps<{
    jsonData: any;
}>();
</script>

<template>
    <div>
        <div class="modal fade" id="jsonModal" tabindex="-1" aria-labelledby="jsonModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="jsonModalLabel">JSON Viewer</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <JsonViewer :data="jsonData"></JsonViewer>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

