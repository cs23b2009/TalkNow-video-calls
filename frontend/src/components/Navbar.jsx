import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, HeadsetIcon, LogOutIcon } from "lucide-react";
import Logo from "./Logo";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");

  // const queryClient = useQueryClient();
  // const { mutate: logoutMutation } = useMutation({
  //   mutationFn: logout,
  //   onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  // });

  const { logoutMutation } = useLogout();

  return (
    <nav className="sticky top-4 z-30 h-16 w-[calc(100%-2rem)] mx-auto flex items-center glass-card rounded-2xl px-4 sm:px-6 mb-6 transition-all duration-300 border border-white/5">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          {/* LOGO - ONLY IN THE CHAT PAGE AND MOBILE */}
          {(isChatPage || true) && (
            <Link to="/" className="lg:hidden">
              <Logo className="size-8" />
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          <Link to={"/notifications"}>
            <button className="btn btn-ghost btn-circle hover:bg-white/5 transition-colors group">
              <BellIcon className="h-5 w-5 text-base-content/70 group-hover:text-primary transition-colors" />
            </button>
          </Link>

          <div className="h-8 w-px bg-white/10 mx-1" />

          <ThemeSelector />

          <Link to="/profile" className="flex items-center gap-2 p-1 pl-3 rounded-full hover:bg-white/5 transition-all group border border-transparent hover:border-white/5 border-l-white/10 ml-2">
            <span className="text-sm font-semibold text-base-content/80 group-hover:text-base-content hidden sm:block">
              {authUser?.fullName?.split(" ")[0]}
            </span>
            <div className="avatar ring-2 ring-primary/20 p-0.5 rounded-full group-hover:ring-primary/40 transition-all">
              <div className="w-8 rounded-full">
                <img src={authUser?.profilePic} alt="User Avatar" />
              </div>
            </div>
          </Link>

          {/* Logout button */}
          <button 
            className="btn btn-ghost btn-circle hover:bg-error/10 hover:text-error transition-all group" 
            onClick={logoutMutation}
            title="Logout"
          >
            <LogOutIcon className="h-5 w-5 opacity-70 group-hover:opacity-100" />
          </button>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
