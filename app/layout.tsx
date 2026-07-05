import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { auth } from "@/lib/auth";
import { Role } from "@/app/generated/prisma/enums";
import { LogoutButton } from "@/app/components/LogoutButton";
import { Footer } from "@/app/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CEINFUA",
  description: "Centro de Estudiantes de Ingeniería Informática - UA",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const role = session?.user?.role;
  const isStaff = role === Role.CEINFUA_MEMBER || role === Role.ADMIN;

  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-white text-neutral-900">
        <nav className="flex gap-6 border-b border-neutral-200 px-6 py-4">
          <Link href="/" className="font-semibold hover:underline">
            CEINFUA
          </Link>
          <Link href="/news" className="hover:underline">
            Novedades
          </Link>
          <Link href="/events" className="hover:underline">
            Eventos
          </Link>
          {!session?.user && (
            <>
              <Link href="/login" className="hover:underline">
                Iniciar sesión
              </Link>
              <Link href="/register" className="hover:underline">
                Registrarme
              </Link>
            </>
          )}
          {session?.user && (
            <>
              <Link href="/profile" className="hover:underline">
                Mi perfil
              </Link>
              <LogoutButton />
            </>
          )}
          {(isStaff || role === Role.EXTERNAL_PARTNER) && (
            <Link href="/students" className="hover:underline">
              Padrón
            </Link>
          )}
          {role === Role.ADMIN && (
            <>
              <Link href="/admin/news" className="hover:underline">
                Gestionar noticias
              </Link>
              <Link href="/admin/events" className="hover:underline">
                Gestionar eventos
              </Link>
              <Link href="/admin/roles" className="hover:underline">
                Roles
              </Link>
            </>
          )}
        </nav>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
