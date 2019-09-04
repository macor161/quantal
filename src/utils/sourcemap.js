/* eslint-disable prefer-destructuring */

function decompressSourcemap(sourceMap) {
  const instructions = sourceMap.split(';')
  let last = []

  return instructions
    .map(current => {
      const ret = [...last]
      const fields = current.split(':')

      if (fields[0] && fields[0] !== '-1' && fields[0].length)
        ret[0] = parseInt(fields[0], 10)

      if (fields[1] && fields[1] !== '-1' && fields[1].length)
        ret[1] = parseInt(fields[1], 10)

      if (fields[2] && fields[2].length)
        ret[2] = parseInt(fields[2], 10)

      if (fields[3] && fields[3].length)
        ret[3] = fields[3]

      last = ret
      return ret.join(':')
    })
    .join(';')
}

module.exports = { decompressSourcemap }
