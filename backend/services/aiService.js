// backend/services/aiService.js
const axios = require('axios');
const config = require('../config/env');
const AppError = require('../utils/AppError');

const PROVIDERS = {
  groq:       { format: 'openai', baseUrl: 'https://api.groq.com/openai/v1',                          model: 'llama-3.3-70b-versatile', needsKey: true,  label: 'Groq' },
  gemini:     { format: 'openai', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-flash-latest',     needsKey: true,  label: 'Google Gemini' },
  openrouter: { format: 'openai', baseUrl: 'https://openrouter.ai/api/v1',                            model: 'openai/gpt-oss-20b:free', needsKey: true,  label: 'OpenRouter' },
  ollama:     { format: 'openai', baseUrl: 'http://localhost:11434/v1',                               model: 'llama3.2',                needsKey: false, label: 'Ollama (local)' },
  anthropic:  { format: 'anthropic', baseUrl: 'https://api.anthropic.com/v1',                         model: 'claude-haiku-5-5',        needsKey: true,  label: 'Anthropic' },
};

const provider = () => PROVIDERS[config.aiProvider] || null;

exports.isEnabled = () => {
  const p = provider();
  return Boolean(p) && (!p.needsKey || Boolean(config.aiApiKey));
};

const normalizeError = (error, p) => {
  const status = error.response?.status;
  console.error(`AI provider error (${p.label}):`, status || error.code, error.response?.data?.error?.message || error.response?.data?.error || error.message);

  if (status === 401 || status === 403) return new AppError('The AI service key is invalid or not allowed. Please contact the administrator.', 503);
  if (status === 404 || status === 400) return new AppError('The AI model is not available. The administrator should check AI_MODEL in the backend .env file.', 503);
  if (status === 429) return new AppError('The free AI limit was reached for now. Please try again in a minute.', 429);
  if (error.code === 'ECONNREFUSED') return new AppError(config.aiProvider === 'ollama' ? 'The local AI (Ollama) is not running.' : 'Cannot reach the AI service.', 503);
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return new AppError('The AI service took too long to respond.', 504);
  return new AppError('The AI service is temporarily unavailable.', 502);
};

exports.complete = async ({ system, messages, maxTokens = config.aiMaxTokens }) => {
  if (!exports.isEnabled()) throw new AppError('The AI assistant is not configured on this server.', 503);

  const p = provider();
  const baseUrl = (config.aiBaseUrl || p.baseUrl).replace(/\/+$/, '');
  const model = config.aiModel || p.model;

  try {
    let text;
    if (p.format === 'anthropic') {
      const { data } = await axios.post(
        `${baseUrl}/messages`,
        { model, max_tokens: maxTokens, system, messages },
        { headers: { 'x-api-key': config.aiApiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, timeout: 45000 }
      );
      text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n');
    } else {
      const headers = { 'content-type': 'application/json' };
      if (config.aiApiKey) headers.authorization = `Bearer ${config.aiApiKey}`;
      if (config.aiProvider === 'openrouter') headers['X-Title'] = 'URO Flood Lab';
      const { data } = await axios.post(
        `${baseUrl}/chat/completions`,
        { model, messages: [{ role: 'system', content: system }, ...messages], max_tokens: maxTokens, temperature: 0.3 },
        { headers, timeout: config.aiProvider === 'ollama' ? 120000 : 45000 }
      );
      text = data.choices?.[0]?.message?.content || '';
    }

    text = String(text || '').trim();
    if (!text) throw new AppError('The AI returned an empty answer. Please try again.', 502);
    return text;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw normalizeError(error, p);
  }
};

// Shows at startup which AI is active (never prints the key), so misconfiguration is obvious.
if (process.env.NODE_ENV !== 'test') {
  const p = provider();
  if (exports.isEnabled()) console.log(`AI enabled: ${p.label} (model: ${config.aiModel || p.model})`);
  else if (config.aiProvider && !p) console.warn(`AI disabled: unknown AI_PROVIDER "${config.aiProvider}". Use groq, gemini, openrouter, ollama or anthropic.`);
  else if (p && p.needsKey) console.warn(`AI disabled: AI_PROVIDER=${config.aiProvider} but AI_API_KEY is empty.`);
  else console.log('AI disabled (set AI_PROVIDER and AI_API_KEY in .env to enable).');
}