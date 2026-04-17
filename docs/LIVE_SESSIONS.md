# Live sessions (MVP scope)

This project implements **scheduled live sessions** with an external meeting link, not in-browser WebRTC.

## Data model

- Each session stores `meetingUrl`, optional `provider` (`jitsi`, `google-meet`, `zoom`, `custom`), `startsAt`, `endsAt`, and `status`.
- Instructors and enrolled students can list sessions for a course via the API (`/api/live-sessions/...`).

## Product expectation

- **MVP:** paste a Zoom, Google Meet, or Jitsi link; notify enrolled learners; open the vendor app for video.
- **Future:** add signaling + WebRTC or a managed SFU if you need native video inside the LMS.

## Operations

- Ensure `CORS_ORIGIN` and `BASE_URL` are correct in production so links and notifications resolve for users.
