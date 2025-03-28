// src/components/AppHeader.tsx
// import godlo from '../assets/Godlo.svg'
// import logo from '../assets/LogoUBB.svg'

import { User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

export default function AppHeader() {
	return (
		<div className="w-full">
			<div className="bg-ubbprimary h-24 overflow-hidden flex items-center justify-between rounded-b-lg mx-2 shadow-lg">
				<div className="ml-4 lg:ml-8">
					<h2 className="text-xl lg:text-3xl font-semibold text-white">System oceny pracowników</h2>
					<p className="text-white/80 text-xs lg:text-sm mt-1">Uniwersytet Bielsko-Bialski</p>
				</div>
				<div className="flex items-center space-x-4 lg:space-x-6 mr-4 lg:mr-8">
					{/* <img src={godlo} alt="Godło" className="w-auto h-full object-cover py-7" /> */}
					{/* <img src={logo} alt="Godło" className="w-auto h-full object-cover" /> */}
					<div className="text-right hidden sm:block">
						<p className="text-white font-medium text-sm lg:text-base">Jakub Gałosz</p>
						<p className="text-white/70 text-xs lg:text-sm">Pracownik naukowy</p>
					</div>
					<Avatar className="h-10 w-10 lg:h-12 lg:w-12 border-2 border-white/20">
						<AvatarImage src="./assets/ts.jpg" />
						<AvatarFallback className="bg-white/10 text-white">
							<User className="h-5 w-5 lg:h-6 lg:w-6" />
						</AvatarFallback>
					</Avatar>
				</div>
			</div>
		</div>
	)
}
