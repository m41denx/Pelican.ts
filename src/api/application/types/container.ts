export type Container = {
    startup_command: string
    image: string
    installed: number
    docker_labels: Record<string, string>
    environment: Record<string, string>
    ports: number[]
    volumes: string[]
    network_mode: string
}
