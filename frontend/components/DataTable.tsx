interface DataTableProps {
  title: string;
  columns: string[];
  data: any[];
}

export default function DataTable({ title, columns, data }: DataTableProps) {
  return (
    <div className="p-8 bg-white min-h-screen w-full">
      <h1 className="text-3xl font-bold mb-6 text-[#6B00BF]">{title}</h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border-2 border-[#6B00BF]">
          <thead>
            <tr className="bg-[#6B00BF]">
              {columns.map((col, i) => (
                <th key={i} className="border border-[#6B00BF] px-4 py-3 text-left text-white font-semibold">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-purple-50">
                {Object.values(row).map((value: any, j) => (
                  <td key={j} className="border border-[#6B00BF] px-4 py-2 text-black">
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
