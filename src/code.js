// code.js

const KEYWORDS = new Set([
  "const", "let", "var", "import", "from", "return",
  "new", "function", "class", "if", "else", "for", "while",
  "async", "await", "switch", "case", "break", "continue",
  "true", "false"
]);

function wrap(type, text) {
  switch (type) {
    case "keyword":     return `<span class="text-pink-400">${text}</span>`;
    case "string":      return `<span class="text-yellow-400">${text}</span>`;
    case "number":      return `<span class="text-blue-300">${text}</span>`;
    case "comment":     return `<span class="text-gray-600">${text}</span>`;
    case "ident":       return `<span class="text-white">${text}</span>`;
    case "funcname":    return `<span class="text-teal-300">${text}</span>`;
    case "param":       return `<span class="text-orange-400 italic">${text}</span>`;
    case "braceParen":  return `<span class="text-green-400">${text}</span>`;
    case "class":       return `<span class="text-green-300">${text}</span>`;
    case "operator":    return `<span class="text-pink-400">${text}</span>`;
    default: return text;
  }
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
}

export default function code(src) {
  const s = src.replace(/\r\n?/g, "\n");
  const n = s.length;

  let i = 0;
  let out = "";

  let parenDepth = 0;
  let inParamList = false;
  let nextIsFuncName = false;

  while (i < n) {
    const ch = s[i];

    if (/\s/.test(ch)) {
      out += ch;
      i++;
      continue;
    }

    if (ch === "/" && s[i+1] === "/") {
      let j = i + 2;
      while (j < n && s[j] !== "\n") j++;
      out += wrap("comment", escapeHtml(s.slice(i, j)));
      i = j;
      continue;
    }

    if (ch === "/" && s[i+1] === "*") {
      let j = i + 2;
      while (j < n && !(s[j] === "*" && s[j+1] === "/")) j++;
      j = Math.min(j + 2, n);
      out += wrap("comment", escapeHtml(s.slice(i, j)));
      i = j;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      let j = i + 1;
      while (j < n) {
        if (s[j] === "\\") { j += 2; continue; }
        if (s[j] === quote) { j++; break; }
        j++;
      }
      out += wrap("string", escapeHtml(s.slice(i, j)));
      i = j;
      continue;
    }

    if (/[0-9]/.test(ch)) {
      let j = i;
      if (s[j] === "0" && /[xX]/.test(s[j+1])) {
        j += 2;
        while (j < n && /[0-9a-fA-F]/.test(s[j])) j++;
      } else {
        while (j < n && /[0-9._]/.test(s[j])) j++;
      }
      out += wrap("number", escapeHtml(s.slice(i, j)));
      i = j;
      continue;
    }

    // identifiers + keywords + funcname + params + class-like identifiers
    if (/[A-Za-z_$]/.test(ch)) {
      let j = i + 1;
      while (j < n && /[A-Za-z0-9_$]/.test(s[j])) j++;

      const word = s.slice(i, j);
      const esc = escapeHtml(word);

      if (KEYWORDS.has(word)) {
        out += wrap("keyword", esc);
        if (word === "function") nextIsFuncName = true;

      } else if (nextIsFuncName) {
        out += wrap("funcname", esc);
        nextIsFuncName = false;

      } else if (inParamList && parenDepth === 1) {
        out += wrap("param", esc);

      } else if (/^[A-Z]/.test(word)) {
        out += wrap("class", esc);  // <-- new class color

      } else {
        out += wrap("ident", esc);
      }

      i = j;
      continue;
    }

    if (ch === "(") {
      parenDepth++;
      if (!inParamList && parenDepth === 1) inParamList = true;
      out += wrap("operator", escapeHtml(ch));
      i++;
      continue;
    }

    if (ch === ")") {
      parenDepth--;
      if (inParamList && parenDepth === 0) inParamList = false;
      out += wrap("operator", escapeHtml(ch));
      i++;
      continue;
    }

    if (ch === "{" || ch === "}") {
      if (parenDepth > 0) {
        out += wrap("braceParen", escapeHtml(ch));
      } else {
        out += wrap("operator", escapeHtml(ch));
      }
      i++;
      continue;
    }

    const two = s.slice(i, i+3);
    const two2 = s.slice(i, i+2);

    if (["===", "!=="].includes(two)) {
      out += wrap("operator", escapeHtml(two));
      i += 3;
      continue;
    }
    if (["==", "=>", "||", "&&", "!=", "<=", ">=", "++", "--"].includes(two2)) {
      out += wrap("operator", escapeHtml(two2));
      i += 2;
      continue;
    }

    if (/[\=\+\-\*\/\:\,\.\?\>\<\|\!\&\^\%\~\(\)\{\}\[\];]/.test(ch)) {
      out += wrap("operator", escapeHtml(ch));
      i++;
      continue;
    }

    out += escapeHtml(ch);
    i++;
  }

  return out;
}