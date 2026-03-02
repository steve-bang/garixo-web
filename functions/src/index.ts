import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as logger from 'firebase-functions/logger';
import { setGlobalOptions } from 'firebase-functions/options';

/**
 * Global runtime defaults for all functions in this module.
 * Keep the region aligned with the primary project deployment region
 * to reduce cross-region latency and simplify operations.
 */
setGlobalOptions({
  region: 'us-central1'
});

/**
 * Scheduled publisher for blog posts.
 *
 * Responsibilities:
 * 1) Trigger on a fixed weekly schedule.
 * 2) Call the web application's publish endpoint.
 * 3) Log success/failure details for operations visibility.
 *
 * Notes:
 * - Business publish logic remains in the Next.js API route.
 * - This function acts as a scheduler/orchestrator only.
 */
export const weeklyBlogPublish = onSchedule(
  {
    // Every Wednesday at 00:40 (Asia/Ho_Chi_Minh).
    schedule: '40 0 * * 3',
    // Explicit timezone ensures deterministic schedule execution.
    timeZone: 'Asia/Ho_Chi_Minh',
    region: 'us-central1'
  },
  async (event) => {
    try {
      // Start log includes both runtime clock and scheduler-provided trigger time.
      logger.info(
        `Starting scheduled function to publish blogs at ${new Date().toISOString()} (${event.scheduleTime}) with timezone Asia/Ho_Chi_Minh UTC+7`
      );

      // Trigger the app endpoint that publishes all due scheduled blog posts.
      const response = await fetch(
        'https://www.garixo.com/api/blogs/publish-scheduled',
        {
          method: 'GET',
          headers: {
            Accept: 'application/json'
          }
        }
      );

      const data = await response.text();

      // Log full HTTP status and response payload for easier debugging.
      logger.info('Blog publish API called successfully', {
        status: response.status,
        data: data
      });
    } catch (error: any) {
      // Catch network/runtime errors so scheduler runs do not crash silently.
      logger.error('Error calling blog publish API', {
        error: error.message
      });
    }
  }
);
