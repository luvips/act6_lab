import Link from 'next/link';

export default function Navbar() {
  const links = [
    { href: '/', label: 'Inicio' },
    { href: '/reports/ranking', label: 'Ranking' },
    { href: '/reports/categories', label: 'Categorias' },
    { href: '/reports/top-customers', label: 'Top Clientes' },
    { href: '/reports/inventory', label: 'Inventario' },
    { href: '/reports/user-activity', label: 'Actividad' },
    { href: '/reports/order-summary', label: 'Resumen' },
    { href: '/reports/daily-sales', label: 'Ventas Diarias' },
  ];

  return (
    <nav className="bg-[#6B00BF] text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="font-bold text-2xl">
          Dashboard
        </Link>
        <div className="flex gap-4 overflow-x-auto">
          {links.map(link => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="hover:bg-purple-700 whitespace-nowrap text-sm font-medium transition-colors px-3 py-2 rounded"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}