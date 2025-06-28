import { useEffect, useRef, useState } from "react";
import Quagga from "quagga";

export default function StockOutPage() {
  const [barcodes, setBarcodes] = useState([]);
  const [input, setInput] = useState("");
  const scannerRef = useRef(null);

  const isValidBarcode = (code) => {
    return (
      code.startsWith("318") &&
      code.length === 3 + 8 + 4 + 10 + 10 + 3 + 3 // รวมทั้งหมด 41 ตัวอักษร
    );
  };

const handleAdd = (code) => {
  if (!isValidBarcode(code)) return;
  setBarcodes((prev) => {
    return prev.includes(code) ? prev : [...prev, code];
  });
};

let lastScan = "";
let lastScanTime = 0;

Quagga.onDetected((result) => {
  const code = result.codeResult.code;
  const now = Date.now();

  if (
    code !== lastScan ||
    now - lastScanTime > 1000 // ต่างรหัส หรือสแกนห่างกันมากกว่า 1 วิ
  ) {
    lastScan = code;
    lastScanTime = now;
    handleAdd(code);
  }
});



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
          readers: ["code_128_reader"],
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
      handleAdd(code);
    });

    return () => {
      Quagga.stop();
      Quagga.offDetected();
    };
  }, []);

  const handleSubmit = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stock/out`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ barcodes }),
    });

    if (res.ok) {
      alert("✅ เบิกสินค้าออกเรียบร้อย");
      setBarcodes([]);
    } else {
      alert("❌ เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">📤 เบิกสินค้าออก</h1>


<div
  ref={scannerRef}
  className="w-full h-[300px] bg-black rounded mb-4"
  style={{ filter: "grayscale(100%) contrast(150%) brightness(110%)" }}
/>

      {/* กรอกมือ */}
      <div className="mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="สแกนหรือกรอก Barcode"
          className="border p-2 mr-2"
        />
        <button
          onClick={() => {
            handleAdd(input);
            setInput("");
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          เพิ่ม
        </button>
      </div>

      {/* รายการ */}
      <ul className="list-disc pl-6 text-green-700">
        {barcodes.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>

      <button
        onClick={handleSubmit}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
      >
        ✅ ตกลงเบิกสินค้า
      </button>
    </div>
  );
}
