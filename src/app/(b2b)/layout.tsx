import React from "react";

export default function B2BLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Can add a B2B-specific header or footer here */}
      <main>{children}</main>
    </div>
  );
}
