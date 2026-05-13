export const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '—')

export const formatCurrency = (value) => {
    const amount = Number(value)

    if (!Number.isFinite(amount)) return '—'

    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0,
    }).format(amount)
}

export const getErrorMessage = (err) =>
    err?.data?.message ?? err?.error ?? 'Something went wrong'
