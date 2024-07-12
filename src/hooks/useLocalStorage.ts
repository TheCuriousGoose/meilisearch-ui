import { ref, watch } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T) {
    // Get the initial value from localStorage or use the default value
    const storedValue = localStorage.getItem(key)
    const data = ref<T>(storedValue ? JSON.parse(storedValue) : defaultValue)

    // Watch the data ref and update localStorage when it changes
    watch(
        data,
        (newValue) => {
            localStorage.setItem(key, JSON.stringify(newValue))
        },
        { deep: true }
    )

    return data
}
