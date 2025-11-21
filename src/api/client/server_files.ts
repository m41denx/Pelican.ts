import axios, {AxiosInstance} from "axios"
import {string} from "zod"
import {FileObject} from "@/api/common/types/server_files"
import {GenericListResponse, GenericResponse} from "@/api/base/types"

export class ServerFiles {
    private readonly r: AxiosInstance
    private readonly id: string

    constructor(requester: AxiosInstance, id: string) {
        this.r = requester
        this.id = id
    }

    list = async (path?: string): Promise<FileObject[]> => {
        const {data} = await this.r.get<
            GenericListResponse<GenericResponse<FileObject, "file_object">>
        >(`/servers/${this.id}/files/list`, {params: {directory: path}})
        return data.data.map(r => r.attributes)
    }

    /**
     * Return the contents of a file. To read binary file (non-editable) use {@link download} instead
     */
    contents = async (path: string): Promise<string> => {
        const {data} = await this.r.get<string>(
            `/servers/${this.id}/files/contents`,
            {params: {file: path}}
        )
        return data
    }

    downloadGetUrl = async (path: string): Promise<string> => {
        const {data} = await this.r.get<
            GenericResponse<{url: string}, "signed_url">
        >(`/servers/${this.id}/files/download`, {params: {file: path}})
        return data.attributes.url
    }

    download = async (path: string): Promise<ArrayBuffer> => {
        const url = await this.downloadGetUrl(path)
        const {data} = await axios.get<ArrayBuffer>(url, {
            responseType: "arraybuffer"
        })
        return data
    }

    rename = async (
        root: string = "/",
        files: {from: string; to: string}[]
    ): Promise<void> => {
        await this.r.put(`/servers/${this.id}/files/rename`, {root, files})
    }

    copy = async (location: string): Promise<void> => {
        await this.r.post(`/servers/${this.id}/files/copy`, {location})
    }

    write = async (path: string, content: string): Promise<void> => {
        await this.r.post(`/servers/${this.id}/files/write`, content, {
            params: {file: path}
        })
    }

    compress = async (
        root: string = "/",
        files: string[],
        archive_name?: string,
        extension?:
            | "zip"
            | "tgz"
            | "tar.gz"
            | "txz"
            | "tar.xz"
            | "tbz2"
            | "tar.bz2"
    ): Promise<FileObject> => {
        const {data} = await this.r.post<
            GenericResponse<FileObject, "file_object">
        >(`/servers/${this.id}/files/compress`, {
            root,
            files,
            archive_name,
            extension
        })
        return data.attributes
    }

    decompress = async (root: string = "/", file: string): Promise<void> => {
        await this.r.post(`/servers/${this.id}/files/decompress`, {root, file})
    }

    delete = async (root: string = "/", files: string[]): Promise<void> => {
        await this.r.post(`/servers/${this.id}/files/delete`, {root, files})
    }

    createFolder = async (root: string = "/", name: string): Promise<void> => {
        await this.r.post(`/servers/${this.id}/files/create-folder`, {
            root,
            name
        })
    }

    chmod = async (
        root: string = "/",
        files: Array<{file: string; mode: number}>
    ): Promise<void> => {
        await this.r.post(`/servers/${this.id}/files/chmod`, {root, files})
    }

    pullFromRemote = async (
        url: string,
        directory?: string,
        filename?: string, // Unused
        use_header: boolean = false, // Unused
        foreground: boolean = false // Unused
    ): Promise<void> => {
        await this.r.post(`/servers/${this.id}/files/pull`, {
            url,
            directory,
            filename,
            use_header,
            foreground
        })
    }

    uploadGetUrl = async (): Promise<string> => {
        const {data} = await this.r.get<
            GenericResponse<{url: string}, "signed_url">
        >(`/servers/${this.id}/files/upload`)
        return data.attributes.url
    }

    upload = async (file: File, root: string = "/"): Promise<void> => {
        const url = await this.uploadGetUrl()
        await axios.post(
            url,
            {files: file},
            {
                headers: {"Content-Type": "multipart/form-data"},
                params: {directory: root}
            }
        )
    }
}
