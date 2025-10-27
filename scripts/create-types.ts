
import fs from "fs"
import path from "path"

const typesPaths = [
    "./api/common/types",
    "./api/application/types",
    "./api/client/types"
]

typesPaths.forEach(p => {
    const prefix = path.join(__dirname, "../src" , p)
    const files = fs.readdirSync(prefix)
        .filter(f => f!=="index.ts")
        .map(f => f.replace(/\.ts$/, ""))
    const strings: Array<string> = []
    files.forEach(f => {
        strings.push(`export * from "./${f}"`)
    })
    fs.writeFileSync(path.join(prefix, "index.ts"), strings.join("\n"))
})

const strings = typesPaths.map(p => `export * from "${p}"`)
fs.writeFileSync(path.join(__dirname, "../src/types.ts"), strings.join("\n"))
