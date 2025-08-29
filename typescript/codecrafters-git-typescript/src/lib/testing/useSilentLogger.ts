import { afterAll, beforeAll } from "@std/testing/bdd";
import { logger } from "../utils/Logger.ts";

export function useSilentLogger(): void {
  beforeAll(() => {
    logger.silence();
  });

  afterAll(() => {
    logger.restore();
  });
}
