// Lista kategorii oceny pracownika
export const categories = [
  'Publikacje dydaktyczne',
  'Podniesienie jakości nauczania',
  'Zajęcia w języku obcym, wykłady za granicą',
  'Pełnienie funkcji dydaktycznej (za każdy rok)',
  'Nagrody i wyróznienia',
]

// Funkcja pomocnicza do konwersji nazwy kategorii na slug URL
export function categoryToSlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
}

// Funkcja pomocnicza do konwersji sluga URL na nazwę kategorii
export function slugToCategory(slug: string, categories: string[]): string {
  // Obsługa specyficznych przypadków z polskimi znakami
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

  // Wyszukiwanie kategorii na podstawie sluga lub zwrócenie pierwszej kategorii jako domyślnej
  return categories.find(category => categoryToSlug(category) === slug) || categories[0]
}