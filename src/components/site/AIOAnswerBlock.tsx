type AIOAnswerBlockProps = {
  question: string;
  answer: string;
};

export function AIOAnswerBlock({ question, answer }: AIOAnswerBlockProps) {
  return (
    <section className="aio-answer-block" aria-label={question}>
      <h2>{question}</h2>
      <p>{answer}</p>
    </section>
  );
}
