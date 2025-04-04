import logo from '../../assets/Logo.svg'

export default function LoginHeader() {
  return (
    <div className="flex flex-col items-center mb-8">
      <img src={logo} alt="UBB Logo" className="h-16 mb-4" />
      <h1 className="text-2xl font-bold text-ubbprimary">System oceny pracowników</h1>
      <p className="text-gray-600 mt-2">Uniwersytet Bielsko-Bialski</p>
    </div>
  )
}