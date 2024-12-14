import cron from 'node-cron'
import { Meeting } from '../../models/meetingModal'


cron.schedule("0 0 * * *", async() => {
    const currentDate = new Date()
     
    // Mark all past meetings as completed
    await Meeting.updateMany(
        { date: { $lt: currentDate } },
        { $set: { isCompleted: true } }
    )
})