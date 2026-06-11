const BINARY_TOOL_SUFFIXES = [
    "pelican_client_server_files_download",
    "pelican_client_server_backups_download"
] as const

const UPLOAD_TOOL_ID = "pelican_client_server_files_upload"

export function isBinaryDownloadTool(toolId: string): boolean {
    return (BINARY_TOOL_SUFFIXES as readonly string[]).includes(toolId)
}

export function isUploadTool(toolId: string): boolean {
    return toolId === UPLOAD_TOOL_ID
}

export function serializeToolResult(result: unknown): unknown {
    if (result === undefined) {
        return {ok: true}
    }
    if (result instanceof ArrayBuffer) {
        return {
            base64: Buffer.from(result).toString("base64"),
            byteLength: result.byteLength
        }
    }
    return result
}

export function base64ToFile(
    contentBase64: string,
    filename: string
): File {
    const buffer = Buffer.from(contentBase64, "base64")
    const blob = new Blob([buffer])
    return new File([blob], filename)
}
