const { Batch } = require('./batch')

/**
 * Separate compilation work of a dependency tree into multiple
 * batches
 *
 * @param {DependencyTree} tree
 * @param {number} batchNumber
 * @return {Batch[]}
 */
function dispatchWork(tree, batchNumber = 1) {
  const branches = tree.getBranches()

  let batches = createEmptyBatches(batchNumber)

  for (const branch of branches) {
    batches = getMinimumWorkloadConfiguration(batches, branch)
  }

  return batches
}

/**
 *
 * @param {number} batchNumber
 */
function createEmptyBatches(batchNumber) {
  return Array
    .from({ length: batchNumber })
    .map(() => new Batch())
}

/**
 * Returns the minimal workload configuration for a new branch
 * added to an array of batches.
 *
 * @param {Batch[]} batches
 * @param {Branch} branch
 */
function getMinimumWorkloadConfiguration(batches, branch) {
  let minimumConfiguration
  let minimumConfigurationWorkload = Infinity
  const newBatches = batches.map((batch) => batch.addBranch(branch))

  for (const [i] of batches.entries()) {
    const trialBatch = batches.map((k, index) => {
      return index === i
        ? newBatches[index]
        : batches[index]
    })
    const workload = getWorkload(trialBatch)

    if (workload < minimumConfigurationWorkload) {
      minimumConfiguration = trialBatch
      minimumConfigurationWorkload = workload
    }
  }
  return minimumConfiguration
}

/**
 * Returns the workload for an array of Batch objects.
 * The number correspond to the workload of the largest Batch
 * @param {Batch[]} batches
 */
function getWorkload(batches) {
  let largestWorkload = -1

  for (const batch of batches) {
    const workload = batch.workload()
    if (workload > largestWorkload) {
      largestWorkload = workload
    }
  }
  return largestWorkload
}

module.exports = { dispatchWork }
