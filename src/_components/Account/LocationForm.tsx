import isEqual from "lodash.isequal";
import { useEffect, useState, useContext, ChangeEvent, FormEvent } from "react";
import { toast } from "sonner";
import { AuthContext } from "@/context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { updateUserProfile } from "@/apis/userApis";
import { UserContext } from "@/context/UserContext";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, Building, Hash } from "lucide-react";
import clsx from "clsx";

interface LocationFormState {
  state: string;
  address: string;
  zipCode: string;
}

const LocationForm = () => {
  const { accessToken } = useContext(AuthContext);
  const { user } = useContext(UserContext);

  const { state = "", address = "", zipCode = "" } = user || {};

  const [formState, setFormState] = useState<LocationFormState>({
    state,
    address,
    zipCode,
  });

  const handleChange = (prop: keyof LocationFormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setFormState({ ...formState, [prop]: event.target.value });
  };

  const [initialState, setInitialState] = useState<LocationFormState>(formState);

  useEffect(() => {
    setInitialState(formState);
  }, [user, formState]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: LocationFormState) => {
      return await updateUserProfile(accessToken, data);
    },
    onSuccess: () => {
      toast.success("Location updated successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update location");
    },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (isEqual(formState, initialState)) {
      toast.info("No changes to save");
      return;
    }

    updateProfileMutation.mutate(formState);
  };

  const hasChanges = !isEqual(formState, initialState);

  return (
    <Card className="w-full border-border/50 shadow-lg">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
          <MapPin className="h-5 w-5 text-primary" />
          Location Settings
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Update your location details for better service delivery
        </p>
      </CardHeader>
      
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Location Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <h3 className="text-sm font-medium text-foreground">Address Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Building className="h-3 w-3 text-muted-foreground" />
                  State/Province
                </Label>
                <Input
                  id="state"
                  type="text"
                  value={formState.state}
                  onChange={handleChange("state")}
                  placeholder="e.g., California, Karnataka"
                  className={clsx(
                    "transition-all duration-200",
                    "border-input bg-background text-foreground",
                    "placeholder:text-muted-foreground",
                    "focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                    "focus:border-primary"
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Enter your state or province for location-specific services
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zipCode" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Hash className="h-3 w-3 text-muted-foreground" />
                  Postal Code
                </Label>
                <Input
                  id="zipCode"
                  type="text"
                  value={formState.zipCode}
                  onChange={handleChange("zipCode")}
                  placeholder="e.g., 90210, 560001"
                  className={clsx(
                    "transition-all duration-200",
                    "border-input bg-background text-foreground",
                    "placeholder:text-muted-foreground",
                    "focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                    "focus:border-primary"
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Your postal/ZIP code for precise location services
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium text-foreground flex items-center gap-2">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                Full Address
              </Label>
              <Input
                id="address"
                type="text"
                value={formState.address}
                onChange={handleChange("address")}
                placeholder="1234 Main Street, Apt 2B, City, State"
                className={clsx(
                  "transition-all duration-200",
                  "border-input bg-background text-foreground",
                  "placeholder:text-muted-foreground",
                  "focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                  "focus:border-primary"
                )}
              />
              <p className="text-xs text-muted-foreground">
                Complete address including street, apartment, city, and state
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-border">
            <div className="text-xs text-muted-foreground">
              {hasChanges ? "You have unsaved changes" : "All changes saved"}
            </div>
            
            <Button
              type="submit"
              disabled={!hasChanges || updateProfileMutation.isPending}
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

export default LocationForm;
