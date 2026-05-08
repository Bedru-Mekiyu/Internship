import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import { Certificate } from '../models/Certificate.model';
import { Course } from '../models/Course.model';
import { Enrollment } from '../models/Enrollment.model';
import { Notification } from '../models/Notification.model';
import { AppError } from '../utils/http-error';
import { asyncHandler } from '../utils/async-handler';
import { routeParam } from '../utils/route-params';
import { emitToUser } from '../utils/socket-notify';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const getDisplayName = (value: unknown) => {
  if (!value || typeof value === 'string') {
    return 'Student';
  }

  const person = value as { firstName?: string; lastName?: string; email?: string };
  return [person.firstName, person.lastName].filter(Boolean).join(' ') || person.email || 'Student';
};

const getCourseTitle = (value: unknown) => {
  if (!value || typeof value === 'string') {
    return 'Untitled course';
  }

  const course = value as { title?: string };
  return course.title || 'Untitled course';
};

const getOwnerId = (value: unknown) => {
  if (value && typeof value === 'object' && '_id' in value) {
    const owner = value as { _id?: { toString?: () => string } | string };
    return typeof owner._id === 'string' ? owner._id : owner._id?.toString?.() || '';
  }

  return String(value || '');
};

const getTrustedBaseUrl = (req: Request) => {
  const configuredBaseUrl = process.env.BASE_URL?.trim().replace(/\/$/, '');
  if (configuredBaseUrl) {
    try {
      const parsed = new URL(configuredBaseUrl);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.toString().replace(/\/$/, '');
      }
    } catch {
      /* fall through */
    }
  }

  if (process.env.NODE_ENV === 'production') {
    throw new AppError('Public base URL is not configured', 500);
  }

  return `${req.protocol}://${req.get('host')}`;
};

const buildCertificateHtml = (options: {
  studentName: string;
  courseTitle: string;
  certificateNumber: string;
  issuedAt: string;
  verifyUrl: string;
}) => {
  const { studentName, courseTitle, certificateNumber, issuedAt, verifyUrl } = options;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(courseTitle)} certificate</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f8fafc;
        --card: #ffffff;
        --ink: #0f172a;
        --muted: #475569;
        --line: #dbe4f0;
        --accent: #4f46e5;
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 32px;
        background:
          radial-gradient(circle at top left, rgba(79, 70, 229, 0.12), transparent 32%),
          linear-gradient(180deg, #eef2ff 0%, var(--bg) 42%, #edf2ff 100%);
        color: var(--ink);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .certificate {
        width: min(920px, 100%);
        background: var(--card);
        border: 1px solid rgba(79, 70, 229, 0.18);
        border-radius: 28px;
        padding: 40px;
        box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
      }

      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.2em;
        font-size: 12px;
        color: var(--accent);
        font-weight: 700;
        margin-bottom: 18px;
      }

      h1 {
        margin: 0;
        font-size: clamp(2rem, 4vw, 3.4rem);
        line-height: 1;
      }

      .subhead {
        margin: 14px 0 0;
        font-size: 1.05rem;
        color: var(--muted);
        max-width: 62ch;
        line-height: 1.65;
      }

      .recipient {
        margin-top: 34px;
        padding: 24px 0;
        border-top: 1px solid var(--line);
        border-bottom: 1px solid var(--line);
      }

      .recipient-label, .meta-label {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        color: var(--muted);
        margin-bottom: 10px;
      }

      .recipient-name {
        font-size: clamp(1.8rem, 3vw, 2.6rem);
        font-weight: 800;
      }

      .course {
        margin-top: 14px;
        color: var(--muted);
        font-size: 1.05rem;
      }

      .meta {
        margin-top: 26px;
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }

      .meta-card {
        border: 1px solid var(--line);
        border-radius: 18px;
        padding: 18px 20px;
        background: #f8fafc;
      }

      .meta-value {
        font-weight: 700;
        word-break: break-word;
      }

      .footer {
        margin-top: 30px;
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: center;
        flex-wrap: wrap;
        color: var(--muted);
        font-size: 0.94rem;
      }

      .verify {
        color: var(--accent);
        text-decoration: none;
        font-weight: 700;
      }

      @media print {
        body { padding: 0; background: #ffffff; }
        .certificate { box-shadow: none; border-radius: 0; width: 100%; }
      }
    </style>
  </head>
  <body>
    <main class="certificate">
      <div class="eyebrow">LearnSpace Certificate</div>
      <h1>Certificate of Completion</h1>
      <p class="subhead">This certificate confirms that the named learner successfully completed the course below and can verify the credential using the public verification route.</p>

      <section class="recipient" aria-labelledby="recipient-name">
        <div class="recipient-label">Awarded to</div>
        <div class="recipient-name" id="recipient-name">${escapeHtml(studentName)}</div>
        <div class="course">${escapeHtml(courseTitle)}</div>
      </section>

      <section class="meta" aria-label="certificate metadata">
        <div class="meta-card">
          <div class="meta-label">Certificate ID</div>
          <div class="meta-value">${escapeHtml(certificateNumber)}</div>
        </div>
        <div class="meta-card">
          <div class="meta-label">Issued</div>
          <div class="meta-value">${escapeHtml(issuedAt)}</div>
        </div>
        <div class="meta-card">
          <div class="meta-label">Verification</div>
          <div class="meta-value"><a class="verify" href="${escapeHtml(verifyUrl)}">Open verification record</a></div>
        </div>
      </section>

      <div class="footer">
        <span>Generated by LearnSpace</span>
        <span>Secure server-rendered credential</span>
      </div>
    </main>
  </body>
</html>`;
};

const loadCertificate = async (certificateId: string, userId?: string) => {
  const certificate = await Certificate.findById(certificateId);

  if (!certificate) {
    throw new AppError('Certificate not found', 404);
  }

  if (typeof certificate.populate === 'function') {
    await certificate.populate('courseId', 'title slug category');
    await certificate.populate('userId', 'firstName lastName email');
  }

  if (userId && getOwnerId(certificate.userId) !== userId) {
    throw new AppError('Access denied', 403);
  }

  return certificate;
};

const createCertificateNumber = (courseId: string, userId: string) => {
  const courseSuffix = courseId.slice(-6).toUpperCase();
  const userSuffix = userId.slice(-6).toUpperCase();
  const timePart = Date.now().toString(36).toUpperCase();
  return `MIT-${courseSuffix}-${userSuffix}-${timePart}`;
};

export const generateCourseCertificate = asyncHandler(async (req: Request, res: Response) => {
  const courseId = routeParam(req.params.courseId);

  const course = await Course.findById(courseId).select('title');
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  const enrollment = await Enrollment.findOne({ userId: req.user?._id, courseId });
  if (!enrollment) {
    throw new AppError('Enrollment not found', 404);
  }

  const isCompleted = enrollment.status === 'completed' || Number(enrollment.progress || 0) >= 100;
  if (!isCompleted) {
    throw new AppError('Course must be completed to generate certificate', 400);
  }

  const existing = await Certificate.findOne({ userId: req.user?._id, courseId }).populate('courseId', 'title');
  if (existing) {
    return res.json(existing);
  }

  const certificate = new Certificate({
    userId: req.user?._id,
    courseId,
    certificateNumber: createCertificateNumber(String(courseId), String(req.user?._id)),
    issuedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await certificate.save();
  await certificate.populate('courseId', 'title');

  const certNotif = await Notification.create({
    userId: req.user?._id,
    type: 'system',
    title: 'Certificate issued',
    message: `Your certificate for ${course.title} is now available.`,
    isRead: false,
    createdAt: new Date(),
  });

  if (req.user?._id) {
    emitToUser(req.app, String(req.user._id), 'notification:new', {
      _id: certNotif._id,
      type: certNotif.type,
      title: certNotif.title,
      message: certNotif.message,
      isRead: certNotif.isRead,
      createdAt: certNotif.createdAt,
    });
  }

  return res.status(201).json(certificate);
});

export const getMyCertificates = asyncHandler(async (req: Request, res: Response) => {
  const certificates = await Certificate.find({ userId: req.user?._id })
    .populate('courseId', 'title slug category')
    .sort({ issuedAt: -1 });

  return res.json(certificates);
});

export const verifyCertificate = asyncHandler(async (req: Request, res: Response) => {
  const certificateId = routeParam(req.params.certificateId);
  const certificate = await Certificate.findById(certificateId)
    .populate('courseId', 'title slug category')
    .populate('userId', 'firstName lastName');

  if (!certificate) {
    throw new AppError('Certificate not found', 404);
  }

  return res.json({
    _id: certificate._id,
    certificateNumber: certificate.certificateNumber,
    issuedAt: certificate.issuedAt,
    course: certificate.courseId,
    learner: certificate.userId,
  });
});

export const renderCertificatePage = asyncHandler(async (req: Request, res: Response) => {
  const certificateId = routeParam(req.params.certificateId);
  const certificate = await loadCertificate(certificateId, req.user?._id ? String(req.user._id) : undefined);

  const html = buildCertificateHtml({
    studentName: getDisplayName(certificate.userId),
    courseTitle: getCourseTitle(certificate.courseId),
    certificateNumber: certificate.certificateNumber,
    issuedAt: certificate.issuedAt ? new Date(certificate.issuedAt).toLocaleDateString() : 'Recently',
    verifyUrl: `${getTrustedBaseUrl(req)}/api/certificates/verify/${certificate._id}`,
  });

  return res.status(200).type('html').send(html);
});

export const downloadCertificatePage = asyncHandler(async (req: Request, res: Response) => {
  const certificateId = routeParam(req.params.certificateId);
  const certificate = await loadCertificate(certificateId, req.user?._id ? String(req.user._id) : undefined);
  const html = buildCertificateHtml({
    studentName: getDisplayName(certificate.userId),
    courseTitle: getCourseTitle(certificate.courseId),
    certificateNumber: certificate.certificateNumber,
    issuedAt: certificate.issuedAt ? new Date(certificate.issuedAt).toLocaleDateString() : 'Recently',
    verifyUrl: `${getTrustedBaseUrl(req)}/api/certificates/verify/${certificate._id}`,
  });

  return res.status(200).attachment(`certificate-${certificate.certificateNumber}.html`).type('html').send(html);
});

export const downloadCertificatePdf = asyncHandler(async (req: Request, res: Response) => {
  const certificateId = routeParam(req.params.certificateId);
  const certificate = await loadCertificate(certificateId, req.user?._id ? String(req.user._id) : undefined);

  const studentName = getDisplayName(certificate.userId);
  const courseTitle = getCourseTitle(certificate.courseId);
  const issuedAt = certificate.issuedAt ? new Date(certificate.issuedAt).toLocaleDateString() : 'Recently';
  const verifyUrl = `${getTrustedBaseUrl(req)}/api/certificates/verify/${certificate._id}`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="certificate-${certificate.certificateNumber}.pdf"`,
  );

  const doc = new PDFDocument({ size: 'LETTER', margin: 56 });
  doc.pipe(res);

  doc.fontSize(22).text('Certificate of completion', { align: 'center' });
  doc.moveDown(1.2);
  doc.fontSize(12).fillColor('#444444').text('This certifies that', { align: 'center' });
  doc.moveDown(0.6);
  doc.fontSize(20).fillColor('#111111').text(studentName, { align: 'center' });
  doc.moveDown(0.8);
  doc.fontSize(12).fillColor('#444444').text('successfully completed', { align: 'center' });
  doc.moveDown(0.6);
  doc.fontSize(16).fillColor('#111111').text(courseTitle, { align: 'center' });
  doc.moveDown(2);
  doc.fontSize(11).fillColor('#555555');
  doc.text(`Credential ID: ${certificate.certificateNumber}`);
  doc.text(`Issued: ${issuedAt}`);
  doc.moveDown(0.5);
  doc.fillColor('#2563EB').text(`Verification: ${verifyUrl}`, { link: verifyUrl, underline: true });
  doc.moveDown(2);
  doc.fontSize(10).fillColor('#888888').text('LearnSpace — academic integrity record. Verification URL confirms issuance.', {
    align: 'center',
  });

  doc.end();
});
