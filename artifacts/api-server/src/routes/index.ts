import { Router, type IRouter } from "express";
import healthRouter from "./health";
import notesRouter from "./notes";
import tasksRouter from "./tasks";
import projectsRouter from "./projects";
import habitsRouter from "./habits";
import financeRouter from "./finance";
import contentRouter from "./content";
import goalsRouter from "./goals";
import dailyPlansRouter from "./daily_plans";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(notesRouter);
router.use(tasksRouter);
router.use(projectsRouter);
router.use(habitsRouter);
router.use(financeRouter);
router.use(contentRouter);
router.use(goalsRouter);
router.use(dailyPlansRouter);

export default router;
