import { getCourses } from './courses'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Category {
  name: string
  count: number
}

// ─── NOTE ─────────────────────────────────────────────────────────────────────
// The server has no dedicated /api/categories endpoint.
// Categories are derived from the `category` field on Course records.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all courses (up to 100) and extract unique category names with counts.
 */
export async function getCategories(): Promise<Category[]> {
  const result = await getCourses({ limit: 100 })

  const counts = new Map<string, number>()
  for (const course of result.data) {
    counts.set(course.category, (counts.get(course.category) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Return only category names as a string array (e.g. for filter dropdowns).
 */
export async function getCategoryNames(): Promise<string[]> {
  const categories = await getCategories()
  return categories.map((c) => c.name)
}
