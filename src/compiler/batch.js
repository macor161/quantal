class Batch {
  constructor(branches = []) {
    this._branches = branches
    const nodes = branches
      .map(branch => branch.getNodes())
      .reduce((acc, val) => acc.concat(val), [])

    this._nodes = new Set(nodes)
  }

  /**
     * Adds a branch
     * @param {Branch} branch
     * @return {Batch} Batch object with the new branch
     */
  addBranch(branch) {
    return new Batch(this._branches.concat([branch]))
  }

  getBranches() {
    return this._branches
  }

  /**
     * Returns a unique hash for this batch
     * @return {string}
     */
  hash() {
    return this._branches
      .map(branch => branch.getId())
      .sort()
      .join(',')
  }

  /**
     * Returns the estimated workload for this batch
     * @return {number}
     */
  workload() {
    return this._nodes.size
  }
}


module.exports = { Batch }
