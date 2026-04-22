"use server";

import { Resend } from "resend";
import { getDpoEmail } from "@/lib/dpo-emails";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL ?? "gdpr@consently.ai";

export async function sendGdprDeletionRequest({
  companyName,
  userEmail,
  dataTypes,
  reason,
  providedDpoEmail,
}: {
  companyName: string;
  userEmail: string;
  dataTypes: string[];
  reason?: string;
  providedDpoEmail?: string;
}): Promise<{ sent: boolean; to: string; error?: string }> {
  const to = providedDpoEmail || getDpoEmail(companyName);
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const dataTypesList = dataTypes.length > 0
    ? dataTypes.map((d) => `<li>${d.replace(/_/g, " ")}</li>`).join("")
    : "<li>All personal data held on file</li>";

  const reasonNote = reason
    ? `<p>The reason for this request is: <em>${reason}</em>.</p>`
    : "";

  const html = `
    <p>${date}</p>

    <p>To the Data Protection Officer / Privacy Team,<br/><strong>${companyName}</strong></p>

    <p>I am writing to exercise my <strong>Right to Erasure</strong> under <strong>Article 17 of the UK/EU General Data Protection Regulation (GDPR)</strong>.</p>

    <p>I request that you permanently delete all personal data you hold about me, including but not limited to:</p>
    <ul>${dataTypesList}</ul>

    <p>My account is registered under the email address: <strong>${userEmail}</strong></p>

    ${reasonNote}

    <p>Please confirm in writing within <strong>30 days</strong> that:</p>
    <ol>
      <li>All personal data has been deleted from your systems and any third-party processors;</li>
      <li>Any backup copies have been scheduled for deletion at the earliest opportunity;</li>
      <li>Any downstream data sharing partners have been notified of this erasure request.</li>
    </ol>

    <p>If you require further verification of my identity, please contact me at the email address below.</p>

    <p>This request is sent on my behalf via <strong>Consently</strong>, a privacy management platform.<br/>
    The data subject's contact email: <a href="mailto:${userEmail}">${userEmail}</a></p>

    <p>Regards,<br/>${userEmail}</p>

    <hr/>
    <p style="font-size:11px;color:#888">
      This email was generated and dispatched by Consently (consently.ai) as an automated GDPR Article 17
      Right to Erasure request on behalf of the data subject identified above.
    </p>
  `;

  if (!resend) {
    // No API key configured — log so the developer can see it during development
    console.log(`[GDPR] Would send deletion request to ${to} for ${companyName} (${userEmail})`);
    return { sent: false, to, error: "RESEND_API_KEY not configured" };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      replyTo: userEmail,
      subject: `Right to Erasure Request (GDPR Art. 17) — ${userEmail}`,
      html,
    });

    if (error) return { sent: false, to, error: error.message };
    return { sent: true, to };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { sent: false, to, error: message };
  }
}
