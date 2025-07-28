export const getCurrencyString = (value: number) => {
    const USDollar = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    })

    return USDollar.format(value)
}

export const parseAmount = (value: string) => {
    const re = /\$([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*))(?:[Ee]([+-]?\d+))?/
    const ok = re.exec(value)
    console.log(ok)
    if (!ok || ok.length <= 1) return
    console.log(ok)
    return parseFloat(ok[1])
}
