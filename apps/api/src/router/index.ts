import { adminRouter } from "./admin";
import { menuRouter } from "./menu";
import { ordersRouter } from "./orders";

export const router = {
  menu: menuRouter,
  orders: ordersRouter,
  admin: adminRouter,
};

export type AppRouter = typeof router;
