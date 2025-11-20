import path from "node:path"
import type { ServerClient } from "@/api/client/server"
import type { FileObject } from "@/api/common/types/server_files"

export class ServerFile {
    private readonly client: ServerClient
    private readonly dir: string
    private readonly path: string
    readonly createdAt: Date
    readonly isFile: boolean
    readonly isSymlink: boolean
    readonly mimetype: string
    readonly mode: string
    readonly modeBits: string
    readonly modifiedAt: Date
    readonly name: string
    readonly size: number

    constructor(client: ServerClient, file: FileObject, dir: string = "/") {
        this.client = client
        this.dir = dir
        this.createdAt = new Date(file.created_at)
        this.isFile = file.is_file
        this.isSymlink = file.is_symlink
        this.mimetype = file.mimetype
        this.mode = file.mode
        this.modeBits = file.mode_bits
        this.modifiedAt = new Date(file.modified_at)
        this.name = file.name
        this.size = file.size
        this.path = path.join(dir, this.name)
    }

    get isArchive() {
        // Maybe mimetype is better
        return [
            "zip",
            "tgz",
            "tar.gz",
            "txz",
            "tar.xz",
            "tbz2",
            "tar.bz2",
        ].some((ext) => this.name.endsWith(`.${ext}`))
    }

    /**
     * Return the contents of a file. To read binary file (non-editable) use {@link download} instead
     */
    contents = async () => this.client.files.contents(this.path)

    downloadGetUrl = async () => this.client.files.downloadGetUrl(this.path)

    download = async () => this.client.files.download(this.path)

    rename = async (newName: string) =>
        this.client.files.rename(this.dir, [{ from: this.name, to: newName }])

    copy = async () => this.client.files.copy(this.path)

    write = async (content: string) =>
        this.client.files.write(this.path, content)

    compress = async (
        archive_name?: string,
        extension?:
            | "zip"
            | "tgz"
            | "tar.gz"
            | "txz"
            | "tar.xz"
            | "tbz2"
            | "tar.bz2",
    ) =>
        this.client.files.compress(
            this.dir,
            [this.name],
            archive_name,
            extension,
        )

    decompress = async () => this.client.files.decompress(this.dir, this.name)

    delete = async () => this.client.files.delete(this.dir, [this.name])

    chmod = async (mode: number) =>
        this.client.files.chmod(this.dir, [{ file: this.name, mode }])
}
