export function debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
    let timerId: ReturnType<typeof setTimeout>

    return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
        const context = this
        clearTimeout(timerId)
        timerId = setTimeout(() => {
            func.apply(context, args)
        }, delay)
    }
}