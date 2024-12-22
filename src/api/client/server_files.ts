import axios, {AxiosInstance} from "axios";
import {string} from "zod";
import {FileObject} from "@/api/common/types_file";
import {GenericListResponse, GenericResponse} from "@/api/base/types";


export class ServerFiles {
    r: AxiosInstance
    id: string

    constructor(requester: AxiosInstance, id: string) {
        this.r = requester
        this.id = id
    }

    list = async (path?: string): Promise<FileObject[]> => {
        const {data} = await this.r.get<
            GenericListResponse<GenericResponse<FileObject, "file_object">>
        >(`/client/servers/${this.id}/files/list`, {
            params: {directory: path}
        })
        return data.data.map(r => r.attributes)
    }

    /**
     * Return the contents of a file. To read binary file (non-editable) use {@link download} instead
     */
    contents = async (path: string): Promise<string> => {
        const {data} = await this.r.get<string>(`/client/servers/${this.id}/files/contents`, {
            params: {file: path}
        })
        return data
    }

    downloadGetUrl = async (path: string): Promise<string> => {
        const {data} = await this.r.get<
            GenericResponse<{ url: string }, "signed_url">
        >(`/client/servers/${this.id}/files/download`, {
            params: {file: path}
        })
        return data.attributes.url
    }

    download = async (path: string): Promise<ArrayBuffer> => {
        const url = await this.downloadGetUrl(path)
        const {data} = await axios.get<ArrayBuffer>(url, {responseType: "arraybuffer"})
        return data
    }

    rename = async (
        root: string = "/",
        files: { from: string, to: string }[]
    ): Promise<void> => {
        await this.r.put(`/client/servers/${this.id}/files/rename`, {root, files})
    }

    copy = async (location: string): Promise<void> => {
        await this.r.post(`/client/servers/${this.id}/files/copy`, {location})
    }

    write = async (path: string, content: string): Promise<void> => {
        await this.r.post(`/client/servers/${this.id}/files/write`, content, {
            params: {file: path},
        })
    }

    compress = async (
        root: string = "/",
        files: string[],
    ): Promise<void> => {
        await this.r.post(`/client/servers/${this.id}/files/compress`, {root, files})
    }

    decompress = async (
        root: string = "/",
        file: string,
    ): Promise<void> => {
        await this.r.post(`/client/servers/${this.id}/files/decompress`, {root, file})
    }

    delete = async (
        root: string = "/",
        files: string[],
    ): Promise<void> => {
        await this.r.post(`/client/servers/${this.id}/files/delete`, {root, files})
    }

    createFolder = async (
        root: string = "/",
        name: string,
    ): Promise<void> => {
        await this.r.post(`/client/servers/${this.id}/files/create-folder`, {root, name})
    }

    uploadGetUrl = async (): Promise<string> => {
        const {data} = await this.r.get<
            GenericResponse<{ url: string }, "signed_url">
        >(`/client/servers/${this.id}/files/upload`)
        return data.attributes.url
    }

    upload = async (file: File, root: string = "/"): Promise<void> => {
        const url = await this.uploadGetUrl()
        await axios.post(url, {files: file}, {
            headers: {"Content-Type": "multipart/form-data"},
            params: {directory: root}
        })
    }
}