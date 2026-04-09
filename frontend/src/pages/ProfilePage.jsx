import { useState, useRef } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateProfile } from "../lib/api";
import { LoaderIcon, MapPinIcon, CameraIcon, SaveIcon } from "lucide-react";
import { LANGUAGES } from "../constants";

const ProfilePage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    location: authUser?.location || "",
    profilePic: authUser?.profilePic || "",
  });

  const { mutate: updateProfileMutation, isPending } = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation(formState);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      return toast.error("Image size must be less than 1MB");
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setFormState({ ...formState, profilePic: reader.result });
      toast.success("Profile picture updated!");
    };
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 premium-gradient-bg min-h-screen">
      <div className="container mx-auto max-w-3xl">
        <div className="card glass-card shadow-2xl rounded-3xl overflow-hidden">
          <div className="card-body p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
                <p className="opacity-70 mt-1">Manage your public profile information</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* PROFILE PIC SECTION */}
              <div className="flex flex-col items-center justify-center space-y-5">
                <div className="relative group">
                  <div className="size-40 rounded-full border-4 border-primary/20 p-1 overflow-hidden transition-all duration-300 group-hover:border-primary/40">
                    <div className="w-full h-full rounded-full bg-base-300 overflow-hidden flex items-center justify-center relative">
                      {formState.profilePic ? (
                        <img
                          src={formState.profilePic}
                          alt="Profile"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <CameraIcon className="size-16 text-base-content opacity-20" />
                      )}
                      
                      {/* Overlay on hover */}
                      <div 
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                        onClick={() => fileInputRef.current.click()}
                      >
                        <CameraIcon className="size-8 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="btn btn-primary btn-sm rounded-full px-6"
                  >
                    Change Picture
                  </button>
                  <p className="text-xs opacity-50">JPG, PNG or WEBP. Max 1MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* FULL NAME */}
                <div className="form-control col-span-1 md:col-span-2">
                  <label className="label">
                    <span className="label-text font-semibold">Full Name</span>
                  </label>
                  <input
                    type="text"
                    value={formState.fullName}
                    onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                    className="input input-bordered w-full focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Your name"
                  />
                </div>

                {/* BIO */}
                <div className="form-control col-span-1 md:col-span-2">
                  <label className="label">
                    <span className="label-text font-semibold">Bio</span>
                  </label>
                  <textarea
                    value={formState.bio}
                    onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                    className="textarea textarea-bordered h-28 focus:ring-2 focus:ring-primary/20 transition-all leading-relaxed"
                    placeholder="Brief introduction..."
                  />
                </div>

                {/* LANGUAGES */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Native Language</span>
                  </label>
                  <select
                    value={formState.nativeLanguage}
                    onChange={(e) => setFormState({ ...formState, nativeLanguage: e.target.value })}
                    className="select select-bordered w-full focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="">Select language</option>
                    {LANGUAGES.map((lang) => (
                      <option key={`native-${lang}`} value={lang.toLowerCase()}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Learning Language</span>
                  </label>
                  <select
                    value={formState.learningLanguage}
                    onChange={(e) => setFormState({ ...formState, learningLanguage: e.target.value })}
                    className="select select-bordered w-full focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="">Select language</option>
                    {LANGUAGES.map((lang) => (
                      <option key={`learning-${lang}`} value={lang.toLowerCase()}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                {/* LOCATION */}
                <div className="form-control col-span-1 md:col-span-2">
                  <label className="label">
                    <span className="label-text font-semibold">Location</span>
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 left-4 size-5 text-primary opacity-70" />
                    <input
                      type="text"
                      value={formState.location}
                      onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                      className="input input-bordered w-full pl-12 focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex gap-4">
                <button 
                  type="submit" 
                  className="btn btn-primary flex-1 sm:flex-none sm:min-w-[160px]" 
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <LoaderIcon className="animate-spin size-4 mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="size-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
