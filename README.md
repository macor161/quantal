# Quantal

Quantal is a fast and lightweight build tool for Solidity. 

## Fast, lightweight


![output](https://user-images.githubusercontent.com/642515/59545001-44d5df00-8ee6-11e9-8a30-1415b38f0c53.gif)
<p align="center"><sub>Open Zeppelin compilation with no cache</sub></p>

By using multiple binary compilers in parallel, V8 caching and other optimizations, Quantal is on average 2-3x faster than truffle-compile. It follows the Unix principle of doing one thing but do it well, focusing exclusively on compilation related tasks.


## Pretty errors and warnings

![compile 2](https://user-images.githubusercontent.com/642515/59149948-2d7c8a80-89ea-11e9-87b0-71d9c57ee7dc.png)



## Watch mode

Launch a new build each time a smart contract is modified. 


## Install

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
* Some solc versions are not supported yet. See list below.
* Cache is not implemented yet. This means quantal will recompile all smart contracts every time it’s launched. Cache support is coming soon.
* Formatted error messages are not supported for solc versions below 0.4.20

## Supported solc versions

**MacOS**

Mojave (10.14) and High Sierra (10.13) currently supported for the following solc versions:

- 0.5.9
- 0.5.8
- 0.5.7
- 0.5.6
- 0.5.5
- 0.5.4
- 0.5.3
- 0.5.2
- 0.5.1
- 0.5.0
- 0.4.26
- 0.4.25
- 0.4.24
- 0.4.23
- 0.4.22
- 0.4.21
- 0.4.20
- 0.4.19
- 0.4.18
- 0.4.17
- 0.4.16
- 0.4.15
- 0.4.14
- 0.4.13
- 0.4.11
- 0.4.10

**Linux**

- 0.5.9
- 0.5.8
- 0.5.7
- 0.5.6
- 0.5.5
- 0.5.4
- 0.5.3
- 0.5.2
- 0.5.1
- 0.5.0
- 0.4.26
- 0.4.25
- 0.4.24
- 0.4.23
- 0.4.22
- 0.4.21
- 0.4.20
- 0.4.19
- 0.4.18
- 0.4.17
- 0.4.16
- 0.4.15
- 0.4.14
- 0.4.13
- 0.4.12
- 0.4.11

**Windows**

- Windows is not currently supported.