/**
 * Dependency tree for a list of solidity files.
 * Instead of keeping references for the root nodes, we
 * keep the leaf references. This helps when extracting
 * independent dependency paths.
 */
class DependencyTree {
  constructor() {
    this._files = {}

    // Files not imported from any other file
    this._leafs = []

    // Files with missing dependencies
    this._filesWithMissingDependencies = []
  }

  /**
     * Adds a file to the dependency tree
     * @param {Object} file
     * @param {string} file.path File path, including file name
     * @param {string[]} file.imports File imports
     * @param {string} file.content File source code
     */
  addFile(file) {
    if (this._files[file.path]) {
      console.error(`File ${file.path} already exists in dependency tree`)
    }

    const fileNode = new DependencyTreeNode(file)
    this._files[fileNode.path] = fileNode
    this._fillInDependencies(fileNode)
    this._updateFilesWithMissingDependencies(fileNode)
    this._updateLeafs()
  }

  /**
     * @return {Branch[]}
     */
  getBranches() {
    return this._leafs
        .map((leaf, index) => new Branch({node: leaf, id: index}))
  }

  /**
     * Returns all files not imported from any other file
     */
  getLeafs() {
    return this._leafs
  }

  _fillInDependencies(file) {
    file.dependencies = file.imports
        .filter((path) => this._files[path] !== undefined)
        .map((path) => this._files[path])
  }

  _updateFilesWithMissingDependencies(newFile) {
    for (const file of this._filesWithMissingDependencies) {
      if (file.imports.includes(newFile.path)) {
        file.dependencies.push(newFile)
        newFile.children.push(file)
      }
    }

    this._filesWithMissingDependencies = this._filesWithMissingDependencies
        .concat([newFile])
        .filter((file) => file.isMissingDependencies())

    if (newFile.isLeaf()) {
      this._leafs.push(newFile)
    }
  }

  _updateLeafs() {
    this._leafs = this._leafs
        .filter((node) => node.isLeaf())
  }
}

/**
 * @property {string} path File path
 * @property {string} content Source code
 * @property {string[]} imports Dependencies file paths
 * @property {DependencyTreeNode[]} dependencies Dependencies
 * @property {DependencyTreeNode[]} children All nodes that depend on this node
 */
class DependencyTreeNode {
  constructor(file) {
    this.dependencies = file.dependencies || []
    this.path = file.path
    this.imports = file.imports
    this.content = file.content
    this.children = []
  }

  isMissingDependencies() {
    return this.imports.length > this.dependencies.length
  }

  getAllDependencies() {
    const dependencies = this.dependencies
        .map((node) => node.getAllDependencies())
        .reduce((acc, dep) => acc.concat(dep), []) // Flatten nested dependencies
        .concat(this.dependencies) // Add current node dependencies

    return unique(dependencies)
  }

  getDirectDependencies() {
    return this.dependencies
  }

  getLeafs({onlyUniques = true} = {}) {
    if (this.isLeaf()) {
      return [this]
    }

    const leafs = this.children
        .map((node) => node.getLeafs())
        .reduce((acc, dep) => acc.concat(dep), []) // Flatten children leafs

    return onlyUniques
            ? unique(leafs)
            : leafs
  }

  isLeaf() {
    return this.children.length === 0
  }
}

class Branch {
  /**
     *
     * @param {DependencyTreeNode} node
     */
  constructor({node, id}) {
    this._node = node
    this._id = id
    this._nodesInCommonCache = new Map() // Cache for nodes in common for each branch
  }

  getId() {
    return this._id
  }

  getNodes() {
    return this._node.getAllDependencies()
        .concat([this._node])
  }

  nodesInCommon(branch) {
    if (!this._nodesInCommonCache.has(branch)) {
      const branchNodes = branch.getNodes()

      const nodesInCommon = this.getNodes()
          .filter((node) => branchNodes.includes(node))

      this._nodesInCommonCache.set(branch, nodesInCommon)
    }

    return this._nodesInCommonCache.get(branch)
  }
}

function unique(items) {
  return Array.from(new Set(items))
}

module.exports = {DependencyTree, DependencyTreeNode, Branch}
