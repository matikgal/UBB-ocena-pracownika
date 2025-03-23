// src/components/AppHeader.tsx
// import godlo from '../assets/Godlo.svg'
// import logo from '../assets/LogoUBB.svg'

export default function AppHeader() {
	return (
		<div className="w-full">
			<div className="bg-ubbprimary h-32 overflow-hidden flex items-center justify-between rounded-b-lg mx-2 shadow-lg">
				<h2 className="text-5xl ml-6 w-full">System oceny pracowników</h2>
				<div className="container flex justify-end mx-auto mr-6 items-center space-x-5 ">
					{/* <img src={godlo} alt="Godło" className="w-auto h-full object-cover py-7" /> */}
					{/* <img src={logo} alt="Godło" className="w-auto h-full object-cover" /> */}
					<div className=" right-auto text-right">
						<p className="font-semibold text-2xl">Jakub Gałosz</p>
						<p className="font-thin">Profesor UBB</p>
					</div>
					<div className="rounded-full h-12 w-12 bg-[url('./assets/ts.jpg')] bg-cover bg-center border-white border"></div>
				</div>
			</div>
		</div>
	)
}
