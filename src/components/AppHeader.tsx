// src/components/AppHeader.tsx
import godlo from '../assets/Godlo.svg'
import logo from '../assets/LogoUBB.svg'

export default function AppHeader() {
	return (
		<div className="bg-ubbprimary w-full h-32 overflow-hidden flex px-4">
			<img src={godlo} alt="Godło" className="w-auto h-full object-cover py-7" />
			<img src={logo} alt="Godło" className="w-auto h-full object-cover  " />
		</div>
	)
}
