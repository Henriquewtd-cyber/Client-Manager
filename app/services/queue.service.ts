

import { Queue } from "bullmq";
import dotenv from "dotenv";

dotenv.config();
export const appointmentQueue = new Queue("appointments", {
    connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
    },

});