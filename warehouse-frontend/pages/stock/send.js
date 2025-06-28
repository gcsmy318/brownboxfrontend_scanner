import { useState, useEffect } from "react";
export default function StockSendPage() {
  const [barcodes, setBarcodes] = useState([]);

  // ดึงรายการที่ status = P
  useEffect(() => {
    fetch( `${process.env.NEXT_PUBLIC_API_URL}/api/report/picked` )
      .then((res) => res.json())
      .then((data) => {
        const list = data.map((item) => item.barcode);
        setBarcodes(list);
      });
  }, []);

  // ✅ ฟังก์ชันที่ใช้ส่งค่าไป Spring
  const handleConfirmSend = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stock/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ barcodes }),
    });

    if (res.ok) {
      alert("✅ ส่งพัสดุเรียบร้อย");
      setBarcodes([]); // clear list หลังส่ง
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">🚚 ยืนยันพัสดุออก</h1>
      {barcodes.map((b, i) => (
        <div key={i}>📦 {b}</div>
      ))}
      <button
        onClick={handleConfirmSend} // ✅ ต้องใช้ชื่อนี้
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
      >
        ✅ ยืนยันพัสดุออก
      </button>
    </div>
  );
}
