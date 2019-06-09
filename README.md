# PackMine

Backwards compatibility support for your Minecraft resource packs.

## How to use

Drop a [packmine binary](https://github.com/Richienb/packmine/releases) into the root directory of your texture pack, in the same directory as your `pack.mcmeta` file.

You can now remove the `pack_format` property in your `pack.mcmeta` file but not removing it doesn't have any effect on the output.

Open the binary executable to generate the zipped and backwards compatible resource pack files.

You now only have to create a resource pack for the latest `pack_format` which is `4`.

## For experienced users

You can globally install the `packmine` package on NPM.
