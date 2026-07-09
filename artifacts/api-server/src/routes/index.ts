import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tempsynthRouter from "./tempsynth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(tempsynthRouter);

export default router;
