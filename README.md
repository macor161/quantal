# Quantal

Quantal is a fast and lightweight build tool for Solidity. 

## Fast, lightweight tool

By using multiple binary compilers in parallel, V8 caching and other optimizations, Quantal is on average 2-3x faster than truffle-compile. It follows the Unix principle of doing one thing but do it well, focusing exclusively on compilation related tasks.



## Pretty errors and warnings




## Watch mode

Launch a new build each time a smart contract is modified.


## Installation

```bash
yarn global add quantal
```
or
```bash
npm install -g quantal
```

**Homebrew is currently required on MacOS.**

## Usage

```
quantal [options]

-w, --watch     Watch for changes
-v, --version   Display version
-h, --help      Display help
```

## Truffle config compatibility

The following truffle config options are currently supported:

```javascript
{
    contracts_build_directory,
    compilers: {
        solc: {
            version, // See supported versions below
            evmVersion,
            optimizer: {
                enabled,
                runs			
            }
        }
    }
}
```

## Important notes

* The current alpha version is not recommended for production use.
* Windows is currently not supported
* Some solc versions are not supported yet. See list below
* Cache is not implemented yet. This means quantal will recompile all smart contracts every time it’s launched. Cache support is coming soon.

## Supported solc versions

