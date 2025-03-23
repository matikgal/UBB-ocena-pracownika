// src/components/AppHeader.tsx
// import godlo from '../assets/Godlo.svg'
// import logo from '../assets/LogoUBB.svg'

export default function AppHeader() {
	return (
		<div className="w-full">
			<div className="h-10 bg-ubbsecondary flex items-center justify-center">
				<h2 className="container text-xl px-6 font-thin">System oceny pracowników</h2>
			</div>
			<div className="bg-ubbprimary h-32 overflow-hidden flex items-center justify-between ">
				<h2 className="text-5xl ml-6 w-full">System oceny pracowników</h2>
				<div className="container flex justify-end mx-auto mr-6 items-center space-x-5 ">
					{/* <img src={godlo} alt="Godło" className="w-auto h-full object-cover py-7" /> */}
					{/* <img src={logo} alt="Godło" className="w-auto h-full object-cover" /> */}
					<div className=" right-auto text-right">
						<p className="font-semibold text-2xl">Jakub Gałosz</p>
						<p className="font-thin">Profesor UBB</p>
					</div>
					<div className="bg-white rounded-full h-12 w-12"> </div>
				</div>
			</div>
		</div>
	)
}
