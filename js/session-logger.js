/**
 * Records the session in the agreed brutalist ChatML format.
 * Sparse SSUs, strict alternation, no system prompt.
 */
export class SessionLogger {
  constructor() {
    this.turns = []; // { role: 'user'|'assistant', content: string }
    this._lastRole = null;
  }

  reset() {
    this.turns = [];
    this._lastRole = null;
  }

  _push(role, content) {
    // Enforce alternation by merging into previous turn of same role if needed
    if (this._lastRole === role && this.turns.length) {
      this.turns[this.turns.length - 1].content += '\n' + content;
    } else {
      this.turns.push({ role, content });
      this._lastRole = role;
    }
  }

  /** Full or sparse state object → <state> tag */
  pushState(stateObj) {
    let body;
    if (stateObj.mood && stateObj.body) {
      // full-ish
      body = [
        `mood:happy:${stateObj.mood.happy?.toFixed?.(2) ?? stateObj.mood.happy} tired:${stateObj.mood.tired?.toFixed?.(2) ?? stateObj.mood.tired} dirt:${stateObj.mood.dirt?.toFixed?.(2) ?? stateObj.mood.dirt ?? 0}`,
        `body:${stateObj.body} task:${stateObj.task} autonomy:${stateObj.autonomy ?? 'none'}`,
        `hands:R=${stateObj.hands?.R ?? 'null'} L=${stateObj.hands?.L ?? 'null'} look:${stateObj.look ?? 'none'}`
      ].join('\n');
    } else {
      // sparse
      const parts = [];
      if (stateObj.mood) parts.push(`mood:happy:${stateObj.mood.happy} tired:${stateObj.mood.tired}`);
      if (stateObj.hands) parts.push(`hands:R=${stateObj.hands.R ?? 'null'} L=${stateObj.hands.L ?? 'null'}`);
      if (stateObj.look) parts.push(`look:${stateObj.look}`);
      if (stateObj.body) parts.push(`body:${stateObj.body}`);
      if (stateObj.task) parts.push(`task:${stateObj.task}`);
      body = parts.join(' ') || JSON.stringify(stateObj);
    }
    this._push('user', `<state>\n${body}\n</state>`);
  }

  pushVoice(text) {
    this._push('user', `<voice>${text}</voice>`);
  }

  pushEvent(desc) {
    this._push('user', `<event>${desc}</event>`);
  }

  pushAssistant(text) {
    this._push('assistant', text);
  }

  toChatML() {
    return this.turns.map(t => {
      return `<|im_start|>${t.role}\n${t.content}\n<|im_end|>`;
    }).join('\n');
  }
}
