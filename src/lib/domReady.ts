export function domReady(): Promise<void> {
    if (
        document.readyState === "complete" ||
        document.readyState === "interactive"
    ) {
        return Promise.resolve()
    }

    return new Promise((resolve) => {
        document.addEventListener("DOMContentLoaded", () => resolve(), {
            once: true
        })
    })
}
