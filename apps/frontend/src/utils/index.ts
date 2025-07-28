import jsSHA from 'jssha'

export const generateHash = (value: string) => {
    const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' })
}

export const getHashedValue = (value: string) => {}
