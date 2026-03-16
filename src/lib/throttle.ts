export function throttle<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
): T {
    let last = 0

    return function (...args: any[]) {
        const now = Date.now()

        if (now - last > delay) {
            last = now
            return fn(...args)
        }
    } as T
}
