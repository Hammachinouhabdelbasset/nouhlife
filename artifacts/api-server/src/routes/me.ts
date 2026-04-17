import { Router, type IRouter } from "express";
import { clerkClient } from "@clerk/express";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAIL.length > 0 && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

router.get("/me", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;

  const user = await clerkClient.users.getUser(userId);
  const primaryEmail = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress
    ?? user.emailAddresses[0]?.emailAddress
    ?? "";

  const admin = isAdminEmail(primaryEmail);

  res.json({
    userId,
    email: primaryEmail,
    name: user.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : user.username ?? primaryEmail,
    imageUrl: user.imageUrl,
    plan: admin ? "BETA" : "FREE",
    role: admin ? "SUPER_ADMIN" : "USER",
    isAdmin: admin,
    isBeta: admin,
    features: admin
      ? {
          unlimitedTasks: true,
          unlimitedHabits: true,
          financeTracker: true,
          contentStudio: true,
          analytics: true,
          allThemes: true,
          engineeringLab: true,
          adminPanel: true,
          betaFeatures: true,
          advancedAnalytics: true,
          prioritySupport: true,
        }
      : {
          unlimitedTasks: false,
          unlimitedHabits: false,
          financeTracker: false,
          contentStudio: false,
          analytics: false,
          allThemes: false,
          engineeringLab: false,
          adminPanel: false,
          betaFeatures: false,
          advancedAnalytics: false,
          prioritySupport: false,
        },
  });
});

export default router;
