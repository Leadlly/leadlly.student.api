// configuration/scheduleActions.ts
import { Request, Response, NextFunction } from 'express';


interface ActionFunction {
  (req: Request, res: Response, next: NextFunction): Promise<void>;
}

interface ScheduleActionsConfig {
  [standard: number]: {
    [schedule: string]: ActionFunction;
  };
}

export const scheduleActions: ScheduleActionsConfig = {
  // 11: {
  //   coaching_college_selfstudy: handlecoacing,
  //   coaching_college: handleCoachingCollege,
  //   coaching_selfstudy: handleCoachingSelfStudy,
  // },
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
