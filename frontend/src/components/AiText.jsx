// src/components/AiText.jsx
// Renders the small subset of Markdown the AI uses (bold, bullets, headings) WITHOUT innerHTML,
// so model output can never inject HTML/scripts into the page.
const renderInline = (text) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong> : part
  );

const AiText = ({ text }) => {
  const blocks = [];
  let list = [];
  const flush = () => { if (list.length) { blocks.push({ type: 'ul', items: list }); list = []; } };

  text.split('\n').forEach((raw) => {
    const line = raw.trim();
    if (!line) return flush();
    const bullet = line.match(/^[-*•]\s+(.*)/);
    if (bullet) return list.push(bullet[1]);
    flush();
    const heading = line.match(/^#{1,4}\s+(.*)/) || line.match(/^\*\*([^*]+)\*\*:?$/);
    blocks.push(heading ? { type: 'h', text: heading[1].replace(/[*:]+$/g, '') } : { type: 'p', text: line });
  });
  flush();

  return (
    <div className="space-y-2 text-sm leading-relaxed text-slate-700">
      {blocks.map((b, i) =>
        b.type === 'h' ? <h4 key={i} className="pt-1 text-sm font-bold text-brand-800">{b.text}</h4>
        : b.type === 'ul' ? <ul key={i} className="list-disc space-y-1 pl-5">{b.items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}</ul>
        : <p key={i}>{renderInline(b.text)}</p>
      )}
    </div>
  );
};

export default AiText;
