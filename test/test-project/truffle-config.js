module.exports = {
  contracts_build_directory: 'truffle-build',
  solc: {
    optimizer: {
      enabled: false,
      runs: 200,
    },
  },

  compilers: {
    solc: {
      version: '0.5.8',
    },
  },
}
