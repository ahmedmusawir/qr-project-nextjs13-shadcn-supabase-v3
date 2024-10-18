"use client";

import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeToggler from "./ThemeToggler";
import Logout from "../auth/Logout";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

const Navbar = () => {
  const { user } = useAuthStore();
  const userId = user?.id; // Assuming user.id contains the user's unique ID
  console.log("USER: Navbar:", user);

  const pathname = usePathname();

  interface NavLinkProps {
    href: string;
    children: ReactNode;
  }

  // PREPARING THE NAVLINK WITH ACTIVE LINK
  const NavLink = ({ href, children }: NavLinkProps) => {
    const isActive = pathname === href;

    return (
      <Link
        href={href}
        className={`text-white dark:text-white px-3 py-2 text-sm font-medium hover:bg-gray-700 hover:text-white ${
          isActive
            ? "border-b-4 border-indigo-500 text-gray-900"
            : "border-b-4 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
        }`}
      >
        {children}
      </Link>
    );
  };

  return (
    <div className="bg-slate-700 dark:bg-slate-700 py-2 px-5 flex justify-between">
      <Link href={"/"}>
        <Image
          src={
            "https://res.cloudinary.com/dyb0qa58h/image/upload/v1696245158/company-4-logo_syxli0.png"
          }
          alt="Cyberize"
          width={40}
          height={40}
        />
      </Link>

      {/* NAVIGATION */}
      <nav className="hidden sm:ml-6 sm:flex flex-grow justify-center items-center">
        {/* <NavLink href="/admin-portal">Admin</NavLink> */}
        {/* <NavLink href="/superadmin-portal">Super</NavLink> */}
        {/* <NavLink href="/wp-test">WP Blog</NavLink> */}
      </nav>

      {/* DARK MODE BUTTON */}
      <div className="flex items-center">
        {/* <ThemeToggler /> */}

        {user && <span className="mr-3 text-white">{user.email}</span>}

        <DropdownMenu>
          <DropdownMenuTrigger>
            <button className="text-gray-500 pt-1">
              <MenuIcon
                className="h-8 w-8 text-white border-2 border-white p-1"
                aria-hidden="true"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white dark:bg-slate-600">
            {/* For Dropdown Menu - Switching between 'Event List' & 'Dashboard' */}
            {
              user ? (
                <DropdownMenuItem>
                  {user?.user_metadata?.is_qr_superadmin ? (
                    <Link href={"/superadmin-portal"}>Dashboard</Link> // Superadmin sees "Dashboard"
                  ) : (
                    <Link href={"/admin-portal"}>Event List</Link> // Admin sees "Event List"
                  )}
                </DropdownMenuItem>
              ) : null /* Do not render this link if no user is logged in */
            }
            {user && (
              <>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            )}

            {/* For Profile Link Based on User Role */}
            {
              user ? (
                <DropdownMenuItem>
                  {user?.user_metadata?.is_qr_superadmin ? (
                    <Link href={`/superadmin/profile/${userId}`}>Profile</Link> // Superadmin profile link
                  ) : (
                    <Link href={`/profile/${userId}`}>Profile</Link> // Admin profile link
                  )}
                </DropdownMenuItem>
              ) : null /* Will not render this link if no user is logged in */
            }

            {/* For Logout / Log in */}
            <DropdownMenuItem>
              {user ? (
                <Logout /> /* If the user is logged in, show Logout */
              ) : (
                <Link href={"/auth"}>
                  Log in
                </Link> /* If no user is logged in, show 'Log in' */
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Navbar;
