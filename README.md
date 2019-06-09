# PackMine

Backwards compatibility support for your Minecraft resource packs.

## How to import your regular resource pack

Replace `pack.mcmeta` with `pack.json` and remove the `pack_format` property.

## How to use

Run `packmine <YOUR_DIRECTORY>` to convert the texture pack directory to zipped versions of backwards compatible versions of your pack.

You now only have to create a resource pack for the latest `pack_format` which is `4`.
