/**
 * Ensure sources have operating system independent paths
 * i.e., convert backslashes to forward slashes; things like C: are left intact.
 * This code comes from Truffle 
 */
function formatPaths(sources, hasTargets) {

    const operatingSystemIndependentSources = {}
    const operatingSystemIndependentTargets = {}
    const originalPathMappings = {}
  
    Object.keys(sources).forEach(function(source) {
      // Turn all backslashes into forward slashes
      let replacement = source.replace(/\\/g, '/')
  
      // Turn G:/.../ into /G/.../ for Windows
      if (replacement.length >= 2 && replacement[1] === ':') {
        replacement = '/' + replacement;
        replacement = replacement.replace(':', '')
      }
  
      // Save the result
      operatingSystemIndependentSources[replacement] = sources[source]
  
      // Just substitute replacement for original in target case. It's
      // a disposable subset of `sources`
      if (hasTargets && options.compilationTargets.includes(source)) {
        operatingSystemIndependentTargets[replacement] = sources[source]
      }
  
      // Map the replacement back to the original source path.
      originalPathMappings[replacement] = source;
    })
  
    return {
      operatingSystemIndependentSources,
      operatingSystemIndependentTargets,
      originalPathMappings
    }
  }

  module.exports = { formatPaths }