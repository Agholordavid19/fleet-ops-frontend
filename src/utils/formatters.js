export function formatDate(dateStr, opts = {}) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...opts,
  })
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return '—'
  const now = new Date()
  const then = new Date(dateStr)
  const diffMs = now - then
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(dateStr)
}

export function formatCurrency(amount, currency = 'USD') {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatMileage(km) {
  if (km == null) return '—'
  return new Intl.NumberFormat('en-US').format(km) + ' km'
}

export function formatPercentage(value, decimals = 1) {
  if (value == null) return '—'
  return `${Number(value).toFixed(decimals)}%`
}

export function formatNumber(value) {
  if (value == null) return '—'
  return new Intl.NumberFormat('en-US').format(value)
}
