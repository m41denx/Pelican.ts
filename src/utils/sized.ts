

const SIZES = {
    B: 1,
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
    TB: 1024 * 1024 * 1024 * 1024
}

const sized = (bytes: number, unit: keyof typeof SIZES): number => {
    return parseInt((bytes / SIZES[unit]).toFixed(3))
}


export default sized