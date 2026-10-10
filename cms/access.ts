import type { Access, FieldAccess, PayloadRequest } from "payload";

type Role = "admin" | "editor";
const roleOf = (req: PayloadRequest) => (req.user as { role?: Role } | null)?.role;

export const anyone: Access = () => true;
export const loggedIn: Access = ({ req }) => Boolean(req.user);
export const adminOnly: Access = ({ req }) => roleOf(req) === "admin";
export const adminFieldOnly: FieldAccess = ({ req }) => roleOf(req) === "admin";

/** For collections with drafts: the public sees published entries only. */
export const publishedOrLoggedIn: Access = ({ req }) =>
  req.user ? true : { _status: { equals: "published" } };

/** Hide admin-only collections from editors' navigation. */
export const hiddenUnlessAdmin = ({ user }: { user?: unknown }) =>
  (user as { role?: Role } | undefined)?.role !== "admin";
