const express = require("express");
const router = express.Router();

const statsController = require("../controllers/statsController");

// Stats & Overview
router.get("/stats/overview", statsController.getOverview);

// Webhooks (N8N)
router.post("/recruitment/post", webhookController.postJob);
router.post("/send-mail-candidate", webhookController.sendMailCandidate);
router.post(
  "/applicants-pass/send-interview-invites",
  webhookController.sendInterviewInvites
);

module.exports = router;
