import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as logger from 'firebase-functions/logger';
import { setGlobalOptions } from 'firebase-functions/options';

setGlobalOptions({
  region: 'us-central1'
});

export const weeklyBlogPublish = onSchedule(
  {
    schedule: '*/1 * * * *', // Schedule to run every Wednesday at 00:40 -- 40 0 * * 3
    timeZone: 'Asia/Ho_Chi_Minh', // Timezone is set to Vietnam
    region: 'us-central1'
  },
  async (event) => {
    try {
      logger.info(
        `Starting scheduled function to publish blogs at ${new Date().toISOString()} (${event.scheduleTime}) with timezone Asia/Ho_Chi_Minh UTC+7`
      );

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

      logger.info('Blog publish API called successfully', {
        status: response.status,
        data: data
      });
    } catch (error: any) {
      logger.error('Error calling blog publish API', {
        error: error.message
      });
    }
  }
);
