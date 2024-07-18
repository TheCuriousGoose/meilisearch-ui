<script setup lang="ts"></script>
<template>
    <div class="w-100">
        <div class="card">
            <div class="card-body">
                <p class="fs-5">
                    <slot></slot>
                </p>
                <small class="text-muted">
                    <slot name="description"></slot>
                </small>
            </div>
        </div>
    </div>
</template>
