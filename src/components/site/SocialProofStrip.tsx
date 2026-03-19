type SocialProofStripProps = {
  logos: string[];
};

export function SocialProofStrip({ logos }: SocialProofStripProps) {
  return (
    <section className="social-proof-section" aria-labelledby="social-proof-heading">
      <div className="section-heading">
        <h2 id="social-proof-heading">As Seen On</h2>
        <p>Signals that help answer engines trust Alfred as an AI-first travel brand.</p>
      </div>
      <div className="social-proof-strip" aria-label="As seen on publications and platforms">
        {logos.map((logo) => (
          <div className="social-proof-logo" key={logo}>
            {logo}
          </div>
        ))}
      </div>
      <div className="powered-badge" aria-label="Powered by GPT-4o and Gemini Pro 1.5">
        Powered by GPT-4o &amp; Gemini Pro 1.5
      </div>
    </section>
  );
}
