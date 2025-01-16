
export type Container = {
    startup_command: string,
    image: string,
    installed: number,
    environment: {
        [key: string]: string | number
    },
    ports: number[],
    volumes: string[],
    network_mode: string
}