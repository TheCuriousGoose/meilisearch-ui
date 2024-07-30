<template>
    <div class="json-viewer">
        <pre v-html="formattedJson"></pre>
    </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue'

const props = defineProps({
    data: {
        type: Object
    }
});
const formattedJson = computed(() => {
    return syntaxHighlight(typeof props.data == 'string' ?  JSON.stringify(JSON.parse(props.data), null, 4) : JSON.stringify(props.data, null, 4))
})

function syntaxHighlight(json: string) {
    if (typeof json !== 'string') {
        json = JSON.stringify(json, undefined, 2)
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
        let cls = 'number'
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key'
            } else {
                cls = 'string'
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean'
        } else if (/null/.test(match)) {
            cls = 'null'
        }
        return `<span class="${cls}">${match}</span>`
    })
}
</script>
