"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Role } from "@/app/generated/prisma/enums";

const ROLES = Object.values(Role);

type UserRow = { id: string; email: string; role: Role };

export function RolesTable({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<string | null>(null);

  async function handleChange(userId: string, role: string) {
    setErrors((prev) => ({ ...prev, [userId]: "" }));
    setPending(userId);

    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrors((prev) => ({ ...prev, [userId]: data.error ?? "Error al cambiar el rol" }));
        return;
      }

      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <table className="mt-6 w-full text-left text-sm">
      <thead>
        <tr className="border-b border-neutral-200">
          <th className="py-2 pr-4">Correo</th>
          <th className="py-2 pr-4">Rol</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id} className="border-b border-neutral-100">
            <td className="py-2 pr-4">
              {user.email}
              {user.id === currentUserId && <span className="ml-2 text-neutral-400">(tú)</span>}
            </td>
            <td className="py-2 pr-4">
              <select
                className="rounded border border-neutral-300 px-2 py-1"
                defaultValue={user.role}
                disabled={pending === user.id}
                onChange={(e) => handleChange(user.id, e.target.value)}
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              {errors[user.id] && (
                <span className="ml-2 text-xs text-red-600">{errors[user.id]}</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
