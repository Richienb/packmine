import chalk from "chalk"

import ora from "ora"

import fs = require("fs")

import path = require("path")

const archiver = require("archiver")

const version = (require("./package.json") || {}).version

const args = require("commander")
    .version(version, "-v, --version")
    .description("Backwards compatibility support for your Minecraft resource packs.")
    .usage("<resource pack directories>")
    .parse(process.argv)

const dirs = (() => {
    const pdirs = args.args.map((val: string) => path.resolve(val))
    return pdirs.length ? pdirs : [__dirname]
})()

const processDir = async (dir: string) => {
    const spinner = ora(`Processing ${dir}`).start()
    // TODO: Allow regular pack.mcmeta
    const conf = require(path.join(dir, "pack.json"))

    const createZip = (filename: string, pack_format: number, transforms: Function) => {
        const output = fs.createWriteStream(`${filename}.zip`)
        const archive = archiver("zip", {
            zlib: { level: 9 },
        })
        archive.pipe(output)

        output.on("close", () => spinner.stop())

        conf.pack.pack_format = pack_format
        archive.append(JSON.stringify(conf, null, 4), { name: "pack.mcmeta" })

        if (fs.existsSync(path.join(dir, "pack.png"))) archive.append(fs.createReadStream(path.join(dir, "pack.png")), { name: "pack.png" })

        transforms(archive)

        archive.finalize()
    }

    // Java Edition 1.13
    createZip(`${path.basename(dir)}-1.13`, 4, (archive: any) => {
        if (fs.existsSync(path.join(dir, "assets"))) archive.directory(path.join(dir, "assets"), "assets")
        if (fs.existsSync(path.join(dir, "data"))) archive.directory(path.join(dir, "data"), "data")
    })

    // Java Edition 1.11 - 1.12
    createZip(`${path.basename(dir)}-1.11-1.12`, 3, (archive: any) => {
        // Assets
        if (fs.existsSync(path.join(dir, "assets"))) archive.directory(path.join(dir, "assets"), "assets")

        // Advancements datapack
        if (fs.existsSync(path.join(dir, "data", "minecraft", "advancements"))) archive.directory(path.join(dir, "data", "minecraft", "advancements"), "advancements")

        // Loot tables datapack
        if (fs.existsSync(path.join(dir, "data", "minecraft", "loot_tables"))) archive.directory(path.join(dir, "data", "minecraft", "loot_tables"), "loot_tables")

        // Recipes datapack
        if (fs.existsSync(path.join(dir, "data", "minecraft", "recipes"))) archive.directory(path.join(dir, "data", "minecraft", "recipes"), "recipes")

        // Structures datapack
        if (fs.existsSync(path.join(dir, "data", "minecraft", "structures"))) archive.directory(path.join(dir, "data", "minecraft", "structures"), "structures")
    })

    // Java Edition 1.10
    createZip(`${path.basename(dir)}-1.10`, 2, (archive: any) => {

    })

    // Java Edition 1.6-pre
    createZip(`${path.basename(dir)}-1.6-pre`, 1, (archive: any) => {

    })
}

dirs
    .map(async (dir: string) => {
        fs.stat(dir, async (err, stats) => {
            if (!err) {
                if (stats.isDirectory()) processDir(dir)
                else console.log(chalk.yellow(`${dir} is not a directory!`))
            }
            else if (err.code === "ENOENT") console.log(chalk.yellow(`${dir} doesn't exist!`))
        })
    })
