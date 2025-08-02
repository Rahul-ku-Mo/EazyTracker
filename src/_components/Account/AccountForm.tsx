import isEqual from "lodash.isequal";
import { useEffect, useState, useContext } from "react";
import { toast } from "sonner";
import { AuthContext } from "@/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile } from "@/apis/userApis";
import { Input } from "@/components/ui/input";
import { UserContext } from "@/context/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Phone, AtSign, Mail, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import clsx from "clsx";
import { uploadImageToS3 } from "../Card/_editor/Plugins/CopyImagePlugin";

interface FormState {
  name?: string;
  phoneNumber?: string;
  imageUrl?: string;
  email: string;
}

const AccountForm = () => {
  const { accessToken } = useContext(AuthContext);
  const { user, isPending } = useContext(UserContext);
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState<FormState>({
    name: "",
    phoneNumber: "",
    imageUrl: "",
    email: "",
  });

  const [initialState, setInitialState] = useState<FormState>({
    name: "",
    phoneNumber: "",
    imageUrl: "",
    email: "",
  });

  // Image upload state
  const [imageUploading, setImageUploading] = useState(false);

  // Update form state when user data loads
  useEffect(() => {
    if (user) {
      const newFormState = {
        name: user.name || "",
        phoneNumber: user.phoneNumber || "",
        imageUrl: user.imageUrl || "",
        email: user.email || "",
      };
      setFormState(newFormState);
      setInitialState(newFormState);
    }
  }, [user]);

  const handleChange =
    (prop: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormState({ ...formState, [prop]: event.target.value });
    };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);

    try {
      const url = await uploadImageToS3(file);
      console.log("Uploaded image to S3:", url);

      if (url) {
        setFormState({ ...formState, imageUrl: url });
        toast.success("Profile image uploaded successfully");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setImageUploading(false);
    }
  };

  const updateProfileMutation = useMutation({
    mutationFn: (data: FormState) => updateUserProfile(accessToken, data),
    onSuccess: () => {
      toast.success("Account updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user"] });
      // Reset the initial state to the current form state after successful save
      setInitialState(formState);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update account");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEqual(formState, initialState)) {
      toast.info("No changes to save");
      return;
    }
    updateProfileMutation.mutate(formState);
  };

  // Custom comparison to handle form changes more reliably
  const hasChanges = !isEqual(formState, initialState);

  // Show loading while user data is being fetched
  if (isPending) {
    return (
      <Card className="w-full border-border/50 shadow-lg">
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading account data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-border/50 shadow-lg">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
          <User className="h-5 w-5 text-primary" />
          Account Settings
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage your personal information and profile details
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <h3 className="text-sm font-medium text-foreground">
                Profile Image
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-6">
                {/* Profile Image Preview */}
                <div className="relative group">
                  <Avatar className="w-20 h-20 border-4 border-border shadow-lg">
                    <AvatarImage
                      src={formState.imageUrl}
                      alt="Profile"
                      className="object-cover"
                    />
                    <AvatarFallback className="text-lg font-bold bg-primary text-primary-foreground">
                      {formState.name?.charAt(0).toUpperCase() ||
                        user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Loading overlay */}
                  {imageUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={imageUploading}
                      className="relative h-9 px-4 text-sm border-dashed border-2 hover:bg-accent transition-colors"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {imageUploading ? "Uploading..." : "Upload Image"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={imageUploading}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </Button>

                    {formState.imageUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setFormState({ ...formState, imageUrl: "" })
                        }
                        disabled={imageUploading}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Upload a profile picture to personalize your account
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supported formats: JPG, PNG, GIF (max 10MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <h3 className="text-sm font-medium text-foreground">
                Personal Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-foreground flex items-center gap-2"
                >
                  <User className="h-3 w-3 text-muted-foreground" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formState.name || ""}
                  onChange={handleChange("name")}
                  placeholder="Enter your full name"
                  className={clsx(
                    "transition-all duration-200",
                    "border-input bg-background text-foreground",
                    "placeholder:text-muted-foreground",
                    "focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                    "focus:border-primary"
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  This name will be displayed on your profile and in team
                  communications
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phoneNumber"
                  className="text-sm font-medium text-foreground flex items-center gap-2"
                >
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formState.phoneNumber || ""}
                  onChange={handleChange("phoneNumber")}
                  placeholder="+1 (555) 123-4567"
                  className={clsx(
                    "transition-all duration-200",
                    "border-input bg-background text-foreground",
                    "placeholder:text-muted-foreground",
                    "focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                    "focus:border-primary"
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Include country code for international numbers
                </p>
              </div>
            </div>
          </div>

          {/* Profile & Identity Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <h3 className="text-sm font-medium text-foreground">
                Profile & Identity
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-sm font-medium text-foreground flex items-center gap-2"
                >
                  <AtSign className="h-3 w-3 text-muted-foreground" />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={user?.username || ""}
                  placeholder="your-username"
                  readOnly
                  className={clsx(
                    "transition-all duration-200",
                    "border-input bg-muted text-muted-foreground",
                    "cursor-not-allowed opacity-60"
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Username cannot be changed as it's used for mentions and user identification
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground flex items-center gap-2"
                >
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formState.email || ""}
                  onChange={handleChange("email")}
                  placeholder="email@example.com"
                  readOnly
                  className={clsx(
                    "transition-all duration-200",
                    "border-input bg-muted text-muted-foreground",
                    "cursor-not-allowed opacity-60"
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed as it's your unique identifier
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-border">
            <div className="text-xs text-muted-foreground">
              {hasChanges ? "You have unsaved changes" : "All changes saved"}
            </div>

            <Button
              type="submit"
              disabled={
                !hasChanges || updateProfileMutation.isPending || imageUploading
              }
              className={clsx(
                "px-6 h-10 font-medium transition-all duration-200",
                "bg-primary hover:bg-primary/90 text-primary-foreground",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              )}
            >
              {updateProfileMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AccountForm;
