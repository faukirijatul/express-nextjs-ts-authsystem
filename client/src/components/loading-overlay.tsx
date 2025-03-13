import React from "react";

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-gray-300 flex flex-col items-center justify-center z-50 h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto"></div>
      <p className="text-center mt-4">Loading...</p>
    </div>
  );
}
