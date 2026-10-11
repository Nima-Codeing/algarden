import { Button } from "../atoms/Button";
import { Text } from "../atoms/Text";

type HeaderProps = {
  userName?: string;
  isPending: boolean;
  handleSignOut: () => void;
};

export const Header = ({ userName, isPending, handleSignOut }: HeaderProps) => {
  return (
    <div className="flex items-center justify-between w-full px-4 py-1">
      <Text className="pl-8 text-2xl font-extrabold">ALGARDEN</Text>
      {userName && (
        <div className="flex items-center justify-center">
          <Text className="text-right px-8">{userName}</Text>
          <Button className="px-2 py-1" onClick={handleSignOut} disabled={isPending}>
            <Text>SignOut</Text>
          </Button>
        </div>
      )}
    </div>
  );
};
