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

const loadJSON = (filepath: string) => JSON.parse(fs.readFileSync(filepath, "utf8"))

const processDir = async (dir: string) => {
    const spinner = ora(`Processing ${dir}`).start()
    // TODO: Allow regular pack.mcmeta
    const conf = loadJSON(path.join(dir, "pack.mcmeta"))

    const createZip = (filename: string, pack_format: number, transforms: Function) => {
        const output = fs.createWriteStream(`${filename}.zip`)
        const archive = archiver("zip", {
            zlib: { level: 9 },
        })
        archive.pipe(output)

        output.on("close", () => spinner.stop())

        conf.pack.pack_format = pack_format
        archive.append(JSON.stringify(conf, null, 4), { name: "pack.mcmeta" })

        // archive.directoryIf = (d: string, dst = d) => fs.access(path.join(dir, d), fs.constants.F_OK, (err) => {
        //     if (!err) archive.directory(path.join(dir, d), dst)
        // });

        archive.directoryIf = (d: string, dst = d) => {
            if (fs.existsSync(path.join(dir, d))) archive.directory(path.join(dir, d), dst)
        }

        if (fs.existsSync(path.join(dir, "pack.png"))) archive.append(fs.createReadStream(path.join(dir, "pack.png")), { name: "pack.png" })

        // fs.access(path.join(dir, "pack.png"), fs.constants.F_OK, (err) => {
        //     if (!err) archive.append(fs.createReadStream(path.join(dir, "pack.png")), { name: "pack.png" })
        // })

        transforms(archive)

        archive.finalize()
    }

    // Java Edition 1.13
    createZip(`${path.basename(dir)}-1.13`, 4, (archive: any) => {
        archive.directoryIf("assets")
        archive.directoryIf("data")
    })

    // Java Edition 1.11 - 1.12
    createZip(`${path.basename(dir)}-1.11-1.12`, 3, (archive: any) => {
        // Assets
        archive.directoryIf("assets")

        // Items
        archive.directoryIf(path.join("assets", "minecraft", "textures", "item"), path.join("assets", "minecraft", "textures", "items"))

        // Blocks
        archive.directoryIf(path.join(dir, "assets", "minecraft", "textures", "block"), path.join("assets", "minecraft", "textures", "blocks"))

        // Advancements datapack
        archive.directoryIf(path.join(dir, "data", "minecraft", "advancements"), "advancements")

        // Loot tables datapack
        archive.directoryIf(path.join(dir, "data", "minecraft", "loot_tables"), "loot_tables")

        // Recipes datapack
        archive.directoryIf(path.join(dir, "data", "minecraft", "recipes"), "recipes")

        // Structures datapack
        archive.directoryIf(path.join(dir, "data", "minecraft", "structures"), "structures")
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
