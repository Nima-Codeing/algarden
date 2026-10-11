import React from "react";

type MainLayoutProps = {
  header: React.ReactNode;
  children: React.ReactNode;
};

export const MainLayout: React.FC<MainLayoutProps> = ({ header, children }) => {
  return (
    <div className="flex flex-col h-full bg-mist-900 text-mist-200">
      {/* ヘッダーエリア */}
      <header className="w-full p-2 border-b">{header}</header>

      {/* 中央エリア */}
      <main className="flex-1 min-h-0">{children}</main>
    </div>
  );
};
