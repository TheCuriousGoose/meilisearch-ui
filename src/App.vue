<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
    <header class="navbar sticky-top bg-white-50">
        <div class="container">
            <a href="" class="navbar-brand text-white">Meilisearch UI</a>
            <nav class="container flex justify-between items-center"></nav>
        </div>
    </header>
    <main class="my-5">
        <RouterView />
    </main>
</template>
