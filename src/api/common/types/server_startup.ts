

export type StartupParams = {
    name: string,
    description: string,
    env_variables: string,
    default_value: string,
    server_value: string,
    is_editable: boolean,
    rules: string
}

export type StartupMeta = {
    startup_command: string
    raw_startup_command: string
}