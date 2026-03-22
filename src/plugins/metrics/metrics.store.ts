type Metrics = {
    totalRequests: number
    totalErrors: number
    slowRequests: number
    durations: number[]
}

const metrics: Metrics = {
    totalRequests: 0,
    totalErrors: 0,
    slowRequests: 0,
    durations: []
}

export function recordRequest(duration: number) {
    metrics.totalRequests++
    metrics.durations.push(duration)

    // mark slow queries (>500ms)
    if (duration > 500) {
        metrics.slowRequests++
    }
}

export function recordError() {
    metrics.totalErrors++
}

export function getMetrics() {
    const avg =
        metrics.durations.length === 0
            ? 0
            : metrics.durations.reduce((a, b) => a + b, 0) /
            metrics.durations.length

    return {
        ...metrics,
        avgResponseTime: Math.round(avg)
    }
}