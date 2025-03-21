// AppSidebar.tsx
import { BookOpen, Home } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "../components/ui/sidebar";

// Define the shape of a menu item
interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

// Menu items
const items: MenuItem[] = [
  {
    title: "Ocena",
    url: "#",
    icon: Home,
  },
];

const categories: MenuItem[] = [
  { title: "Publikacje dykaktyczne", url: "#", icon: BookOpen },
  { title: "Podniesienie jakości nauczania", url: "#", icon: BookOpen },
  {
    title: "Zajęcia w języku obcym, wykłady za granicą",
    url: "#",
    icon: BookOpen,
  },
  {
    title: "Pełnienie funkcji dydaktycznej (za każdy rok)",
    url: "#",
    icon: BookOpen,
  },
  { title: "Nagrody i wyróznienia", url: "#", icon: BookOpen },
];

interface AppSidebarProps {
  setSelectedCategory: (category: string) => void;
}

export function AppSidebar({ setSelectedCategory }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <div>
                <h2 className="font-bold text-2xl text-white mt-16">
                  Tu sie oceniasz
                </h2>
              </div>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="flex flex-col">
                  {categories.map((category) => (
                    <div
                      key={category.title}
                      onClick={() => setSelectedCategory(category.title)}
                      className="text-white text-wrap max-w-[16rem] m-2 hover:underline cursor-pointer font-semibold"
                    >
                      {category.title}
                    </div>
                  ))}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}