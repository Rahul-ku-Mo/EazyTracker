import { FollowerPointerCard } from "../../components/advanced-ui/Follow-Pointer";

export const UserPointer = ({
  title,
  avatar,
  children,
}: {
  title: string;
  avatar: string;
  children: React.ReactNode;
}) => {
  return (
    <FollowerPointerCard
      title={<TitleComponent title={title} avatar={avatar} />}
    >
      {children}
    </FollowerPointerCard>
  );
};

const TitleComponent = ({
  title,
  avatar,
}: {
  title: string;
  avatar: string;
}) => (
  <div className="flex items-center space-x-2">
    <img
      src={avatar}
      height="20"
      width="20"
      alt="thumbnail"
      className="border-2 border-white rounded-full"
    />
    <p>{title}</p>
  </div>
);
