
export type FileObject = {
    name: string,
    mode: string,
    size: number,
    is_file: boolean,
    is_symlink: boolean,
    is_editable: boolean
    mimetype: string
    created_at: string
    modified_at: string
}