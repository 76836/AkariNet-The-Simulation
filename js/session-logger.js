/**
 * SESSION-LOGGER-E5R2N
 * Records the session in the agreed brutalist ChatML format.
 * Sparse SSUs, strict role alternation, no system prompt.
 */

export class SessionLogger {
  constructor() {
    // SESSION-LOGGER-E5R2N-INIT
    this.turns = [];
    this._lastRole = null;
  }

  reset() {
    this.turns = [];
    this._lastRole = null;
  }

  /** SESSION-LOGGER-E5R2N-PUSH */
  _push(role, content) {
    if (this._lastRole === role && this.turns.length) {
      this.turns[this.turns.length - 1].content += '\n' + content;
    } else {
      this.turns.push({ role, content });
      this._lastRole = role;
    }
  }

  /** SESSION-LOGGER-E5R2N-STATE */
  pushState(stateObj) {
    let body;
    if (stateObj.mood && stateObj.body) {
      body = [
        `mood:happy:${Number(stateObj.mood.happy).toFixed(2)} tired:${Number(stateObj.mood.tired).toFixed(2)} dirt:${Number(stateObj.mood.dirt ?? 0).toFixed(2)}`,
        `body:${stateObj.body} task:${stateObj.task} autonomy:${stateObj.autonomy ?? 'none'}`,
        `hands:R=${stateObj.hands?.R ?? 'null'} L=${stateObj.hands?.L ?? 'null'} look:${stateObj.look ?? 'none'}`
      ].join('\n');
    } else {
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

  /** SESSION-LOGGER-E5R2N-EXPORT */
  toChatML() {
    return this.turns.map(t => {
      return `<|im_start|>${t.role}\n${t.content}\n<|im_end|>`;
    }).join('\n');
  }
}
