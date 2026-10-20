import { Text } from "../components/ui/atoms/Text";
import { Header } from "../components/ui/organisms/Header";
import { MainLayout } from "../layouts/MainLayout";

// src/pages/NotFound.jsx
export const NotFoundPage = () => {
  return (
    <MainLayout header={<Header />}>
      <div className="flex flex-col items-center justify-center h-full">
        <Text className="flex items-start text-xl font-bold">
          404 - Page Not Found
        </Text>
        <Text className="flex items-start text-lg font-semibold">
          お探しのページは存在しません。
        </Text>
      </div>
    </MainLayout>
  );
};
