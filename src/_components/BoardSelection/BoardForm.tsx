import {  useContext } from "react";
import { UserContext } from "../../Context/UserContext";
import { Check, Loader2, Ban } from "lucide-react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import useBoardForm from "../../hooks/useBoardForm";
import { useOrganizationLead } from "../../hooks/useQueries";
import Cookies from "js-cookie";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";

interface UnsplashImage {
  id: string;
  urls: {
    thumb: string;
    full: string;
  };
  links: {
    html: string;
  };
  user: {
    name: string;
  };
}

interface BoardFormProps {
  count: number;
}

const BoardForm = ({ count }: BoardFormProps) => {
  const {
    isLoading,
    isPending,
    images,
    selectedImageId,
    setCurrentBoardInput,
    currentBoardInput,
    setSelectedImageId,
    handleSubmit,
    selectedOrganizationId,
    setSelectedOrganizationId,
  } = useBoardForm(count);

  const accessToken = Cookies.get("accessToken");
  const { user } = useContext(UserContext);

  const { data: organizations, isPending: isOrganizationsPending } =
    useOrganizationLead(accessToken, user?.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="w-6 h-6 text-emerald-700 animate-spin" />
      </div>
    );
  }

  return (
    <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
      <div className="flex flex-col">
        <Label className="pb-2 text-xs font-bold text-center text-gray-300">
          Choose Background
        </Label>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {images.map((image: UnsplashImage) => (
            <div
              key={image.id}
              className={clsx(
                "cursor-pointer relative aspect-video group hover:opacity-75 transition bg-gray-800",
                isPending && "opacity-50 hover:opacity-50 cursor-auto"
              )}
              onClick={() => {
                if (isPending) return;
                setSelectedImageId(image.id);
              }}
            >
              <input
                type="radio"
                id="image"
                name="image"
                onChange={() => setSelectedImageId(image.id)}
                className="hidden"
                checked={selectedImageId === image.id}
                value={`${image.id}|${image.urls.thumb}|${image.urls.full}|${image.links.html}|${image.user.name}`}
              />
              <img
                src={image.urls.thumb}
                alt="Unsplash image"
                className="object-cover w-full h-16 rounded-sm"
              />
              {selectedImageId === image.id && (
                <div className="absolute inset-y-0 flex items-center justify-center w-full h-full bg-black/30">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              <Link
                to={image.links.html}
                target="_blank"
                className="opacity-0 group-hover:opacity-100 absolute bottom-0 w-full text-[10px] truncate text-white hover:underline p-1 bg-black/50"
              >
                {image.user.name}
              </Link>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="board-title">Board title</Label>
        <Input
          id="board-title"
          name="title"
          value={currentBoardInput}
          onChange={(e) => setCurrentBoardInput(e.target.value)}
          className="border text-zinc-200 bg-zinc-700 border-zinc-600 focus-visible:ring-0"
        />
        
        <Label className="mt-2">
          Organization{" "}
          <span className="text-red-400">
            (if no organization, leave empty)
          </span>
        </Label>
        <ul className="flex flex-wrap gap-2 p-1 text-xs h-14">
          <li
            onClick={() => setSelectedOrganizationId("")}
            className="inline-flex items-center justify-center w-12 h-12 text-lg font-bold tracking-tight uppercase transition-all duration-300 ease-in-out bg-gray-700 rounded-md cursor-pointer opacity-40 hover:bg-gray-600 hover:text-white"
          >
            <Ban className="w-5 h-5" />
          </li>
          {organizations?.map((org) => (
            <li
              key={org.id}
              onClick={() => setSelectedOrganizationId(org.id)}
              className="relative inline-flex items-center justify-center w-12 h-12 text-lg font-bold tracking-tight uppercase transition-all duration-300 ease-in-out bg-gray-700 rounded-md cursor-pointer hover:bg-gray-600 hover:text-white"
            >
              {org.name
                .split(" ")
                .map((word) => word[0])
                .join("")}
              {selectedOrganizationId === org.id && (
                <div className="absolute inset-0 flex items-end justify-start border-2 border-gray-500 rounded-md opacity-70 bg-black/50" />
              )}
            </li>
          ))}
        </ul>
        <Button
          type="submit"
          disabled={isPending || (!selectedImageId && !currentBoardInput.trim())}
          className="w-full"
          variant="secondary"
        >
          Create
        </Button>
      </div>
    </form>
  );
};

export default BoardForm;