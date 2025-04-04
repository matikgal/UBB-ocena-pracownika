// List of categories
export const categories = [
  'Publikacje dydaktyczne',
  'Podniesienie jakości nauczania',
  'Zajęcia w języku obcym, wykłady za granicą',
  'Pełnienie funkcji dydaktycznej (za każdy rok)',
  'Nagrody i wyróznienia',
]

// Helper function to convert category name to URL slug
export function categoryToSlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
}

// Helper function to convert URL slug to category name
export function slugToCategory(slug: string, categories: string[]): string {
  // Check for specific cases with special characters
  if (slug === 'nagrody-i-wyroznienia') {
    return 'Nagrody i wyróznienia'
  }
  if (slug === 'zajecia-w-jezyku-obcym-wyklady-za-granica') {
    return 'Zajęcia w języku obcym, wykłady za granicą'
  }
  if (slug === 'pelnienie-funkcji-dydaktycznej-za-kazdy-rok') {
    return 'Pełnienie funkcji dydaktycznej (za każdy rok)'
  }
  if (slug === 'podniesienie-jakosci-nauczania') {
    return 'Podniesienie jakości nauczania'
  }

  return categories.find(category => categoryToSlug(category) === slug) || categories[0]
}