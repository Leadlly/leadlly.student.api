// configuration/scheduleActions.ts
import { Request, Response, NextFunction } from "express";
import { handleCoachingCollegeSelfStudy } from "./coaching_college_selfstudy";

interface ActionFunction {
  (req: Request, res: Response, next: NextFunction): Promise<void>;
}

interface ScheduleActionsConfig {
  [standard: number]: {
    [schedule: string]: ActionFunction;
  };
}

export const scheduleActions: ScheduleActionsConfig = {
  11: {
    coaching_college_selfstudy: handleCoachingCollegeSelfStudy,
    // college_selfstudy_coaching_selfstudy: handleCoachingCollege,
  },
  // 12: {
  //   coaching_college_selfstudy: handleCoachingCollegeSelfStudy,
  //   coaching_college: handleCoachingCollege,
  //   coaching_selfstudy: handleCoachingSelfStudy,
  // },
  // 13: {
  //   coaching_college_selfstudy: handleCoachingCollegeSelfStudy,
  //   coaching_college: handleCoachingCollege,
  //   coaching_selfstudy: handleCoachingSelfStudy,
  // },
};
