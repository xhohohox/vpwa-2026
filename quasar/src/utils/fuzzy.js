// Case-insensitive subsequence match used for the fuzzy search in selects:
// "gnr" and "gene" both match "general", "xyz" does not.
export function fuzzyMatch(text, search) {
  const needle = search.toLowerCase()
  const haystack = text.toLowerCase()

  let index = 0
  for (const char of haystack) {
    if (char === needle[index]) index++
    if (index === needle.length) return true
  }
  return needle.length === 0
}