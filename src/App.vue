<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref, onMounted } from 'vue'

// Layout customization options
const layoutOptions = ref({
    sidebarCollapsed: false,
    contentWidth: 'fluid',
    theme: 'dark',
    navPosition: 'top',
});

// Toggle sidebar collapsed state
const toggleSidebar = () => {
    layoutOptions.value.sidebarCollapsed = !layoutOptions.value.sidebarCollapsed;
    localStorage.setItem('layoutOptions', JSON.stringify(layoutOptions.value));
};

// Load saved layout preferences from localStorage
onMounted(() => {
    const savedOptions = localStorage.getItem('layoutOptions');
    if (savedOptions) {
        layoutOptions.value = JSON.parse(savedOptions);
    }
});
</script>

<template>
    <div class="app-container" :class="`theme-${layoutOptions.theme}`">

        <div class="app-body">
            <!-- Side Navigation -->
            <aside v-if="layoutOptions.navPosition === 'side'" class="app-sidebar"
                :class="{ 'collapsed': layoutOptions.sidebarCollapsed }">
                <div class="sidebar-header">
                    <span class="gradient-text">Meili Tool</span>
                    <button class="btn btn-icon sidebar-toggle" @click="toggleSidebar">
                        <i class="fas"
                            :class="layoutOptions.sidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
                    </button>
                </div>
                <nav class="sidebar-nav">
                    <!-- Sidebar navigation items would go here -->
                </nav>
            </aside>

            <!-- Main Content -->
            <main class="app-content" :class="{
                'with-sidebar': layoutOptions.navPosition === 'side',
                'with-header': layoutOptions.navPosition === 'top',
                'container': layoutOptions.contentWidth === 'fixed',
                'container-fluid': layoutOptions.contentWidth === 'fluid'
            }">
                <RouterView v-slot="{ Component }">
                    <transition name="fade" mode="out-in">
                        <component :is="Component" />
                    </transition>
                </RouterView>
            </main>
        </div>
    </div>
</template>

<style>
/* Layout variables for customization */
:root {
    --header-height: 64px;
    --sidebar-width: 250px;
    --sidebar-collapsed-width: 70px;
    --content-padding: 1.5rem;
    --content-max-width: 1400px;
}
</style>

<style scoped>
/* Base layout */
.app-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.theme-dark {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    color: var(--bs-light);
}

.theme-light {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    color: var(--bs-dark);
}

/* Header styles */
.app-header {
    height: var(--header-height);
    position: sticky;
    top: 0;
    z-index: 1000;
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--bs-border-color);
}

.app-header-inner {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--content-padding);
}

.app-header-logo {
    font-size: 1.5rem;
    font-weight: 600;
}

.app-header-nav {
    display: flex;
    gap: 1rem;
}

.app-header-actions {
    display: flex;
    gap: 0.5rem;
}

/* Body layout */
.app-body {
    display: flex;
    flex: 1;
}

/* Sidebar styles */
.app-sidebar {
    width: var(--sidebar-width);
    flex-shrink: 0;
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(8px);
    border-right: 1px solid var(--bs-border-color);
    transition: width 0.3s ease;
    padding: var(--content-padding);
    display: flex;
    flex-direction: column;
    height: 100vh;
    position: sticky;
    top: 0;
}

.app-sidebar.collapsed {
    width: var(--sidebar-collapsed-width);
}

.sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    height: 48px;
}

.sidebar-nav {
    flex: 1;
    overflow-y: auto;
}

/* Main content styles */
.app-content {
    flex: 1;
    padding: var(--content-padding);
    margin: 0 auto;
    width: 100%;
}

.app-content.with-sidebar {
    margin-left: 0;
}

.app-content.with-header {
    padding-top: calc(var(--content-padding) / 2);
}

/* Button icon */
.btn-icon {
    width: 36px;
    height: 36px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 992px) {
    :root {
        --sidebar-width: 220px;
    }

    .app-sidebar {
        position: fixed;
        z-index: 1050;
        transform: translateX(-100%);
    }

    .app-sidebar.active {
        transform: translateX(0);
    }

    .app-content.with-sidebar {
        margin-left: 0;
    }
}

@media (max-width: 768px) {
    :root {
        --header-height: 56px;
        --content-padding: 1rem;
    }

    .app-header-logo {
        font-size: 1.25rem;
    }
}
</style>