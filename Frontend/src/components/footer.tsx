// src/components/footer.tsx
import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-gray-600">
        <p>© {year} InventorHeads. All rights reserved.</p>
        <p className="mt-1">
          LandsDevelop is a brand owned and operated by <span className="font-medium">InventorHeads</span>.
        </p>
      </div>
    </footer>
  );
}
