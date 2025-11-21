import {string} from "zod"

export const ArrayQueryParams = (p: {
    [key: string]: {[key: string]: string}
}): {[key: string]: string} => {
    const params = new URLSearchParams()

    const o: ReturnType<typeof ArrayQueryParams> = {}

    for (const [param, value] of Object.entries(p)) {
        for (const [key, val] of Object.entries(value)) {
            o[`${param}[${key}]`] = val
        }
    }

    return o
}

export const SortParam = (key: string, p: "asc" | "desc"): string => {
    return `${p === "desc" ? "-" : ""}${key}`
}
