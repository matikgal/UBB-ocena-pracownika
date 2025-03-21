import { SidebarProvider } from './components/ui/sidebar'
import { AppSidebar } from './components/AppSideBar'
import AppHeader from './components/AppHeader'
import QuestionsComponent from './components/QuestionsComponent'
import { useState } from 'react';

function App() {

	const [selectedCategory, setSelectedCategory] = useState<string>(
		"Publikacje dykaktyczne"
	  );
	return (
		<div className='w-screen overflow-hidden max-h-screen'>
		<SidebarProvider>
			<main>	
				<div className="flex w-full ">
					<AppSidebar setSelectedCategory={setSelectedCategory} />
					<div className="flex-col ">
						<div className="w-screen ">
							<AppHeader />
						</div>
						<div className='h-screen '>
						<QuestionsComponent selectedCategory={selectedCategory} />
						</div>
					</div>
				</div>
			</main>
		</SidebarProvider>
		</div>
	)
}

export default App
