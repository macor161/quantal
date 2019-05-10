module.exports = {
  "networks": {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*"   
    }   
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  /*
  compilers: {
    solc: {
         version: '0.5.0',
    },
  }*/

}
