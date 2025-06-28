import { useEffect, useRef, useState } from "react";
import Quagga from "quagga";

const ZONES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const SHELVES_PER_ZONE = 5;
const MAX_BOXES_PER_SHELF = 100;

export default function StockInPage() {
  const [scannedBarcodes, setScannedBarcodes] = useState([]);
  const [zone, setZone] = useState("A");
  const [shelfData, setShelfData] = useState({});
  const scannerRef = useRef(null);

  useEffect(() => {
    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            facingMode: "environment",
          },
        },
        decoder: {
          readers: ["code_128_reader"], // ✅ ใช้แค่ Code128
        },
      },
      (err) => {
        if (err) {
          console.error(err);
          return;
        }
        Quagga.start();
      }
    );

    Quagga.onDetected((result) => {
      const code = result.codeResult.code;

      // ✅ ตรวจสอบ barcode
      const isValidBarcode =
        code.startsWith("318") && code.length === 41 && /^[0-9A-Za-z]+$/.test(code);

      if (!isValidBarcode) {
        console.warn("❌ Barcode ไม่ถูกต้อง:", code);
        return;
      }

      setScannedBarcodes((prev) => (prev.includes(code) ? prev : [...prev, code]));
    });

    return () => {
      Quagga.stop();
      Quagga.offDetected();
    };
  }, []);

  const handleSubmit = async () => {
    const shelves = scannedBarcodes.map((_, i) => (i % SHELVES_PER_ZONE) + 1);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stock/in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        barcodes: scannedBarcodes,
        type: "ลูกฟูก",
        zone,
        shelves,
      }),
    });

    if (res.ok) {
      const newData = { ...shelfData };
      scannedBarcodes.forEach((b, idx) => {
        const shelfKey = `${zone}-${(idx % SHELVES_PER_ZONE) + 1}`;
        newData[shelfKey] = [...(newData[shelfKey] || []), b];
      });
      setShelfData(newData);
      setScannedBarcodes([]);
      alert("✅ บันทึกแล้ว");
    } else {
      alert("❌ บันทึกล้มเหลว");
    }
  };



  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">📦 สแกนกล่องเข้าสต็อก</h1>

      {/* เลือกโซน */}
      <label className="font-semibold mr-2">เลือกโซน:</label>
      <select
        value={zone}
        onChange={(e) => setZone(e.target.value)}
        className="mb-4 border p-1"
      >
        {ZONES.map((z) => (
          <option key={z} value={z}>
            {z}
          </option>
        ))}
      </select>

      {/* กล้อง */}

<div
  ref={scannerRef}
  className="w-full h-[300px] bg-black rounded mb-4"
  style={{ filter: "grayscale(100%) contrast(150%) brightness(110%)" }}
/>
      {/* แสดงรายการ */}
      <div className="mb-4">
        <h2 className="font-semibold">รายการที่เพิ่ม:</h2>
        <ul className="list-disc pl-6 text-green-700">
          {scannedBarcodes.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </div>

      {/* ตารางชั้นวาง */}


      {/* ปุ่มยืนยัน */}
      <button
        onClick={handleSubmit}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
      >
        ✅ ตกลงจัดเก็บ
      </button>
    </div>
  );
}
