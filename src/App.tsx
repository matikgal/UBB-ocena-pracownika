import { SidebarProvider} from './components/ui/sidebar'
import { AppSidebar } from './components/AppSideBar'
import AppHeader from './components/AppHeader'
import AppHeader from "./components/AppHeader";


function App() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<main className="w-screen">
				<AppHeader />
				<SidebarTrigger />
			</main>
		</SidebarProvider>
	)
}

export default App
