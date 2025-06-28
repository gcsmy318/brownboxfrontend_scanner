import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

export default function ReportPage() {
  const [stockData, setStockData] = useState({ I: [], P: [], Y: [] });

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/report/all`) // ต้องมี API รวมทุกสถานะ
      .then(res => res.json())
      .then(data => {
        const grouped = { I: [], P: [], Y: [] };
        data.forEach(item => {
          grouped[item.status]?.push(item);
        });
        setStockData(grouped);
      });
  }, []);

  const exportToExcel = () => {
    const rows = [
      ...stockData.I.map(i => ({ Status: "I", Barcode: i.barcode, Zone: i.zone, Shelf: i.shelf })),
      ...stockData.P.map(i => ({ Status: "P", Barcode: i.barcode })),
      ...stockData.Y.map(i => ({ Status: "Y", Barcode: i.barcode })),
    ];
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stock Report");
    XLSX.writeFile(wb, "stock_report.xlsx");
  };

  const renderSection = (label, statusKey, color) => (
    <div className="mb-6">
      <h2 className={`text-lg font-bold mb-2 text-${color}-600`}>
        {label} ({stockData[statusKey].length})
      </h2>
      <ul className="list-disc pl-6">
        {stockData[statusKey].map((item, i) => (
          <li key={i}>
            {item.barcode}
            {statusKey === "I" && ` (โซน: ${item.zone}, ชั้น: ${item.shelf})`}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 รายงานคลังสินค้า</h1>

      <button
        onClick={exportToExcel}
        className="mb-6 bg-green-600 text-white px-4 py-2 rounded"
      >
        📥 Export เป็น Excel
      </button>

      {renderSection("📦 อยู่ในคลัง (I)", "I", "blue")}
      {renderSection("✅ ยืนยันแล้ว (P)", "P", "yellow")}
      {renderSection("🚚 ส่งออกแล้ว (Y)", "Y", "gray")}
    </div>
  );
}
