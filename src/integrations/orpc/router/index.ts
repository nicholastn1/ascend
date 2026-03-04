import { aiRouter } from "./ai";
import { applicationRouter } from "./application";
import { authRouter } from "./auth";
import { chatRouter } from "./chat";
import { flagsRouter } from "./flags";
import { printerRouter } from "./printer";
import { promptRouter } from "./prompt";
import { resumeRouter } from "./resume";
import { statisticsRouter } from "./statistics";
import { storageRouter } from "./storage";

export default {
	ai: aiRouter,
	application: applicationRouter,
	auth: authRouter,
	chat: chatRouter,
	flags: flagsRouter,
	prompt: promptRouter,
	resume: resumeRouter,
	storage: storageRouter,
	printer: printerRouter,
	statistics: statisticsRouter,
};
