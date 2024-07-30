<script setup lang="ts">
import JsonViewer from '../components/JsonViewer.vue';

const props = defineProps({
    facet: {
        type: Object
    }
});

</script>

<template>
    <button class="btn btn-dark border text-nowrap" data-bs-toggle="modal" data-bs-target="#facetModal">Show
        facet</button>
    <div class="modal fade" id="facetModal" tabindex="-1" aria-labelledby="facetModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="facetModalLabel">Facet</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <JsonViewer :data="props.facet"></JsonViewer>
                </div>
            </div>
        </div>
    </div>
</template>