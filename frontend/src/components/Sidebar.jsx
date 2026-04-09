import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, HomeIcon , UsersIcon, UserIcon } from "lucide-react";
import Logo from "./Logo";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <aside className="w-68 glass-card hidden lg:flex flex-col h-[calc(100vh-2rem)] sticky top-4 left-4 rounded-3xl border border-white/10 m-4 transition-all duration-300">
      <div className="p-6 border-b border-white/5">
        <Link to="/">
          <Logo className="size-10" />
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {[
          { to: "/", icon: HomeIcon, label: "Home" },
          { to: "/friends", icon: UsersIcon, label: "Friends" },
          { to: "/notifications", icon: BellIcon, label: "Notifications" },
          { to: "/profile", icon: UserIcon, label: "Profile" },
        ].map((item) => {
          const isActive = currentPath === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group hover:bg-white/5 ${
                isActive ? "bg-primary/10 text-primary font-bold shadow-inner" : "text-base-content/70 hover:text-base-content"
              }`}
            >
              {isActive && <div className="active-nav-indicator" />}
              <item.icon className={`size-5 transition-transform duration-300 ${isActive ? "text-primary scale-110" : "group-hover:scale-110 group-hover:text-primary"}`} />
              <span className="tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* USER PROFILE SECTION */}
      <div className="p-4 m-4 mt-auto rounded-3xl bg-white/5 border border-white/5 glow-on-hover transition-all duration-500">
        <div className="flex items-center gap-3">
          <div className="avatar ring-2 ring-primary/20 p-0.5 rounded-full ring-offset-base-100 ring-offset-2">
            <div className="w-10 rounded-full">
              <img src={authUser?.profilePic} alt="User Avatar" />
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-bold text-sm truncate">{authUser?.fullName}</p>
            <p className="text-[10px] text-success flex items-center gap-1.5 font-medium uppercase tracking-widest">
              <span className="size-1.5 rounded-full bg-success animate-pulse shadow-[0_0_8px_theme(colors.success.DEFAULT)]" />
              Online
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
