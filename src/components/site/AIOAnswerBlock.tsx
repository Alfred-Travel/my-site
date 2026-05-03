type AIOAnswerBlockProps = {
  question: string;
  answer: string;
};

export function AIOAnswerBlock({ question, answer }: AIOAnswerBlockProps) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answer,
        },
      },
    ],
  };

  return (
    <section className="aio-answer-block" aria-label={question}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <h2>{question}</h2>
      <p>{answer}</p>
    </section>
  );
}
