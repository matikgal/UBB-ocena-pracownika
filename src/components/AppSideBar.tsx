import { BookOpen } from 'lucide-react'
import logo from '../assets/Logo.svg'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from '../components/ui/sidebar'

import {
  publikacjeDydaktyczne,
  podniesienieJakosciNauczania,
  zajeciaJezykObcy,
  funkcjeDydaktyczne,
  nagrodyWyroznienia,
} from '../lib/questions'

interface MenuItem {
  title: string
  url: string
  icon: React.ElementType
  subcategories: Array<{ id: string; title: string; points: number | string; tooltip: string[] }>
}

const categories: MenuItem[] = [
  { title: 'Publikacje dydaktyczne', url: '#', icon: BookOpen, subcategories: publikacjeDydaktyczne },
  { title: 'Podniesienie jakości nauczania', url: '#', icon: BookOpen, subcategories: podniesienieJakosciNauczania },
  { title: 'Zajęcia w języku obcym, wykłady za granicą', url: '#', icon: BookOpen, subcategories: zajeciaJezykObcy },
  {
    title: 'Pełnienie funkcji dydaktycznej (za każdy rok)',
    url: '#',
    icon: BookOpen,
    subcategories: funkcjeDydaktyczne,
  },
  { title: 'Nagrody i wyróżnienia', url: '#', icon: BookOpen, subcategories: nagrodyWyroznienia },
]

interface AppSidebarProps {
  setSelectedCategory: (category: string) => void
}

export function AppSidebar({ setSelectedCategory }: AppSidebarProps) {
  return (
    <Sidebar className="border-none">
      <SidebarContent className="bg-gray-200">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <div>
                <img src={logo} alt="Godło" className="w-auto h-full object-cover" />
                <h2 className="font-bold text-2xl text-ubbsecondary mt-16 ml-2 border-b-2 border-white w-3/4">
                  Kategorie
                </h2>
              </div>
              {categories.map(category => (
                <SidebarMenuItem
                  key={category.title}
                  className="mt-4 rounded-lg bg-white space-y-2 shadow-lg"
                >
                  <div
                    className="text-gray-700 text-base px-4 py-2 hover:text-ubbprimary duration-300 cursor-pointer rounded-md transition-all"
                    onClick={() => {
                      setSelectedCategory(category.title)}}
                  >
                    <p>{category.title}</p>
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
