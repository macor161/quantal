#!/usr/bin/env node

const fs = require('fs-extra')
const path = require('path')
const { red, green } = require('chalk')
const importFresh = require('import-fresh')

async function main() {
    try {
        const [,,folderArg1, folderArg2] = process.argv

        if (!folderArg1 || !folderArg2)
            throw new Error('You must specify two folders to compare.')

        console.log(`Comparing ${folderArg1} and ${folderArg2}`)

        const folder1 = getPath(folderArg1)
        const folder2 = getPath(folderArg2)

        const folder1Files = (await fs.readdir(folder1, { withFileTypes: true }))
            .filter(file => file.isFile())

        for (const file of folder1Files) {
            const fileName = file.name

            console.log(`${fileName}...`)
            const file1Path = path.join(folder1, fileName) 
            const file2Path = path.join(folder2, fileName)

            if (await fs.exists(file2Path) && await isFile(file2Path)) {
                if (await compare(file1Path, file2Path))
                    console.log(green('ok'))
                else
                    console.log(red('wrong'))
            }
        }

    } catch (err) {
        console.log(`${red.bold('Error')}: ${err}`)
    }
}

async function compare(filePath1, filePath2) {
    const artifact1 = importFresh(filePath1)
    const artifact2 = importFresh(filePath2)

    return artifact1.bytecode === artifact2.bytecode
}

async function isFile(file) {
    return (await fs.lstat(file)).isFile()
}

function getPath(filePath) {
    return path.join(process.cwd(), filePath)
}


main()