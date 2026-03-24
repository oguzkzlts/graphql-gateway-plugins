type Metrics = {
    totalRequests: number
    totalErrors: number
    slowRequests: number
    cacheHits: number
    cacheMisses: number
    durations: number[]
    operations: Record<string, number>
}

const MAX_SAMPLES = 1000

const metrics: Metrics = {
    totalRequests: 0,
    totalErrors: 0,
    slowRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    durations: [],
    operations: {}
}

// Record request duration
export function recordRequest(duration: number) {
    metrics.totalRequests++

    metrics.durations.push(duration)

    // prevent memory leak
    if (metrics.durations.length > MAX_SAMPLES) {
        metrics.durations.shift()
    }

    // mark slow queries (>500ms)
    if (duration > 500) {
        metrics.slowRequests++
    }
}

// Record errors
export function recordError() {
    metrics.totalErrors++
}

// Track operations (queries)
export function recordOperation(operation: string) {
    if (!operation) return

    const key = operation.slice(0, 100) // prevent huge keys
    metrics.operations[key] = (metrics.operations[key] || 0) + 1
}

// Record Redis cache hits
export function recordCacheHit() {
    metrics.cacheHits++
}

// Record Redis cache misses
export function recordCacheMiss() {
    metrics.cacheMisses++
}

// Percentile helper (P95 etc.)
function percentile(arr: number[], p: number) {
    if (arr.length === 0) return 0

    const sorted = [...arr].sort((a, b) => a - b)
    const index = Math.ceil((p / 100) * sorted.length) - 1

    return sorted[index]
}

// Public metrics output
export function getMetrics() {
    const avg =
        metrics.durations.length === 0
            ? 0
            : metrics.durations.reduce((a, b) => a + b, 0) /
            metrics.durations.length

    return {
        totalRequests: metrics.totalRequests,
        totalErrors: metrics.totalErrors,
        slowRequests: metrics.slowRequests,
        cacheHits: metrics.cacheHits,
        cacheMisses: metrics.cacheMisses,
        avgResponseTime: Math.round(avg),
        p95ResponseTime: percentile(metrics.durations, 95),
        operations: metrics.operations
    }
}