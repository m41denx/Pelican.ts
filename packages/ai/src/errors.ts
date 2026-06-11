export function formatPelicanToolError(error: unknown): Error {
    if (
        typeof error === "object" &&
        error !== null &&
        "isAxiosError" in error &&
        (error as {isAxiosError?: boolean}).isAxiosError
    ) {
        const axiosError = error as {
            message: string
            response?: {data?: unknown}
        }
        const data = axiosError.response?.data as
            | {errors?: Array<{detail?: string; code?: string}>; message?: string}
            | undefined
        const details =
            data?.errors
                ?.map(e => e.detail ?? e.code)
                .filter(Boolean)
                .join("; ") ??
            data?.message ??
            axiosError.message
        return new Error(`Pelican API error: ${details}`)
    }

    if (error instanceof Error) {
        return error
    }

    return new Error(String(error))
}
