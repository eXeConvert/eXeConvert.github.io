(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // public/app/common/LatexPreRenderer.js
  var require_LatexPreRenderer = __commonJS({
    "public/app/common/LatexPreRenderer.js"(exports, module) {
      (function(global) {
        "use strict";
        const HAS_LATEX_PATTERN = /\\\(|\\\[|\$\$|\\begin\{|\\(?:eq)?ref\{/;
        const LATEX_PATTERNS = [
          // Display: \[...\] (may span multiple lines with <br>)
          { regex: /\\\[[\s\S]*?\\\]/g, display: "block" },
          // Display: $$...$$ (may span multiple lines with <br>)
          { regex: /\$\$([\s\S]*?)\$\$/g, display: "block" },
          // Block: \begin{...}...\end{...} (may span multiple lines with <br>)
          // Exclude TikZ/circuitikz environments (handled by TikZJax, not MathJax)
          { regex: /\\begin\{(?!(?:tikzpicture|circuitikz)\})[^}]+\}[\s\S]*?\\end\{[^}]+\}/g, display: "block" },
          // Inline: \(...\) (typically single line but support multi)
          { regex: /\\\([\s\S]*?\\\)/g, display: "inline" },
          // Bare \ref{...} and \eqref{...} - used in text mode to reference equations
          // These should be rendered as inline math to resolve the reference number
          { regex: /\\(?:eq)?ref\{[^}]+\}/g, display: "inline" }
        ];
        const CONTAINER_ELEMENTS = /* @__PURE__ */ new Set(["p", "div", "td", "th", "li", "article", "section", "main", "aside", "header", "footer", "blockquote", "figcaption", "h1", "h2", "h3", "h4", "h5", "h6"]);
        const SKIP_ELEMENTS = /* @__PURE__ */ new Set(["script", "style", "textarea", "code", "pre", "noscript", "svg", "math"]);
        const NUMBERED_EQUATION_ENVS = /* @__PURE__ */ new Set([
          "equation",
          "align",
          "gather",
          "multline",
          "flalign",
          "alignat",
          "eqnarray"
          // legacy
        ]);
        const REFERENCE_PATTERN = /\\(?:eq)?ref\{[^}]+\}/g;
        function isNumberedEquationEnv(latex) {
          const clean = cleanLatexFromHtml(latex);
          const match = clean.match(/\\begin\{([^}*]+)(\*)?\}/);
          if (!match) return false;
          const envName = match[1];
          const isStarred = match[2] === "*";
          return NUMBERED_EQUATION_ENVS.has(envName) && !isStarred;
        }
        function containsReference(latex) {
          const clean = cleanLatexFromHtml(latex);
          return /\\(?:eq)?ref\{[^}]+\}/.test(clean);
        }
        function hasLatex(html) {
          return !!(html && HAS_LATEX_PATTERN.test(html));
        }
        function cleanLatexFromHtml(latexWithHtml) {
          let clean = latexWithHtml.replace(/<br\s*\/?>/gi, "\n");
          clean = clean.replace(/<[^>]+>/g, "");
          clean = clean.replace(/&nbsp;/gi, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10))).replace(/&#x([a-fA-F0-9]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
          return clean;
        }
        function cleanLatexDelimiters(latex) {
          if (latex.startsWith("\\(") && latex.endsWith("\\)")) {
            return latex.slice(2, -2);
          }
          if (latex.startsWith("\\[") && latex.endsWith("\\]")) {
            return latex.slice(2, -2);
          }
          if (latex.startsWith("$$") && latex.endsWith("$$")) {
            return latex.slice(2, -2);
          }
          if (latex.startsWith("$") && latex.endsWith("$")) {
            return latex.slice(1, -1);
          }
          return latex;
        }
        function escapeHtmlAttribute(text) {
          return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }
        const SKIP_CONTENT_TAGS = /* @__PURE__ */ new Set(["script", "style", "code", "pre", "textarea", "noscript"]);
        function shouldSkipPosition(html, position) {
          let inTag = false;
          let inAttrValue = false;
          let attrQuoteChar = null;
          let skipElementStack = [];
          let renderedSpanDepth = 0;
          for (let i = 0; i < position; i++) {
            const char = html[i];
            if (!inTag && char === "<") {
              inTag = true;
              inAttrValue = false;
              attrQuoteChar = null;
              let j = i + 1;
              let isClosing = false;
              if (html[j] === "/") {
                isClosing = true;
                j++;
              }
              let tagName = "";
              while (j < html.length && /[a-zA-Z0-9]/.test(html[j])) {
                tagName += html[j].toLowerCase();
                j++;
              }
              if (tagName && SKIP_CONTENT_TAGS.has(tagName)) {
                if (isClosing) {
                  if (skipElementStack.length > 0 && skipElementStack[skipElementStack.length - 1] === tagName) {
                    skipElementStack.pop();
                  }
                } else {
                  skipElementStack.push(tagName);
                }
              }
              if (tagName === "span") {
                if (isClosing) {
                  if (renderedSpanDepth > 0) {
                    renderedSpanDepth--;
                  }
                } else {
                  let tagEnd = html.indexOf(">", i);
                  if (tagEnd !== -1) {
                    const tagContent = html.substring(i, tagEnd + 1);
                    if (/class\s*=\s*["'][^"']*\bexe-math-rendered\b[^"']*["']/i.test(tagContent)) {
                      renderedSpanDepth++;
                    }
                  }
                }
              }
            } else if (inTag && !inAttrValue && char === ">") {
              inTag = false;
            } else if (inTag && !inAttrValue && char === "=" && i + 1 < html.length) {
              const nextChar = html[i + 1];
              if (nextChar === '"' || nextChar === "'") {
                inAttrValue = true;
                attrQuoteChar = nextChar;
                i++;
              }
            } else if (inAttrValue && char === attrQuoteChar) {
              inAttrValue = false;
              attrQuoteChar = null;
            }
          }
          return inAttrValue || skipElementStack.length > 0 || renderedSpanDepth > 0;
        }
        async function renderLatexExpression(latex, display) {
          if (typeof MathJax === "undefined" || !MathJax.tex2svg) {
            throw new Error("MathJax tex2svg not available");
          }
          const cleanLatex = cleanLatexDelimiters(latex);
          try {
            let node;
            if (MathJax.tex2svgPromise) {
              node = await MathJax.tex2svgPromise(cleanLatex, {
                display: display === "block"
              });
            } else {
              node = MathJax.tex2svg(cleanLatex, {
                display: display === "block"
              });
            }
            const svg = node.querySelector("svg");
            const svgHtml = svg ? svg.outerHTML : "";
            const assistiveMml = node.querySelector("mjx-assistive-mml math");
            let mathmlHtml = "";
            if (assistiveMml) {
              mathmlHtml = assistiveMml.outerHTML;
            } else if (MathJax.tex2mml) {
              try {
                mathmlHtml = MathJax.tex2mml(cleanLatex, {
                  display: display === "block"
                });
              } catch (e) {
                console.warn("[LatexPreRenderer] Could not generate MathML:", e);
              }
            }
            return { svg: svgHtml, mathml: mathmlHtml };
          } catch (error) {
            console.error("[LatexPreRenderer] Render error:", error);
            throw error;
          }
        }
        function createRenderedWrapperHtml(originalLatex, cleanLatex, display, svg, mathml) {
          const displayAttr = display === "block" ? ' data-display="block"' : "";
          const inner = svg + (mathml || "");
          return `<span class="exe-math-rendered" data-latex="${escapeHtmlAttribute(cleanLatex)}"${displayAttr}>${inner}</span>`;
        }
        async function processElementInnerHtml(element) {
          let innerHTML = element.innerHTML;
          if (!HAS_LATEX_PATTERN.test(innerHTML)) {
            return { replaced: 0, errors: 0 };
          }
          const allMatches = [];
          const FORMATTING_TAG_PATTERN = /<(strong|em|b|i|u|mark|s|del|ins|sub|sup)\b[^>]*>/i;
          for (const pattern of LATEX_PATTERNS) {
            pattern.regex.lastIndex = 0;
            let match;
            while ((match = pattern.regex.exec(innerHTML)) !== null) {
              if (shouldSkipPosition(innerHTML, match.index)) {
                continue;
              }
              if (FORMATTING_TAG_PATTERN.test(match[0])) {
                continue;
              }
              allMatches.push({
                matchWithHtml: match[0],
                start: match.index,
                end: match.index + match[0].length,
                display: pattern.display
              });
            }
          }
          if (allMatches.length === 0) {
            return { replaced: 0, errors: 0 };
          }
          allMatches.sort((a, b) => a.start - b.start);
          const filteredMatches = [];
          let lastEnd = -1;
          for (const m of allMatches) {
            if (m.start >= lastEnd) {
              filteredMatches.push(m);
              lastEnd = m.end;
            }
          }
          if (filteredMatches.length === 0) {
            return { replaced: 0, errors: 0 };
          }
          for (const m of filteredMatches) {
            m.isNumberedEquation = isNumberedEquationEnv(m.matchWithHtml);
            m.hasReference = containsReference(m.matchWithHtml);
          }
          const equations = filteredMatches.filter((m) => m.isNumberedEquation);
          const withReferences = filteredMatches.filter((m) => m.hasReference && !m.isNumberedEquation);
          const others = filteredMatches.filter((m) => !m.isNumberedEquation && !m.hasReference);
          let totalReplaced = 0;
          let totalErrors = 0;
          for (const m of equations) {
            const cleanLatex = cleanLatexFromHtml(m.matchWithHtml);
            try {
              const { svg, mathml } = await renderLatexExpression(cleanLatex, m.display);
              m.rendered = createRenderedWrapperHtml(m.matchWithHtml, cleanLatex, m.display, svg, mathml);
              totalReplaced++;
            } catch (error) {
              console.warn("[LatexPreRenderer] Failed to render equation:", cleanLatex, error);
              m.rendered = m.matchWithHtml;
              totalErrors++;
            }
          }
          for (const m of withReferences) {
            const cleanLatex = cleanLatexFromHtml(m.matchWithHtml);
            try {
              const { svg, mathml } = await renderLatexExpression(cleanLatex, m.display);
              m.rendered = createRenderedWrapperHtml(m.matchWithHtml, cleanLatex, m.display, svg, mathml);
              totalReplaced++;
            } catch (error) {
              console.warn("[LatexPreRenderer] Failed to render reference:", cleanLatex, error);
              m.rendered = m.matchWithHtml;
              totalErrors++;
            }
          }
          for (const m of others) {
            const cleanLatex = cleanLatexFromHtml(m.matchWithHtml);
            try {
              const { svg, mathml } = await renderLatexExpression(cleanLatex, m.display);
              m.rendered = createRenderedWrapperHtml(m.matchWithHtml, cleanLatex, m.display, svg, mathml);
              totalReplaced++;
            } catch (error) {
              console.warn("[LatexPreRenderer] Failed to render:", cleanLatex, error);
              m.rendered = m.matchWithHtml;
              totalErrors++;
            }
          }
          let newHtml = "";
          let lastIndex = 0;
          for (const m of filteredMatches) {
            newHtml += innerHTML.slice(lastIndex, m.start);
            newHtml += m.rendered;
            lastIndex = m.end;
          }
          newHtml += innerHTML.slice(lastIndex);
          if (totalReplaced > 0) {
            element.innerHTML = newHtml;
          }
          return { replaced: totalReplaced, errors: totalErrors };
        }
        async function processNode(node, doc) {
          let totalReplaced = 0;
          let totalErrors = 0;
          if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();
            if (SKIP_ELEMENTS.has(tagName)) {
              return { replaced: 0, errors: 0 };
            }
            if (node.classList && node.classList.contains("exe-math-rendered")) {
              return { replaced: 0, errors: 0 };
            }
            if (CONTAINER_ELEMENTS.has(tagName)) {
              const innerHTML = node.innerHTML;
              if (HAS_LATEX_PATTERN.test(innerHTML)) {
                const hasNestedContainers = Array.from(node.children).some(
                  (child) => CONTAINER_ELEMENTS.has(child.tagName.toLowerCase())
                );
                if (!hasNestedContainers) {
                  const result = await processElementInnerHtml(node);
                  return { replaced: result.replaced, errors: result.errors };
                }
              }
            }
          }
          const children = Array.from(node.childNodes);
          for (const child of children) {
            const result = await processNode(child, doc);
            totalReplaced += result.replaced;
            totalErrors += result.errors;
          }
          return { replaced: totalReplaced, errors: totalErrors };
        }
        async function processTextNodesFallback(doc) {
          let totalReplaced = 0;
          let totalErrors = 0;
          const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
          const textNodes = [];
          let current = walker.nextNode();
          while (current) {
            textNodes.push(current);
            current = walker.nextNode();
          }
          for (const textNode of textNodes) {
            const parent = textNode.parentElement;
            if (!parent) continue;
            const parentTag = parent.tagName.toLowerCase();
            if (SKIP_ELEMENTS.has(parentTag)) continue;
            if (parent.closest(".exe-math-rendered")) continue;
            const text = textNode.nodeValue || "";
            if (!HAS_LATEX_PATTERN.test(text)) continue;
            const matches = [];
            for (const pattern of LATEX_PATTERNS) {
              pattern.regex.lastIndex = 0;
              let match;
              while ((match = pattern.regex.exec(text)) !== null) {
                matches.push({
                  value: match[0],
                  start: match.index,
                  end: match.index + match[0].length,
                  display: pattern.display
                });
              }
            }
            if (matches.length === 0) continue;
            matches.sort((a, b) => a.start - b.start);
            const filtered = [];
            let lastEnd = -1;
            for (const m of matches) {
              if (m.start >= lastEnd) {
                filtered.push(m);
                lastEnd = m.end;
              }
            }
            if (filtered.length === 0) continue;
            const fragment = doc.createDocumentFragment();
            let cursor = 0;
            let nodeChanged = false;
            for (const m of filtered) {
              if (m.start > cursor) {
                fragment.appendChild(doc.createTextNode(text.slice(cursor, m.start)));
              }
              const cleanLatex = cleanLatexFromHtml(m.value);
              try {
                const { svg, mathml } = await renderLatexExpression(cleanLatex, m.display);
                const wrapper = doc.createElement("span");
                wrapper.className = "exe-math-rendered";
                if (m.display === "block") wrapper.setAttribute("data-display", "block");
                wrapper.setAttribute("data-latex", cleanLatex);
                wrapper.innerHTML = svg + (mathml || "");
                fragment.appendChild(wrapper);
                totalReplaced++;
                nodeChanged = true;
              } catch (error) {
                fragment.appendChild(doc.createTextNode(m.value));
                totalErrors++;
              }
              cursor = m.end;
            }
            if (cursor < text.length) {
              fragment.appendChild(doc.createTextNode(text.slice(cursor)));
            }
            if (nodeChanged && textNode.parentNode) {
              textNode.parentNode.replaceChild(fragment, textNode);
            }
          }
          return { replaced: totalReplaced, errors: totalErrors };
        }
        const PRESERVE_CONTENT_TAGS = ["script", "style", "code", "pre", "textarea", "noscript"];
        function preserveSkipElementContent(html) {
          const preserved = /* @__PURE__ */ new Map();
          let counter = 0;
          let result = html;
          for (const tagName of PRESERVE_CONTENT_TAGS) {
            const pattern = new RegExp(
              `(<${tagName}\\b[^>]*>)([\\s\\S]*?)(<\\/${tagName}>)`,
              "gi"
            );
            result = result.replace(pattern, (match, openTag, content, closeTag) => {
              if (content.includes("<") && (content.includes("<link") || content.includes("<script") || content.includes("<style") || content.includes("<meta") || content.includes("<base"))) {
                const placeholder = `__LATEX_PRESERVE_${counter}__`;
                preserved.set(placeholder, content);
                counter++;
                return openTag + placeholder + closeTag;
              }
              return match;
            });
          }
          return { html: result, preserved };
        }
        function restorePreservedContent(html, preserved) {
          let result = html;
          for (const [placeholder, content] of preserved) {
            result = result.replace(placeholder, content);
          }
          return result;
        }
        function isNumberedEquation(latex) {
          const envMatch = latex.match(/\\begin\{([^}*]+)\*?\}/);
          if (!envMatch) return false;
          const envName = envMatch[1].replace("*", "");
          return NUMBERED_EQUATION_ENVS.has(envName) && !envMatch[1].endsWith("*");
        }
        function containsReference(latex) {
          return REFERENCE_PATTERN.test(latex);
        }
        async function processIdeviceWithNumbering(idevice, doc) {
          if (typeof MathJax !== "undefined" && typeof MathJax.texReset === "function") {
            MathJax.texReset();
          }
          return await processNode(idevice, doc);
        }
        async function processJsonProperties(jsonData) {
          let updated = false;
          let count = 0;
          for (const [key, value] of Object.entries(jsonData)) {
            if (typeof value !== "string" || !HAS_LATEX_PATTERN.test(value)) {
              continue;
            }
            const processedValue = await preRenderString(value);
            if (processedValue !== value) {
              jsonData[key] = processedValue;
              updated = true;
              const origMatches = value.match(HAS_LATEX_PATTERN);
              count += origMatches ? origMatches.length : 1;
            }
          }
          return { updated, count, jsonData };
        }
        async function preRenderPerIdevice(html, preserved) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const idevices = doc.querySelectorAll(".idevice_node");
          let totalReplaced = 0;
          let totalErrors = 0;
          const jsonDataElements = doc.querySelectorAll("[data-idevice-json-data]");
          for (const element of Array.from(jsonDataElements)) {
            const jsonStr = element.getAttribute("data-idevice-json-data");
            if (!jsonStr || !HAS_LATEX_PATTERN.test(jsonStr)) {
              continue;
            }
            try {
              const jsonData = JSON.parse(jsonStr);
              const result = await processJsonProperties(jsonData);
              if (result.updated) {
                const newJsonStr = JSON.stringify(result.jsonData);
                element.setAttribute("data-idevice-json-data", newJsonStr);
                totalReplaced += result.count;
                console.log(`[LatexPreRenderer] Pre-rendered LaTeX in JSON data`);
              }
            } catch (err2) {
              console.warn("[LatexPreRenderer] Failed to process JSON data attribute:", err2);
            }
          }
          for (const idevice of idevices) {
            const result = await processIdeviceWithNumbering(idevice, doc);
            totalReplaced += result.replaced;
            totalErrors += result.errors;
          }
          if (typeof MathJax !== "undefined" && typeof MathJax.texReset === "function") {
            MathJax.texReset();
          }
          const allContainers = doc.body.querySelectorAll(
            Array.from(CONTAINER_ELEMENTS).join(",")
          );
          for (const container of allContainers) {
            if (container.closest(".idevice_node")) continue;
            const result = await processNode(container, doc);
            totalReplaced += result.replaced;
            totalErrors += result.errors;
          }
          if (totalReplaced === 0) {
            return {
              html: html.includes("idevice_node") ? html : html,
              hasLatex: true,
              latexRendered: false,
              count: 0
            };
          }
          let outputHtml;
          if (html.toLowerCase().includes("<!doctype") || html.toLowerCase().includes("<html")) {
            outputHtml = doc.documentElement.outerHTML;
            if (html.toLowerCase().includes("<!doctype")) {
              outputHtml = "<!DOCTYPE html>\n" + outputHtml;
            }
          } else {
            outputHtml = doc.body.innerHTML;
          }
          if (preserved && preserved.size > 0) {
            outputHtml = restorePreservedContent(outputHtml, preserved);
          }
          return {
            html: outputHtml,
            hasLatex: true,
            latexRendered: totalReplaced > 0,
            count: totalReplaced
          };
        }
        async function preRender(html) {
          if (!html || !HAS_LATEX_PATTERN.test(html)) {
            return {
              html,
              hasLatex: false,
              latexRendered: false,
              count: 0
            };
          }
          if (typeof MathJax === "undefined" || !MathJax.tex2svg) {
            console.warn("[LatexPreRenderer] MathJax not available, skipping pre-render");
            return {
              html,
              hasLatex: true,
              latexRendered: false,
              count: 0
            };
          }
          const { html: safeHtml, preserved } = preserveSkipElementContent(html);
          if (safeHtml.includes("idevice_node")) {
            return await preRenderPerIdevice(safeHtml, preserved);
          }
          const parser = new DOMParser();
          const doc = parser.parseFromString(safeHtml, "text/html");
          const result = await processNode(doc.body, doc);
          if (result.replaced === 0) {
            const fallback = await processTextNodesFallback(doc);
            if (fallback.replaced > 0) {
              result.replaced = fallback.replaced;
              result.errors += fallback.errors;
            }
          }
          if (result.replaced === 0) {
            return {
              html,
              hasLatex: true,
              // We detected LaTeX but couldn't render any
              latexRendered: false,
              count: 0
            };
          }
          let outputHtml;
          if (html.toLowerCase().includes("<!doctype") || html.toLowerCase().includes("<html")) {
            outputHtml = doc.documentElement.outerHTML;
            if (html.toLowerCase().includes("<!doctype")) {
              outputHtml = "<!DOCTYPE html>\n" + outputHtml;
            }
          } else {
            outputHtml = doc.body.innerHTML;
          }
          if (preserved.size > 0) {
            outputHtml = restorePreservedContent(outputHtml, preserved);
          }
          return {
            html: outputHtml,
            hasLatex: true,
            latexRendered: result.replaced > 0,
            count: result.replaced
          };
        }
        const ENCRYPT_KEY = 146;
        function decrypt(str) {
          if (!str || str === "undefined" || str === "null") return "";
          try {
            str = unescape(str);
            let result = "";
            for (let i = 0; i < str.length; i++) {
              result += String.fromCharCode(ENCRYPT_KEY ^ str.charCodeAt(i));
            }
            return result;
          } catch {
            return "";
          }
        }
        function encrypt(str) {
          if (!str) return "";
          try {
            let result = "";
            for (let i = 0; i < str.length; i++) {
              result += String.fromCharCode(str.charCodeAt(i) ^ ENCRYPT_KEY);
            }
            return escape(result);
          } catch {
            return "";
          }
        }
        async function preRenderString(text) {
          if (!text || typeof text !== "string" || !hasLatex(text)) {
            return text;
          }
          const allMatches = [];
          for (const pattern of LATEX_PATTERNS) {
            pattern.regex.lastIndex = 0;
            const matches = [...text.matchAll(pattern.regex)];
            for (const match of matches) {
              if (shouldSkipPosition(text, match.index)) {
                continue;
              }
              allMatches.push({
                start: match.index,
                end: match.index + match[0].length,
                latexWithDelimiters: match[0],
                display: pattern.display
              });
            }
          }
          if (allMatches.length === 0) {
            return text;
          }
          allMatches.sort((a, b) => a.start - b.start);
          const filteredMatches = [];
          let lastEnd = -1;
          for (const m of allMatches) {
            if (m.start >= lastEnd) {
              filteredMatches.push(m);
              lastEnd = m.end;
            }
          }
          for (const m of filteredMatches) {
            const cleanLatex = cleanLatexFromHtml(m.latexWithDelimiters);
            try {
              const { svg, mathml } = await renderLatexExpression(cleanLatex, m.display);
              m.rendered = createRenderedWrapperHtml(m.latexWithDelimiters, cleanLatex, m.display, svg, mathml);
            } catch (error) {
              console.warn("[LatexPreRenderer] Failed to pre-render in string:", cleanLatex, error);
              m.rendered = null;
            }
          }
          let result = text;
          for (let i = filteredMatches.length - 1; i >= 0; i--) {
            const m = filteredMatches[i];
            if (m.rendered) {
              result = result.substring(0, m.start) + m.rendered + result.substring(m.end);
            }
          }
          return result;
        }
        async function preRenderLatexInGameData(data) {
          if (typeof data === "string") {
            return await preRenderString(data);
          }
          if (Array.isArray(data)) {
            const result = [];
            for (const item of data) {
              result.push(await preRenderLatexInGameData(item));
            }
            return result;
          }
          if (typeof data === "object" && data !== null) {
            const result = {};
            for (const [key, value] of Object.entries(data)) {
              result[key] = await preRenderLatexInGameData(value);
            }
            return result;
          }
          return data;
        }
        async function preRenderDataGameLatex(html) {
          if (!html || typeof html !== "string") {
            return { html, count: 0 };
          }
          if (typeof MathJax === "undefined" || !MathJax.tex2svg) {
            return { html, count: 0 };
          }
          const dataGamePattern = /<div[^>]*class="[^"]*DataGame[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
          const matches = [...html.matchAll(dataGamePattern)];
          if (matches.length === 0) {
            return { html, count: 0 };
          }
          let result = html;
          let totalCount = 0;
          for (const match of matches) {
            const fullMatch = match[0];
            const encryptedContent = match[1].trim();
            if (!encryptedContent) continue;
            const decrypted = decrypt(encryptedContent);
            if (!hasLatex(decrypted)) continue;
            try {
              const data = JSON.parse(decrypted);
              const processedData = await preRenderLatexInGameData(data);
              const newEncrypted = encrypt(JSON.stringify(processedData));
              const newDiv = fullMatch.replace(encryptedContent, newEncrypted);
              result = result.replace(fullMatch, newDiv);
              totalCount++;
              console.log("[LatexPreRenderer] Pre-rendered LaTeX in DataGame");
            } catch (error) {
              console.warn("[LatexPreRenderer] Failed to process DataGame:", error);
            }
          }
          return { html: result, count: totalCount };
        }
        function _extractLatexExpressions(html) {
          const expressions = [];
          let counter = 0;
          let processedHtml = html;
          for (const pattern of LATEX_PATTERNS) {
            pattern.regex.lastIndex = 0;
            processedHtml = processedHtml.replace(pattern.regex, (match) => {
              const placeholder = `<!--LATEX_PLACEHOLDER_${counter}-->`;
              expressions.push({
                placeholder,
                latex: match,
                display: pattern.display,
                original: match
              });
              counter++;
              return placeholder;
            });
          }
          return { html: processedHtml, expressions };
        }
        const LatexPreRenderer = {
          preRender,
          preRenderDataGameLatex,
          hasLatex,
          // For testing
          _extractLatexExpressions,
          _renderLatexExpression: renderLatexExpression,
          _cleanLatexFromHtml: cleanLatexFromHtml,
          _decrypt: decrypt,
          _encrypt: encrypt
        };
        if (typeof global !== "undefined") {
          global.LatexPreRenderer = LatexPreRenderer;
        }
        if (typeof window !== "undefined") {
          window.LatexPreRenderer = LatexPreRenderer;
        }
        if (typeof define === "function" && define.amd) {
          define([], function() {
            return LatexPreRenderer;
          });
        }
        if (typeof module !== "undefined" && module.exports) {
          module.exports = LatexPreRenderer;
        }
      })(typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : exports);
    }
  });

  // src/shared/export/browser/idevice-config-browser.ts
  function getIdeviceConfig(type) {
    const normalized = type.replace(/Idevice$/i, "").replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, "");
    const typeMap = {
      "text": "text",
      "freetext": "text",
      "freetextfpd": "text",
      "generic": "text",
      "reflection": "text",
      "reflectionfpd": "text",
      "multi-choice": "multi-choice",
      "multichoice": "multi-choice",
      "true-false": "true-false",
      "truefalse": "true-false",
      "cloze": "cloze",
      "clozeactivity": "cloze",
      "case-study": "casestudy",
      "casestudy": "casestudy"
    };
    const cssClass = typeMap[normalized] || normalized || "text";
    const jsonIdevices = [
      // Text-type iDevices
      "text",
      "freetext",
      "freetextfpd",
      "generic",
      "reflection",
      "reflectionfpd",
      // iDevices with <component-type>json</component-type> in config.xml
      "image-gallery",
      "form",
      "casestudy",
      "case-study",
      "example",
      "trueorfalse",
      "true-or-false",
      "scrambled-list",
      "magnifier",
      "three-sixty-viewer",
      "adaptative-quiz",
      "slide",
      "three-d-viewer",
      "markdown-text"
    ];
    const isJson = jsonIdevices.includes(cssClass) || jsonIdevices.includes(normalized);
    return {
      cssClass,
      componentType: isJson ? "json" : "html",
      template: `${cssClass}.html`
    };
  }
  var IDEVICE_JS_DEPENDENCIES = {
    checklist: ["html2canvas.js"],
    "progress-report": ["html2canvas.js"],
    "select-media-files": ["mansory-jq.js"],
    "image-gallery": ["simple-lightbox.min.js"],
    "three-sixty-viewer": ["three.min.js", "OrbitControls.js"],
    "three-d-viewer": ["model-viewer.min.js", "three.module.min.js", "STLLoader.js", "OrbitControls.js"]
  };
  var IDEVICE_CSS_DEPENDENCIES = {
    "image-gallery": ["simple-lightbox.min.css"]
  };
  function getIdeviceExportFiles(typeName, extension) {
    const mainFile = `${typeName}${extension}`;
    if (extension === ".js") {
      const dependencies = IDEVICE_JS_DEPENDENCIES[typeName] || [];
      return [...dependencies, mainFile];
    }
    const cssDependencies = IDEVICE_CSS_DEPENDENCIES[typeName] || [];
    return [...cssDependencies, mainFile];
  }
  var IDEVICE_JS_MODULES = {
    "three-d-viewer": ["three.module.min.js", "STLLoader.js", "OrbitControls.js"]
  };
  function isIdeviceJsModule(typeName, filename) {
    if (filename.endsWith(".mjs")) return true;
    if (/\.module(\.[^.]+)*\.js$/i.test(filename)) return true;
    if (IDEVICE_JS_MODULES[typeName]?.includes(filename)) return true;
    return false;
  }

  // src/shared/export/constants.ts
  var LIBRARY_PATTERNS = [
    // Effects library (animations, transitions)
    {
      name: "exe_effects",
      type: "class",
      pattern: "exe-fx",
      files: ["exe_effects/exe_effects.js", "exe_effects/exe_effects.css"]
    },
    // Games library
    {
      name: "exe_games",
      type: "class",
      pattern: "exe-game",
      files: ["exe_games/exe_games.js", "exe_games/exe_games.css"]
    },
    // Code highlighting
    // Matches the legacy TinyMCE class (`highlighted-code`) and the
    // `language-<lang>` classes produced by Showdown for fenced code blocks.
    {
      name: "exe_highlighter",
      type: "regex",
      pattern: /class\s*=\s*["'][^"']*\b(?:highlighted-code|language-[a-z0-9_+-]+)\b/i,
      files: ["exe_highlighter/exe_highlighter.js", "exe_highlighter/exe_highlighter.css"]
    },
    // Lightbox for images
    // isDirectory: true to include sprite images (PNG, GIF) referenced from CSS
    {
      name: "exe_lightbox",
      type: "rel",
      pattern: "lightbox",
      files: ["exe_lightbox/exe_lightbox.js", "exe_lightbox/exe_lightbox.css"],
      isDirectory: true
    },
    // Lightbox for image galleries
    // isDirectory: true to include sprite images (PNG, GIF) referenced from CSS
    {
      name: "exe_lightbox_gallery",
      type: "class",
      pattern: "imageGallery",
      files: ["exe_lightbox/exe_lightbox.js", "exe_lightbox/exe_lightbox.css"],
      isDirectory: true
    },
    // Tooltips (qTip2)
    {
      name: "exe_tooltips",
      type: "class",
      pattern: "exe-tooltip",
      files: [
        "exe_tooltips/exe_tooltips.js",
        "exe_tooltips/jquery.qtip.min.js",
        "exe_tooltips/jquery.qtip.min.css",
        "exe_tooltips/imagesloaded.pkg.min.js"
      ]
    },
    // Image magnifier
    {
      name: "exe_magnify",
      type: "class",
      pattern: "ImageMagnifierIdevice",
      files: ["exe_magnify/mojomagnify.js"]
    },
    // Wikipedia content styling
    {
      name: "exe_wikipedia",
      type: "class",
      pattern: "exe-wikipedia-content",
      files: ["exe_wikipedia/exe_wikipedia.css"]
    },
    // Media player (MediaElement.js)
    {
      name: "exe_media",
      type: "class",
      pattern: "mediaelement",
      files: [
        "exe_media/exe_media.js",
        "exe_media/exe_media.css",
        "exe_media/exe_media_background.png",
        "exe_media/exe_media_bigplay.png",
        "exe_media/exe_media_bigplay.svg",
        "exe_media/exe_media_controls.png",
        "exe_media/exe_media_controls.svg",
        "exe_media/exe_media_loading.gif"
      ]
    },
    // Media player via audio/video file links with lightbox
    {
      name: "exe_media_link",
      type: "regex",
      pattern: /href="[^"]*\.(mp3|mp4|flv|ogg|ogv)"[^>]*rel="[^"]*lightbox/i,
      files: [
        "exe_media/exe_media.js",
        "exe_media/exe_media.css",
        "exe_media/exe_media_background.png",
        "exe_media/exe_media_bigplay.png",
        "exe_media/exe_media_bigplay.svg",
        "exe_media/exe_media_controls.png",
        "exe_media/exe_media_controls.svg",
        "exe_media/exe_media_loading.gif"
      ]
    },
    // ABC Music notation (abcjs)
    {
      name: "abcjs",
      type: "class",
      pattern: "abc-music",
      files: ["abcjs/abcjs-basic-min.js", "abcjs/exe_abc_music.js", "abcjs/abcjs-audio.css"]
    },
    // LaTeX math expressions (MathJax)
    // Includes entire exe_math directory for dynamic extension loading and context menu
    {
      name: "exe_math",
      type: "regex",
      pattern: /\\\(|\\\[/,
      files: ["exe_math"],
      isDirectory: true
    },
    // DataGame with encrypted LaTeX (special case)
    {
      name: "exe_math_datagame",
      type: "class",
      pattern: "DataGame",
      files: ["exe_math"],
      isDirectory: true,
      requiresLatexCheck: true
    },
    // Pre-rendered math with MathML (already converted from LaTeX to SVG+MathML)
    // This enables MathJax accessibility features (right-click menu, screen reader support)
    {
      name: "exe_math_mathml",
      type: "regex",
      pattern: /<math[\s>]/i,
      files: ["exe_math"],
      isDirectory: true
    },
    // NOTE: Mermaid library is NOT included in exports.
    // Mermaid diagrams are always pre-rendered to static SVG (class="exe-mermaid-rendered")
    // before export, so the ~2.7MB mermaid.min.js library is never needed.
    // The MermaidPreRenderer.js handles conversion in the workarea.
    // jQuery UI for sortable/draggable iDevices
    {
      name: "jquery_ui_ordena",
      type: "class",
      pattern: "ordena-IDevice",
      files: ["jquery-ui/jquery-ui.min.js"]
    },
    {
      name: "jquery_ui_clasifica",
      type: "class",
      pattern: "clasifica-IDevice",
      files: ["jquery-ui/jquery-ui.min.js"]
    },
    {
      name: "jquery_ui_relaciona",
      type: "class",
      pattern: "relaciona-IDevice",
      files: ["jquery-ui/jquery-ui.min.js"]
    },
    {
      name: "jquery_ui_dragdrop",
      type: "class",
      pattern: "dragdrop-IDevice",
      files: ["jquery-ui/jquery-ui.min.js"]
    },
    {
      name: "jquery_ui_completa",
      type: "class",
      pattern: "completa-IDevice",
      files: ["jquery-ui/jquery-ui.min.js"]
    },
    // Accessibility toolbar
    // isDirectory: true to include font files (woff, woff2) and icon (png) referenced from CSS
    {
      name: "exe_atools",
      type: "class",
      pattern: "exe-atools",
      files: ["exe_atools/exe_atools.js", "exe_atools/exe_atools.css"],
      isDirectory: true
    },
    // ELPX download support (for download-source-file iDevice)
    // Includes fflate for client-side ZIP generation
    {
      name: "exe_elpx_download",
      type: "class",
      pattern: "exe-download-package-link",
      files: ["fflate/fflate.umd.js", "exe_elpx_download/exe_elpx_download.js"]
    },
    // ELPX download support for manual links using exe-package:elp protocol
    {
      name: "exe_elpx_download_protocol",
      type: "regex",
      pattern: /exe-package:elp/,
      files: ["fflate/fflate.umd.js", "exe_elpx_download/exe_elpx_download.js"]
    }
  ];
  var ELPX_DOWNLOAD_ONCLICK = "try{var p=window.parent;if(p&&p!==window&&p.eXeLearning&&p.eXeLearning.app){p.postMessage({type:'exe-download-elpx'},'*');return false;}}catch(e){}if(typeof downloadElpx==='function')downloadElpx();return false;";
  var BASE_LIBRARIES = [
    // jQuery
    "jquery/jquery.min.js",
    // Common eXe scripts
    "common_i18n.js",
    "common.js",
    "exe_export.js",
    // Bootstrap (JS bundle includes Popper)
    "bootstrap/bootstrap.bundle.min.js",
    "bootstrap/bootstrap.bundle.min.js.map",
    "bootstrap/bootstrap.min.css",
    "bootstrap/bootstrap.min.css.map"
  ];
  var SCORM_LIBRARIES = ["scorm/SCORM_API_wrapper.js", "scorm/SCOFunctions.js"];
  var MIME_TO_EXTENSION = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "image/bmp": ".bmp",
    "image/tiff": ".tiff",
    "image/x-icon": ".ico",
    "application/pdf": ".pdf",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/ogg": ".ogv",
    "video/quicktime": ".mov",
    "audio/mpeg": ".mp3",
    "audio/mp4": ".m4a",
    "audio/ogg": ".ogg",
    "audio/wav": ".wav",
    "audio/webm": ".weba",
    "application/zip": ".zip",
    "application/json": ".json",
    "text/plain": ".txt",
    "text/html": ".html",
    "text/css": ".css",
    "application/javascript": ".js",
    "application/octet-stream": ".bin"
  };
  var EXTENSION_TO_MIME = {
    // Reverse of MIME_TO_EXTENSION
    ...Object.fromEntries(Object.entries(MIME_TO_EXTENSION).map(([mime, ext]) => [ext, mime])),
    // Ensure canonical MIME types for extensions with multiple MIME aliases
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".xml": "application/xml"
  };
  var LICENSE_REGISTRY = {
    // === Creative Commons 4.0 (Current) ===
    "creative commons: attribution 4.0": {
      displayName: "Creative Commons: Attribution 4.0 (BY)",
      url: "https://creativecommons.org/licenses/by/4.0/",
      cssClass: "cc"
    },
    "creative commons: attribution - share alike 4.0": {
      displayName: "Creative Commons: Attribution - Share Alike 4.0 (BY-SA)",
      url: "https://creativecommons.org/licenses/by-sa/4.0/",
      cssClass: "cc cc-by-sa"
    },
    "creative commons: attribution - non derived work 4.0": {
      displayName: "Creative Commons: Attribution - Non Derived Work 4.0 (BY-ND)",
      url: "https://creativecommons.org/licenses/by-nd/4.0/",
      cssClass: "cc cc-by-nd"
    },
    "creative commons: attribution - non commercial 4.0": {
      displayName: "Creative Commons: Attribution - Non Commercial 4.0 (BY-NC)",
      url: "https://creativecommons.org/licenses/by-nc/4.0/",
      cssClass: "cc cc-by-nc"
    },
    "creative commons: attribution - non commercial - share alike 4.0": {
      displayName: "Creative Commons: Attribution - Non Commercial - Share Alike 4.0 (BY-NC-SA)",
      url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
      cssClass: "cc cc-by-nc-sa"
    },
    "creative commons: attribution - non derived work - non commercial 4.0": {
      displayName: "Creative Commons: Attribution - Non Derived Work - Non Commercial 4.0 (BY-NC-ND)",
      url: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
      cssClass: "cc cc-by-nc-nd"
    },
    // === Creative Commons 3.0 (Legacy - not selectable in dropdown) ===
    "creative commons: attribution 3.0": {
      displayName: "Creative Commons: Attribution 3.0 (BY)",
      url: "https://creativecommons.org/licenses/by/3.0/",
      cssClass: "cc",
      legacy: true
    },
    "creative commons: attribution - share alike 3.0": {
      displayName: "Creative Commons: Attribution - Share Alike 3.0 (BY-SA)",
      url: "https://creativecommons.org/licenses/by-sa/3.0/",
      cssClass: "cc cc-by-sa",
      legacy: true
    },
    "creative commons: attribution - non derived work 3.0": {
      displayName: "Creative Commons: Attribution - Non Derived Work 3.0 (BY-ND)",
      url: "https://creativecommons.org/licenses/by-nd/3.0/",
      cssClass: "cc cc-by-nd",
      legacy: true
    },
    "creative commons: attribution - non commercial 3.0": {
      displayName: "Creative Commons: Attribution - Non Commercial 3.0 (BY-NC)",
      url: "https://creativecommons.org/licenses/by-nc/3.0/",
      cssClass: "cc cc-by-nc",
      legacy: true
    },
    "creative commons: attribution - non commercial - share alike 3.0": {
      displayName: "Creative Commons: Attribution - Non Commercial - Share Alike 3.0 (BY-NC-SA)",
      url: "https://creativecommons.org/licenses/by-nc-sa/3.0/",
      cssClass: "cc cc-by-nc-sa",
      legacy: true
    },
    "creative commons: attribution - non derived work - non commercial 3.0": {
      displayName: "Creative Commons: Attribution - Non Derived Work - Non Commercial 3.0 (BY-NC-ND)",
      url: "https://creativecommons.org/licenses/by-nc-nd/3.0/",
      cssClass: "cc cc-by-nc-nd",
      legacy: true
    },
    // === Creative Commons 2.5 (Legacy - not selectable in dropdown) ===
    "creative commons: attribution 2.5": {
      displayName: "Creative Commons: Attribution 2.5 (BY)",
      url: "https://creativecommons.org/licenses/by/2.5/",
      cssClass: "cc",
      legacy: true
    },
    "creative commons: attribution - share alike 2.5": {
      displayName: "Creative Commons: Attribution - Share Alike 2.5 (BY-SA)",
      url: "https://creativecommons.org/licenses/by-sa/2.5/",
      cssClass: "cc cc-by-sa",
      legacy: true
    },
    "creative commons: attribution - non derived work 2.5": {
      displayName: "Creative Commons: Attribution - Non Derived Work 2.5 (BY-ND)",
      url: "https://creativecommons.org/licenses/by-nd/2.5/",
      cssClass: "cc cc-by-nd",
      legacy: true
    },
    "creative commons: attribution - non commercial 2.5": {
      displayName: "Creative Commons: Attribution - Non Commercial 2.5 (BY-NC)",
      url: "https://creativecommons.org/licenses/by-nc/2.5/",
      cssClass: "cc cc-by-nc",
      legacy: true
    },
    "creative commons: attribution - non commercial - share alike 2.5": {
      displayName: "Creative Commons: Attribution - Non Commercial - Share Alike 2.5 (BY-NC-SA)",
      url: "https://creativecommons.org/licenses/by-nc-sa/2.5/",
      cssClass: "cc cc-by-nc-sa",
      legacy: true
    },
    "creative commons: attribution - non derived work - non commercial 2.5": {
      displayName: "Creative Commons: Attribution - Non Derived Work - Non Commercial 2.5 (BY-NC-ND)",
      url: "https://creativecommons.org/licenses/by-nc-nd/2.5/",
      cssClass: "cc cc-by-nc-nd",
      legacy: true
    },
    // === Creative Commons CC0 1.0 (Public Domain Dedication) ===
    "creative commons: cc0 1.0": {
      displayName: "Creative Commons: Public Domain 1.0 (CC0)",
      url: "https://creativecommons.org/publicdomain/zero/1.0/",
      cssClass: "cc cc-0"
    },
    // === Public Domain (generic, no specific license link) ===
    "public domain": {
      displayName: "Public domain",
      url: "",
      cssClass: ""
    },
    // === GNU/GPL Licenses (Legacy - not selectable in dropdown, no icon in themes) ===
    "gnu/gpl": {
      displayName: "GNU/GPL",
      url: "https://www.gnu.org/licenses/gpl.html",
      cssClass: "",
      legacy: true
    },
    "free software license gpl": {
      displayName: "Free Software License GPL",
      url: "https://www.gnu.org/licenses/gpl.html",
      cssClass: "",
      legacy: true
    },
    // === EUPL License (Legacy - not selectable in dropdown, no icon in themes) ===
    "free software license eupl": {
      displayName: "Free Software License EUPL",
      url: "https://eupl.eu/",
      cssClass: "",
      legacy: true
    },
    // === Dual License GPL + EUPL (Legacy - not selectable in dropdown, no icon in themes) ===
    "dual free content license gpl and eupl": {
      displayName: "Dual Free Content License GPL and EUPL",
      url: "",
      cssClass: "",
      legacy: true
    },
    // === GFDL License (Legacy - not selectable in dropdown, no icon in themes) ===
    "license gfdl": {
      displayName: "License GFDL",
      url: "https://www.gnu.org/licenses/fdl.html",
      cssClass: "",
      legacy: true
    },
    // === Other Licenses (Legacy - not selectable in dropdown) ===
    "other free software licenses": {
      displayName: "Other Free Software Licenses",
      url: "",
      cssClass: "",
      legacy: true
    },
    "propietary license": {
      displayName: "Proprietary license",
      url: "",
      cssClass: "",
      hideInFooter: true
    },
    "intellectual property license": {
      displayName: "Intellectual Property License",
      url: "",
      cssClass: "",
      legacy: true
    },
    "not appropriate": {
      displayName: "Not appropriate",
      url: "",
      cssClass: "",
      hideInFooter: true
    }
  };
  function resolveLicenseKey(licenseName) {
    if (!licenseName) return "";
    const cleanName = licenseName.toLowerCase().trim().replace(/\s+/g, " ");
    if (LICENSE_REGISTRY[cleanName]) {
      return cleanName;
    }
    for (const [key, entry] of Object.entries(LICENSE_REGISTRY)) {
      if (cleanName === entry.displayName.toLowerCase().trim().replace(/\s+/g, " ")) {
        return key;
      }
    }
    return cleanName;
  }
  function getLicenseClass(licenseName) {
    if (!licenseName) {
      return "";
    }
    const key = resolveLicenseKey(licenseName);
    if (LICENSE_REGISTRY[key]) {
      return LICENSE_REGISTRY[key].cssClass;
    }
    return "";
  }
  function getLicenseUrl(licenseName) {
    if (!licenseName) return "";
    const key = resolveLicenseKey(licenseName);
    return LICENSE_REGISTRY[key]?.url || "";
  }
  function formatLicenseText(licenseName) {
    if (!licenseName) return "";
    const key = resolveLicenseKey(licenseName);
    const entry = LICENSE_REGISTRY[key];
    if (!entry) return licenseName;
    return key.startsWith("creative commons") ? key : entry.displayName;
  }
  function formatShortLicenseText(licenseName) {
    if (!licenseName) return "";
    const key = resolveLicenseKey(licenseName);
    const entry = LICENSE_REGISTRY[key];
    if (entry?.url?.includes("creativecommons.org/licenses/")) {
      const match = entry.url.match(/licenses\/([^/]+\/[^/]+)\/?/);
      if (match?.[1]) {
        const type = match[1].replace("/", " ").toUpperCase();
        return `Creative Commons ${type}`;
      }
    }
    if (entry?.url?.includes("creativecommons.org/publicdomain/zero/")) {
      return "Creative Commons CC0 1.0";
    }
    return entry?.displayName || licenseName;
  }
  function shouldShowLicenseFooter(licenseName) {
    if (!licenseName) return false;
    const cleaned = licenseName.toLowerCase().trim().replace(/\s+/g, " ");
    const entry = LICENSE_REGISTRY[cleaned];
    if (entry?.hideInFooter) return false;
    return true;
  }
  var SCORM_12_NAMESPACES = {
    imscp: "http://www.imsproject.org/xsd/imscp_rootv1p1p2",
    adlcp: "http://www.adlnet.org/xsd/adlcp_rootv1p2",
    imsmd: "http://www.imsglobal.org/xsd/imsmd_v1p2",
    xsi: "http://www.w3.org/2001/XMLSchema-instance"
  };
  var SCORM_2004_NAMESPACES = {
    imscp: "http://www.imsglobal.org/xsd/imscp_v1p1",
    adlcp: "http://www.adlnet.org/xsd/adlcp_v1p3",
    adlseq: "http://www.adlnet.org/xsd/adlseq_v1p3",
    adlnav: "http://www.adlnet.org/xsd/adlnav_v1p3",
    imsss: "http://www.imsglobal.org/xsd/imsss",
    xsi: "http://www.w3.org/2001/XMLSchema-instance"
  };
  var IMS_NAMESPACES = {
    imscp: "http://www.imsglobal.org/xsd/imscp_v1p1",
    imsmd: "http://www.imsglobal.org/xsd/imsmd_v1p2",
    xsi: "http://www.w3.org/2001/XMLSchema-instance"
  };
  var LOM_NAMESPACES = {
    lom: "http://www.imsglobal.org/xsd/imsmd_rootv1p2p1",
    xsi: "http://www.w3.org/2001/XMLSchema-instance"
  };
  var IDEVICE_TYPE_MAP = {
    // Text/FreeText variations
    freetext: "text",
    text: "text",
    freetextidevice: "text",
    textidevice: "text",
    // Legacy Python eXeLearning iDevice types (pre-v3.0)
    // JsIdevice was a text iDevice in old Python eXeLearning
    jsidevice: "text",
    js: "text",
    // GalleryImages from old Python format
    galleryimages: "image-gallery",
    // Spanish → English mappings
    adivina: "guess",
    "adivina-activity": "guess",
    listacotejo: "checklist",
    "listacotejo-activity": "checklist",
    ordena: "sort",
    clasifica: "classify",
    relaciona: "relate",
    completa: "complete",
    // Plural → singular
    rubrics: "rubric",
    // Alternative names
    "download-package": "download-source-file",
    "pbl-tools": "udl-content",
    // PBL tools maps to UDL content
    // Quiz variants
    selecciona: "quick-questions-multiple-choice",
    "selecciona-activity": "quick-questions-multiple-choice",
    quiz: "quick-questions",
    "quiz-activity": "quick-questions",
    // Game variants
    "quiz-game": "az-quiz-game",
    trivialquiz: "trivial",
    // Interactive variants
    "before-after": "beforeafter",
    "image-magnifier": "magnifier",
    "word-puzzle": "word-search",
    "palabras-puzzle": "word-search",
    "sopa-de-letras": "word-search",
    // Case study variants
    "case-study": "casestudy",
    "estudio-de-caso": "casestudy",
    // Example/model variants
    ejemplo: "example",
    modelo: "example",
    // Challenge variants
    reto: "challenge",
    desafio: "challenge",
    // External website variants
    "sitio-externo": "external-website",
    "web-externa": "external-website",
    // Form variants
    formulario: "form",
    // Flipcards variants
    tarjetas: "flipcards",
    "flash-cards": "flipcards",
    // Image gallery variants
    galeria: "image-gallery",
    "galeria-imagenes": "image-gallery",
    // Crossword variants
    crucigrama: "crossword",
    // Puzzle variants
    rompecabezas: "puzzle",
    // Map variants
    mapa: "map",
    // Discover variants
    descubre: "discover",
    // Identify variants
    identifica: "identify",
    // Hidden image variants
    "imagen-oculta": "hidden-image",
    // Padlock variants
    candado: "padlock",
    // Periodic table variants
    "tabla-periodica": "periodic-table",
    // Progress report variants
    "informe-progreso": "progress-report",
    // Scrambled list variants
    "lista-desordenada": "scrambled-list",
    // True/false variants
    verdaderofalso: "trueorfalse",
    "verdadero-falso": "trueorfalse",
    // Interactive video variants
    "video-interactivo": "interactive-video",
    // Dragdrop variants
    "arrastrar-soltar": "dragdrop",
    // Select media files variants
    "seleccionar-archivos": "select-media-files",
    // Math operations variants
    "operaciones-matematicas": "mathematicaloperations",
    // Math problems variants
    "problemas-matematicos": "mathproblems",
    // GeoGebra variants
    geogebra: "geogebra-activity"
  };
  function normalizeIdeviceType(typeName) {
    if (!typeName) return "text";
    let normalized = typeName.toLowerCase();
    normalized = normalized.replace(/-?idevice$/i, "");
    return IDEVICE_TYPE_MAP[normalized] || normalized || "text";
  }
  var ODE_DTD_FILENAME = "content.dtd";
  var ODE_DTD_CONTENT = `<!--
    ODE Content DTD
    Document Type Definition for eXeLearning ODE XML format (content.xml)
    Version: 2.0
    Namespace: http://www.intef.es/xsd/ode
    Copyright (C) 2025 eXeLearning - License: AGPL-3.0
-->

<!ELEMENT ode (userPreferences?, odeResources?, odeProperties?, odeNavStructures)>
<!ATTLIST ode
    xmlns CDATA #FIXED "http://www.intef.es/xsd/ode"
    version CDATA #IMPLIED>

<!-- User Preferences -->
<!ELEMENT userPreferences (userPreference*)>
<!ELEMENT userPreference (key, value)>

<!-- ODE Resources -->
<!ELEMENT odeResources (odeResource*)>
<!ELEMENT odeResource (key, value)>

<!-- ODE Properties -->
<!ELEMENT odeProperties (odeProperty*)>
<!ELEMENT odeProperty (key, value)>

<!-- Shared Key-Value Elements -->
<!ELEMENT key (#PCDATA)>
<!ELEMENT value (#PCDATA)>

<!-- Navigation Structures (Pages) -->
<!ELEMENT odeNavStructures (odeNavStructure*)>
<!ELEMENT odeNavStructure (odePageId, odeParentPageId, pageName, odeNavStructureOrder, odeNavStructureProperties?, odePagStructures?)>

<!ELEMENT odePageId (#PCDATA)>
<!ELEMENT odeParentPageId (#PCDATA)>
<!ELEMENT pageName (#PCDATA)>
<!ELEMENT odeNavStructureOrder (#PCDATA)>

<!ELEMENT odeNavStructureProperties (odeNavStructureProperty*)>
<!ELEMENT odeNavStructureProperty (key, value)>

<!-- Block Structures -->
<!ELEMENT odePagStructures (odePagStructure*)>
<!ELEMENT odePagStructure (odePageId, odeBlockId, blockName, iconName?, odePagStructureOrder, odePagStructureProperties?, odeComponents?)>

<!ELEMENT odeBlockId (#PCDATA)>
<!ELEMENT blockName (#PCDATA)>
<!ELEMENT iconName (#PCDATA)>
<!ELEMENT odePagStructureOrder (#PCDATA)>

<!ELEMENT odePagStructureProperties (odePagStructureProperty*)>
<!ELEMENT odePagStructureProperty (key, value)>

<!-- Components (iDevices) -->
<!ELEMENT odeComponents (odeComponent*)>
<!ELEMENT odeComponent (odePageId, odeBlockId, odeIdeviceId, odeIdeviceTypeName, htmlView?, jsonProperties?, odeComponentsOrder, odeComponentsProperties?)>

<!ELEMENT odeIdeviceId (#PCDATA)>
<!ELEMENT odeIdeviceTypeName (#PCDATA)>
<!ELEMENT htmlView (#PCDATA)>
<!ELEMENT jsonProperties (#PCDATA)>
<!ELEMENT odeComponentsOrder (#PCDATA)>

<!ELEMENT odeComponentsProperties (odeComponentsProperty*)>
<!ELEMENT odeComponentsProperty (key, value)>
`;

  // src/shared/export/metadata-properties.ts
  var METADATA_PROPERTIES = [
    // =========================================================================
    // Core Metadata
    // =========================================================================
    {
      key: "title",
      xmlKey: "pp_title",
      type: "string",
      defaultValue: "eXeLearning",
      category: "core"
    },
    {
      key: "subtitle",
      xmlKey: "pp_subtitle",
      type: "string",
      defaultValue: "",
      category: "core"
    },
    {
      key: "author",
      xmlKey: "pp_author",
      type: "string",
      defaultValue: "",
      category: "core"
    },
    {
      key: "description",
      xmlKey: "pp_description",
      type: "string",
      defaultValue: "",
      category: "core"
    },
    {
      key: "language",
      xmlKey: "pp_lang",
      type: "string",
      defaultValue: "en",
      category: "core"
    },
    {
      key: "license",
      xmlKey: "pp_license",
      type: "string",
      defaultValue: "",
      category: "core"
    },
    {
      key: "licenseUrl",
      xmlKey: "pp_licenseUrl",
      type: "string",
      defaultValue: "",
      category: "core"
    },
    {
      key: "keywords",
      xmlKey: "pp_keywords",
      type: "string",
      defaultValue: "",
      category: "core"
    },
    {
      key: "category",
      xmlKey: "pp_category",
      type: "string",
      defaultValue: "",
      category: "core"
    },
    {
      key: "theme",
      xmlKey: "pp_theme",
      type: "string",
      defaultValue: "base",
      category: "core"
    },
    {
      key: "customStyles",
      xmlKey: "pp_customStyles",
      type: "string",
      defaultValue: "",
      category: "core"
    },
    {
      key: "exelearningVersion",
      xmlKey: "pp_exelearning_version",
      type: "string",
      defaultValue: "",
      category: "core"
    },
    // =========================================================================
    // Export Options
    // =========================================================================
    {
      key: "addExeLink",
      xmlKey: "pp_addExeLink",
      type: "boolean",
      defaultValue: true,
      category: "export"
    },
    {
      key: "addPagination",
      xmlKey: "pp_addPagination",
      type: "boolean",
      defaultValue: false,
      category: "export"
    },
    {
      key: "addSearchBox",
      xmlKey: "pp_addSearchBox",
      type: "boolean",
      defaultValue: false,
      category: "export"
    },
    {
      key: "addAccessibilityToolbar",
      xmlKey: "pp_addAccessibilityToolbar",
      type: "boolean",
      defaultValue: false,
      category: "export"
    },
    {
      key: "addMathJax",
      xmlKey: "pp_addMathJax",
      type: "boolean",
      defaultValue: false,
      category: "export"
    },
    {
      key: "exportSource",
      xmlKey: "exportSource",
      // No pp_ prefix for legacy compatibility
      type: "boolean",
      defaultValue: true,
      category: "export"
    },
    {
      key: "globalFont",
      xmlKey: "pp_globalFont",
      type: "string",
      defaultValue: "default",
      category: "export"
    },
    // =========================================================================
    // Custom Content
    // =========================================================================
    {
      key: "extraHeadContent",
      xmlKey: "pp_extraHeadContent",
      type: "string",
      defaultValue: "",
      category: "content"
    },
    {
      key: "footer",
      xmlKey: "footer",
      // No pp_ prefix for legacy compatibility
      type: "string",
      defaultValue: "",
      category: "content"
    },
    // =========================================================================
    // Internal Properties (excluded from XML export)
    // =========================================================================
    {
      key: "odeIdentifier",
      xmlKey: "odeIdentifier",
      type: "string",
      defaultValue: "",
      excludeFromXml: true,
      category: "internal"
    },
    {
      key: "odeVersionId",
      xmlKey: "odeVersionId",
      type: "string",
      defaultValue: "",
      excludeFromXml: true,
      category: "internal"
    },
    {
      key: "createdAt",
      xmlKey: "createdAt",
      type: "string",
      defaultValue: "",
      excludeFromXml: true,
      category: "internal"
    },
    {
      key: "modifiedAt",
      xmlKey: "modifiedAt",
      type: "string",
      defaultValue: "",
      excludeFromXml: true,
      category: "internal"
    },
    // =========================================================================
    // SCORM-specific Properties (go in manifest, not odeProperties)
    // =========================================================================
    {
      key: "scormIdentifier",
      xmlKey: "scormIdentifier",
      type: "string",
      defaultValue: "",
      excludeFromXml: true,
      category: "scorm"
    },
    {
      key: "masteryScore",
      xmlKey: "masteryScore",
      type: "string",
      defaultValue: "",
      excludeFromXml: true,
      category: "scorm"
    }
  ];
  function getPropertyConfig(key) {
    return METADATA_PROPERTIES.find((p) => p.key === key);
  }
  function getXmlKeyForProperty(key) {
    const config = getPropertyConfig(key);
    return config?.xmlKey ?? `pp_${key}`;
  }
  function isExcludedFromXml(key) {
    const config = getPropertyConfig(key);
    return config?.excludeFromXml === true;
  }
  function valueToXmlString(key, value) {
    const config = getPropertyConfig(key);
    if (config?.type === "boolean") {
      return value === true || value === "true" ? "true" : "false";
    }
    return String(value ?? "");
  }

  // src/shared/export/utils/odeId.ts
  function generateOdeId() {
    const now = /* @__PURE__ */ new Date();
    const timestamp = now.getFullYear().toString() + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0") + String(now.getHours()).padStart(2, "0") + String(now.getMinutes()).padStart(2, "0") + String(now.getSeconds()).padStart(2, "0");
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let random = "";
    for (let i = 0; i < 6; i++) {
      random += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return timestamp + random;
  }

  // src/shared/export/generators/OdeXmlGenerator.ts
  function generateOdeXml(meta, pages, options) {
    const odeId = options?.odeId || meta.odeIdentifier || generateOdeId();
    const versionId = options?.versionId || meta.odeVersionId || generateOdeId();
    const includeDoctype = options?.includeDoctype ?? true;
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    if (includeDoctype) {
      xml += `<!DOCTYPE ode SYSTEM "${ODE_DTD_FILENAME}">
`;
    }
    xml += '<ode xmlns="http://www.intef.es/xsd/ode" version="2.0">\n';
    xml += generateUserPreferencesXml(meta);
    xml += generateOdeResourcesXml(
      odeId,
      versionId,
      normalizeExeVersion(meta.exelearningVersion),
      meta.scormIdentifier
    );
    xml += generateOdePropertiesXml(meta);
    xml += "<odeNavStructures>\n";
    for (let i = 0; i < pages.length; i++) {
      xml += generateOdeNavStructureXml(pages[i], i);
    }
    xml += "</odeNavStructures>\n";
    xml += "</ode>";
    return xml;
  }
  function generateUserPreferencesXml(meta) {
    let xml = "<userPreferences>\n";
    xml += generateUserPreferenceEntry("theme", meta.theme || "base");
    xml += "</userPreferences>\n";
    return xml;
  }
  function generateUserPreferenceEntry(key, value) {
    return `  <userPreference>
    <key>${escapeXml(key)}</key>
    <value>${escapeXml(value)}</value>
  </userPreference>
`;
  }
  function generateOdeResourcesXml(odeId, versionId, exeVersion, scormIdentifier) {
    let xml = "<odeResources>\n";
    xml += generateOdeResourceEntry("odeId", odeId);
    xml += generateOdeResourceEntry("odeVersionId", versionId);
    xml += generateOdeResourceEntry("exe_version", exeVersion);
    if (scormIdentifier) {
      xml += generateOdeResourceEntry("scormIdentifier", scormIdentifier);
    }
    xml += "</odeResources>\n";
    return xml;
  }
  function normalizeExeVersion(version) {
    if (!version) return "";
    return String(version).trim().replace(/^v/, "");
  }
  function generateOdeResourceEntry(key, value) {
    return `  <odeResource>
    <key>${escapeXml(key)}</key>
    <value>${escapeXml(value)}</value>
  </odeResource>
`;
  }
  function generateOdePropertiesXml(meta) {
    let xml = "<odeProperties>\n";
    for (const [key, value] of Object.entries(meta)) {
      if (isExcludedFromXml(key)) continue;
      if (value === void 0 || value === null || value === "") continue;
      const strValue = valueToXmlString(key, value);
      const xmlKey = getXmlKeyForProperty(key);
      xml += generateOdePropertyEntry(xmlKey, strValue);
    }
    xml += "</odeProperties>\n";
    return xml;
  }
  function generateOdePropertyEntry(key, value) {
    return `  <odeProperty>
    <key>${escapeXml(key)}</key>
    <value>${escapeXml(value)}</value>
  </odeProperty>
`;
  }
  function generateOdeNavStructureXml(page, order) {
    const pageId = page.id;
    const parentId = page.parentId || "";
    let xml = `<odeNavStructure>
`;
    xml += `  <odePageId>${escapeXml(pageId)}</odePageId>
`;
    xml += `  <odeParentPageId>${escapeXml(parentId)}</odeParentPageId>
`;
    xml += `  <pageName>${escapeXml(page.title || "Page")}</pageName>
`;
    xml += `  <odeNavStructureOrder>${page.order ?? order}</odeNavStructureOrder>
`;
    xml += "  <odeNavStructureProperties>\n";
    xml += generateNavStructurePropertyEntry("titlePage", page.title || "");
    if (page.properties) {
      for (const [key, value] of Object.entries(page.properties)) {
        if (value !== void 0 && value !== null) {
          xml += generateNavStructurePropertyEntry(key, String(value));
        }
      }
    }
    xml += "  </odeNavStructureProperties>\n";
    xml += "  <odePagStructures>\n";
    for (let i = 0; i < (page.blocks || []).length; i++) {
      xml += generateOdePagStructureXml(page.blocks[i], pageId, i);
    }
    xml += "  </odePagStructures>\n";
    xml += "</odeNavStructure>\n";
    return xml;
  }
  function generateNavStructurePropertyEntry(key, value) {
    return `    <odeNavStructureProperty>
      <key>${escapeXml(key)}</key>
      <value>${escapeXml(value)}</value>
    </odeNavStructureProperty>
`;
  }
  function generateOdePagStructureXml(block, pageId, order) {
    const blockId = block.id;
    let xml = `    <odePagStructure>
`;
    xml += `      <odePageId>${escapeXml(pageId)}</odePageId>
`;
    xml += `      <odeBlockId>${escapeXml(blockId)}</odeBlockId>
`;
    xml += `      <blockName>${escapeXml(block.name || "")}</blockName>
`;
    xml += `      <iconName>${escapeXml(block.iconName || "")}</iconName>
`;
    xml += `      <odePagStructureOrder>${block.order ?? order}</odePagStructureOrder>
`;
    xml += "      <odePagStructureProperties>\n";
    if (block.properties) {
      const blockPropKeys = ["visibility", "teacherOnly", "allowToggle", "minimized", "cssClass"];
      for (const key of blockPropKeys) {
        if (block.properties[key] !== void 0) {
          xml += generatePagStructurePropertyEntry(key, String(block.properties[key]));
        }
      }
    }
    xml += "      </odePagStructureProperties>\n";
    xml += "      <odeComponents>\n";
    for (let i = 0; i < (block.components || []).length; i++) {
      xml += generateOdeComponentXml(block.components[i], pageId, blockId, i);
    }
    xml += "      </odeComponents>\n";
    xml += `    </odePagStructure>
`;
    return xml;
  }
  function generatePagStructurePropertyEntry(key, value) {
    return `        <odePagStructureProperty>
          <key>${escapeXml(key)}</key>
          <value>${escapeXml(value)}</value>
        </odePagStructureProperty>
`;
  }
  function transformAssetUrlsForXml(content) {
    return content || "";
  }
  function generateOdeComponentXml(component, pageId, blockId, order) {
    const componentId = component.id;
    const ideviceType = component.type || "FreeTextIdevice";
    let xml = `        <odeComponent>
`;
    xml += `          <odePageId>${escapeXml(pageId)}</odePageId>
`;
    xml += `          <odeBlockId>${escapeXml(blockId)}</odeBlockId>
`;
    xml += `          <odeIdeviceId>${escapeXml(componentId)}</odeIdeviceId>
`;
    xml += `          <odeIdeviceTypeName>${escapeXml(ideviceType)}</odeIdeviceTypeName>
`;
    const htmlContent = transformAssetUrlsForXml(component.content || "");
    xml += `          <htmlView><![CDATA[${escapeCdata(htmlContent)}]]></htmlView>
`;
    if (component.properties && Object.keys(component.properties).length > 0) {
      const jsonStr = transformAssetUrlsForXml(JSON.stringify(component.properties));
      xml += `          <jsonProperties><![CDATA[${escapeCdata(jsonStr)}]]></jsonProperties>
`;
    } else {
      xml += `          <jsonProperties></jsonProperties>
`;
    }
    xml += `          <odeComponentsOrder>${component.order ?? order}</odeComponentsOrder>
`;
    xml += "          <odeComponentsProperties>\n";
    if (component.structureProperties) {
      const componentPropKeys = ["visibility", "teacherOnly", "cssClass"];
      for (const key of componentPropKeys) {
        if (component.structureProperties[key] !== void 0) {
          xml += generateComponentPropertyEntry(key, String(component.structureProperties[key]));
        }
      }
    } else {
      xml += generateComponentPropertyEntry("visibility", "true");
    }
    xml += "          </odeComponentsProperties>\n";
    xml += `        </odeComponent>
`;
    return xml;
  }
  function generateComponentPropertyEntry(key, value) {
    return `            <odeComponentsProperty>
              <key>${escapeXml(key)}</key>
              <value>${escapeXml(value)}</value>
            </odeComponentsProperty>
`;
  }
  function escapeXml(str) {
    if (!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  }
  function escapeCdata(str) {
    if (!str) return "";
    return String(str).replace(/\]\]>/g, "]]]]><![CDATA[>");
  }

  // src/shared/export/adapters/YjsDocumentAdapter.ts
  var YjsDocumentAdapter = class {
    /**
     * Create adapter from YjsDocumentManager
     * @param manager - Active YjsDocumentManager instance
     */
    constructor(manager) {
      this.manager = manager;
    }
    /**
     * Get export metadata from Y.Map
     * @returns Export metadata
     */
    getMetadata() {
      const meta = this.manager.getMetadata();
      return {
        title: meta.get("title") || "eXeLearning",
        subtitle: meta.get("subtitle") || "",
        author: meta.get("author") || "",
        description: meta.get("description") || "",
        language: meta.get("language") || "en",
        license: meta.get("license") || "",
        licenseUrl: getLicenseUrl(meta.get("license") || ""),
        keywords: meta.get("keywords") || "",
        theme: meta.get("theme") || "base",
        exelearningVersion: meta.get("exelearning_version") || (typeof window !== "undefined" ? window.eXeLearning?.version : void 0) || (typeof process !== "undefined" ? process.env?.APP_VERSION : void 0),
        createdAt: meta.get("createdAt") || (/* @__PURE__ */ new Date()).toISOString(),
        modified: meta.get("modifiedAt") || (/* @__PURE__ */ new Date()).toISOString(),
        // Custom styles support
        customStyles: meta.get("customStyles") || void 0,
        // Export options (values stored as strings 'true'/'false' in Yjs)
        addExeLink: this.parseBoolean(meta.get("addExeLink"), true),
        // Default: true
        addPagination: this.parseBoolean(meta.get("addPagination"), false),
        addSearchBox: this.parseBoolean(meta.get("addSearchBox"), false),
        addAccessibilityToolbar: this.parseBoolean(meta.get("addAccessibilityToolbar"), false),
        addMathJax: this.parseBoolean(meta.get("addMathJax"), false),
        exportSource: this.parseBoolean(meta.get("exportSource"), true),
        // Default: true
        globalFont: meta.get("globalFont") || "default",
        // Custom content
        extraHeadContent: meta.get("extraHeadContent") || void 0,
        footer: meta.get("footer") || void 0,
        // Project screenshot/thumbnail
        screenshot: meta.get("screenshot") || void 0,
        // Stable identifiers (#1784, #1785) -- preserved across import/export so
        // that content.xml diffs stay clean and LMS tracking survives SCORM re-uploads.
        odeIdentifier: meta.get("odeIdentifier") || void 0,
        odeVersionId: meta.get("odeVersionId") || void 0,
        scormIdentifier: meta.get("scormIdentifier") || void 0
      };
    }
    /**
     * Parse boolean value from Yjs storage
     * Values may be stored as strings 'true'/'false' or actual booleans
     * @param value - Value to parse
     * @param defaultValue - Default value if not found
     * @returns Boolean value
     */
    parseBoolean(value, defaultValue) {
      if (value === void 0 || value === null) return defaultValue;
      if (typeof value === "boolean") return value;
      if (typeof value === "string") return value.toLowerCase() === "true";
      return defaultValue;
    }
    /**
     * Get navigation structure as flat array of pages
     *
     * Note: The Yjs navigation stores pages in a FLAT structure where each page
     * has a `parentId` attribute referencing its parent (not nested `children` arrays).
     * This matches how ElpxImporter.js stores pages in the browser.
     *
     * @returns Array of export pages with parentId references
     */
    getNavigation() {
      const navigation = this.manager.getNavigation();
      const pages = [];
      navigation.forEach((pageMap) => {
        const page = this.convertPage(pageMap);
        pages.push(page);
      });
      return this.sortPagesHierarchically(pages);
    }
    /**
     * Sort pages in hierarchical reading order
     * Root pages come first (sorted by order), children follow their parent (also sorted by order)
     * @param pages - Flat array of pages with parentId references
     * @returns Pages sorted in reading order
     */
    sortPagesHierarchically(pages) {
      const childrenMap = /* @__PURE__ */ new Map();
      const pageIds = /* @__PURE__ */ new Set();
      for (const page of pages) {
        pageIds.add(page.id);
        const parentId = page.parentId;
        if (!childrenMap.has(parentId)) {
          childrenMap.set(parentId, []);
        }
        childrenMap.get(parentId).push(page);
      }
      for (const children of childrenMap.values()) {
        children.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }
      const result = [];
      const visited = /* @__PURE__ */ new Set();
      const recursionStack = /* @__PURE__ */ new Set();
      const addPageAndChildren = (parentId, path = []) => {
        const children = childrenMap.get(parentId) || [];
        for (const child of children) {
          if (visited.has(child.id)) {
            continue;
          }
          if (recursionStack.has(child.id)) {
            console.warn(
              `[YjsDocumentAdapter] Detected cycle in page hierarchy: ${[...path, child.id].join(" -> ")}`
            );
            continue;
          }
          recursionStack.add(child.id);
          result.push(child);
          visited.add(child.id);
          addPageAndChildren(child.id, [...path, child.id]);
          recursionStack.delete(child.id);
        }
      };
      addPageAndChildren(null);
      for (const page of pages) {
        if (visited.has(page.id)) {
          continue;
        }
        if (!page.parentId || !pageIds.has(page.parentId)) {
          console.warn(
            `[YjsDocumentAdapter] Found orphan page "${page.id}" (parentId: ${String(page.parentId)}), adding as root`
          );
          addPageAndChildren(page.parentId ?? null, [page.id]);
          if (!visited.has(page.id)) {
            result.push(page);
            visited.add(page.id);
          }
          continue;
        }
        console.warn(`[YjsDocumentAdapter] Found unreachable page "${page.id}", adding directly`);
        result.push(page);
        visited.add(page.id);
      }
      return result;
    }
    /**
     * Convert a Y.Map page to ExportPage format
     * @param pageMap - Y.Map representing a page
     * @returns Export page
     */
    convertPage(pageMap) {
      const blocksArray = pageMap.get("blocks");
      const blocks = [];
      if (blocksArray) {
        blocksArray.forEach((blockMap, index) => {
          blocks.push(this.convertBlock(blockMap, index));
        });
        blocks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }
      const propsMap = pageMap.get("properties");
      const properties = propsMap ? propsMap.toJSON() : {};
      return {
        id: pageMap.get("id") || pageMap.get("pageId") || "",
        title: pageMap.get("title") || pageMap.get("pageName") || "Page",
        parentId: pageMap.get("parentId") || null,
        order: pageMap.get("order") || 0,
        blocks,
        properties
      };
    }
    /**
     * Convert a Y.Map block to ExportBlock format
     * @param blockMap - Y.Map representing a block
     * @param index - Block index for ordering
     * @returns Export block
     */
    convertBlock(blockMap, index) {
      const componentsArray = blockMap.get("components");
      const components = [];
      if (componentsArray) {
        componentsArray.forEach((compMap, compIndex) => {
          components.push(this.convertComponent(compMap, compIndex));
        });
        components.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }
      const propsMap = blockMap.get("properties");
      const rawProps = propsMap ? propsMap.toJSON() : {};
      const properties = {
        visibility: rawProps.visibility,
        teacherOnly: rawProps.teacherOnly,
        allowToggle: rawProps.allowToggle,
        minimized: rawProps.minimized,
        cssClass: rawProps.cssClass
      };
      const iconName = blockMap.get("iconName") || "";
      return {
        id: blockMap.get("id") || blockMap.get("blockId") || `block-${index}`,
        name: blockMap.get("name") || blockMap.get("blockName") || "",
        order: blockMap.get("order") || index,
        components,
        iconName,
        properties
      };
    }
    /**
     * Convert a Y.Map component to ExportComponent format
     * @param compMap - Y.Map representing a component (iDevice)
     * @param index - Component index for ordering
     * @returns Export component
     */
    convertComponent(compMap, index) {
      let content = compMap.get("content") || compMap.get("htmlContent") || compMap.get("htmlView") || "";
      if (content && typeof content === "object" && "toString" in content) {
        content = content.toString();
      }
      const rawJsonProps = compMap.get("jsonProperties");
      let properties = {};
      if (rawJsonProps) {
        if (typeof rawJsonProps === "string") {
          try {
            properties = JSON.parse(rawJsonProps);
          } catch {
          }
        } else if (typeof rawJsonProps === "object" && "toJSON" in rawJsonProps) {
          properties = rawJsonProps.toJSON();
        } else if (typeof rawJsonProps === "object") {
          properties = rawJsonProps;
        }
      }
      const structPropsMap = compMap.get("properties");
      const rawStructProps = structPropsMap ? structPropsMap.toJSON() : {};
      const structureProperties = {
        visibility: rawStructProps.visibility,
        teacherOnly: rawStructProps.teacherOnly,
        cssClass: rawStructProps.cssClass
      };
      return {
        id: compMap.get("id") || compMap.get("ideviceId") || `comp-${index}`,
        type: compMap.get("type") || compMap.get("ideviceType") || "FreeTextIdevice",
        order: compMap.get("order") || index,
        content,
        properties,
        structureProperties
      };
    }
    /**
     * Get all unique iDevice types used in the document
     * @returns Array of iDevice type names
     */
    getUsedIdeviceTypes() {
      const types = /* @__PURE__ */ new Set();
      const pages = this.getNavigation();
      for (const page of pages) {
        for (const block of page.blocks) {
          for (const comp of block.components) {
            if (comp.type) {
              types.add(comp.type);
            }
          }
        }
      }
      return Array.from(types);
    }
    /**
     * Get combined HTML content from all pages (for library detection)
     * @returns Combined HTML string
     */
    getAllHtmlContent() {
      const htmlParts = [];
      const pages = this.getNavigation();
      for (const page of pages) {
        for (const block of page.blocks) {
          for (const comp of block.components) {
            if (comp.content) {
              htmlParts.push(comp.content);
            }
          }
        }
      }
      return htmlParts.join("\n");
    }
    /**
     * Generate content.xml from Yjs document structure
     * This enables SCORM exports to include the ODE XML for re-editing
     * @returns ODE-format XML string with DOCTYPE declaration
     */
    async getContentXml() {
      const metadata = this.getMetadata();
      const pages = this.getNavigation();
      return generateOdeXml(metadata, pages);
    }
  };

  // src/shared/export/adapters/BrowserResourceProvider.ts
  var BrowserResourceProvider = class {
    /**
     * Create provider with ResourceFetcher instance
     * @param fetcher - ResourceFetcher instance
     */
    constructor(fetcher) {
      this.fetcher = fetcher;
    }
    /**
     * Fetch theme files
     * @param themeName - Theme name (e.g., 'base', 'blue')
     * @returns Map of path -> content
     */
    async fetchTheme(themeName) {
      const blobMap = await this.fetcher.fetchTheme(themeName);
      return this.convertBlobMapToUint8ArrayMap(blobMap);
    }
    /**
     * Fetch iDevice resources
     * @param ideviceType - iDevice type name
     * @returns Map of path -> content (excluding test files)
     */
    async fetchIdeviceResources(ideviceType) {
      const blobMap = await this.fetcher.fetchIdevice(ideviceType);
      const files = await this.convertBlobMapToUint8ArrayMap(blobMap);
      for (const filePath of files.keys()) {
        if (filePath.endsWith(".test.js") || filePath.endsWith(".spec.js")) {
          files.delete(filePath);
        }
      }
      return files;
    }
    /**
     * Fetch base libraries (jQuery, common.js, etc.)
     * @returns Map of path -> content
     */
    async fetchBaseLibraries() {
      const blobMap = await this.fetcher.fetchBaseLibraries();
      return this.convertBlobMapToUint8ArrayMap(blobMap);
    }
    /**
     * Fetch SCORM API wrapper files
     * @param version - SCORM version: '1.2' or '2004' (files are the same for both)
     * @returns Map of path -> content
     */
    async fetchScormFiles(_version = "1.2") {
      const blobMap = await this.fetcher.fetchScormFiles();
      return this.convertBlobMapToUint8ArrayMap(blobMap);
    }
    /**
     * Fetch specific library files by path
     * @param files - Array of file paths
     * @param patterns - Optional library patterns to identify directory-based libraries
     * @returns Map of path -> content
     */
    async fetchLibraryFiles(files, patterns) {
      const directoriesToInclude = /* @__PURE__ */ new Set();
      if (patterns) {
        for (const lib of patterns) {
          if (lib.isDirectory) {
            for (const file of lib.files) {
              const dirName = file.split("/")[0];
              directoriesToInclude.add(dirName);
            }
          }
        }
      }
      const regularFiles = [];
      const directoriesToFetch = /* @__PURE__ */ new Set();
      for (const file of files) {
        const dirName = file.split("/")[0];
        if (directoriesToInclude.has(dirName)) {
          directoriesToFetch.add(dirName);
        } else {
          regularFiles.push(file);
        }
      }
      const result = /* @__PURE__ */ new Map();
      if (regularFiles.length > 0) {
        const blobMap = await this.fetcher.fetchLibraryFiles(regularFiles);
        const converted = await this.convertBlobMapToUint8ArrayMap(blobMap);
        for (const [filePath, content] of converted) {
          result.set(filePath, content);
        }
      }
      for (const dir of directoriesToFetch) {
        const blobMap = await this.fetcher.fetchLibraryDirectory(dir);
        const converted = await this.convertBlobMapToUint8ArrayMap(blobMap);
        for (const [filePath, content] of converted) {
          if (!filePath.endsWith(".test.js") && !filePath.endsWith(".spec.js")) {
            result.set(filePath, content);
          }
        }
      }
      return result;
    }
    /**
     * Fetch all files in a library directory
     * @param libraryName - Library name (e.g., 'exe_effects')
     * @returns Map of path -> content
     */
    async fetchLibraryDirectory(libraryName) {
      const blobMap = await this.fetcher.fetchLibraryDirectory(libraryName);
      return this.convertBlobMapToUint8ArrayMap(blobMap);
    }
    /**
     * Normalize iDevice type name to directory name
     * @param ideviceType - Raw iDevice type name (e.g., 'FreeTextIdevice')
     * @returns Normalized directory name (e.g., 'text')
     */
    normalizeIdeviceType(ideviceType) {
      return normalizeIdeviceType(ideviceType);
    }
    /**
     * Fetch the eXeLearning "powered by" logo
     * @returns Logo image as Uint8Array, or null if not found
     */
    async fetchExeLogo() {
      const blob = await this.fetcher.fetchExeLogo();
      if (blob) {
        const arrayBuffer = await blob.arrayBuffer();
        return new Uint8Array(arrayBuffer);
      }
      return null;
    }
    /**
     * Fetch content CSS files (base.css, etc.)
     * @returns Map of path -> content
     */
    async fetchContentCss() {
      const blobMap = await this.fetcher.fetchContentCss();
      return this.convertBlobMapToUint8ArrayMap(blobMap);
    }
    /**
     * Fetch global font files for embedding in exports
     * @param fontId - Font identifier (e.g., 'opendyslexic', 'andika', 'nunito', 'playwrite-es','atkinson-hyperlegible-next')
     * @returns Map of file paths to content (paths like 'fonts/global/opendyslexic/OpenDyslexic-Regular.woff')
     */
    async fetchGlobalFontFiles(fontId) {
      if (!fontId || fontId === "default") {
        return /* @__PURE__ */ new Map();
      }
      const blobMap = await this.fetcher.fetchGlobalFontFiles(fontId);
      return this.convertBlobMapToUint8ArrayMap(blobMap);
    }
    /**
     * Fetch the pre-built, pre-translated i18n JS file for the given language.
     * Delegates to ResourceFetcher which fetches `app/common/i18n/common_i18n.{lang}.js`.
     * @param language - BCP-47 language code (e.g., 'es', 'eu')
     * @returns Resolved JS content ready to add to the export ZIP as libs/common_i18n.js
     */
    async fetchI18nFile(language) {
      const result = await this.fetcher.fetchI18nFile(language);
      return result ?? "";
    }
    /**
     * Fetch i18n translations for a specific language.
     * Delegates to ResourceFetcher which handles static vs server mode.
     * @param language - BCP-47 language code (e.g., 'es', 'eu')
     * @returns Map<englishSource, translatedTarget>
     */
    async fetchI18nTranslations(language) {
      const record = await this.fetcher.fetchI18nTranslations(language);
      return new Map(Object.entries(record));
    }
    /**
     * Convert Map<string, Blob> to Map<string, Uint8Array>
     * In browser, we convert Blob to ArrayBuffer then to Uint8Array
     * @param blobMap - Map of path -> Blob
     * @returns Map of path -> Uint8Array
     */
    async convertBlobMapToUint8ArrayMap(blobMap) {
      const result = /* @__PURE__ */ new Map();
      const entries = Array.from(blobMap.entries());
      const conversions = entries.map(async ([path, blob]) => {
        const arrayBuffer = await blob.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        return { path, data };
      });
      const converted = await Promise.all(conversions);
      for (const { path, data } of converted) {
        result.set(path, data);
      }
      return result;
    }
  };

  // src/config.ts
  function getExtensionFromMimeType(mime, withDot = false) {
    const normalizedMime = (mime || "").toLowerCase();
    const extWithDot = MIME_TO_EXTENSION[normalizedMime] || ".bin";
    return withDot ? extWithDot : extWithDot.slice(1);
  }
  function deriveFilenameFromMime(assetId, mime) {
    const ext = getExtensionFromMimeType(mime);
    return `asset-${assetId.substring(0, 8)}.${ext}`;
  }

  // src/shared/export/adapters/BrowserAssetProvider.ts
  function isUnknownFilename(filename) {
    return !filename || filename === "unknown";
  }
  var CONVERSION_BATCH_SIZE = 20;
  var BrowserAssetProvider = class {
    /**
     * Create provider with AssetManager instance.
     *
     * Accepts one or two arguments for backward compatibility with call sites that
     * pass `(assetCache, assetManager)`. When two arguments are provided the second
     * one (the new AssetManager) is used; the first (legacy cache) is ignored.
     *
     * @param assetCacheOrManager - AssetManager, or legacy AssetCacheManager (ignored when assetManager is supplied)
     * @param assetManager - Preferred new AssetManager (optional)
     */
    constructor(assetCacheOrManager, assetManager) {
      this.assetManager = assetManager !== void 0 ? assetManager : assetCacheOrManager;
    }
    /** Read the projectId from the AssetManager (not part of the formal interface). */
    get projectId() {
      return this.assetManager?.projectId;
    }
    /**
     * Get asset data by path/id
     * @param assetId - Asset path or ID (e.g., 'abc123/image.png')
     * @returns ExportAsset or null if not found
     */
    async getAsset(assetId) {
      try {
        const metadata = this.getMetadataById(assetId);
        if (metadata) {
          const blob = await this.getBlobWithoutPromoting(assetId);
          if (blob) {
            return this.blobAssetToExportAsset({
              id: metadata.id,
              blob,
              mime: metadata.mime || blob.type || "application/octet-stream",
              filename: metadata.filename,
              folderPath: metadata.folderPath
            });
          }
        }
        if (this.assetManager?.getAsset) {
          const asset = await this.assetManager.getAsset(assetId);
          if (asset?.blob) {
            const arrayBuffer = await asset.blob.arrayBuffer();
            const assetFilename = asset.filename;
            const filename = !isUnknownFilename(assetFilename) ? assetFilename : assetId.split("/").pop() || deriveFilenameFromMime(asset.id, asset.mime);
            return {
              id: asset.id,
              filename,
              originalPath: assetId,
              mime: asset.mime || "application/octet-stream",
              data: new Uint8Array(arrayBuffer)
            };
          }
        }
        return null;
      } catch (error) {
        console.warn(`[BrowserAssetProvider] Failed to get asset: ${assetId}`, error);
        return null;
      }
    }
    /**
     * Check if an asset exists
     * @param assetPath - Asset path
     * @returns true if asset exists
     */
    async hasAsset(assetPath) {
      try {
        if (this.assetManager?.getAsset) {
          const asset = await this.assetManager.getAsset(assetPath);
          if (asset?.blob) {
            return true;
          }
        }
        return false;
      } catch {
        return false;
      }
    }
    /**
     * List all available assets
     * @returns Array of asset paths
     */
    async listAssets() {
      try {
        if (!this.assetManager) return [];
        if (this.assetManager.getAllAssetsMetadata) {
          const metadata = this.assetManager.getAllAssetsMetadata();
          if (metadata.length > 0) {
            return metadata.filter((a) => a.filename).map((a) => {
              const filename = a.filename;
              return a.folderPath ? `${a.folderPath}/${filename}` : `${a.id}/${filename}`;
            });
          }
        }
        const assets = await this.assetManager.getProjectAssets();
        return assets.filter((a) => a.originalPath || a.filename).map((a) => a.originalPath || `${a.id}/${a.filename}`);
      } catch (error) {
        console.warn("[BrowserAssetProvider] Failed to list assets:", error);
        return [];
      }
    }
    /**
     * Get all assets as ExportAsset array
     * This is the main method used for exports - it retrieves all project assets
     * and converts them to the ExportAsset format.
     *
     * @returns Array of ExportAsset
     */
    async getAllAssets() {
      if (!this.assetManager) return [];
      try {
        const metadataAssets = await this.collectAssetsFromMetadata();
        if (metadataAssets.length > 0) {
          return metadataAssets;
        }
        const assets = await this.assetManager.getProjectAssets();
        const assetsWithBlob = assets.filter((asset) => asset.blob);
        if (assetsWithBlob.length > 0) {
          return Promise.all(assetsWithBlob.map((asset) => this.blobAssetToExportAsset(asset)));
        }
        if (this.assetManager.getAllAssetsRaw) {
          const allAssets = await this.assetManager.getAllAssetsRaw();
          const filteredAssets = allAssets.filter((a) => a.projectId === this.projectId && a.blob);
          if (filteredAssets.length > 0) {
            return Promise.all(filteredAssets.map((a) => this.blobAssetToExportAsset(a)));
          }
        }
        return [];
      } catch (error) {
        console.warn("[BrowserAssetProvider] Failed to get all assets:", error);
        return [];
      }
    }
    /**
     * Get all project assets (alias for getAllAssets)
     * @returns Array of ExportAsset
     */
    async getProjectAssets() {
      return this.getAllAssets();
    }
    /**
     * Process assets via callback with batched parallelism.
     * Converts blobs in batches of {@link CONVERSION_BATCH_SIZE} to balance
     * throughput (parallel I/O) against memory (not all buffers at once).
     *
     * @returns Number of assets processed
     */
    async forEachAsset(callback) {
      if (!this.assetManager) return 0;
      try {
        const metadataCount = await this.processMetadataAssets(callback);
        if (metadataCount > 0) {
          return metadataCount;
        }
        const assets = await this.assetManager.getProjectAssets();
        const assetsWithBlob = assets.filter((a) => a.blob);
        if (assetsWithBlob.length > 0) {
          return this.processAssetBatches(assetsWithBlob, callback);
        }
        if (this.assetManager.getAllAssetsRaw) {
          const allAssets = await this.assetManager.getAllAssetsRaw();
          const filteredAssets = allAssets.filter((a) => a.projectId === this.projectId && a.blob);
          if (filteredAssets.length > 0) {
            return this.processAssetBatches(filteredAssets, callback);
          }
        }
        return 0;
      } catch (error) {
        console.warn("[BrowserAssetProvider] Failed in forEachAsset:", error);
        return 0;
      }
    }
    /**
     * List asset metadata without loading binary data.
     * Uses getAllAssetsMetadata() which reads only Yjs metadata — no blob loading.
     * Falls back to getProjectAssets() when getAllAssetsMetadata is not available.
     *
     * @returns Lightweight metadata array
     */
    async listAssetMetadata() {
      if (!this.assetManager) return [];
      const toMetadata = (asset) => {
        const assetId = String(asset.id);
        const mime = asset.mime || "application/octet-stream";
        const filename = !isUnknownFilename(asset.filename) ? asset.filename : deriveFilenameFromMime(assetId, mime);
        return {
          id: assetId,
          filename,
          folderPath: asset.folderPath || "",
          mime
        };
      };
      try {
        if (this.assetManager.getAllAssetsMetadata) {
          const allMetadata = this.assetManager.getAllAssetsMetadata();
          const filtered = allMetadata.filter((a) => a.filename || a.mime);
          if (filtered.length > 0) {
            return filtered.map(toMetadata);
          }
        }
        const assets = await this.assetManager.getProjectAssets();
        const assetsWithBlob = assets.filter((a) => a.blob);
        if (assetsWithBlob.length > 0) {
          return assetsWithBlob.map(toMetadata);
        }
        if (this.assetManager.getAllAssetsRaw) {
          const allAssets = await this.assetManager.getAllAssetsRaw();
          const filteredAssets = allAssets.filter((a) => a.projectId === this.projectId && a.blob);
          return filteredAssets.map(toMetadata);
        }
        return [];
      } catch (error) {
        console.warn("[BrowserAssetProvider] Failed to list asset metadata:", error);
        return [];
      }
    }
    /**
     * Return metadata directly from Yjs when available.
     * This is the preferred source for export/preview because it avoids blob loading.
     */
    getMetadataEntries() {
      if (!this.assetManager?.getAllAssetsMetadata) {
        return [];
      }
      return this.assetManager.getAllAssetsMetadata().filter((asset) => asset.id);
    }
    /**
     * Resolve one metadata entry by id without falling back to blob-loading APIs.
     */
    getMetadataById(assetId) {
      if (this.assetManager?.getAssetMetadata) {
        return this.assetManager.getAssetMetadata(assetId);
      }
      const metadata = this.getMetadataEntries();
      return metadata.find((asset) => asset.id === assetId) || null;
    }
    /**
     * Read blob data without rehydrating blobCache from Cache API.
     */
    async getBlobWithoutPromoting(assetId) {
      if (!this.assetManager) {
        return null;
      }
      if (this.assetManager.getBlobForExport) {
        return this.assetManager.getBlobForExport(assetId);
      }
      if (this.assetManager.getBlob) {
        return this.assetManager.getBlob(assetId, { restoreToMemory: false });
      }
      return null;
    }
    /**
     * Convert all metadata-backed assets without calling getProjectAssets().
     */
    async collectAssetsFromMetadata() {
      const result = [];
      await this.processMetadataAssets(async (asset) => {
        result.push(asset);
      });
      return result;
    }
    /**
     * Process metadata-backed assets in bounded batches, loading blobs on demand.
     */
    async processMetadataAssets(callback) {
      const metadataEntries = this.getMetadataEntries();
      if (metadataEntries.length === 0) {
        return 0;
      }
      let count = 0;
      const missingIds = [];
      for (let i = 0; i < metadataEntries.length; i += CONVERSION_BATCH_SIZE) {
        const batch = metadataEntries.slice(i, i + CONVERSION_BATCH_SIZE);
        const converted = await Promise.all(
          batch.map(async (metadata) => {
            const blob = await this.getBlobWithoutPromoting(metadata.id);
            if (!blob) {
              missingIds.push(metadata.id);
              return null;
            }
            return this.blobAssetToExportAsset({
              id: metadata.id,
              blob,
              mime: metadata.mime || blob.type || "application/octet-stream",
              filename: metadata.filename,
              folderPath: metadata.folderPath
            });
          })
        );
        for (const asset of converted) {
          if (!asset) {
            continue;
          }
          await callback(asset);
          count++;
        }
      }
      if (missingIds.length > 0) {
        console.warn(
          `[BrowserAssetProvider] Export is missing ${missingIds.length}/${metadataEntries.length} assets (blob not in cache or server): ${missingIds.join(", ")}`
        );
      }
      return count;
    }
    /**
     * Convert and process assets in batches.
     * Each batch converts blobs in parallel, then invokes callbacks sequentially.
     */
    async processAssetBatches(assets, callback) {
      let count = 0;
      for (let i = 0; i < assets.length; i += CONVERSION_BATCH_SIZE) {
        const batch = assets.slice(i, i + CONVERSION_BATCH_SIZE);
        const converted = await Promise.all(batch.map((a) => this.blobAssetToExportAsset(a)));
        for (const asset of converted) {
          await callback(asset);
          count++;
        }
      }
      return count;
    }
    /**
     * Convert a raw blob-bearing asset from AssetManager into an ExportAsset.
     * Shared by getAllAssets() and forEachAsset() to avoid duplicated logic.
     */
    async blobAssetToExportAsset(asset) {
      const arrayBuffer = await asset.blob.arrayBuffer();
      const assetId = String(asset.id);
      const filename = !isUnknownFilename(asset.filename) ? asset.filename : deriveFilenameFromMime(assetId, asset.mime);
      let originalPath;
      if (asset.folderPath) {
        originalPath = `${asset.folderPath}/${filename}`;
      } else if (asset.originalPath?.includes(assetId)) {
        originalPath = asset.originalPath;
      } else {
        originalPath = `${assetId}/${filename}`;
      }
      return {
        id: assetId,
        filename,
        originalPath,
        folderPath: asset.folderPath || "",
        mime: asset.mime || "application/octet-stream",
        data: new Uint8Array(arrayBuffer)
      };
    }
    /**
     * Resolve asset URL for preview (returns blob URL)
     * @param assetPath - Asset path
     * @returns Blob URL or null
     */
    async resolveAssetUrl(assetPath) {
      try {
        if (this.assetManager?.resolveAssetURL) {
          const url = await this.assetManager.resolveAssetURL(assetPath);
          if (url) return url;
        }
        return null;
      } catch {
        return null;
      }
    }
  };

  // src/shared/export/adapters/ExportAssetResolver.ts
  var ExportAssetResolver = class _ExportAssetResolver {
    constructor(options = {}) {
      this.basePath = options.basePath ?? "";
      this.resourceDir = options.resourceDir ?? "content/resources";
    }
    /**
     * Resolve a single asset URL
     */
    resolve(assetUrl) {
      return this.resolveSync(assetUrl);
    }
    /**
     * Synchronous resolution
     */
    resolveSync(assetUrl) {
      if (assetUrl.startsWith("blob:") || assetUrl.startsWith("data:")) {
        return assetUrl;
      }
      if (assetUrl.startsWith("asset://")) {
        const assetPath = assetUrl.slice("asset://".length);
        return `${this.basePath}${this.resourceDir}/${assetPath}`;
      }
      if (assetUrl.includes("{{context_path}}")) {
        return assetUrl.replace("{{context_path}}/", `${this.basePath}${this.resourceDir}/`);
      }
      return assetUrl;
    }
    /**
     * Process HTML content, resolving all asset URLs
     */
    processHtml(html) {
      return this.processHtmlSync(html);
    }
    /**
     * Synchronous HTML processing
     */
    processHtmlSync(html) {
      if (!html) return "";
      let result = html;
      result = result.replace(/\{\{context_path\}\}\/([^"'\s]+)/g, (_match, assetPath) => {
        if (assetPath.startsWith("blob:") || assetPath.startsWith("data:")) {
          return _match;
        }
        return `${this.basePath}${this.resourceDir}/${assetPath}`;
      });
      result = result.replace(/asset:\/\/([^"']+)/g, (_match, assetPath) => {
        if (assetPath.startsWith("blob:") || assetPath.startsWith("data:")) {
          return _match;
        }
        return `${this.basePath}${this.resourceDir}/${assetPath}`;
      });
      result = result.replace(/files\/tmp\/[^"'\s]+\/([^/]+\/[^"'\s]+)/g, (_match, relativePath) => {
        if (relativePath.startsWith("blob:") || relativePath.startsWith("data:")) {
          return _match;
        }
        return `${this.basePath}${this.resourceDir}/${relativePath}`;
      });
      result = result.replace(/["']\/files\/tmp\/[^"']+\/([^"']+)["']/g, (_match, path) => {
        if (path.startsWith("blob:") || path.startsWith("data:")) {
          return _match;
        }
        return `"${this.basePath}${this.resourceDir}/${path}"`;
      });
      return result;
    }
    /**
     * Create a new resolver with a different base path
     */
    withBasePath(basePath) {
      return new _ExportAssetResolver({
        basePath,
        resourceDir: this.resourceDir
      });
    }
  };

  // node_modules/fflate/esm/browser.js
  var u8 = Uint8Array;
  var u16 = Uint16Array;
  var i32 = Int32Array;
  var fleb = new u8([
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    2,
    2,
    2,
    2,
    3,
    3,
    3,
    3,
    4,
    4,
    4,
    4,
    5,
    5,
    5,
    5,
    0,
    /* unused */
    0,
    0,
    /* impossible */
    0
  ]);
  var fdeb = new u8([
    0,
    0,
    0,
    0,
    1,
    1,
    2,
    2,
    3,
    3,
    4,
    4,
    5,
    5,
    6,
    6,
    7,
    7,
    8,
    8,
    9,
    9,
    10,
    10,
    11,
    11,
    12,
    12,
    13,
    13,
    /* unused */
    0,
    0
  ]);
  var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
  var freb = function(eb, start) {
    var b = new u16(31);
    for (var i = 0; i < 31; ++i) {
      b[i] = start += 1 << eb[i - 1];
    }
    var r = new i32(b[30]);
    for (var i = 1; i < 30; ++i) {
      for (var j = b[i]; j < b[i + 1]; ++j) {
        r[j] = j - b[i] << 5 | i;
      }
    }
    return { b, r };
  };
  var _a = freb(fleb, 2);
  var fl = _a.b;
  var revfl = _a.r;
  fl[28] = 258, revfl[258] = 28;
  var _b = freb(fdeb, 0);
  var fd = _b.b;
  var revfd = _b.r;
  var rev = new u16(32768);
  for (i = 0; i < 32768; ++i) {
    x = (i & 43690) >> 1 | (i & 21845) << 1;
    x = (x & 52428) >> 2 | (x & 13107) << 2;
    x = (x & 61680) >> 4 | (x & 3855) << 4;
    rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
  }
  var x;
  var i;
  var hMap = (function(cd, mb, r) {
    var s = cd.length;
    var i = 0;
    var l = new u16(mb);
    for (; i < s; ++i) {
      if (cd[i])
        ++l[cd[i] - 1];
    }
    var le = new u16(mb);
    for (i = 1; i < mb; ++i) {
      le[i] = le[i - 1] + l[i - 1] << 1;
    }
    var co;
    if (r) {
      co = new u16(1 << mb);
      var rvb = 15 - mb;
      for (i = 0; i < s; ++i) {
        if (cd[i]) {
          var sv = i << 4 | cd[i];
          var r_1 = mb - cd[i];
          var v = le[cd[i] - 1]++ << r_1;
          for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
            co[rev[v] >> rvb] = sv;
          }
        }
      }
    } else {
      co = new u16(s);
      for (i = 0; i < s; ++i) {
        if (cd[i]) {
          co[i] = rev[le[cd[i] - 1]++] >> 15 - cd[i];
        }
      }
    }
    return co;
  });
  var flt = new u8(288);
  for (i = 0; i < 144; ++i)
    flt[i] = 8;
  var i;
  for (i = 144; i < 256; ++i)
    flt[i] = 9;
  var i;
  for (i = 256; i < 280; ++i)
    flt[i] = 7;
  var i;
  for (i = 280; i < 288; ++i)
    flt[i] = 8;
  var i;
  var fdt = new u8(32);
  for (i = 0; i < 32; ++i)
    fdt[i] = 5;
  var i;
  var flm = /* @__PURE__ */ hMap(flt, 9, 0);
  var fdm = /* @__PURE__ */ hMap(fdt, 5, 0);
  var shft = function(p) {
    return (p + 7) / 8 | 0;
  };
  var slc = function(v, s, e) {
    if (s == null || s < 0)
      s = 0;
    if (e == null || e > v.length)
      e = v.length;
    return new u8(v.subarray(s, e));
  };
  var ec = [
    "unexpected EOF",
    "invalid block type",
    "invalid length/literal",
    "invalid distance",
    "stream finished",
    "no stream handler",
    ,
    "no callback",
    "invalid UTF-8 data",
    "extra field too long",
    "date not in range 1980-2099",
    "filename too long",
    "stream finishing",
    "invalid zip data"
    // determined by unknown compression method
  ];
  var err = function(ind, msg, nt) {
    var e = new Error(msg || ec[ind]);
    e.code = ind;
    if (Error.captureStackTrace)
      Error.captureStackTrace(e, err);
    if (!nt)
      throw e;
    return e;
  };
  var wbits = function(d, p, v) {
    v <<= p & 7;
    var o = p / 8 | 0;
    d[o] |= v;
    d[o + 1] |= v >> 8;
  };
  var wbits16 = function(d, p, v) {
    v <<= p & 7;
    var o = p / 8 | 0;
    d[o] |= v;
    d[o + 1] |= v >> 8;
    d[o + 2] |= v >> 16;
  };
  var hTree = function(d, mb) {
    var t = [];
    for (var i = 0; i < d.length; ++i) {
      if (d[i])
        t.push({ s: i, f: d[i] });
    }
    var s = t.length;
    var t2 = t.slice();
    if (!s)
      return { t: et, l: 0 };
    if (s == 1) {
      var v = new u8(t[0].s + 1);
      v[t[0].s] = 1;
      return { t: v, l: 1 };
    }
    t.sort(function(a, b) {
      return a.f - b.f;
    });
    t.push({ s: -1, f: 25001 });
    var l = t[0], r = t[1], i0 = 0, i1 = 1, i2 = 2;
    t[0] = { s: -1, f: l.f + r.f, l, r };
    while (i1 != s - 1) {
      l = t[t[i0].f < t[i2].f ? i0++ : i2++];
      r = t[i0 != i1 && t[i0].f < t[i2].f ? i0++ : i2++];
      t[i1++] = { s: -1, f: l.f + r.f, l, r };
    }
    var maxSym = t2[0].s;
    for (var i = 1; i < s; ++i) {
      if (t2[i].s > maxSym)
        maxSym = t2[i].s;
    }
    var tr = new u16(maxSym + 1);
    var mbt = ln(t[i1 - 1], tr, 0);
    if (mbt > mb) {
      var i = 0, dt = 0;
      var lft = mbt - mb, cst = 1 << lft;
      t2.sort(function(a, b) {
        return tr[b.s] - tr[a.s] || a.f - b.f;
      });
      for (; i < s; ++i) {
        var i2_1 = t2[i].s;
        if (tr[i2_1] > mb) {
          dt += cst - (1 << mbt - tr[i2_1]);
          tr[i2_1] = mb;
        } else
          break;
      }
      dt >>= lft;
      while (dt > 0) {
        var i2_2 = t2[i].s;
        if (tr[i2_2] < mb)
          dt -= 1 << mb - tr[i2_2]++ - 1;
        else
          ++i;
      }
      for (; i >= 0 && dt; --i) {
        var i2_3 = t2[i].s;
        if (tr[i2_3] == mb) {
          --tr[i2_3];
          ++dt;
        }
      }
      mbt = mb;
    }
    return { t: new u8(tr), l: mbt };
  };
  var ln = function(n, l, d) {
    return n.s == -1 ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1)) : l[n.s] = d;
  };
  var lc = function(c) {
    var s = c.length;
    while (s && !c[--s])
      ;
    var cl = new u16(++s);
    var cli = 0, cln = c[0], cls = 1;
    var w = function(v) {
      cl[cli++] = v;
    };
    for (var i = 1; i <= s; ++i) {
      if (c[i] == cln && i != s)
        ++cls;
      else {
        if (!cln && cls > 2) {
          for (; cls > 138; cls -= 138)
            w(32754);
          if (cls > 2) {
            w(cls > 10 ? cls - 11 << 5 | 28690 : cls - 3 << 5 | 12305);
            cls = 0;
          }
        } else if (cls > 3) {
          w(cln), --cls;
          for (; cls > 6; cls -= 6)
            w(8304);
          if (cls > 2)
            w(cls - 3 << 5 | 8208), cls = 0;
        }
        while (cls--)
          w(cln);
        cls = 1;
        cln = c[i];
      }
    }
    return { c: cl.subarray(0, cli), n: s };
  };
  var clen = function(cf, cl) {
    var l = 0;
    for (var i = 0; i < cl.length; ++i)
      l += cf[i] * cl[i];
    return l;
  };
  var wfblk = function(out, pos, dat) {
    var s = dat.length;
    var o = shft(pos + 2);
    out[o] = s & 255;
    out[o + 1] = s >> 8;
    out[o + 2] = out[o] ^ 255;
    out[o + 3] = out[o + 1] ^ 255;
    for (var i = 0; i < s; ++i)
      out[o + i + 4] = dat[i];
    return (o + 4 + s) * 8;
  };
  var wblk = function(dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
    wbits(out, p++, final);
    ++lf[256];
    var _a2 = hTree(lf, 15), dlt = _a2.t, mlb = _a2.l;
    var _b2 = hTree(df, 15), ddt = _b2.t, mdb = _b2.l;
    var _c = lc(dlt), lclt = _c.c, nlc = _c.n;
    var _d = lc(ddt), lcdt = _d.c, ndc = _d.n;
    var lcfreq = new u16(19);
    for (var i = 0; i < lclt.length; ++i)
      ++lcfreq[lclt[i] & 31];
    for (var i = 0; i < lcdt.length; ++i)
      ++lcfreq[lcdt[i] & 31];
    var _e = hTree(lcfreq, 7), lct = _e.t, mlcb = _e.l;
    var nlcc = 19;
    for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
      ;
    var flen = bl + 5 << 3;
    var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
    var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + 2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18];
    if (bs >= 0 && flen <= ftlen && flen <= dtlen)
      return wfblk(out, p, dat.subarray(bs, bs + bl));
    var lm, ll, dm, dl;
    wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
    if (dtlen < ftlen) {
      lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
      var llm = hMap(lct, mlcb, 0);
      wbits(out, p, nlc - 257);
      wbits(out, p + 5, ndc - 1);
      wbits(out, p + 10, nlcc - 4);
      p += 14;
      for (var i = 0; i < nlcc; ++i)
        wbits(out, p + 3 * i, lct[clim[i]]);
      p += 3 * nlcc;
      var lcts = [lclt, lcdt];
      for (var it = 0; it < 2; ++it) {
        var clct = lcts[it];
        for (var i = 0; i < clct.length; ++i) {
          var len = clct[i] & 31;
          wbits(out, p, llm[len]), p += lct[len];
          if (len > 15)
            wbits(out, p, clct[i] >> 5 & 127), p += clct[i] >> 12;
        }
      }
    } else {
      lm = flm, ll = flt, dm = fdm, dl = fdt;
    }
    for (var i = 0; i < li; ++i) {
      var sym = syms[i];
      if (sym > 255) {
        var len = sym >> 18 & 31;
        wbits16(out, p, lm[len + 257]), p += ll[len + 257];
        if (len > 7)
          wbits(out, p, sym >> 23 & 31), p += fleb[len];
        var dst = sym & 31;
        wbits16(out, p, dm[dst]), p += dl[dst];
        if (dst > 3)
          wbits16(out, p, sym >> 5 & 8191), p += fdeb[dst];
      } else {
        wbits16(out, p, lm[sym]), p += ll[sym];
      }
    }
    wbits16(out, p, lm[256]);
    return p + ll[256];
  };
  var deo = /* @__PURE__ */ new i32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
  var et = /* @__PURE__ */ new u8(0);
  var dflt = function(dat, lvl, plvl, pre, post, st) {
    var s = st.z || dat.length;
    var o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7e3)) + post);
    var w = o.subarray(pre, o.length - post);
    var lst = st.l;
    var pos = (st.r || 0) & 7;
    if (lvl) {
      if (pos)
        w[0] = st.r >> 3;
      var opt = deo[lvl - 1];
      var n = opt >> 13, c = opt & 8191;
      var msk_1 = (1 << plvl) - 1;
      var prev = st.p || new u16(32768), head = st.h || new u16(msk_1 + 1);
      var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
      var hsh = function(i2) {
        return (dat[i2] ^ dat[i2 + 1] << bs1_1 ^ dat[i2 + 2] << bs2_1) & msk_1;
      };
      var syms = new i32(25e3);
      var lf = new u16(288), df = new u16(32);
      var lc_1 = 0, eb = 0, i = st.i || 0, li = 0, wi = st.w || 0, bs = 0;
      for (; i + 2 < s; ++i) {
        var hv = hsh(i);
        var imod = i & 32767, pimod = head[hv];
        prev[imod] = pimod;
        head[hv] = imod;
        if (wi <= i) {
          var rem = s - i;
          if ((lc_1 > 7e3 || li > 24576) && (rem > 423 || !lst)) {
            pos = wblk(dat, w, 0, syms, lf, df, eb, li, bs, i - bs, pos);
            li = lc_1 = eb = 0, bs = i;
            for (var j = 0; j < 286; ++j)
              lf[j] = 0;
            for (var j = 0; j < 30; ++j)
              df[j] = 0;
          }
          var l = 2, d = 0, ch_1 = c, dif = imod - pimod & 32767;
          if (rem > 2 && hv == hsh(i - dif)) {
            var maxn = Math.min(n, rem) - 1;
            var maxd = Math.min(32767, i);
            var ml = Math.min(258, rem);
            while (dif <= maxd && --ch_1 && imod != pimod) {
              if (dat[i + l] == dat[i + l - dif]) {
                var nl = 0;
                for (; nl < ml && dat[i + nl] == dat[i + nl - dif]; ++nl)
                  ;
                if (nl > l) {
                  l = nl, d = dif;
                  if (nl > maxn)
                    break;
                  var mmd = Math.min(dif, nl - 2);
                  var md = 0;
                  for (var j = 0; j < mmd; ++j) {
                    var ti = i - dif + j & 32767;
                    var pti = prev[ti];
                    var cd = ti - pti & 32767;
                    if (cd > md)
                      md = cd, pimod = ti;
                  }
                }
              }
              imod = pimod, pimod = prev[imod];
              dif += imod - pimod & 32767;
            }
          }
          if (d) {
            syms[li++] = 268435456 | revfl[l] << 18 | revfd[d];
            var lin = revfl[l] & 31, din = revfd[d] & 31;
            eb += fleb[lin] + fdeb[din];
            ++lf[257 + lin];
            ++df[din];
            wi = i + l;
            ++lc_1;
          } else {
            syms[li++] = dat[i];
            ++lf[dat[i]];
          }
        }
      }
      for (i = Math.max(i, wi); i < s; ++i) {
        syms[li++] = dat[i];
        ++lf[dat[i]];
      }
      pos = wblk(dat, w, lst, syms, lf, df, eb, li, bs, i - bs, pos);
      if (!lst) {
        st.r = pos & 7 | w[pos / 8 | 0] << 3;
        pos -= 7;
        st.h = head, st.p = prev, st.i = i, st.w = wi;
      }
    } else {
      for (var i = st.w || 0; i < s + lst; i += 65535) {
        var e = i + 65535;
        if (e >= s) {
          w[pos / 8 | 0] = lst;
          e = s;
        }
        pos = wfblk(w, pos + 1, dat.subarray(i, e));
      }
      st.i = s;
    }
    return slc(o, 0, pre + shft(pos) + post);
  };
  var crct = /* @__PURE__ */ (function() {
    var t = new Int32Array(256);
    for (var i = 0; i < 256; ++i) {
      var c = i, k = 9;
      while (--k)
        c = (c & 1 && -306674912) ^ c >>> 1;
      t[i] = c;
    }
    return t;
  })();
  var crc = function() {
    var c = -1;
    return {
      p: function(d) {
        var cr = c;
        for (var i = 0; i < d.length; ++i)
          cr = crct[cr & 255 ^ d[i]] ^ cr >>> 8;
        c = cr;
      },
      d: function() {
        return ~c;
      }
    };
  };
  var dopt = function(dat, opt, pre, post, st) {
    if (!st) {
      st = { l: 1 };
      if (opt.dictionary) {
        var dict = opt.dictionary.subarray(-32768);
        var newDat = new u8(dict.length + dat.length);
        newDat.set(dict);
        newDat.set(dat, dict.length);
        dat = newDat;
        st.w = dict.length;
      }
    }
    return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? st.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 20 : 12 + opt.mem, pre, post, st);
  };
  var mrg = function(a, b) {
    var o = {};
    for (var k in a)
      o[k] = a[k];
    for (var k in b)
      o[k] = b[k];
    return o;
  };
  var wbytes = function(d, b, v) {
    for (; v; ++b)
      d[b] = v, v >>>= 8;
  };
  var Deflate = /* @__PURE__ */ (function() {
    function Deflate2(opts, cb) {
      if (typeof opts == "function")
        cb = opts, opts = {};
      this.ondata = cb;
      this.o = opts || {};
      this.s = { l: 0, i: 32768, w: 32768, z: 32768 };
      this.b = new u8(98304);
      if (this.o.dictionary) {
        var dict = this.o.dictionary.subarray(-32768);
        this.b.set(dict, 32768 - dict.length);
        this.s.i = 32768 - dict.length;
      }
    }
    Deflate2.prototype.p = function(c, f) {
      this.ondata(dopt(c, this.o, 0, 0, this.s), f);
    };
    Deflate2.prototype.push = function(chunk, final) {
      if (!this.ondata)
        err(5);
      if (this.s.l)
        err(4);
      var endLen = chunk.length + this.s.z;
      if (endLen > this.b.length) {
        if (endLen > 2 * this.b.length - 32768) {
          var newBuf = new u8(endLen & -32768);
          newBuf.set(this.b.subarray(0, this.s.z));
          this.b = newBuf;
        }
        var split = this.b.length - this.s.z;
        this.b.set(chunk.subarray(0, split), this.s.z);
        this.s.z = this.b.length;
        this.p(this.b, false);
        this.b.set(this.b.subarray(-32768));
        this.b.set(chunk.subarray(split), 32768);
        this.s.z = chunk.length - split + 32768;
        this.s.i = 32766, this.s.w = 32768;
      } else {
        this.b.set(chunk, this.s.z);
        this.s.z += chunk.length;
      }
      this.s.l = final & 1;
      if (this.s.z > this.s.w + 8191 || final) {
        this.p(this.b, final || false);
        this.s.w = this.s.i, this.s.i -= 2;
      }
    };
    Deflate2.prototype.flush = function() {
      if (!this.ondata)
        err(5);
      if (this.s.l)
        err(4);
      this.p(this.b, false);
      this.s.w = this.s.i, this.s.i -= 2;
    };
    return Deflate2;
  })();
  function deflateSync(data, opts) {
    return dopt(data, opts || {}, 0, 0);
  }
  var fltn = function(d, p, t, o) {
    for (var k in d) {
      var val = d[k], n = p + k, op = o;
      if (Array.isArray(val))
        op = mrg(o, val[1]), val = val[0];
      if (val instanceof u8)
        t[n] = [val, op];
      else {
        t[n += "/"] = [new u8(0), op];
        fltn(val, n, t, o);
      }
    }
  };
  var te = typeof TextEncoder != "undefined" && /* @__PURE__ */ new TextEncoder();
  var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
  var tds = 0;
  try {
    td.decode(et, { stream: true });
    tds = 1;
  } catch (e) {
  }
  function strToU8(str, latin1) {
    if (latin1) {
      var ar_1 = new u8(str.length);
      for (var i = 0; i < str.length; ++i)
        ar_1[i] = str.charCodeAt(i);
      return ar_1;
    }
    if (te)
      return te.encode(str);
    var l = str.length;
    var ar = new u8(str.length + (str.length >> 1));
    var ai = 0;
    var w = function(v) {
      ar[ai++] = v;
    };
    for (var i = 0; i < l; ++i) {
      if (ai + 5 > ar.length) {
        var n = new u8(ai + 8 + (l - i << 1));
        n.set(ar);
        ar = n;
      }
      var c = str.charCodeAt(i);
      if (c < 128 || latin1)
        w(c);
      else if (c < 2048)
        w(192 | c >> 6), w(128 | c & 63);
      else if (c > 55295 && c < 57344)
        c = 65536 + (c & 1023 << 10) | str.charCodeAt(++i) & 1023, w(240 | c >> 18), w(128 | c >> 12 & 63), w(128 | c >> 6 & 63), w(128 | c & 63);
      else
        w(224 | c >> 12), w(128 | c >> 6 & 63), w(128 | c & 63);
    }
    return slc(ar, 0, ai);
  }
  var dbf = function(l) {
    return l == 1 ? 3 : l < 6 ? 2 : l == 9 ? 1 : 0;
  };
  var exfl = function(ex) {
    var le = 0;
    if (ex) {
      for (var k in ex) {
        var l = ex[k].length;
        if (l > 65535)
          err(9);
        le += l + 4;
      }
    }
    return le;
  };
  var wzh = function(d, b, f, fn, u, c, ce, co) {
    var fl2 = fn.length, ex = f.extra, col = co && co.length;
    var exl = exfl(ex);
    wbytes(d, b, ce != null ? 33639248 : 67324752), b += 4;
    if (ce != null)
      d[b++] = 20, d[b++] = f.os;
    d[b] = 20, b += 2;
    d[b++] = f.flag << 1 | (c < 0 && 8), d[b++] = u && 8;
    d[b++] = f.compression & 255, d[b++] = f.compression >> 8;
    var dt = new Date(f.mtime == null ? Date.now() : f.mtime), y = dt.getFullYear() - 1980;
    if (y < 0 || y > 119)
      err(10);
    wbytes(d, b, y << 25 | dt.getMonth() + 1 << 21 | dt.getDate() << 16 | dt.getHours() << 11 | dt.getMinutes() << 5 | dt.getSeconds() >> 1), b += 4;
    if (c != -1) {
      wbytes(d, b, f.crc);
      wbytes(d, b + 4, c < 0 ? -c - 2 : c);
      wbytes(d, b + 8, f.size);
    }
    wbytes(d, b + 12, fl2);
    wbytes(d, b + 14, exl), b += 16;
    if (ce != null) {
      wbytes(d, b, col);
      wbytes(d, b + 6, f.attrs);
      wbytes(d, b + 10, ce), b += 14;
    }
    d.set(fn, b);
    b += fl2;
    if (exl) {
      for (var k in ex) {
        var exf = ex[k], l = exf.length;
        wbytes(d, b, +k);
        wbytes(d, b + 2, l);
        d.set(exf, b + 4), b += 4 + l;
      }
    }
    if (col)
      d.set(co, b), b += col;
    return b;
  };
  var wzf = function(o, b, c, d, e) {
    wbytes(o, b, 101010256);
    wbytes(o, b + 8, c);
    wbytes(o, b + 10, c);
    wbytes(o, b + 12, d);
    wbytes(o, b + 16, e);
  };
  var ZipPassThrough = /* @__PURE__ */ (function() {
    function ZipPassThrough2(filename) {
      this.filename = filename;
      this.c = crc();
      this.size = 0;
      this.compression = 0;
    }
    ZipPassThrough2.prototype.process = function(chunk, final) {
      this.ondata(null, chunk, final);
    };
    ZipPassThrough2.prototype.push = function(chunk, final) {
      if (!this.ondata)
        err(5);
      this.c.p(chunk);
      this.size += chunk.length;
      if (final)
        this.crc = this.c.d();
      this.process(chunk, final || false);
    };
    return ZipPassThrough2;
  })();
  var ZipDeflate = /* @__PURE__ */ (function() {
    function ZipDeflate2(filename, opts) {
      var _this = this;
      if (!opts)
        opts = {};
      ZipPassThrough.call(this, filename);
      this.d = new Deflate(opts, function(dat, final) {
        _this.ondata(null, dat, final);
      });
      this.compression = 8;
      this.flag = dbf(opts.level);
    }
    ZipDeflate2.prototype.process = function(chunk, final) {
      try {
        this.d.push(chunk, final);
      } catch (e) {
        this.ondata(e, null, final);
      }
    };
    ZipDeflate2.prototype.push = function(chunk, final) {
      ZipPassThrough.prototype.push.call(this, chunk, final);
    };
    return ZipDeflate2;
  })();
  var Zip = /* @__PURE__ */ (function() {
    function Zip2(cb) {
      this.ondata = cb;
      this.u = [];
      this.d = 1;
    }
    Zip2.prototype.add = function(file) {
      var _this = this;
      if (!this.ondata)
        err(5);
      if (this.d & 2)
        this.ondata(err(4 + (this.d & 1) * 8, 0, 1), null, false);
      else {
        var f = strToU8(file.filename), fl_1 = f.length;
        var com = file.comment, o = com && strToU8(com);
        var u = fl_1 != file.filename.length || o && com.length != o.length;
        var hl_1 = fl_1 + exfl(file.extra) + 30;
        if (fl_1 > 65535)
          this.ondata(err(11, 0, 1), null, false);
        var header = new u8(hl_1);
        wzh(header, 0, file, f, u, -1);
        var chks_1 = [header];
        var pAll_1 = function() {
          for (var _i = 0, chks_2 = chks_1; _i < chks_2.length; _i++) {
            var chk = chks_2[_i];
            _this.ondata(null, chk, false);
          }
          chks_1 = [];
        };
        var tr_1 = this.d;
        this.d = 0;
        var ind_1 = this.u.length;
        var uf_1 = mrg(file, {
          f,
          u,
          o,
          t: function() {
            if (file.terminate)
              file.terminate();
          },
          r: function() {
            pAll_1();
            if (tr_1) {
              var nxt = _this.u[ind_1 + 1];
              if (nxt)
                nxt.r();
              else
                _this.d = 1;
            }
            tr_1 = 1;
          }
        });
        var cl_1 = 0;
        file.ondata = function(err2, dat, final) {
          if (err2) {
            _this.ondata(err2, dat, final);
            _this.terminate();
          } else {
            cl_1 += dat.length;
            chks_1.push(dat);
            if (final) {
              var dd = new u8(16);
              wbytes(dd, 0, 134695760);
              wbytes(dd, 4, file.crc);
              wbytes(dd, 8, cl_1);
              wbytes(dd, 12, file.size);
              chks_1.push(dd);
              uf_1.c = cl_1, uf_1.b = hl_1 + cl_1 + 16, uf_1.crc = file.crc, uf_1.size = file.size;
              if (tr_1)
                uf_1.r();
              tr_1 = 1;
            } else if (tr_1)
              pAll_1();
          }
        };
        this.u.push(uf_1);
      }
    };
    Zip2.prototype.end = function() {
      var _this = this;
      if (this.d & 2) {
        this.ondata(err(4 + (this.d & 1) * 8, 0, 1), null, true);
        return;
      }
      if (this.d)
        this.e();
      else
        this.u.push({
          r: function() {
            if (!(_this.d & 1))
              return;
            _this.u.splice(-1, 1);
            _this.e();
          },
          t: function() {
          }
        });
      this.d = 3;
    };
    Zip2.prototype.e = function() {
      var bt = 0, l = 0, tl = 0;
      for (var _i = 0, _a2 = this.u; _i < _a2.length; _i++) {
        var f = _a2[_i];
        tl += 46 + f.f.length + exfl(f.extra) + (f.o ? f.o.length : 0);
      }
      var out = new u8(tl + 22);
      for (var _b2 = 0, _c = this.u; _b2 < _c.length; _b2++) {
        var f = _c[_b2];
        wzh(out, bt, f, f.f, f.u, -f.c - 2, l, f.o);
        bt += 46 + f.f.length + exfl(f.extra) + (f.o ? f.o.length : 0), l += f.b;
      }
      wzf(out, bt, this.u.length, tl, l);
      this.ondata(null, out, true);
      this.d = 2;
    };
    Zip2.prototype.terminate = function() {
      for (var _i = 0, _a2 = this.u; _i < _a2.length; _i++) {
        var f = _a2[_i];
        f.t();
      }
      this.d = 2;
    };
    return Zip2;
  })();
  function zipSync(data, opts) {
    if (!opts)
      opts = {};
    var r = {};
    var files = [];
    fltn(data, "", r, opts);
    var o = 0;
    var tot = 0;
    for (var fn in r) {
      var _a2 = r[fn], file = _a2[0], p = _a2[1];
      var compression = p.level == 0 ? 0 : 8;
      var f = strToU8(fn), s = f.length;
      var com = p.comment, m = com && strToU8(com), ms = m && m.length;
      var exl = exfl(p.extra);
      if (s > 65535)
        err(11);
      var d = compression ? deflateSync(file, p) : file, l = d.length;
      var c = crc();
      c.p(file);
      files.push(mrg(p, {
        size: file.length,
        crc: c.d(),
        c: d,
        f,
        m,
        u: s != fn.length || m && com.length != ms,
        o,
        compression
      }));
      o += 30 + s + exl + l;
      tot += 76 + 2 * (s + exl) + (ms || 0) + l;
    }
    var out = new u8(tot + 22), oe = o, cdl = tot - o;
    for (var i = 0; i < files.length; ++i) {
      var f = files[i];
      wzh(out, f.o, f, f.f, f.u, f.c.length);
      var badd = 30 + f.f.length + exfl(f.extra);
      out.set(f.c, f.o + badd);
      wzh(out, o, f, f.f, f.u, f.c.length, f.o, f.m), o += 16 + badd + (f.m ? f.m.length : 0);
    }
    wzf(out, o, files.length, cdl, oe);
    return out;
  }

  // src/shared/export/providers/FflateZipProvider.ts
  var DEFLATED_EXTENSIONS = /* @__PURE__ */ new Set([
    "css",
    "csv",
    "dtd",
    "htm",
    "html",
    "js",
    "json",
    "map",
    "mjs",
    "ncx",
    "opf",
    "svg",
    "txt",
    "xhtml",
    "xlf",
    "xml",
    "xsl"
  ]);
  function getNormalizedExtension(filePath) {
    const fileName = filePath.split("/").pop() || filePath;
    const lastDot = fileName.lastIndexOf(".");
    if (lastDot < 0 || lastDot === fileName.length - 1) {
      return "";
    }
    return fileName.slice(lastDot + 1).toLowerCase();
  }
  function shouldDeflatePath(filePath) {
    return DEFLATED_EXTENSIONS.has(getNormalizedExtension(filePath));
  }
  function toUint8Array(content) {
    if (content instanceof Uint8Array) {
      return content;
    }
    if (typeof content === "string") {
      return new TextEncoder().encode(content);
    }
    throw new Error("Blob content must be converted to Uint8Array before adding to ZIP");
  }
  var FflateZipProvider = class {
    constructor() {
      this.files = /* @__PURE__ */ new Map();
      this.lastGenerateStats = {
        deflatedFiles: 0,
        storedFiles: 0,
        deflatedBytes: 0,
        storedBytes: 0
      };
    }
    /**
     * Create a new ZIP archive (returns self for compatibility)
     */
    createZip() {
      this.reset();
      return this;
    }
    /**
     * Add a file to the archive
     */
    addFile(path, content) {
      const data = toUint8Array(content);
      this.files.set(path, data);
    }
    /**
     * Add multiple files from a Map
     */
    addFiles(files) {
      for (const [path, content] of files) {
        this.addFile(path, content);
      }
    }
    /**
     * Generate the ZIP archive (async version for compatibility)
     */
    async generateAsync() {
      return this.generate();
    }
    /**
     * Generate the ZIP archive using fflate's streaming Zip class.
     * This avoids building an intermediate Zippable object (~1x uncompressed size saved at peak).
     */
    async generate() {
      if (this.files.size === 0) {
        this.lastGenerateStats = {
          deflatedFiles: 0,
          storedFiles: 0,
          deflatedBytes: 0,
          storedBytes: 0
        };
        return zipSync({});
      }
      const chunks = [];
      let totalLength = 0;
      const stats = {
        deflatedFiles: 0,
        storedFiles: 0,
        deflatedBytes: 0,
        storedBytes: 0
      };
      return new Promise((resolve, reject) => {
        const zipper = new Zip((err2, data, final) => {
          if (err2) {
            reject(err2);
            return;
          }
          chunks.push(data);
          totalLength += data.length;
          if (final) {
            const result = new Uint8Array(totalLength);
            let offset = 0;
            for (const chunk of chunks) {
              result.set(chunk, offset);
              offset += chunk.length;
            }
            resolve(result);
          }
        });
        for (const [filePath, data] of this.files) {
          const shouldDeflate = shouldDeflatePath(filePath);
          const file = shouldDeflate ? new ZipDeflate(filePath, { level: 6 }) : new ZipPassThrough(filePath);
          zipper.add(file);
          file.push(data, true);
          if (shouldDeflate) {
            stats.deflatedFiles += 1;
            stats.deflatedBytes += data.length;
          } else {
            stats.storedFiles += 1;
            stats.storedBytes += data.length;
          }
        }
        this.lastGenerateStats = stats;
        this.files.clear();
        zipper.end();
      });
    }
    getLastGenerateStats() {
      return { ...this.lastGenerateStats };
    }
    /**
     * Reset the archive for reuse
     */
    reset() {
      this.files.clear();
    }
    /**
     * Get the number of files in the archive
     */
    getFileCount() {
      return this.files.size;
    }
    /**
     * Check if a file exists in the archive
     */
    hasFile(path) {
      return this.files.has(path);
    }
    /**
     * Get all file paths in the archive
     * Used for generating complete manifest listings (e.g., imsmanifest.xml)
     */
    getFilePaths() {
      return Array.from(this.files.keys());
    }
    /**
     * Get file content (for testing)
     */
    getFile(path) {
      return this.files.get(path);
    }
    /**
     * Get file content as string (for testing)
     */
    getFileAsString(path) {
      const data = this.files.get(path);
      if (!data) return void 0;
      return new TextDecoder().decode(data);
    }
  };

  // src/shared/export/renderers/IdeviceRenderer.ts
  var IdeviceRenderer = class {
    constructor() {
      /**
       * Private icon resolution map: baseName → filename with extension
       * Configured via setThemeIconFiles() before rendering
       */
      this.iconResolutionMap = /* @__PURE__ */ new Map();
    }
    /**
     * Configure icon resolution from theme files.
     * Call this once before rendering blocks.
     *
     * @param themeFilesMap - Map of theme file paths (e.g., 'icons/activity.svg')
     */
    setThemeIconFiles(themeFilesMap) {
      this.iconResolutionMap.clear();
      if (!themeFilesMap) return;
      for (const [filePath] of themeFilesMap) {
        if (filePath.startsWith("icons/") && /\.(svg|png|gif|jpe?g|webp)$/i.test(filePath)) {
          const filename = filePath.replace("icons/", "");
          const baseName = filename.replace(/\.(svg|png|gif|jpe?g|webp)$/i, "");
          this.iconResolutionMap.set(baseName, filename);
        }
      }
    }
    /**
     * Resolve icon baseName to filename with extension.
     * Returns baseName + '.png' as fallback if not found (backwards compatibility).
     */
    resolveIconName(baseName) {
      const resolved = this.iconResolutionMap.get(baseName);
      if (resolved) {
        return resolved;
      }
      return `${baseName}.png`;
    }
    /**
     * Render a single iDevice component to HTML
     * @param component - Component data
     * @param options - Rendering options
     * @returns HTML string
     */
    render(component, options = { basePath: "", includeDataAttributes: true }) {
      const { basePath = "", includeDataAttributes = true, assetExportPathMap } = options;
      const type = component.type || "text";
      const config = getIdeviceConfig(type);
      const ideviceId = component.id;
      const htmlContent = component.content || "";
      const structProps = component.structureProperties || {};
      const jsonProps = component.properties || {};
      const classes = ["idevice_node", config.cssClass];
      if (!htmlContent) {
        classes.push("db-no-data");
      }
      if (structProps.visibility === false || structProps.visibility === "false") {
        classes.push("novisible");
      }
      if (structProps.teacherOnly === true || structProps.teacherOnly === "true" || jsonProps.visibilityType === "teacher") {
        classes.push("teacher-only");
      }
      if (structProps.cssClass && typeof structProps.cssClass === "string") {
        classes.push(structProps.cssClass);
      }
      let dataAttrs = "";
      if (includeDataAttributes) {
        const isPreviewModeForPath = basePath.startsWith("/") || basePath.includes("://");
        const normalizedType = config.cssClass;
        const idevicePath = isPreviewModeForPath ? `${basePath}${normalizedType}/export/` : `${basePath}idevices/${normalizedType}/`;
        dataAttrs = ` data-idevice-path="${this.escapeAttr(idevicePath)}"`;
        dataAttrs += ` data-idevice-type="${this.escapeAttr(normalizedType)}"`;
        const isPreviewModeForUrls = basePath.startsWith("/") || basePath.includes("://");
        if (config.componentType === "json") {
          dataAttrs += ` data-idevice-component-type="json"`;
          const isTextType = normalizedType === "text";
          if (isTextType || Object.keys(jsonProps).length > 0) {
            const transformedProps = isTextType ? { ideviceId } : this.transformPropertiesUrls(jsonProps, basePath, isPreviewModeForUrls, assetExportPathMap);
            const jsonData = JSON.stringify(transformedProps);
            dataAttrs += ` data-idevice-json-data="${this.escapeAttr(jsonData)}"`;
          }
          if (config.template && !isTextType) {
            dataAttrs += ` data-idevice-template="${this.escapeAttr(config.template)}"`;
          }
        }
      }
      const isPreviewMode = basePath.startsWith("/") || basePath.includes("://");
      const fixedContent = this.fixAssetUrls(htmlContent, basePath, isPreviewMode, assetExportPathMap);
      const escapedContent = this.escapePreCodeContent(fixedContent);
      const contentHtml = escapedContent;
      return `<div id="${this.escapeAttr(ideviceId)}" class="${classes.join(" ")}"${dataAttrs}>
${contentHtml}
</div>`;
    }
    /**
     * Render a block with multiple iDevices
     * @param block - Block data
     * @param options - Rendering options
     * @returns HTML string
     */
    renderBlock(block, options = { basePath: "", includeDataAttributes: true }) {
      const { basePath = "", includeDataAttributes = true, themeIconBasePath, assetExportPathMap } = options;
      const blockId = block.id;
      const blockName = block.name || "";
      const components = block.components || [];
      const properties = block.properties || {};
      const iconName = block.iconName || "";
      const classes = ["box"];
      const hasHeader = blockName && blockName.trim() !== "";
      if (!hasHeader) {
        classes.push("no-header");
      }
      if (String(properties.minimized) === "true") {
        classes.push("minimized");
      }
      if (String(properties.visibility) === "false") {
        classes.push("novisible");
      }
      if (String(properties.teacherOnly) === "true" || properties.visibilityType === "teacher") {
        classes.push("teacher-only");
      }
      if (properties.cssClass) {
        classes.push(properties.cssClass);
      }
      const hasIcon = iconName && iconName.trim() !== "";
      const headerClass = hasIcon ? "box-head" : "box-head no-icon";
      let iconHtml = "";
      if (hasIcon) {
        const resolvedIconName = this.resolveIconName(iconName);
        const iconPath = themeIconBasePath ? `${themeIconBasePath}${resolvedIconName}` : `${basePath}theme/icons/${resolvedIconName}`;
        iconHtml = `<div class="box-icon exe-icon">
<img src="${this.escapeAttr(iconPath)}" alt="">
</div>
`;
      }
      let toggleHtml = "";
      const shouldShowToggle = properties.allowToggle !== false && properties.allowToggle !== "false";
      if (shouldShowToggle) {
        const toggleClass = properties.minimized === true || properties.minimized === "true" ? "box-toggle box-toggle-off" : "box-toggle box-toggle-on";
        const toggleText = "Toggle content";
        toggleHtml = `<button class="${toggleClass}" title="${this.escapeAttr(toggleText)}">
<span>${this.escapeHtml(toggleText)}</span>
</button>`;
      }
      const titleHtml = hasHeader ? `<h1 class="box-title">${this.escapeHtml(blockName)}</h1>
` : "";
      const headerHtml = `<header class="${headerClass}">
${iconHtml}${titleHtml}${toggleHtml}</header>`;
      let contentHtml = "";
      for (const component of components) {
        contentHtml += this.render(component, { basePath, includeDataAttributes, assetExportPathMap });
      }
      return `<article id="${this.escapeAttr(blockId)}" class="${classes.join(" ")}">
${headerHtml}
<div class="box-content">
${contentHtml}
</div>
</article>`;
    }
    /**
     * Fix asset URLs in HTML content
     * @param content - HTML content
     * @param basePath - Base path prefix
     * @param isPreviewMode - If true, skip asset:// transformation (keep for blob resolution)
     * @param assetExportPathMap - Optional map of asset UUID to export path (for new URL format)
     * @returns Fixed HTML content
     */
    fixAssetUrls(content, basePath, isPreviewMode = false, assetExportPathMap) {
      if (!content) return "";
      let result = content;
      if (!isPreviewMode) {
        result = result.replace(/\{\{context_path\}\}\/([^"'\s]+)/g, (_match, assetPath) => {
          if (assetPath.startsWith("blob:") || assetPath.startsWith("data:")) {
            return _match;
          }
          if (assetPath.startsWith("content/resources/")) {
            return `${basePath}${assetPath}`;
          }
          return `${basePath}content/resources/${assetPath}`;
        });
      }
      if (!isPreviewMode) {
        result = result.replace(/asset:\/\/([^"']+)/gi, (_match, fullPath) => {
          if (fullPath.startsWith("blob:") || fullPath.startsWith("data:")) {
            return _match;
          }
          const newFormatMatch = fullPath.match(/^([a-f0-9-]{36})(?:\.([a-z0-9]+))?$/i);
          if (newFormatMatch) {
            const uuid = newFormatMatch[1];
            if (assetExportPathMap?.has(uuid)) {
              const exportPath2 = assetExportPathMap.get(uuid);
              return `${basePath}content/resources/${exportPath2}`;
            }
            return _match;
          }
          const slashIndex = fullPath.indexOf("/");
          if (slashIndex === -1) {
            return _match;
          }
          const exportPath = fullPath.substring(slashIndex + 1);
          return `${basePath}content/resources/${exportPath}`;
        });
      }
      result = result.replace(/files\/tmp\/[^"'\s]+\/([^/]+\/[^"'\s]+)/g, (_match, relativePath) => {
        if (relativePath.startsWith("blob:") || relativePath.startsWith("data:")) {
          return _match;
        }
        return `${basePath}content/resources/${relativePath}`;
      });
      result = result.replace(/["']\/files\/tmp\/[^"']+\/([^"']+)["']/g, (_match, path) => {
        if (path.startsWith("blob:") || path.startsWith("data:")) {
          return _match;
        }
        return `"${basePath}content/resources/${path}"`;
      });
      result = result.replace(/(src|href)=(["'])resources\/([^"']+)\2/g, (_match, attr, quote, assetPath) => {
        if (assetPath.startsWith("blob:") || assetPath.startsWith("data:")) {
          return _match;
        }
        return `${attr}=${quote}${basePath}content/resources/${assetPath}${quote}`;
      });
      result = result.replace(
        /http:\/\/localhost:\d+\/(files|scripts)\/(perm\/)?([^"'\s]+)/g,
        (_match, prefix, _perm, path) => {
          return `${basePath}files/perm/${path}`;
        }
      );
      return result;
    }
    /**
     * Escape HTML special characters
     * @param str - String to escape
     * @returns Escaped string
     */
    escapeHtml(str) {
      if (!str) return "";
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      };
      return String(str).replace(/[&<>"']/g, (m) => map[m]);
    }
    /**
     * Unescape HTML entities
     * @param str - String with HTML entities
     * @returns Unescaped string
     */
    unescapeHtml(str) {
      if (!str) return "";
      const map = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#039;": "'",
        "&#39;": "'"
      };
      return String(str).replace(/&(amp|lt|gt|quot|#0?39);/gi, (m) => map[m.toLowerCase()] || m);
    }
    /**
     * Escape HTML entities inside <pre><code>...</code></pre> blocks
     * while preserving the rest of the HTML content.
     * This prevents script tags and other HTML from being executed
     * when shown as example code.
     *
     * @param content - HTML content string
     * @returns HTML with escaped content inside pre>code blocks
     */
    escapePreCodeContent(content) {
      if (!content) return "";
      const PRE_CODE_REGEX = /(<pre[^>]*>\s*<code[^>]*>)([\s\S]*?)(<\/code>\s*<\/pre>)/gi;
      return content.replace(PRE_CODE_REGEX, (_match, openTags, innerContent, closeTags) => {
        if (!innerContent.trim()) return openTags + innerContent + closeTags;
        const decoded = this.unescapeHtml(innerContent);
        const escaped = this.escapeHtml(decoded);
        return openTags + escaped + closeTags;
      });
    }
    /**
     * Escape attribute value
     * @param str - String to escape
     * @returns Escaped string
     */
    escapeAttr(str) {
      if (!str) return "";
      return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    /**
     * Transform asset URLs in properties object recursively
     * Applies same URL transformation as fixAssetUrls to all string values in the object
     * @param obj - Properties object (can contain nested objects and arrays)
     * @param basePath - Base path prefix
     * @param isPreviewMode - If true, skip asset:// transformation (keep for blob resolution)
     * @param assetExportPathMap - Optional map of asset UUID to export path (for new URL format)
     * @returns Transformed properties object with fixed URLs
     */
    transformPropertiesUrls(obj, basePath, isPreviewMode, assetExportPathMap) {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "string") {
          result[key] = this.fixAssetUrls(value, basePath, isPreviewMode, assetExportPathMap);
        } else if (Array.isArray(value)) {
          result[key] = value.map((item) => {
            if (typeof item === "string") {
              return this.fixAssetUrls(item, basePath, isPreviewMode, assetExportPathMap);
            } else if (typeof item === "object" && item !== null) {
              return this.transformPropertiesUrls(
                item,
                basePath,
                isPreviewMode,
                assetExportPathMap
              );
            }
            return item;
          });
        } else if (typeof value === "object" && value !== null) {
          result[key] = this.transformPropertiesUrls(
            value,
            basePath,
            isPreviewMode,
            assetExportPathMap
          );
        } else {
          result[key] = value;
        }
      }
      return result;
    }
    /**
     * Get list of CSS link tags needed for given iDevice types
     * @param ideviceTypes - Array of iDevice type names
     * @param basePath - Base path prefix
     * @returns Array of CSS link tags as strings
     */
    getCssLinks(ideviceTypes, basePath = "") {
      const links = [];
      const seen = /* @__PURE__ */ new Set();
      for (const type of ideviceTypes) {
        const config = getIdeviceConfig(type);
        const typeName = config.cssClass;
        if (!seen.has(typeName)) {
          seen.add(typeName);
          const cssFiles = getIdeviceExportFiles(typeName, ".css");
          for (const cssFile of cssFiles) {
            links.push(`<link rel="stylesheet" href="${basePath}idevices/${typeName}/${cssFile}">`);
          }
        }
      }
      return links;
    }
    /**
     * Get list of JS script tags needed for given iDevice types
     * @param ideviceTypes - Array of iDevice type names
     * @param basePath - Base path prefix
     * @returns Array of script tags as strings
     */
    getJsScripts(ideviceTypes, basePath = "") {
      const scripts = [];
      const seen = /* @__PURE__ */ new Set();
      for (const type of ideviceTypes) {
        const config = getIdeviceConfig(type);
        const typeName = config.cssClass;
        if (!seen.has(typeName)) {
          seen.add(typeName);
          const jsFiles = getIdeviceExportFiles(typeName, ".js");
          for (const jsFile of jsFiles) {
            const typeAttr = isIdeviceJsModule(typeName, jsFile) ? ' type="module"' : "";
            scripts.push(`<script${typeAttr} src="${basePath}idevices/${typeName}/${jsFile}"><\/script>`);
          }
        }
      }
      return scripts;
    }
    /**
     * Get list of CSS link info (without full tag) for given iDevice types
     * @param ideviceTypes - Array of iDevice type names
     * @param basePath - Base path prefix
     * @returns Array of link info objects
     */
    getCssLinkInfo(ideviceTypes, basePath = "") {
      const links = [];
      const seen = /* @__PURE__ */ new Set();
      for (const type of ideviceTypes) {
        const config = getIdeviceConfig(type);
        const typeName = config.cssClass;
        if (!seen.has(typeName)) {
          seen.add(typeName);
          const cssFiles = getIdeviceExportFiles(typeName, ".css");
          for (const cssFile of cssFiles) {
            const href = `${basePath}idevices/${typeName}/${cssFile}`;
            links.push({
              href,
              tag: `<link rel="stylesheet" href="${href}">`
            });
          }
        }
      }
      return links;
    }
    /**
     * Get list of JS script info (without full tag) for given iDevice types
     * @param ideviceTypes - Array of iDevice type names
     * @param basePath - Base path prefix
     * @returns Array of script info objects
     */
    getJsScriptInfo(ideviceTypes, basePath = "") {
      const scripts = [];
      const seen = /* @__PURE__ */ new Set();
      for (const type of ideviceTypes) {
        const config = getIdeviceConfig(type);
        const typeName = config.cssClass;
        if (!seen.has(typeName)) {
          seen.add(typeName);
          const jsFiles = getIdeviceExportFiles(typeName, ".js");
          for (const jsFile of jsFiles) {
            const src = `${basePath}idevices/${typeName}/${jsFile}`;
            const typeAttr = isIdeviceJsModule(typeName, jsFile) ? ' type="module"' : "";
            scripts.push({
              src,
              tag: `<script${typeAttr} src="${src}"><\/script>`
            });
          }
        }
      }
      return scripts;
    }
  };

  // src/shared/export/browser/translation-shim.ts
  function trans(id, _parameters, _locale) {
    return id;
  }

  // src/shared/export/renderers/PageRenderer.ts
  var PageRenderer = class {
    /**
     * @param ideviceRenderer - Renderer for iDevice content
     */
    constructor(ideviceRenderer = null) {
      this.ideviceRenderer = ideviceRenderer || new IdeviceRenderer();
    }
    /**
     * Build the HTML <title> value for a page.
     * Index page uses the project title alone. Inner pages use
     * "Page title | Project title" (falling back to the project title
     * when the page title is empty or duplicates it).
     */
    buildDocumentTitle(page, projectTitle, isIndex) {
      if (isIndex) return projectTitle;
      const pageTitle = (page.title || "").trim();
      if (!pageTitle) return projectTitle;
      if (!projectTitle || pageTitle === projectTitle) return pageTitle;
      return `${pageTitle} | ${projectTitle}`;
    }
    /**
     * Check if a property value is truthy (handles both boolean and string "true")
     */
    isTruthyProperty(value) {
      return value === true || value === "true";
    }
    /**
     * Check if a property value is falsy (handles both boolean and string "false")
     */
    isFalsyProperty(value) {
      return value === false || value === "false";
    }
    /**
     * Render a complete HTML page
     * @param page - Page data
     * @param options - Rendering options
     * @returns Complete HTML document
     */
    render(page, options) {
      const {
        projectTitle = "eXeLearning",
        language = "en",
        customStyles = "",
        allPages = [],
        basePath = "",
        isIndex = false,
        usedIdevices = [],
        license = "",
        description = "",
        licenseUrl = "",
        // Page counter options
        totalPages,
        currentPageIndex,
        userFooterContent = "",
        // Export options (with defaults)
        addExeLink = true,
        addPagination = false,
        addSearchBox = false,
        addAccessibilityToolbar = false,
        addMathJax = false,
        // Custom head content
        extraHeadContent = "",
        // SCORM-specific options
        isScorm = false,
        scormVersion = "",
        bodyClass = "",
        extraHeadScripts = "",
        onLoadScript = "",
        onUnloadScript = "",
        detectedLibraries: providedDetectedLibraries,
        // Theme files (CSS/JS from theme root directory)
        themeFiles = [],
        // Navigation visibility options (for SCORM/IMS where LMS handles navigation)
        hideNavigation = false,
        hideNavButtons = false,
        // Asset URL transformation map
        assetExportPathMap,
        // Application version for generator meta tag
        version
      } = options;
      const pageTitle = this.buildDocumentTitle(page, projectTitle, isIndex);
      const originalContent = this.collectPageContent(page);
      const detectedLibraries = providedDetectedLibraries ?? this.detectContentLibraries(originalContent);
      const pageContent = this.renderPageContent(page, basePath, projectTitle, assetExportPathMap, {
        author: options.author,
        description: options.description,
        license: options.license,
        language: options.language,
        translatedLicense: options.navLabels?.license
      });
      const total = totalPages ?? allPages.length;
      const currentIdx = currentPageIndex ?? allPages.findIndex((p) => p.id === page.id);
      const bodyClassStr = bodyClass || "exe-export exe-web-site";
      const onLoadAttr = onLoadScript ? ` onload="${onLoadScript}"` : "";
      const onUnloadAttr = onUnloadScript ? ` onunload="${onUnloadScript}" onbeforeunload="${onUnloadScript}"` : "";
      const pageHeaderHtml = this.renderPageHeader(page, {
        projectTitle,
        projectSubtitle: options.projectSubtitle,
        currentPageIndex: currentIdx,
        totalPages: total,
        addPagination,
        pageLabel: options.navLabels?.page
      });
      const searchBoxHtml = addSearchBox ? `<div id="exe-client-search" data-block-order-string="Caja %e" data-no-results-string="Sin resultados.">
</div>` : "";
      const madeWithExeHtml = addExeLink ? this.renderMadeWithEXe(language, options.navLabels) : "";
      const pageFilenameMap = options.pageFilenameMap;
      const navHtml = hideNavigation ? "" : this.renderNavigation(allPages, page.id, basePath, pageFilenameMap);
      const navButtonsHtml = hideNavButtons ? "" : this.renderNavButtons(page, allPages, basePath, options.navLabels, pageFilenameMap);
      return `<!DOCTYPE html>
<html lang="${language}" id="exe-${isIndex ? "index" : page.id}">
<head>
${this.renderHead({ pageTitle, basePath, usedIdevices, customStyles, extraHeadScripts, isScorm, scormVersion, description, licenseUrl, addAccessibilityToolbar, addMathJax, extraHeadContent, addSearchBox, detectedLibraries, themeFiles, faviconPath: options.faviconPath, faviconType: options.faviconType, version })}
</head>
<body class="${bodyClassStr}"${onLoadAttr}${onUnloadAttr}>
<script>document.body.className+=" js"<\/script>
<div class="exe-content exe-export pre-js siteNav-hidden">${bodyClassStr.includes("exe-web-site") ? `<a href="#${page.id}" id="skipNav">${trans("Skip to content", {}, language)}</a> ` : ""}${navHtml}<main id="${page.id}" class="page"> ${searchBoxHtml}
${pageHeaderHtml}<div id="page-content-${page.id}" class="page-content">
${pageContent}
</div></main>${navButtonsHtml}
${this.renderFooterSection({ license, licenseUrl, userFooterContent, language, navLabels: options.navLabels })}
</div>
${madeWithExeHtml}
</body>
</html>`;
    }
    /**
     * Render HTML head section
     * Legacy order: SCRIPTS first, then CSS (required for proper initialization)
     * @param options - Head render options
     * @returns HTML head content
     */
    renderHead(options) {
      const {
        pageTitle,
        basePath,
        usedIdevices,
        customStyles,
        extraHeadScripts = "",
        isScorm: _isScorm = false,
        description = "",
        licenseUrl = "",
        addAccessibilityToolbar = false,
        addMathJax = false,
        extraHeadContent = "",
        addSearchBox = false,
        detectedLibraries = [],
        themeFiles = [],
        faviconPath = "libs/favicon.ico",
        faviconType = "image/x-icon",
        version,
        isEpub = false
      } = options;
      let head = `<meta charset="utf-8">
<meta name="generator" content="eXeLearning${version ? ` ${version}` : ""}">
<meta name="viewport" content="width=device-width, initial-scale=1">
${licenseUrl ? `<link rel="license" type="text/html" href="${licenseUrl}">
` : ""}<title>${this.escapeHtml(pageTitle)}</title>`;
      head += `
${this.renderFavicon(basePath, faviconPath, faviconType)}`;
      if (description) {
        head += `
<meta name="description" content="${this.escapeAttr(description)}">`;
      }
      head += `
<script>document.querySelector("html").classList.add("js");<\/script>`;
      if (isEpub) {
        head += `<script src="${basePath}libs/exe_epub_guards.js"> <\/script>`;
      }
      head += `<script src="${basePath}libs/jquery/jquery.min.js"> <\/script>`;
      head += `<script src="${basePath}libs/common_i18n.js"> <\/script>`;
      head += `<script src="${basePath}libs/common.js"> <\/script>`;
      head += `<script src="${basePath}libs/exe_export.js"> <\/script>`;
      if (addSearchBox) {
        head += `<script src="${basePath}search_index.js"> <\/script>`;
      }
      head += `<script src="${basePath}libs/bootstrap/bootstrap.bundle.min.js"> <\/script>`;
      head += `<link rel="stylesheet" href="${basePath}libs/bootstrap/bootstrap.min.css">`;
      const jsScripts = this.ideviceRenderer.getJsScripts(usedIdevices, basePath);
      const cssLinks = this.ideviceRenderer.getCssLinks(usedIdevices, basePath);
      for (let i = 0; i < jsScripts.length; i++) {
        head += `
${jsScripts[i]}`;
        if (cssLinks[i]) {
          head += cssLinks[i];
        }
      }
      for (const libName of detectedLibraries) {
        const libPattern = LIBRARY_PATTERNS.find((p) => p.name === libName);
        if (!libPattern) continue;
        const jsFiles = libPattern.files.filter((f) => f.endsWith(".js"));
        const cssFiles = libPattern.files.filter((f) => f.endsWith(".css"));
        for (const jsFile of jsFiles) {
          head += `
<script src="${basePath}libs/${jsFile}"> <\/script>`;
        }
        for (const cssFile of cssFiles) {
          head += `
<link rel="stylesheet" href="${basePath}libs/${cssFile}">`;
        }
      }
      if (addAccessibilityToolbar) {
        head += `
<script src="${basePath}libs/exe_atools/exe_atools.js"> <\/script>`;
        head += `<link rel="stylesheet" href="${basePath}libs/exe_atools/exe_atools.css">`;
      }
      head += `
<link rel="stylesheet" href="${basePath}content/css/base.css">`;
      if (themeFiles.length > 0) {
        const sortedFiles = [...themeFiles].sort();
        const jsFiles = sortedFiles.filter((f) => f.endsWith(".js"));
        const cssFiles = sortedFiles.filter((f) => f.endsWith(".css"));
        for (const jsFile of jsFiles) {
          head += `<script src="${basePath}theme/${jsFile}"> <\/script>`;
        }
        for (const cssFile of cssFiles) {
          head += `<link rel="stylesheet" href="${basePath}theme/${cssFile}">`;
        }
      } else {
        head += `<script src="${basePath}theme/default.js"> <\/script>`;
        head += `<link rel="stylesheet" href="${basePath}theme/content.css">`;
      }
      if (customStyles) {
        head += `
<style>
${customStyles}
</style>`;
      }
      if (addMathJax) {
        head += `
<script src="${basePath}libs/exe_math/tex-mml-svg.js"> <\/script>`;
      }
      if (extraHeadContent) {
        head += `
${extraHeadContent}`;
      }
      if (extraHeadScripts) {
        head += `
${extraHeadScripts}`;
      }
      return head;
    }
    /**
     * Render navigation menu
     * @param allPages - All pages in the project
     * @param currentPageId - ID of the current page
     * @param basePath - Base path for links
     * @returns Navigation HTML
     */
    renderNavigation(allPages, currentPageId, basePath, pageFilenameMap) {
      const rootPages = allPages.filter((p) => !p.parentId);
      let html = '<nav id="siteNav">\n<ul>\n';
      for (const page of rootPages) {
        html += this.renderNavItem(page, allPages, currentPageId, basePath, pageFilenameMap);
      }
      html += "</ul>\n</nav>";
      return html;
    }
    /**
     * Render a single navigation item (recursive for children)
     * @param page - Page to render
     * @param allPages - All pages
     * @param currentPageId - Current page ID
     * @param basePath - Base path
     * @param pageFilenameMap - Map of page IDs to unique filenames (optional)
     * @returns Navigation item HTML
     */
    renderNavItem(page, allPages, currentPageId, basePath, pageFilenameMap) {
      if (!this.isPageVisible(page, allPages)) {
        return "";
      }
      const children = allPages.filter((p) => p.parentId === page.id && this.isPageVisible(p, allPages));
      const isCurrent = page.id === currentPageId;
      const hasChildren = children.length > 0;
      const isAncestor = this.isAncestorOf(page.id, currentPageId, allPages);
      const isFirstPage = page.id === allPages[0]?.id;
      const liClass = isCurrent ? ' class="active"' : isAncestor ? ' class="current-page-parent"' : "";
      const link = this.getPageLink(page, allPages, basePath, pageFilenameMap);
      const linkClasses = [];
      if (isCurrent) linkClasses.push("active");
      if (isFirstPage) linkClasses.push("main-node");
      linkClasses.push(hasChildren ? "daddy" : "no-ch");
      if (this.isPageHighlighted(page)) {
        linkClasses.push("highlighted-link");
      }
      let html = `<li${liClass}>`;
      html += ` <a href="${link}" class="${linkClasses.join(" ")}">${this.escapeHtml(page.title)}</a>
`;
      if (hasChildren) {
        html += '<ul class="other-section">\n';
        for (const child of children) {
          html += this.renderNavItem(child, allPages, currentPageId, basePath, pageFilenameMap);
        }
        html += "</ul>\n";
      }
      html += "</li>\n";
      return html;
    }
    /**
     * Check if a page is an ancestor of another
     * @param ancestorId - Potential ancestor ID
     * @param childId - Child ID
     * @param allPages - All pages
     * @returns True if ancestorId is an ancestor of childId
     */
    isAncestorOf(ancestorId, childId, allPages) {
      const child = allPages.find((p) => p.id === childId);
      if (!child || !child.parentId) return false;
      if (child.parentId === ancestorId) return true;
      return this.isAncestorOf(ancestorId, child.parentId, allPages);
    }
    /**
     * Check if a page is visible in export
     * First page is always visible regardless of visibility setting.
     * If a parent is hidden, all its children are also hidden.
     * @param page - Page to check
     * @param allPages - All pages
     * @returns True if page should be visible
     */
    isPageVisible(page, allPages) {
      if (page.id === allPages[0]?.id) {
        return true;
      }
      if (this.isFalsyProperty(page.properties?.visibility)) {
        return false;
      }
      if (page.parentId) {
        const parent = allPages.find((p) => p.id === page.parentId);
        if (parent && !this.isPageVisible(parent, allPages)) {
          return false;
        }
      }
      return true;
    }
    /**
     * Filter pages to only include visible ones
     * @param pages - All pages
     * @returns Pages that should be visible in navigation and exports
     */
    getVisiblePages(pages) {
      return pages.filter((page) => this.isPageVisible(page, pages));
    }
    /**
     * Check if a page has highlight property enabled
     * @param page - Page to check
     * @returns True if page should be highlighted in navigation
     */
    isPageHighlighted(page) {
      return this.isTruthyProperty(page.properties?.highlight);
    }
    /**
     * Check if a page's title should be hidden
     * @param page - Page to check
     * @returns True if page title should be hidden
     */
    shouldHidePageTitle(page) {
      return this.isTruthyProperty(page.properties?.hidePageTitle);
    }
    /**
     * Get effective page title (respects editableInPage + titlePage properties)
     * If editableInPage is true and titlePage is set, use titlePage
     * Otherwise use the default page title
     * @param page - Page to get title for
     * @returns Effective title string
     */
    getEffectivePageTitle(page) {
      if (this.isTruthyProperty(page.properties?.editableInPage)) {
        const titlePage = page.properties?.titlePage;
        if (titlePage) return titlePage;
      }
      return page.title;
    }
    /**
     * Get page link URL
     * @param page - Page
     * @param allPages - All pages
     * @param basePath - Base path
     * @param pageFilenameMap - Map of page IDs to unique filenames (optional, handles title collisions)
     * @returns Link URL
     */
    getPageLink(page, allPages, basePath, pageFilenameMap) {
      const isFirstPage = page.id === allPages[0]?.id;
      if (isFirstPage) {
        return basePath ? `${basePath}index.html` : "index.html";
      }
      const mapFilename = pageFilenameMap?.get(page.id);
      const filename = mapFilename || `${this.sanitizeFilename(page.title)}.html`;
      return `${basePath}html/${filename}`;
    }
    /**
     * Sanitize title for use as filename
     * @param title - Title to sanitize
     * @returns Sanitized filename
     */
    sanitizeFilename(title) {
      if (!title) return "page";
      return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").substring(0, 50);
    }
    /**
     * Render page header with page counter, package title (h1), subtitle, and page title (h2)
     * @param page - Page
     * @param options - Header options including counter info
     * @returns Header HTML
     */
    renderPageHeader(page, options) {
      const { projectTitle, projectSubtitle, currentPageIndex, totalPages, addPagination, pageLabel } = options;
      const pageCounterHtml = addPagination ? ` <p class="page-counter"> <span class="page-counter-label">${pageLabel || "Page"} </span><span class="page-counter-content"> <strong class="page-counter-current-page">${currentPageIndex + 1}</strong><span class="page-counter-sep">/</span><strong class="page-counter-total">${totalPages}</strong></span></p>
` : "";
      const hideTitle = this.shouldHidePageTitle(page);
      const effectiveTitle = this.getEffectivePageTitle(page);
      const pageTitleClass = hideTitle ? "page-title sr-av" : "page-title";
      const subtitleHtml = projectSubtitle ? `
<p class="package-subtitle">${this.escapeHtml(projectSubtitle)}</p>` : "";
      return `<header class="main-header">${pageCounterHtml}
<div class="package-header"><p class="package-title">${this.escapeHtml(projectTitle)}</p>${subtitleHtml}</div>
<div class="page-header"><h1 class="${pageTitleClass}">${this.escapeHtml(effectiveTitle)}</h1></div>
</header>`;
    }
    /**
     * Render page content (blocks with iDevices)
     * @param page - Page
     * @param basePath - Base path
     * @param projectTitle - Project title (for exe-package:elp transformation)
     * @param assetExportPathMap - Map of asset UUID to export path for URL transformation
     * @returns Content HTML
     */
    renderPageContent(page, basePath, projectTitle, assetExportPathMap, metadata) {
      let html = "";
      for (const block of page.blocks || []) {
        html += this.ideviceRenderer.renderBlock(block, {
          basePath,
          includeDataAttributes: true,
          assetExportPathMap
        });
      }
      if (projectTitle) {
        html = this.replaceElpxProtocol(html, projectTitle);
      }
      if (html.includes("exe-prop-")) {
        const safeTitle = this.escapeHtml(projectTitle || "-");
        const safeAuthor = this.escapeHtml(metadata?.author || "-");
        const safeDesc = this.escapeHtml(metadata?.description || "-");
        const safeLicense = this.escapeHtml(metadata?.license ? formatShortLicenseText(metadata.license) : "-");
        let safeLicenseHtml = safeLicense;
        if (metadata?.license) {
          const shortText = formatShortLicenseText(metadata.license);
          const isStandardCC = shortText.startsWith("Creative Commons");
          if (isStandardCC) {
            const licenseUrl = getLicenseUrl(metadata.license);
            if (licenseUrl) {
              const cssClass = getLicenseClass(metadata.license);
              const classAttr = cssClass ? ` class="${cssClass}"` : "";
              safeLicenseHtml = `<a href="${licenseUrl}" rel="license"${classAttr}><span></span>${safeLicense}</a>`;
            }
          } else if (["propietary license", "not appropriate", "public domain"].includes(
            metadata.license.toLowerCase().trim()
          )) {
            let displayName = metadata.license;
            if (metadata.license.toLowerCase().trim() === "propietary license")
              displayName = "Proprietary license";
            if (metadata.license.toLowerCase().trim() === "not appropriate") displayName = "Not appropriate";
            if (metadata.license.toLowerCase().trim() === "public domain") displayName = "Public domain";
            safeLicenseHtml = this.escapeHtml(
              metadata.translatedLicense || trans(displayName, {}, metadata.language)
            );
          }
        }
        html = html.replace(/<td class="mceNonEditable exe-prop-locked\s*"[^>]*>/g, "<td>");
        html = html.replace(
          /<span class="exe-prop-title[^>]*>.*?<\/span>/g,
          `<span class="exe-prop-title">${safeTitle}</span>`
        );
        html = html.replace(
          /<span class="exe-prop-author[^>]*>.*?<\/span>/g,
          `<span class="exe-prop-author">${safeAuthor}</span>`
        );
        html = html.replace(
          /<span class="exe-prop-description[^>]*>.*?<\/span>/g,
          `<span class="exe-prop-description">${safeDesc}</span>`
        );
        html = html.replace(
          /<span class="exe-prop-license[^>]*>[\s\S]*?(?=<\/td>|<\/p>|<\/div>|<\/li>|$)/g,
          `<span class="exe-prop-license">${safeLicenseHtml}</span>`
        );
      }
      return html;
    }
    /**
     * Collect all content from a page's components (for library detection)
     * @param page - Page to collect content from
     * @returns Combined HTML content from all components
     */
    collectPageContent(page) {
      const parts = [];
      for (const block of page.blocks || []) {
        for (const component of block.components || []) {
          if (component.content) {
            parts.push(component.content);
          }
        }
      }
      return parts.join("\n");
    }
    /**
     * Replace exe-package:elp protocol with client-side download handler
     * This enables the download-source-file iDevice to generate ELPX files on-the-fly
     *
     * @param content - HTML content
     * @param projectTitle - Project title for the download filename
     * @returns Content with exe-package:elp replaced with onclick handler
     */
    replaceElpxProtocol(content, projectTitle) {
      if (!content || !content.includes("exe-package:elp")) {
        return content;
      }
      let result = content.replace(/href="exe-package:elp"/g, `href="#" onclick="${ELPX_DOWNLOAD_ONCLICK}"`);
      const safeTitle = this.escapeHtml(projectTitle);
      result = result.replace(/download="exe-package:elp-name"/g, `download="${safeTitle}.elpx"`);
      return result;
    }
    /**
     * Render navigation buttons (prev/next links).
     * Uses pre-translated labels resolved at export time from XLF translations,
     * so the exported HTML already contains the correct text for the content language.
     * @param page - Current page
     * @param allPages - All pages
     * @param basePath - Base path
     * @param navLabels - Translated labels ({ previous, next }); defaults to English
     * @param pageFilenameMap - Optional map for collision-safe filenames
     * @returns Navigation buttons HTML
     */
    renderNavButtons(page, allPages, basePath, navLabels, pageFilenameMap) {
      const prevLabel = navLabels?.previous || "Previous";
      const nextLabel = navLabels?.next || "Next";
      const currentIndex = allPages.findIndex((p) => p.id === page.id);
      const prevPage = currentIndex > 0 ? allPages[currentIndex - 1] : null;
      const nextPage = currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null;
      const parts = ['<div class="nav-buttons">'];
      if (prevPage) {
        const link = this.getPageLink(prevPage, allPages, basePath, pageFilenameMap);
        parts.push(
          `<a href="${link}" title="${prevLabel}" class="nav-button nav-button-left"><span>${prevLabel}</span></a>`
        );
      } else {
        parts.push(`<span class="nav-button nav-button-left" aria-hidden="true"><span>${prevLabel}</span></span>`);
      }
      if (nextPage) {
        const link = this.getPageLink(nextPage, allPages, basePath, pageFilenameMap);
        parts.push(
          `<a href="${link}" title="${nextLabel}" class="nav-button nav-button-right"><span>${nextLabel}</span></a>`
        );
      } else {
        parts.push(`<span class="nav-button nav-button-right" aria-hidden="true"><span>${nextLabel}</span></span>`);
      }
      parts.push("</div>");
      return parts.join("\n");
    }
    /**
     * Render pagination (prev/next links) - legacy method kept for backward compatibility
     * @param page - Current page
     * @param allPages - All pages
     * @param basePath - Base path
     * @param language - Language for button text translation
     * @returns Pagination HTML
     * @deprecated Use renderNavButtons instead
     */
    renderPagination(page, allPages, basePath) {
      return this.renderNavButtons(page, allPages, basePath);
    }
    /**
     * Render complete footer section with license and optional user content
     * @param options - Footer options
     * @returns Footer HTML with siteFooter wrapper
     */
    renderFooterSection(options) {
      const { license, licenseUrl = "", userFooterContent, language = "en", navLabels } = options;
      let userFooterHtml = "";
      if (userFooterContent) {
        userFooterHtml = `<div id="siteUserFooter"> <div>${userFooterContent}</div>
</div>`;
      }
      if (!shouldShowLicenseFooter(license)) {
        return `<footer id="siteFooter"><div id="siteFooterContent">${userFooterHtml}</div></footer>`;
      }
      const licenseText = formatLicenseText(license);
      const translatedLicenseText = navLabels?.license || trans(licenseText, {}, language);
      const licenseClass = getLicenseClass(license);
      const licenseLabel = navLabels?.licenseLabel || trans("License", {}, language);
      const licenseContent = licenseUrl ? `<a href="${licenseUrl}" class="license">${translatedLicenseText}</a>` : `<span class="license">${translatedLicenseText}</span>`;
      return `<footer id="siteFooter"><div id="siteFooterContent"> <div id="packageLicense" class="${licenseClass}"> <p> <span class="license-label">${licenseLabel}: </span>${licenseContent}</p>
</div>
${userFooterHtml}</div></footer>`;
    }
    /**
     * Render "Made with eXeLearning" credit in the document language.
     * @param language - Document language code (e.g. 'es', 'en')
     * @param navLabels - Pre-translated labels (browser-side exports supply these via fetchNavLabels)
     * @returns Made with eXe HTML
     */
    renderMadeWithEXe(language = "en", navLabels) {
      const madeWithText = navLabels?.madeWith || trans("Made with eXeLearning", {}, language);
      const newWindowText = navLabels?.newWindow || trans("New window", {}, language);
      return `<p id="made-with-eXe"> <a href="https://exelearning.net/" target="_blank" rel="noopener"> <span>${madeWithText} <span>(${newWindowText})</span></span></a></p>`;
    }
    /**
     * Render license div (inside main, before pagination)
     * @param options - License options
     * @returns License HTML
     * @deprecated Use renderFooterSection instead
     */
    renderLicense(options) {
      const { license, licenseUrl = "" } = options;
      if (!shouldShowLicenseFooter(license)) {
        return "";
      }
      const licenseContent = licenseUrl ? `<a rel="license" href="${licenseUrl}">${this.escapeHtml(license)}</a>` : `<span>${this.escapeHtml(license)}</span>`;
      return `<div id="packageLicense" class="${getLicenseClass(license)}">
<p><span>Licensed under the</span> ${licenseContent}</p>
</div>`;
    }
    /**
     * Render footer section (legacy method, kept for backward compatibility)
     * @param options - Footer options
     * @returns Footer HTML
     * @deprecated Use renderFooterSection instead
     */
    renderFooter(options) {
      return this.renderLicense({ ...options, licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/" });
    }
    /**
     * Generate search data JSON for client-side search functionality
     * @param allPages - All pages in the project
     * @param _basePath - Base path for URLs (unused but kept for API compatibility)
     * @param pageFilenameMap - Map of page IDs to unique filenames (optional, handles title collisions)
     * @returns JSON string with page structure
     */
    generateSearchData(allPages, _basePath, pageFilenameMap) {
      const pagesData = {};
      for (let i = 0; i < allPages.length; i++) {
        const page = allPages[i];
        const isIndex = i === 0;
        const prevPage = i > 0 ? allPages[i - 1] : null;
        const nextPage = i < allPages.length - 1 ? allPages[i + 1] : null;
        const mapFilename = pageFilenameMap?.get(page.id);
        const fileName = isIndex ? "index.html" : mapFilename || `${this.sanitizeFilename(page.title)}.html`;
        const fileUrl = isIndex ? "index.html" : `html/${fileName}`;
        const blocksData = {};
        for (const block of page.blocks || []) {
          const idevicesData = {};
          for (let j = 0; j < (block.components || []).length; j++) {
            const component = block.components[j];
            idevicesData[component.id] = {
              order: j + 1,
              htmlView: component.content || "",
              jsonProperties: JSON.stringify(component.properties || {})
            };
          }
          blocksData[block.id] = {
            name: block.name || "",
            order: block.order || 1,
            idevices: idevicesData
          };
        }
        pagesData[page.id] = {
          name: page.title,
          isIndex,
          fileName,
          fileUrl,
          prePageId: prevPage?.id || null,
          nextPageId: nextPage?.id || null,
          blocks: blocksData
        };
      }
      return JSON.stringify(pagesData);
    }
    /**
     * Generate the content for search_index.js file
     * @param allPages - All pages in the project
     * @param basePath - Base path for URLs
     * @param pageFilenameMap - Map of page IDs to unique filenames (optional, handles title collisions)
     * @returns JavaScript file content with window.exeSearchData assignment
     */
    generateSearchIndexFile(allPages, basePath, pageFilenameMap) {
      const searchDataJson = this.generateSearchData(allPages, basePath, pageFilenameMap);
      return `window.exeSearchData = ${searchDataJson};`;
    }
    /**
     * Render favicon link tag
     * @param basePath - Base path for links
     * @param faviconPath - Path to favicon file
     * @param faviconType - MIME type of favicon
     * @returns Link tag HTML
     */
    renderFavicon(basePath, faviconPath = "libs/favicon.ico", faviconType = "image/x-icon") {
      const faviconHref = `${basePath}${faviconPath}`;
      return `<link rel="icon" type="${this.escapeAttr(faviconType)}" href="${this.escapeAttr(faviconHref)}">`;
    }
    /**
     * Render a single-page HTML document with all pages
     * @param allPages - All pages in the project
     * @param options - Rendering options
     * @returns Complete HTML document
     */
    renderSinglePage(allPages, options = {}) {
      const {
        projectTitle = "eXeLearning",
        projectSubtitle = "",
        language = "en",
        customStyles = "",
        usedIdevices = [],
        license = "",
        licenseUrl = "",
        description = "",
        faviconPath = "libs/favicon.ico",
        faviconType = "image/x-icon",
        addExeLink = true,
        userFooterContent = "",
        version,
        detectedLibraries = [],
        addMathJax = false,
        addAccessibilityToolbar = false,
        navLabels
      } = options;
      let contentHtml = "";
      const effectiveDetectedLibraries = detectedLibraries.length > 0 ? detectedLibraries : this.detectContentLibrariesForPages(allPages);
      for (const page of allPages) {
        const hideTitle = this.shouldHidePageTitle(page);
        const effectiveTitle = this.getEffectivePageTitle(page);
        const pageTitleClass = hideTitle ? "page-title sr-av" : "page-title";
        contentHtml += `<section id="section-${page.id}">
<header class="main-header">
<div class="page-header">
<h1 class="${pageTitleClass}">${this.escapeHtml(effectiveTitle)}</h1>
</div>
</header>
<div class="page-content">
${this.renderPageContent(page, "", projectTitle, void 0, {
          author: options.author,
          description: options.description,
          license: options.license,
          language: options.language,
          translatedLicense: navLabels?.license
        })}
</div>
</section>
`;
      }
      const jsScripts = this.ideviceRenderer.getJsScripts(usedIdevices, "");
      const cssLinks = this.ideviceRenderer.getCssLinks(usedIdevices, "");
      let ideviceIncludes = "";
      for (let i = 0; i < jsScripts.length; i++) {
        ideviceIncludes += `
${jsScripts[i]}`;
        if (cssLinks[i]) {
          ideviceIncludes += cssLinks[i];
        }
      }
      return `<!DOCTYPE html>
<html lang="${language}" id="exe-index">
<head>
<meta charset="utf-8">
<meta name="generator" content="eXeLearning${version ? ` ${version}` : ""}">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${this.escapeHtml(projectTitle)}</title>
<script>document.querySelector("html").classList.add("js");<\/script>
<script src="libs/jquery/jquery.min.js"> <\/script>
<script src="libs/common_i18n.js"> <\/script>
<script src="libs/common.js"> <\/script>
<script src="libs/exe_export.js"> <\/script>
<script src="libs/bootstrap/bootstrap.bundle.min.js"> <\/script>
<link rel="stylesheet" href="libs/bootstrap/bootstrap.min.css">${ideviceIncludes}
<link rel="stylesheet" href="content/css/base.css">
<script src="theme/style.js"> <\/script>
<link rel="stylesheet" href="theme/style.css">
${this.renderFavicon("", faviconPath, faviconType)}
${customStyles ? `<style>
${customStyles}
</style>` : ""}
${this.renderDetectedLibraries(effectiveDetectedLibraries, "")}
${addAccessibilityToolbar ? `<script src="libs/exe_atools/exe_atools.js"> <\/script>
<link rel="stylesheet" href="libs/exe_atools/exe_atools.css">` : ""}
${addMathJax ? `<script src="libs/exe_math/tex-mml-svg.js"> <\/script>` : ""}
</head>
<body class="exe-export exe-single-page">
<script>document.body.className+=" js"<\/script>
<div class="exe-content exe-export pre-js siteNav-hidden">
<main class="page">
<header class="package-header"><p class="package-title">${this.escapeHtml(projectTitle)}</p>${projectSubtitle ? `
<p class="package-subtitle">${this.escapeHtml(projectSubtitle)}</p>` : ""}</header>
${contentHtml}
</main>
${this.renderFooterSection({ license, licenseUrl, userFooterContent, language, navLabels })}
</div>
${addExeLink ? this.renderMadeWithEXe(language, navLabels) : ""}
</body>
</html>`;
    }
    /**
     * Render navigation for single-page export (anchor links)
     * @param allPages - All pages
     * @returns Navigation HTML
     */
    renderSinglePageNav(allPages) {
      const rootPages = allPages.filter((p) => !p.parentId);
      let html = '<nav id="siteNav" class="single-page-nav">\n<ul>\n';
      for (const page of rootPages) {
        html += this.renderSinglePageNavItem(page, allPages);
      }
      html += "</ul>\n</nav>";
      return html;
    }
    /**
     * Render a single navigation item for single-page (anchor links)
     * @param page - Page
     * @param allPages - All pages
     * @returns Navigation item HTML
     */
    renderSinglePageNavItem(page, allPages) {
      if (!this.isPageVisible(page, allPages)) {
        return "";
      }
      const children = allPages.filter((p) => p.parentId === page.id && this.isPageVisible(p, allPages));
      const hasChildren = children.length > 0;
      const linkClasses = [];
      linkClasses.push(hasChildren ? "daddy" : "no-ch");
      if (this.isPageHighlighted(page)) {
        linkClasses.push("highlighted-link");
      }
      let html = "<li>";
      html += ` <a href="#section-${page.id}" class="${linkClasses.join(" ")}">${this.escapeHtml(page.title)}</a>
`;
      if (hasChildren) {
        html += '<ul class="other-section">\n';
        for (const child of children) {
          html += this.renderSinglePageNavItem(child, allPages);
        }
        html += "</ul>\n";
      }
      html += "</li>\n";
      return html;
    }
    /**
     * Detect content-based libraries from HTML content
     * Scans the content for patterns that indicate specific libraries are needed
     * @param html - HTML content to scan
     * @returns Array of library names detected
     */
    detectContentLibraries(html) {
      const detectedLibs = /* @__PURE__ */ new Set();
      for (const lib of LIBRARY_PATTERNS) {
        let found = false;
        switch (lib.type) {
          case "class":
            found = html.includes(`class="${lib.pattern}"`) || html.includes(`class='${lib.pattern}'`) || new RegExp(`class="[^"]*\\b${lib.pattern}\\b[^"]*"`, "i").test(html) || new RegExp(`class='[^']*\\b${lib.pattern}\\b[^']*'`, "i").test(html);
            break;
          case "rel":
            found = new RegExp(`rel="[^"]*${lib.pattern}[^"]*"`, "i").test(html) || new RegExp(`rel='[^']*${lib.pattern}[^']*'`, "i").test(html);
            break;
          case "regex":
            found = lib.pattern.test(html);
            break;
        }
        if (found) {
          detectedLibs.add(lib.name);
        }
      }
      return Array.from(detectedLibs);
    }
    detectContentLibrariesForPages(pages) {
      const detectedLibs = /* @__PURE__ */ new Set();
      for (const page of pages) {
        for (const libName of this.detectContentLibraries(this.collectPageContent(page))) {
          detectedLibs.add(libName);
        }
      }
      return Array.from(detectedLibs);
    }
    /**
     * Escape HTML special characters
     * @param str - String to escape
     * @returns Escaped string
     */
    escapeHtml(str) {
      if (!str) return "";
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      };
      return String(str).replace(/[&<>"']/g, (m) => map[m]);
    }
    /**
     * Escape attribute value for use in HTML attributes
     * @param str - String to escape
     * @returns Escaped string safe for attribute values
     */
    escapeAttr(str) {
      if (!str) return "";
      return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    /**
     * Render detected libraries scripts and CSS
     * @param detectedLibraries - List of detected library names
     * @param basePath - Base path for URLs
     * @returns HTML for library includes
     */
    renderDetectedLibraries(detectedLibraries, basePath) {
      let html = "";
      for (const libName of detectedLibraries) {
        const libPattern = LIBRARY_PATTERNS.find((p) => p.name === libName);
        if (!libPattern) continue;
        const jsFiles = libPattern.files.filter((f) => f.endsWith(".js"));
        const cssFiles = libPattern.files.filter((f) => f.endsWith(".css"));
        for (const jsFile of jsFiles) {
          html += `
<script src="${basePath}libs/${jsFile}"> <\/script>`;
        }
        for (const cssFile of cssFiles) {
          html += `
<link rel="stylesheet" href="${basePath}libs/${cssFile}">`;
        }
      }
      return html;
    }
  };

  // src/shared/export/utils/LibraryDetector.ts
  var LibraryDetector = class {
    constructor() {
      this.detectedLibraries = /* @__PURE__ */ new Set();
      this.filesToInclude = /* @__PURE__ */ new Set();
      this.detectedPatterns = [];
    }
    resetDetection() {
      this.detectedLibraries.clear();
      this.filesToInclude.clear();
      this.detectedPatterns = [];
    }
    /**
     * Detect all required libraries by scanning HTML content
     * @param html - HTML content to scan
     * @param options - Detection options
     * @returns Detected libraries info
     */
    detectLibraries(html, options = {}) {
      this.resetDetection();
      this.scanHtmlFragment(html, options);
      return this.finalizeDetection(options);
    }
    /**
     * Detect all required libraries by scanning multiple HTML fragments incrementally.
     * This avoids building one giant concatenated HTML string in memory.
     */
    detectLibrariesFromFragments(htmlFragments, options = {}) {
      this.resetDetection();
      for (const html of htmlFragments) {
        this.scanHtmlFragment(html, options);
      }
      return this.finalizeDetection(options);
    }
    scanHtmlFragment(html, options) {
      if (!html || typeof html !== "string") {
        return;
      }
      for (const lib of LIBRARY_PATTERNS) {
        if (options.skipMathJax && (lib.name === "exe_math" || lib.name === "exe_math_datagame")) {
          continue;
        }
        if (this._matchesPattern(html, lib)) {
          if (lib.requiresLatexCheck && !this._hasLatexInDataGame(html)) {
            continue;
          }
          this._addLibrary(lib);
        }
      }
    }
    finalizeDetection(options) {
      if (options.includeAccessibilityToolbar) {
        const atoolsLib = LIBRARY_PATTERNS.find((l) => l.name === "exe_atools");
        if (atoolsLib) {
          this._addLibrary(atoolsLib);
        }
      }
      if (options.includeMathJax) {
        const mathLib = LIBRARY_PATTERNS.find((l) => l.name === "exe_math");
        if (mathLib) {
          this._addLibrary(mathLib);
        }
      }
      return this._buildResult();
    }
    /**
     * Check if HTML matches a library pattern
     * @param html - HTML content
     * @param lib - Library pattern definition
     * @returns True if pattern matches
     */
    _matchesPattern(html, lib) {
      switch (lib.type) {
        case "class":
          return new RegExp(`class="[^"]*${this._escapeRegex(lib.pattern)}[^"]*"`, "i").test(html);
        case "rel":
          return new RegExp(`rel="[^"]*${this._escapeRegex(lib.pattern)}[^"]*"`, "i").test(html);
        case "regex":
          return lib.pattern.test(html);
        default:
          return false;
      }
    }
    /**
     * Check if DataGame content contains LaTeX after decryption
     * @param html - HTML content
     * @returns True if LaTeX is found in decrypted DataGame content
     */
    _hasLatexInDataGame(html) {
      const match = html.match(/<div[^>]*class="[^"]*DataGame[^"]*"[^>]*>(.*?)<\/div>/s);
      if (!match) return false;
      const decrypted = this._decrypt(match[1]);
      return /\\\(|\\\[/.test(decrypted);
    }
    /**
     * Decrypt XOR-encoded string (matches Symfony's decrypt method)
     * @param str - Encrypted string
     * @returns Decrypted string
     */
    _decrypt(str) {
      if (!str || str === "undefined" || str === "null") return "";
      try {
        str = decodeURIComponent(str);
        const key = 146;
        let result = "";
        for (let i = 0; i < str.length; i++) {
          result += String.fromCharCode(key ^ str.charCodeAt(i));
        }
        return result;
      } catch {
        return "";
      }
    }
    /**
     * Add a library and its files to the detected set
     * @param lib - Library pattern
     */
    _addLibrary(lib) {
      if (this.detectedLibraries.has(lib.name)) return;
      this.detectedLibraries.add(lib.name);
      this.detectedPatterns.push(lib);
      for (const file of lib.files) {
        this.filesToInclude.add(file);
      }
    }
    /**
     * Build the result object
     * @returns Detection result
     */
    _buildResult() {
      const libraries = [];
      for (const lib of LIBRARY_PATTERNS) {
        if (this.detectedLibraries.has(lib.name)) {
          libraries.push({
            name: lib.name,
            files: lib.files
          });
        }
      }
      return {
        libraries,
        files: Array.from(this.filesToInclude),
        count: libraries.length,
        patterns: this.detectedPatterns
      };
    }
    /**
     * Get base libraries (always included)
     * @returns Array of base library file paths
     */
    getBaseLibraries() {
      return [...BASE_LIBRARIES];
    }
    /**
     * Get SCORM-specific libraries
     * @returns Array of SCORM library file paths
     */
    getScormLibraries() {
      return [...SCORM_LIBRARIES];
    }
    /**
     * Get all files needed for export (base + detected)
     * @param html - HTML content to scan
     * @param options - Options
     * @returns Array of file paths
     */
    getAllRequiredFiles(html, options = {}) {
      return this.getAllRequiredFilesWithPatterns(html, options).files;
    }
    /**
     * Get all files needed for export with pattern information
     * @param html - HTML content to scan
     * @param options - Options
     * @returns Object with files and patterns for directory-based libraries
     */
    getAllRequiredFilesWithPatterns(html, options = {}) {
      const detected = this.detectLibraries(html, options);
      return this.buildRequiredFilesResult(detected, options);
    }
    /**
     * Get all files needed for export with pattern information from HTML fragments.
     * This incremental API avoids concatenating all content into one large string.
     */
    getAllRequiredFilesWithPatternsFromFragments(htmlFragments, options = {}) {
      const detected = this.detectLibrariesFromFragments(htmlFragments, options);
      return this.buildRequiredFilesResult(detected, options);
    }
    buildRequiredFilesResult(detected, options) {
      const files = new Set(this.getBaseLibraries());
      for (const file of detected.files) {
        files.add(file);
      }
      if (options.includeScorm) {
        for (const file of this.getScormLibraries()) {
          files.add(file);
        }
      }
      return {
        files: Array.from(files),
        patterns: detected.patterns
      };
    }
    /**
     * Group files by type for HTML head generation
     * @param files - Array of file paths
     * @returns Object with js and css arrays
     */
    groupFilesByType(files) {
      const js = [];
      const css = [];
      for (const file of files) {
        const ext = file.split(".").pop()?.toLowerCase();
        if (ext === "js") {
          js.push(file);
        } else if (ext === "css") {
          css.push(file);
        }
      }
      return { js, css };
    }
    /**
     * Escape special regex characters in a string
     * @param str - String to escape
     * @returns Escaped string
     */
    _escapeRegex(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
  };

  // src/shared/export/exporters/BaseExporter.ts
  var BaseExporter = class _BaseExporter {
    constructor(document2, resources, assets, zip2) {
      // Cache for asset filename lookups
      this.assetFilenameMap = null;
      // Cache for asset export path lookups (folderPath-based)
      this.assetExportPathMap = null;
      this.document = document2;
      this.resources = resources;
      this.assets = assets;
      this.zip = zip2;
      this.ideviceRenderer = new IdeviceRenderer();
      this.pageRenderer = new PageRenderer(this.ideviceRenderer);
      this.libraryDetector = new LibraryDetector();
    }
    isElpxExportDebugEnabled() {
      const browserGlobal = globalThis;
      return browserGlobal.window?.eXeLearning?.config?.debugElpxExport === true || browserGlobal.eXeLearning?.config?.debugElpxExport === true;
    }
    logElpxExportDebugPhase(phase, context = {}) {
      if (!this.isElpxExportDebugEnabled()) {
        return;
      }
      const browserGlobal = globalThis;
      const trace = browserGlobal.window?.__currentElpxExportTrace;
      if (!trace) {
        return;
      }
      const now = globalThis.performance?.now ? globalThis.performance.now() : Date.now();
      const entry = {
        phase,
        ts: (/* @__PURE__ */ new Date()).toISOString(),
        elapsedMs: Math.round(now - trace.startedMs),
        ...context
      };
      trace.entries.push(entry);
      console.log("[ELPX Export DEBUG]", entry);
    }
    // =========================================================================
    // i18n Content Generation
    // =========================================================================
    /**
     * Fetch the pre-built, pre-translated `common_i18n.js` content for the given language.
     * The file is generated at build time by `scripts/build-i18n-bundles.js` and contains
     * resolved string literals (no c_() calls) ready to include in the export ZIP.
     */
    async generateI18nContent(language) {
      return this.resources.fetchI18nFile(language);
    }
    /**
     * Fetch translated labels for navigation buttons (Previous / Next / Page counter).
     * Labels are resolved from XLF translations so the exported HTML already
     * contains the correct text for the content language — no runtime JS needed.
     */
    async fetchNavLabels(language, license) {
      const translations = await this.resources.fetchI18nTranslations(language);
      let translatedLicense = license;
      if (license) {
        const key = formatLicenseText(license);
        translatedLicense = translations.get(key) || key;
      }
      return {
        previous: translations.get("Previous") || "Previous",
        next: translations.get("Next") || "Next",
        page: translations.get("Page") || "Page",
        license: translatedLicense,
        licenseLabel: translations.get("License") || "License",
        madeWith: translations.get("Made with eXeLearning") || "Made with eXeLearning",
        newWindow: translations.get("New window") || "New window"
      };
    }
    // =========================================================================
    // Structure Access Methods
    // =========================================================================
    /**
     * Get project metadata
     */
    getMetadata() {
      return this.document.getMetadata();
    }
    /**
     * Get navigation structure (pages)
     */
    getNavigation() {
      return this.document.getNavigation();
    }
    /**
     * Build a flat list of pages from the navigation structure
     */
    buildPageList() {
      return this.getNavigation();
    }
    /**
     * Get list of unique iDevice types used in the project
     */
    getUsedIdevices(pages) {
      const types = /* @__PURE__ */ new Set();
      for (const page of pages) {
        for (const block of page.blocks || []) {
          for (const component of block.components || []) {
            if (component.type) {
              types.add(component.type);
            }
          }
        }
      }
      return Array.from(types);
    }
    /**
     * Get list of iDevice types used in a specific page
     */
    getUsedIdevicesForPage(page) {
      const types = /* @__PURE__ */ new Set();
      for (const block of page.blocks || []) {
        for (const component of block.components || []) {
          if (component.type) {
            types.add(component.type);
          }
        }
      }
      return Array.from(types);
    }
    /**
     * Get root pages (pages without parent)
     */
    getRootPages(pages) {
      return pages.filter((p) => !p.parentId);
    }
    /**
     * Get child pages of a given page
     */
    getChildPages(parentId, pages) {
      return pages.filter((p) => p.parentId === parentId);
    }
    // =========================================================================
    // Visibility Helpers
    // =========================================================================
    /**
     * Check if a page is visible in export
     * A page is visible if:
     * 1. It is the root page (always visible)
     * 2. Its visibility property is not set to false/ 'false'
     * 3. All its ancestors are visible
     */
    isPageVisible(page, allPages) {
      if (page.id === allPages[0]?.id) {
        return true;
      }
      const visibility = page.properties?.visibility;
      if (visibility === false || visibility === "false") {
        return false;
      }
      if (page.parentId) {
        const parent = allPages.find((p) => p.id === page.parentId);
        if (parent && !this.isPageVisible(parent, allPages)) {
          return false;
        }
      }
      return true;
    }
    // =========================================================================
    // String Utilities
    // =========================================================================
    /**
     * Escape XML special characters
     */
    escapeXml(str) {
      if (!str) return "";
      return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
    }
    /**
     * Escape content for use in CDATA sections
     * CDATA cannot contain the sequence ]]> as it closes the CDATA block.
     * We split it into multiple CDATA sections when this sequence appears.
     */
    escapeCdata(str) {
      if (!str) return "";
      return String(str).replace(/\]\]>/g, "]]]]><![CDATA[>");
    }
    /**
     * Escape HTML special characters
     */
    escapeHtml(str) {
      if (!str) return "";
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      };
      return String(str).replace(/[&<>"']/g, (m) => map[m]);
    }
    /**
     * Sanitize string for use as filename (with accent normalization)
     */
    sanitizeFilename(str, maxLength = 50) {
      if (!str) return "export";
      return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").substring(0, maxLength);
    }
    /**
     * Sanitize page title for use as filename (with accent normalization)
     */
    sanitizePageFilename(title) {
      if (!title) return "page";
      return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").substring(0, 50);
    }
    /**
     * Generate unique identifier with optional prefix
     */
    generateId(prefix = "") {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 8);
      return `${prefix}${timestamp}${random}`.toUpperCase();
    }
    /**
     * Stable identifier used in SCORM/IMS manifests and LOM catalog/entry.
     *
     * Derives from the project's odeIdentifier so the LMS treats updated
     * re-uploads as the same course (preserving learner tracking). Honours
     * an explicit `scormIdentifier` override from project metadata.
     *
     * Resolution order:
     * 1. `meta.scormIdentifier` if set (user override -- used verbatim).
     * 2. `'eXe-MANIFEST-' + meta.odeIdentifier` (default -- shares root with content.xml).
     * 3. `'eXe-MANIFEST-' + generateOdeId()` (fallback for legacy projects).
     *
     * The result is memoized per exporter instance: a single export call must
     * always observe the same manifest identifier so the manifest, the
     * organization identifier and the LOM catalog/entry stay consistent.
     *
     * The returned string is the FINAL `manifest@identifier` value. Manifest
     * generators must use it as-is (i.e. they must NOT prepend their own
     * `eXe-MANIFEST-` prefix).
     *
     * Related: exelearning/exelearning#1785.
     */
    getManifestIdentifier() {
      if (this._manifestIdentifier !== void 0) {
        return this._manifestIdentifier;
      }
      const meta = this.getMetadata();
      if (meta.scormIdentifier) {
        this._manifestIdentifier = meta.scormIdentifier;
      } else if (meta.odeIdentifier) {
        this._manifestIdentifier = "eXe-MANIFEST-" + meta.odeIdentifier;
      } else {
        this._manifestIdentifier = "eXe-MANIFEST-" + generateOdeId();
      }
      return this._manifestIdentifier;
    }
    /**
     * Bare project identifier (without the `eXe-MANIFEST-` prefix).
     *
     * Used for the manifest `organization@identifier` (`eXe-<bareId>`) and
     * for the LOM `catalog/entry` (`ODE-<bareId>`) so a single project
     * identity flows through every artifact in the export.
     */
    getBareProjectIdentifier() {
      const fullId = this.getManifestIdentifier();
      const PREFIX = "eXe-MANIFEST-";
      return fullId.startsWith(PREFIX) ? fullId.slice(PREFIX.length) : fullId;
    }
    // =========================================================================
    // Asset Iteration
    // =========================================================================
    /**
     * Iterate over all assets using the most efficient method available.
     * Uses forEachAsset() when supported (streaming, memory-efficient),
     * otherwise falls back to getAllAssets().
     */
    async forEachAsset(callback) {
      if (this.assets.forEachAsset) {
        await this.assets.forEachAsset(callback);
      } else {
        const assets = await this.assets.getAllAssets();
        for (const asset of assets) {
          await callback(asset);
        }
      }
    }
    // =========================================================================
    // File Handling
    // =========================================================================
    /**
     * Build export filename from metadata
     */
    buildFilename() {
      const meta = this.getMetadata();
      const title = meta.title || "export";
      const sanitized = this.sanitizeFilename(title);
      return `${sanitized}${this.getFileSuffix()}${this.getFileExtension()}`;
    }
    /**
     * Add assets to ZIP
     */
    async addAssetsToZip(prefix = "") {
      let assetsAdded = 0;
      try {
        const processAsset = async (asset) => {
          const assetId = asset.id;
          const filename = asset.filename || `asset-${assetId}`;
          const assetPath = asset.originalPath || `${assetId}/${filename}`;
          const zipPath = prefix ? `${prefix}${assetPath}` : assetPath;
          this.zip.addFile(zipPath, asset.data);
          assetsAdded++;
        };
        await this.forEachAsset(processAsset);
      } catch (e) {
        console.warn("[BaseExporter] Failed to add assets to ZIP:", e);
      }
      return assetsAdded;
    }
    /**
     * Add assets to ZIP with content/resources/ prefix
     * Uses folderPath-based structure for cleaner exports
     *
     * Each asset is written exactly once, under its resolved export path
     * (the friendly filename derived from metadata). HTML and content.xml
     * always reference the same path because both transformations resolve
     * `asset://uuid.ext` URLs through {@link buildAssetExportPathMap}, so a
     * literal `content/resources/<uuid><ext>` URL only appears for genuinely
     * missing assets — and writing the file under that path would not help,
     * because the asset is not in the iteration in the first place.
     *
     * @param trackingList - Optional array to track added file paths (for ELPX manifest)
     */
    async addAssetsToZipWithResourcePath(trackingList) {
      let assetsAdded = 0;
      try {
        this.logElpxExportDebugPhase("exporter:assets-to-zip:start");
        const exportPathMap = await this.buildAssetExportPathMap();
        const processAsset = async (asset) => {
          const exportPath = exportPathMap.get(asset.id);
          if (!exportPath) {
            console.warn(`[BaseExporter] No export path for asset: ${asset.id}`);
            return;
          }
          const zipPath = `content/resources/${exportPath}`;
          if (this.zip.hasFile(zipPath)) {
            return;
          }
          this.zip.addFile(zipPath, asset.data);
          if (trackingList) trackingList.push(zipPath);
          assetsAdded++;
        };
        await this.forEachAsset(processAsset);
        this.logElpxExportDebugPhase("exporter:assets-to-zip:end", {
          assetsAdded,
          exportPaths: exportPathMap.size
        });
      } catch (e) {
        console.warn("[BaseExporter] Failed to add assets to ZIP:", e);
      }
      return assetsAdded;
    }
    // =========================================================================
    // Navigation Helpers
    // =========================================================================
    /**
     * Check if a page is an ancestor of another page
     */
    isAncestorOf(potentialAncestor, childId, allPages) {
      const child = allPages.find((p) => p.id === childId);
      if (!child || !child.parentId) return false;
      if (child.parentId === potentialAncestor.id) return true;
      return this.isAncestorOf(potentialAncestor, child.parentId, allPages);
    }
    /**
     * Get page link (index.html for first page, id.html for others)
     */
    getPageLink(page, allPages, extension = ".html") {
      if (page.id === allPages[0]?.id) {
        return `index${extension}`;
      }
      return `${page.id}${extension}`;
    }
    /**
     * Get previous page in flat list
     */
    getPreviousPage(currentPage, allPages) {
      const currentIndex = allPages.findIndex((p) => p.id === currentPage.id);
      return currentIndex > 0 ? allPages[currentIndex - 1] : null;
    }
    /**
     * Get next page in flat list
     */
    getNextPage(currentPage, allPages) {
      const currentIndex = allPages.findIndex((p) => p.id === currentPage.id);
      return currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null;
    }
    // =========================================================================
    // Asset URL Transformation
    // =========================================================================
    /**
     * Get file extension from MIME type
     */
    getExtensionFromMime(mime) {
      return getExtensionFromMimeType(mime, true);
    }
    /**
     * Build asset filename map for URL transformation
     */
    async buildAssetFilenameMap() {
      if (this.assetFilenameMap) {
        return this.assetFilenameMap;
      }
      this.assetFilenameMap = /* @__PURE__ */ new Map();
      try {
        if (this.assets.listAssetMetadata) {
          const metadata = await this.assets.listAssetMetadata();
          for (const item of metadata) {
            let filename = item.filename;
            if (!filename) {
              const ext = this.getExtensionFromMime(item.mime || "application/octet-stream");
              filename = `asset-${item.id.substring(0, 8)}${ext}`;
            }
            this.assetFilenameMap.set(item.id, filename);
          }
        } else {
          const assets = await this.assets.getAllAssets();
          for (const asset of assets) {
            const id = asset.id;
            let filename = asset.filename;
            if (!filename) {
              const ext = this.getExtensionFromMime(asset.mime || "application/octet-stream");
              filename = `asset-${id.substring(0, 8)}${ext}`;
            }
            this.assetFilenameMap.set(id, filename);
          }
        }
      } catch (e) {
        console.warn("[BaseExporter] Failed to build asset map:", e);
      }
      return this.assetFilenameMap;
    }
    /**
     * Build asset export path map for URL transformation
     * Uses folderPath instead of UUID for cleaner export structure
     * Handles filename collisions by appending counter
     *
     * @returns Map of asset UUID to export path (e.g., "images/photo.jpg" or "photo.jpg" for root)
     */
    async buildAssetExportPathMap() {
      if (this.assetExportPathMap) {
        return this.assetExportPathMap;
      }
      this.assetExportPathMap = /* @__PURE__ */ new Map();
      const usedPaths = /* @__PURE__ */ new Set();
      try {
        this.logElpxExportDebugPhase("exporter:asset-export-map:start");
        const items = this.assets.listAssetMetadata ? await this.assets.listAssetMetadata() : (await this.assets.getAllAssets()).map((a) => ({
          id: a.id,
          filename: a.filename,
          folderPath: a.folderPath,
          mime: a.mime
        }));
        for (const item of items) {
          let folderPath = item.folderPath || "";
          const filename = item.filename && item.filename !== "unknown" ? item.filename : this._deriveFilenameFromMime(item.id, item.mime);
          if (folderPath === filename) {
            folderPath = "";
          } else if (folderPath.endsWith(`/${filename}`)) {
            folderPath = folderPath.slice(0, -(filename.length + 1));
          }
          const basePath = folderPath ? `${folderPath}/${filename}` : filename;
          let finalPath = basePath;
          let counter = 1;
          while (usedPaths.has(finalPath.toLowerCase())) {
            const ext = filename.includes(".") ? "." + filename.split(".").pop() : "";
            const nameWithoutExt = ext ? filename.slice(0, -ext.length) : filename;
            finalPath = folderPath ? `${folderPath}/${nameWithoutExt}_${counter}${ext}` : `${nameWithoutExt}_${counter}${ext}`;
            counter++;
          }
          usedPaths.add(finalPath.toLowerCase());
          this.assetExportPathMap.set(item.id, finalPath);
        }
        this.logElpxExportDebugPhase("exporter:asset-export-map:end", {
          assets: items.length,
          uniquePaths: this.assetExportPathMap.size
        });
      } catch (e) {
        console.warn("[BaseExporter] Failed to build asset export path map:", e);
      }
      return this.assetExportPathMap;
    }
    /**
     * Derive a fallback export filename from MIME type and asset ID.
     * Used when an asset has no filename or has the placeholder value 'unknown'.
     */
    _deriveFilenameFromMime(assetId, mime) {
      return deriveFilenameFromMime(assetId, mime);
    }
    /**
     * Convert asset:// URLs directly to {{context_path}}/content/resources/ format
     * for XML export. This is the single transformation step.
     *
     * Supported input formats:
     * - asset://uuid.ext (new format with extension)
     * - asset://uuid (simple UUID without extension)
     *
     * Output: {{context_path}}/content/resources/{exportPath}
     *
     * Also fixes duplicated filename patterns that may exist in content
     * (e.g., content/resources/file.pdf/file.pdf → content/resources/file.pdf)
     */
    async addFilenamesToAssetUrls(content) {
      if (!content) return "";
      const assetMap = await this.buildAssetExportPathMap();
      let result = content.replace(/asset:\/\/([a-f0-9-]{36})(\.[a-z0-9]+)?/gi, (_match, uuid, ext) => {
        const exportPath = assetMap.get(uuid);
        if (exportPath) {
          return `{{context_path}}/content/resources/${exportPath}`;
        }
        console.warn(
          `[BaseExporter] Unresolved asset reference in HTML; falling back to literal UUID URL: asset://${uuid}${ext || ""}`
        );
        return `{{context_path}}/content/resources/${uuid}${ext || ""}`;
      });
      result = result.replace(/asset:\/\/([^"'\s]+)/g, (_match, assetPath) => {
        if (assetPath.includes("{{context_path}}")) {
          return _match;
        }
        const exportPath = assetMap.get(assetPath) || assetMap.get(`resources/${assetPath}`);
        if (exportPath) {
          return `{{context_path}}/content/resources/${exportPath}`;
        }
        const filename = assetPath.includes("/") ? assetPath.split("/").pop() : assetPath;
        const filenameExportPath = assetMap.get(filename);
        if (filenameExportPath) {
          return `{{context_path}}/content/resources/${filenameExportPath}`;
        }
        return `{{context_path}}/content/resources/${assetPath}`;
      });
      result = result.replace(/content\/resources\/([^/"]+)\/\1(?=["'\s>])/g, "content/resources/$1");
      return result;
    }
    /**
     * Pre-process pages to add filenames to asset URLs in all component content
     * And converts internal links (exe-node:) to proper page URLs
     *
     * Note: exe-package:elp protocol transformation is now done in PageRenderer.renderPageContent()
     * so the XML content keeps the original protocol for re-import compatibility
     */
    async preprocessPagesForExport(pages) {
      const componentCount = pages.reduce((total, page) => {
        const blocks = page.blocks || [];
        return total + blocks.reduce((blockTotal, block) => blockTotal + (block.components?.length || 0), 0);
      }, 0);
      this.logElpxExportDebugPhase("exporter:preprocess-pages:start", {
        pages: pages.length,
        components: componentCount
      });
      const clonedPages = JSON.parse(JSON.stringify(pages));
      const pageUrlMap = this.buildPageUrlMap(clonedPages);
      for (let pageIndex = 0; pageIndex < clonedPages.length; pageIndex++) {
        const page = clonedPages[pageIndex];
        const isIndex = pageIndex === 0;
        for (const block of page.blocks || []) {
          for (const component of block.components || []) {
            if (component.content) {
              component.content = await this.addFilenamesToAssetUrls(component.content);
              component.content = this.replaceInternalLinks(component.content, pageUrlMap, isIndex);
            }
            if (component.properties && Object.keys(component.properties).length > 0) {
              const propsStr = JSON.stringify(component.properties);
              const processedStr = await this.addFilenamesToAssetUrls(propsStr);
              component.properties = JSON.parse(processedStr);
            }
          }
        }
      }
      this.logElpxExportDebugPhase("exporter:preprocess-pages:end", {
        pages: clonedPages.length,
        components: componentCount
      });
      return clonedPages;
    }
    /**
     * Build a map of page IDs to unique filenames
     * Handles collisions by incrementing trailing numbers or appending -1, -2, etc.
     * First page is always index.html, others are {sanitized-title}.html
     *
     * For filenames ending with a number (e.g., "new-page-1"), collisions increment
     * that number (e.g., "new-page-2", "new-page-3") instead of appending another number.
     */
    buildPageFilenameMap(pages) {
      const filenameMap = /* @__PURE__ */ new Map();
      const usedFilenames = /* @__PURE__ */ new Set();
      const maxAttempts = 20;
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        if (i === 0) {
          filenameMap.set(page.id, "index.html");
          usedFilenames.add("index.html");
          continue;
        }
        const baseFilename = this.sanitizePageFilename(page.title);
        let filename = `${baseFilename}.html`;
        if (usedFilenames.has(filename)) {
          const match = baseFilename.match(/^(.*?)-?(\d+)$/);
          if (match) {
            const base = match[1] ? `${match[1]}-` : "";
            const startNum = parseInt(match[2], 10);
            let counter = startNum + 1;
            while (counter <= startNum + maxAttempts) {
              filename = `${base}${counter}.html`;
              if (!usedFilenames.has(filename)) break;
              counter++;
            }
          } else {
            let counter = 2;
            while (usedFilenames.has(filename) && counter <= maxAttempts + 1) {
              filename = `${baseFilename}-${counter}.html`;
              counter++;
            }
          }
        }
        usedFilenames.add(filename);
        filenameMap.set(page.id, filename);
      }
      return filenameMap;
    }
    /**
     * Build a map of page IDs to their export URLs
     * Used for internal link (exe-node:) conversion
     */
    buildPageUrlMap(pages) {
      const map = /* @__PURE__ */ new Map();
      const filenameMap = this.buildPageFilenameMap(pages);
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const filename = filenameMap.get(page.id) || "page.html";
        const isFirstPage = i === 0;
        if (isFirstPage) {
          map.set(page.id, {
            url: "index.html",
            urlFromSubpage: "../index.html"
          });
        } else {
          map.set(page.id, {
            url: `html/${filename}`,
            urlFromSubpage: filename
          });
        }
      }
      return map;
    }
    /**
     * Replace exe-node: internal links with proper page URLs
     *
     * @param content - HTML content
     * @param pageUrlMap - Map of page IDs to their export URLs
     * @param isFromIndex - Whether the content is from the index page (affects relative paths)
     * @returns Content with internal links replaced
     */
    replaceInternalLinks(content, pageUrlMap, isFromIndex) {
      if (!content || !content.includes("exe-node:")) {
        return content;
      }
      return content.replace(/href=["']exe-node:([^"']+)["']/gi, (match, pageIdWithAnchor) => {
        const hashIdx = pageIdWithAnchor.indexOf("#");
        const pageId = hashIdx !== -1 ? pageIdWithAnchor.substring(0, hashIdx) : pageIdWithAnchor;
        const anchorFragment = hashIdx !== -1 ? pageIdWithAnchor.substring(hashIdx) : "";
        const pageUrls = pageUrlMap.get(pageId);
        if (pageUrls) {
          const url = isFromIndex ? pageUrls.url : pageUrls.urlFromSubpage;
          return `href="${url}${anchorFragment}"`;
        }
        console.warn(`[BaseExporter] Internal link target not found: ${pageId}`);
        return match;
      });
    }
    /**
     * Replace exe-package:elp protocol with client-side download handler
     * This enables the download-source-file iDevice to generate ELPX files on-the-fly
     *
     * @param content - HTML content
     * @param projectTitle - Project title for the download filename
     * @returns Content with exe-package:elp replaced with onclick handler
     */
    replaceElpxProtocol(content, projectTitle) {
      if (!content) return "";
      if (!content.includes("exe-package:elp")) {
        return content;
      }
      let result = content.replace(/href="exe-package:elp"/g, `href="#" onclick="${ELPX_DOWNLOAD_ONCLICK}"`);
      const safeTitle = this.escapeXml(projectTitle);
      result = result.replace(/download="exe-package:elp-name"/g, `download="${safeTitle}.elpx"`);
      return result;
    }
    /**
     * Collect all HTML content from all pages (for library detection)
     */
    collectAllHtmlContent(pages) {
      const htmlParts = [];
      for (const page of pages) {
        for (const block of page.blocks || []) {
          for (const component of block.components || []) {
            if (component.content) {
              htmlParts.push(component.content);
            }
          }
        }
      }
      return htmlParts.join("\n");
    }
    /**
     * Yield component HTML fragments lazily so callers can detect libraries
     * without building one giant intermediate string.
     */
    *iteratePageContentFragments(pages) {
      for (const page of pages) {
        for (const block of page.blocks || []) {
          for (const component of block.components || []) {
            if (component.content) {
              yield component.content;
            }
          }
        }
      }
    }
    /**
     * Detect required libraries across all page fragments incrementally.
     */
    getRequiredLibraryFilesForPages(pages, options = {}) {
      return this.libraryDetector.getAllRequiredFilesWithPatternsFromFragments(
        this.iteratePageContentFragments(pages),
        options
      );
    }
    // =========================================================================
    // Download Source File iDevice Detection
    // =========================================================================
    /**
     * Check if any page contains the download-source-file iDevice
     * (needs ELPX manifest for client-side ZIP recreation)
     */
    needsElpxDownloadSupport(pages) {
      return pages.some((page) => this.pageHasDownloadSourceFile(page));
    }
    /**
     * Check if a specific page contains the download-source-file iDevice
     * or a manual link using exe-package:elp protocol
     */
    pageHasDownloadSourceFile(page) {
      for (const block of page.blocks || []) {
        for (const component of block.components || []) {
          const type = (component.type || "").toLowerCase();
          if (type.includes("download-source-file") || type.includes("downloadsourcefile")) {
            return true;
          }
          if (component.content?.includes("exe-download-package-link")) {
            return true;
          }
          if (component.content?.includes("exe-package:elp")) {
            return true;
          }
        }
      }
      return false;
    }
    static {
      // =========================================================================
      // ELPX Download Support (for download-source-file iDevice)
      // =========================================================================
      /** Library files required for client-side ELPX download */
      this.ELPX_LIB_FILES = ["fflate/fflate.umd.js", "exe_elpx_download/exe_elpx_download.js"];
    }
    /**
     * Ensure ELPX download libraries (fflate, exe_elpx_download) are present in the ZIP.
     * Call after library detection step so we only fetch what's missing.
     */
    async ensureElpxDownloadLibraries(addFile, commonFiles) {
      const missingLibs = _BaseExporter.ELPX_LIB_FILES.filter((f) => !this.zip.hasFile(`libs/${f}`));
      if (missingLibs.length === 0) return;
      try {
        const libContents = await this.resources.fetchLibraryFiles(missingLibs);
        for (const [libPath, content] of libContents) {
          addFile(`libs/${libPath}`, content);
          if (commonFiles) commonFiles.push(`libs/${libPath}`);
        }
      } catch {
      }
    }
    /**
     * Generate ELPX manifest and add it to the ZIP.
     * Also adds HTML page paths to the file list before generating.
     *
     * @param fileList - Tracked file paths to include in manifest
     * @param pageFileUrls - HTML page file URLs to add to the file list
     * @param commonFiles - Optional SCORM/IMS common files array to update
     */
    addElpxManifestToZip(fileList, pageFileUrls, commonFiles) {
      for (const url of pageFileUrls) {
        if (!fileList.includes(url)) {
          fileList.push(url);
        }
      }
      fileList.push("libs/elpx-manifest.js");
      const manifestJs = this.generateElpxManifestFile(fileList);
      this.zip.addFile("libs/elpx-manifest.js", manifestJs);
      if (commonFiles) commonFiles.push("libs/elpx-manifest.js");
    }
    /**
     * Inject ELPX download script tags into HTML before </body> for pages
     * that contain download-source-file iDevice or exe-package:elp links.
     *
     * @returns Modified HTML with injected scripts, or original HTML if not applicable
     */
    injectElpxScripts(html, page, isIndex) {
      if (!this.pageHasDownloadSourceFile(page)) return html;
      const basePath = isIndex ? "" : "../";
      const fflateScript = `<script src="${basePath}libs/fflate/fflate.umd.js"> <\/script>`;
      const elpxDownloadScript = `<script src="${basePath}libs/exe_elpx_download/exe_elpx_download.js"> <\/script>`;
      const manifestScript = `<script src="${basePath}libs/elpx-manifest.js"> <\/script>`;
      return html.replace(/<\/body>/i, `${fflateScript}
${elpxDownloadScript}
${manifestScript}
</body>`);
    }
    /**
     * Generate ELPX manifest as a standalone JS file
     * Used for HTML5 exports where the manifest is a separate file
     *
     * @param fileList - List of file paths in the export
     * @returns JavaScript file content
     */
    generateElpxManifestFile(fileList) {
      const manifest = {
        version: 1,
        files: fileList,
        projectTitle: this.getMetadata().title || "eXeLearning-project"
      };
      return `/**
 * ELPX Manifest - Auto-generated for download-source-file iDevice
 * Used by exe_elpx_download.js to recreate the complete export package
 */
window.__ELPX_MANIFEST__=${JSON.stringify(manifest, null, 2)};
`;
    }
    // =========================================================================
    // Content XML Generation (for re-import capability)
    // =========================================================================
    /**
     * Generate content.xml from document structure
     * Uses unified OdeXmlGenerator for consistent output across all exporters
     *
     * @param preprocessedPages - Optional preprocessed pages (with asset URLs already transformed).
     *                            If not provided, uses raw navigation from document.
     */
    generateContentXml(preprocessedPages) {
      const metadata = this.getMetadata();
      const pages = preprocessedPages || this.getNavigation();
      return generateOdeXml(metadata, pages);
    }
    // =========================================================================
    // Fallback Styles (used when resources can't be fetched)
    // =========================================================================
    /**
     * Get fallback theme CSS
     */
    getFallbackThemeCss() {
      return `/* Default theme CSS */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  margin: 0;
  padding: 0;
  line-height: 1.6;
}
`;
    }
    /**
     * Get fallback theme JS
     */
    getFallbackThemeJs() {
      return `// Default theme JS
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    // Theme initialization
    console.log('[Theme] Default theme loaded');
  });
})();
`;
    }
  };

  // src/shared/export/utils/GlobalFontGenerator.ts
  var GLOBAL_FONTS = {
    opendyslexic: {
      id: "opendyslexic",
      displayName: "OpenDyslexic",
      fontFamily: "OpenDyslexic",
      fallback: "serif",
      files: [
        { weight: 400, style: "normal", filename: "OpenDyslexic-Regular.woff", format: "woff" },
        { weight: 400, style: "italic", filename: "OpenDyslexic-Italic.woff", format: "woff" },
        { weight: 700, style: "normal", filename: "OpenDyslexic-Bold.woff", format: "woff" },
        { weight: 700, style: "italic", filename: "OpenDyslexic-BoldItalic.woff", format: "woff" }
      ]
    },
    andika: {
      id: "andika",
      displayName: "Andika",
      fontFamily: "Andika",
      fallback: "sans-serif",
      files: [
        { weight: 400, style: "normal", filename: "Andika-Regular.woff2", format: "woff2" },
        { weight: 400, style: "italic", filename: "Andika-Italic.woff2", format: "woff2" },
        { weight: 700, style: "normal", filename: "Andika-Bold.woff2", format: "woff2" },
        { weight: 700, style: "italic", filename: "Andika-BoldItalic.woff2", format: "woff2" }
      ]
    },
    "atkinson-hyperlegible-next": {
      id: "andika",
      displayName: "Atkinson Hyperlegible Next",
      fontFamily: "Atkinson Hyperlegible Next",
      fallback: "sans-serif",
      files: [
        { weight: 400, style: "normal", filename: "AtkinsonHyperlegibleNext-Regular.woff2", format: "woff2" },
        { weight: 400, style: "italic", filename: "AtkinsonHyperlegibleNext-RegularItalic.woff2", format: "woff2" },
        { weight: 700, style: "normal", filename: "AtkinsonHyperlegibleNext-Bold.woff2", format: "woff2" },
        { weight: 700, style: "italic", filename: "AtkinsonHyperlegibleNext-BoldItalic.woff2", format: "woff2" }
      ]
    },
    nunito: {
      id: "nunito",
      displayName: "Nunito",
      fontFamily: "Nunito",
      fallback: "sans-serif",
      files: [
        { weight: 400, style: "normal", filename: "Nunito-Regular.woff2", format: "woff2" },
        { weight: 400, style: "italic", filename: "Nunito-Italic.woff2", format: "woff2" },
        { weight: 700, style: "normal", filename: "Nunito-Bold.woff2", format: "woff2" },
        { weight: 700, style: "italic", filename: "Nunito-BoldItalic.woff2", format: "woff2" }
      ]
    },
    "playwrite-es": {
      id: "playwrite-es",
      displayName: "Playwrite ES",
      fontFamily: "Playwrite ES",
      fallback: "cursive, sans-serif",
      files: [
        {
          weight: 400,
          style: "normal",
          filename: "PlaywriteES-Regular.woff2",
          format: "woff2"
        }
      ],
      lineHeight: "2em"
    }
  };
  var FONT_SELECTORS = "body, main, article, .exe-content, .iDevice_wrapper, .idevice-content";
  function buildFontCss(fontConfig, fontPath, label) {
    let css = `/* Global Font: ${fontConfig.displayName}${label} */
`;
    for (const file of fontConfig.files) {
      css += `@font-face {
    font-family: '${fontConfig.fontFamily}';
    font-style: ${file.style};
    font-weight: ${file.weight};
    font-display: swap;
    src: url('${fontPath}${file.filename}') format('${file.format}');
}
`;
    }
    const lineHeightRule = fontConfig.lineHeight ? `
    line-height: ${fontConfig.lineHeight} !important;` : "";
    css += `
${FONT_SELECTORS} {
    font-family: '${fontConfig.fontFamily}', ${fontConfig.fallback} !important;${lineHeightRule}
}
`;
    if (fontConfig.attribution) {
      css += `/* ${fontConfig.attribution} */
`;
    }
    return css;
  }
  var GlobalFontGenerator = class {
    /**
     * Check if a font ID is valid
     */
    static isValidFont(fontId) {
      return fontId !== "default" && fontId in GLOBAL_FONTS;
    }
    /**
     * Get font configuration
     */
    static getFontConfig(fontId) {
      return GLOBAL_FONTS[fontId] || null;
    }
    /**
     * Generate CSS for global font including @font-face rules and body style
     * @param fontId - Font identifier (e.g., 'opendyslexic')
     * @param basePath - Base path for font URLs (e.g., '' for index, '../' for subpages)
     * @returns CSS string or empty string if font is 'default'
     */
    static generateCss(fontId, basePath = "") {
      if (!fontId || fontId === "default") {
        return "";
      }
      const fontConfig = GLOBAL_FONTS[fontId];
      if (!fontConfig) {
        console.warn(`[GlobalFontGenerator] Unknown font: ${fontId}`);
        return "";
      }
      return buildFontCss(fontConfig, `${basePath}fonts/global/${fontId}/`, "");
    }
    /**
     * Generate CSS for preview (uses absolute server URLs)
     * @param fontId - Font identifier
     * @param serverBasePath - Server base path (e.g., '/files/perm')
     * @returns CSS string
     */
    static generatePreviewCss(fontId, serverBasePath = "/files/perm") {
      if (!fontId || fontId === "default") {
        return "";
      }
      const fontConfig = GLOBAL_FONTS[fontId];
      if (!fontConfig) {
        return "";
      }
      return buildFontCss(fontConfig, `${serverBasePath}/fonts/global/${fontId}/`, " (Preview)");
    }
    /**
     * Get list of font file paths to include in export
     * @param fontId - Font identifier
     * @returns Array of relative file paths
     */
    static getFontFilePaths(fontId) {
      const fontConfig = GLOBAL_FONTS[fontId];
      if (!fontConfig) {
        return [];
      }
      return fontConfig.files.map((f) => `fonts/global/${fontId}/${f.filename}`);
    }
    /**
     * Get attribution text for a font
     */
    static getAttribution(fontId) {
      return GLOBAL_FONTS[fontId]?.attribution || null;
    }
    /**
     * Get all available font IDs (excluding 'default')
     */
    static getAvailableFontIds() {
      return Object.keys(GLOBAL_FONTS);
    }
    /**
     * Get CSS class name for body element based on font
     * @param fontId - Font identifier
     * @returns CSS class name (e.g., 'exe-global-font-playwrite-es') or empty string if default
     */
    static getBodyClassName(fontId) {
      if (!fontId || fontId === "default") {
        return "";
      }
      return `exe-global-font-${fontId}`;
    }
  };

  // src/shared/export/exporters/Html5Exporter.ts
  var Html5Exporter = class extends BaseExporter {
    getBrowserLatexPreRenderer() {
      const browserGlobal = globalThis;
      return browserGlobal.window?.LatexPreRenderer || null;
    }
    /**
     * Get file extension for HTML5 format
     */
    getFileExtension() {
      return ".zip";
    }
    /**
     * Get file suffix for HTML5 format
     */
    getFileSuffix() {
      return "_web";
    }
    /**
     * Export to HTML5 ZIP
     */
    async export(options) {
      const exportFilename = options?.filename || this.buildFilename();
      const html5Options = options;
      try {
        let pages = this.buildPageList();
        const meta = this.getMetadata();
        const themeName = html5Options?.theme || meta.theme || "base";
        const needsElpxDownload = this.needsElpxDownloadSupport(pages);
        pages = await this.preprocessPagesForExport(pages);
        const pageFilenameMap = this.buildPageFilenameMap(pages);
        const fileList = needsElpxDownload ? [] : null;
        const addFile = (path, content) => {
          this.zip.addFile(path, content);
          if (fileList) fileList.push(path);
        };
        const {
          themeFilesMap,
          themeRootFiles,
          faviconInfo: detectedFavicon
        } = await this.prepareThemeData(themeName);
        if (themeFilesMap) {
          console.log(`[Html5Exporter] Theme '${themeName}' files count: ${themeFilesMap.size}`);
        }
        const faviconInfo = html5Options?.faviconPath ? { path: html5Options.faviconPath, type: html5Options.faviconType || "image/x-icon" } : detectedFavicon;
        const assetExportPathMap = await this.buildAssetExportPathMap();
        const navLabels = await this.fetchNavLabels(meta.language || "en", meta.license);
        let latexWasRendered = false;
        let mermaidWasRendered = false;
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          let html = this.generatePageHtml(
            page,
            pages,
            meta,
            i === 0,
            i,
            themeRootFiles,
            faviconInfo,
            pageFilenameMap,
            assetExportPathMap,
            navLabels
          );
          if (!meta.addMathJax) {
            const preRenderDataGameLatex = options?.preRenderDataGameLatex || this.getBrowserLatexPreRenderer()?.preRenderDataGameLatex;
            if (preRenderDataGameLatex) {
              try {
                const result = await preRenderDataGameLatex(html);
                if (result.count > 0) {
                  html = result.html;
                  latexWasRendered = true;
                  console.log(
                    `[Html5Exporter] Pre-rendered LaTeX in ${result.count} DataGame(s) on page: ${page.title}`
                  );
                }
              } catch (error) {
                console.warn(
                  "[Html5Exporter] DataGame LaTeX pre-render failed for page:",
                  page.title,
                  error
                );
              }
            }
            const preRenderLatex = options?.preRenderLatex || this.getBrowserLatexPreRenderer()?.preRender;
            if (preRenderLatex) {
              try {
                const result = await preRenderLatex(html);
                if (result.latexRendered) {
                  html = result.html;
                  latexWasRendered = true;
                  console.log(
                    `[Html5Exporter] Pre-rendered ${result.count} LaTeX expressions on page: ${page.title}`
                  );
                }
              } catch (error) {
                console.warn("[Html5Exporter] LaTeX pre-render failed for page:", page.title, error);
              }
            }
          }
          if (options?.preRenderMermaid) {
            try {
              const result = await options.preRenderMermaid(html);
              if (result.mermaidRendered) {
                html = result.html;
                mermaidWasRendered = true;
                console.log(
                  `[Html5Exporter] Pre-rendered ${result.count} Mermaid diagram(s) on page: ${page.title}`
                );
              }
            } catch (error) {
              console.warn("[Html5Exporter] Mermaid pre-render failed for page:", page.title, error);
            }
          }
          if (needsElpxDownload && this.pageHasDownloadSourceFile(page)) {
            const basePath = i === 0 ? "" : "../";
            const manifestScriptTag = `<script src="${basePath}libs/elpx-manifest.js"> <\/script>`;
            html = html.replace(/<\/body>/i, `${manifestScriptTag}
</body>`);
          }
          const pageUniqueFilename = pageFilenameMap.get(page.id) || "page.html";
          const filename = i === 0 ? "index.html" : `html/${pageUniqueFilename}`;
          this.zip.addFile(filename, html);
          if (fileList) fileList.push(filename);
        }
        if (meta.addSearchBox) {
          const searchIndexContent = this.pageRenderer.generateSearchIndexFile(pages, "", pageFilenameMap);
          addFile("search_index.js", searchIndexContent);
        }
        if (meta.exportSource !== false) {
          const contentXml = this.generateContentXml(pages);
          addFile("content.xml", contentXml);
        }
        const contentCssFiles = await this.resources.fetchContentCss();
        let baseCss = contentCssFiles.get("content/css/base.css");
        if (!baseCss) {
          throw new Error("Failed to fetch content/css/base.css");
        }
        if (latexWasRendered || mermaidWasRendered) {
          const decoder = new TextDecoder();
          let baseCssText = decoder.decode(baseCss);
          if (latexWasRendered) {
            baseCssText += "\n" + this.getPreRenderedLatexCss();
          }
          if (mermaidWasRendered) {
            baseCssText += "\n" + this.getPreRenderedMermaidCss();
          }
          const encoder = new TextEncoder();
          baseCss = encoder.encode(baseCssText);
        }
        addFile("content/css/base.css", baseCss);
        try {
          const logoData = await this.resources.fetchExeLogo();
          if (logoData) {
            addFile("content/img/exe_powered_logo.png", logoData);
          }
        } catch {
        }
        if (themeFilesMap) {
          for (const [filePath, content] of themeFilesMap) {
            console.log(`[Html5Exporter] Adding theme file: theme/${filePath}`);
            addFile(`theme/${filePath}`, content);
          }
        } else {
          addFile("theme/style.css", this.getFallbackThemeCss());
          addFile("theme/style.js", this.getFallbackThemeJs());
        }
        try {
          const baseLibs = await this.resources.fetchBaseLibraries();
          for (const [libPath, content] of baseLibs) {
            addFile(`libs/${libPath}`, content);
          }
        } catch {
        }
        const i18nContent = await this.generateI18nContent(meta.language || "en");
        addFile("libs/common_i18n.js", new TextEncoder().encode(i18nContent));
        const { files: allRequiredFiles, patterns } = this.getRequiredLibraryFilesForPages(pages, {
          includeAccessibilityToolbar: meta.addAccessibilityToolbar === true,
          includeMathJax: meta.addMathJax === true,
          skipMathJax: latexWasRendered && !meta.addMathJax
        });
        if (latexWasRendered) {
          console.log("[Html5Exporter] LaTeX pre-rendered - skipping MathJax library (~1MB saved)");
        }
        try {
          const libFiles = await this.resources.fetchLibraryFiles(allRequiredFiles, patterns);
          for (const [libPath, content] of libFiles) {
            const zipPath = `libs/${libPath}`;
            if (!this.zip.hasFile(zipPath)) {
              addFile(zipPath, content);
            }
          }
        } catch {
        }
        const usedIdevices = this.getUsedIdevices(pages);
        for (const idevice of usedIdevices) {
          try {
            const normalizedType = this.resources.normalizeIdeviceType(idevice);
            const ideviceFiles = await this.resources.fetchIdeviceResources(idevice);
            for (const [filePath, content] of ideviceFiles) {
              addFile(`idevices/${normalizedType}/${filePath}`, content);
            }
          } catch {
          }
        }
        if (meta.globalFont && meta.globalFont !== "default") {
          try {
            const fontFiles = await this.resources.fetchGlobalFontFiles(meta.globalFont);
            if (fontFiles) {
              for (const [filePath, content] of fontFiles) {
                addFile(filePath, content);
              }
              console.log(
                `[Html5Exporter] Added ${fontFiles.size} global font files for: ${meta.globalFont}`
              );
            }
          } catch (e) {
            console.warn(`[Html5Exporter] Failed to fetch global font files: ${meta.globalFont}`, e);
          }
        }
        await this.addAssetsToZipWithResourcePath(fileList);
        if (needsElpxDownload && fileList) {
          fileList.push("libs/elpx-manifest.js");
          const manifestJs = this.generateElpxManifestFile(fileList);
          this.zip.addFile("libs/elpx-manifest.js", manifestJs);
        }
        const buffer = await this.zip.generateAsync();
        return {
          success: true,
          filename: exportFilename,
          data: buffer
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
    /**
     * Generate complete HTML for a page
     * @param page - Page data
     * @param allPages - All pages in the project
     * @param meta - Project metadata
     * @param isIndex - Whether this is the index page
     * @param pageIndex - Page index for page counter
     * @param themeFiles - List of root-level theme CSS/JS files
     * @param faviconInfo - Favicon info (optional)
     * @param pageFilenameMap - Map of page IDs to unique filenames (optional, handles title collisions)
     * @param assetExportPathMap - Map of asset UUID to export path for URL transformation
     */
    generatePageHtml(page, allPages, meta, isIndex, pageIndex, themeFiles, faviconInfo, pageFilenameMap, assetExportPathMap, navLabels) {
      const basePath = isIndex ? "" : "../";
      const usedIdevices = this.getUsedIdevicesForPage(page);
      const currentPageIndex = pageIndex ?? allPages.findIndex((p) => p.id === page.id);
      let customStyles = meta.customStyles || "";
      let bodyClass = "exe-export exe-web-site";
      if (meta.globalFont && meta.globalFont !== "default") {
        const globalFontCss = GlobalFontGenerator.generateCss(meta.globalFont, basePath);
        if (globalFontCss) {
          customStyles = globalFontCss + "\n" + customStyles;
        }
        const fontBodyClass = GlobalFontGenerator.getBodyClassName(meta.globalFont);
        if (fontBodyClass) {
          bodyClass += ` ${fontBodyClass}`;
        }
      }
      return this.pageRenderer.render(page, {
        projectTitle: meta.title || "eXeLearning",
        projectSubtitle: meta.subtitle || "",
        language: meta.language || "en",
        theme: meta.theme || "base",
        customStyles,
        bodyClass,
        allPages,
        basePath,
        isIndex,
        usedIdevices,
        author: meta.author || "",
        license: meta.license || "",
        description: meta.description || "",
        licenseUrl: meta.licenseUrl || "",
        // Page counter options
        totalPages: allPages.length,
        currentPageIndex,
        userFooterContent: meta.footer,
        // Export options
        addExeLink: meta.addExeLink ?? true,
        addPagination: meta.addPagination ?? false,
        addSearchBox: meta.addSearchBox ?? false,
        addAccessibilityToolbar: meta.addAccessibilityToolbar ?? false,
        addMathJax: meta.addMathJax ?? false,
        // Custom head content
        extraHeadContent: meta.extraHeadContent,
        // Theme files for HTML head includes
        themeFiles: themeFiles || [],
        // Favicon options
        faviconPath: faviconInfo?.path,
        faviconType: faviconInfo?.type,
        // Page filename map for navigation links (handles title collisions)
        pageFilenameMap,
        // Asset URL transformation map
        assetExportPathMap,
        // Application version for generator meta tag
        version: meta.exelearningVersion,
        // Pre-translated nav button labels (resolved from XLF at export time)
        navLabels
      });
    }
    /**
     * Detect theme-specific favicon from theme files map
     * @param themeFilesMap - Map of theme files
     * @returns Favicon info or null if not found
     */
    detectFavicon(themeFilesMap) {
      if (themeFilesMap.has("img/favicon.ico")) {
        return { path: "theme/img/favicon.ico", type: "image/x-icon" };
      }
      if (themeFilesMap.has("img/favicon.png")) {
        return { path: "theme/img/favicon.png", type: "image/png" };
      }
      return null;
    }
    /**
     * Prepare theme data for export: fetch theme files, extract root-level CSS/JS, detect favicon
     * @param themeName - Name of the theme to fetch
     * @returns ThemeData with files, root files list, and favicon info
     */
    async prepareThemeData(themeName) {
      const themeRootFiles = [];
      let themeFilesMap = null;
      let faviconInfo = null;
      try {
        themeFilesMap = await this.resources.fetchTheme(themeName);
        for (const [filePath] of themeFilesMap) {
          if (!filePath.includes("/") && (filePath.endsWith(".css") || filePath.endsWith(".js"))) {
            themeRootFiles.push(filePath);
          }
        }
        faviconInfo = this.detectFavicon(themeFilesMap);
      } catch (e) {
        console.warn(`[Html5Exporter] Failed to fetch theme: ${themeName}`, e);
        themeRootFiles.push("style.css", "style.js");
      }
      this.ideviceRenderer.setThemeIconFiles(themeFilesMap);
      return { themeFilesMap, themeRootFiles, faviconInfo };
    }
    /**
     * Get page link for HTML5 export
     */
    getPageLinkForHtml5(page, allPages, basePath) {
      const isFirstPage = page.id === allPages[0]?.id;
      if (isFirstPage) {
        return basePath ? `${basePath}index.html` : "index.html";
      }
      const filename = this.sanitizePageFilename(page.title);
      return `${basePath}html/${filename}.html`;
    }
    /**
     * Get CSS for pre-rendered LaTeX (SVG+MathML)
     * This CSS is needed when LaTeX is pre-rendered instead of using MathJax at runtime
     */
    getPreRenderedLatexCss() {
      return `/* Pre-rendered LaTeX (SVG+MathML) - MathJax not included */
.exe-math-rendered { display: inline-block; vertical-align: middle; }
.exe-math-rendered[data-display="block"] { display: block; text-align: center; margin: 1em 0; }
.exe-math-rendered svg { vertical-align: middle; max-width: 100%; height: auto; }
/* Fix for MathJax array/table borders - SVG has stroke-width:0 which hides lines */
.exe-math-rendered svg line.mjx-solid { stroke-width: 60 !important; }
.exe-math-rendered svg rect[data-frame="true"] { fill: none; stroke-width: 60 !important; }
/* Hide MathML visually but keep accessible for screen readers */
.exe-math-rendered math { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }`;
    }
    /**
     * Get CSS for pre-rendered Mermaid diagrams (static SVG)
     * This CSS is needed when Mermaid is pre-rendered instead of using the library at runtime
     */
    getPreRenderedMermaidCss() {
      return `/* Pre-rendered Mermaid (static SVG) - Mermaid library not included */
.exe-mermaid-rendered { display: block; text-align: center; margin: 1.5em 0; }
.exe-mermaid-rendered svg { max-width: 100%; height: auto; }`;
    }
    /**
     * Generate preview files map (for Service Worker-based preview)
     * Returns a map of file paths to transferable ArrayBuffers
     * Same structure as ZIP export but without creating the archive
     *
     * This enables unified preview/export rendering using the eXeViewer approach:
     * - Preview uses Service Worker to serve files from memory
     * - Files are the same as what would be in the HTML5 export
     * - No blob:// URLs, no special preview rendering path
     */
    async generateForPreview(options) {
      const files = /* @__PURE__ */ new Map();
      try {
        let pages = this.buildPageList();
        const meta = this.getMetadata();
        const themeName = options?.theme || meta.theme || "base";
        const needsElpxDownload = this.needsElpxDownloadSupport(pages);
        pages = await this.preprocessPagesForExport(pages);
        const pageFilenameMap = this.buildPageFilenameMap(pages);
        const fileList = needsElpxDownload ? [] : null;
        const addFile = (path, content) => {
          files.set(path, this.toPreviewArrayBuffer(content));
          if (fileList) fileList.push(path);
        };
        const {
          themeFilesMap,
          themeRootFiles,
          faviconInfo: detectedFavicon
        } = await this.prepareThemeData(themeName);
        const faviconInfo = options?.faviconPath ? { path: options.faviconPath, type: options.faviconType || "image/x-icon" } : detectedFavicon;
        const assetExportPathMap = await this.buildAssetExportPathMap();
        const navLabels = await this.fetchNavLabels(meta.language || "en", meta.license);
        const pageEntries = [];
        let latexWasRendered = false;
        let mermaidWasRendered = false;
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          let html = this.generatePageHtml(
            page,
            pages,
            meta,
            i === 0,
            i,
            themeRootFiles,
            faviconInfo,
            pageFilenameMap,
            assetExportPathMap,
            navLabels
          );
          if (!meta.addMathJax) {
            const preRenderDataGameLatex = options?.preRenderDataGameLatex || this.getBrowserLatexPreRenderer()?.preRenderDataGameLatex;
            if (preRenderDataGameLatex) {
              try {
                const result = await preRenderDataGameLatex(html);
                if (result.count > 0) {
                  html = result.html;
                  latexWasRendered = true;
                }
              } catch {
              }
            }
            const preRenderLatex = options?.preRenderLatex || this.getBrowserLatexPreRenderer()?.preRender;
            if (preRenderLatex) {
              try {
                const result = await preRenderLatex(html);
                if (result.latexRendered) {
                  html = result.html;
                  latexWasRendered = true;
                }
              } catch {
              }
            }
          }
          if (options?.preRenderMermaid) {
            try {
              const result = await options.preRenderMermaid(html);
              if (result.mermaidRendered) {
                html = result.html;
                mermaidWasRendered = true;
              }
            } catch {
            }
          }
          const uniqueFilename = pageFilenameMap.get(page.id) || "page.html";
          const filename = i === 0 ? "index.html" : `html/${uniqueFilename}`;
          pageEntries.push({ filename, html, page, index: i });
        }
        if (meta.addSearchBox) {
          const searchIndexContent = this.pageRenderer.generateSearchIndexFile(pages, "", pageFilenameMap);
          addFile("search_index.js", searchIndexContent);
        }
        const contentCssFiles = await this.resources.fetchContentCss();
        let baseCss = contentCssFiles.get("content/css/base.css");
        if (baseCss) {
          if (latexWasRendered || mermaidWasRendered) {
            const decoder = new TextDecoder();
            let baseCssText = decoder.decode(baseCss);
            if (latexWasRendered) {
              baseCssText += "\n" + this.getPreRenderedLatexCss();
            }
            if (mermaidWasRendered) {
              baseCssText += "\n" + this.getPreRenderedMermaidCss();
            }
            const encoder = new TextEncoder();
            baseCss = encoder.encode(baseCssText);
          }
          addFile("content/css/base.css", baseCss);
        }
        try {
          const logoData = await this.resources.fetchExeLogo();
          if (logoData) {
            addFile("content/img/exe_powered_logo.png", logoData);
          }
        } catch {
        }
        if (themeFilesMap) {
          for (const [filePath, content] of themeFilesMap) {
            addFile(`theme/${filePath}`, content);
          }
        } else {
          const encoder = new TextEncoder();
          addFile("theme/style.css", encoder.encode(this.getFallbackThemeCss()));
          addFile("theme/style.js", encoder.encode(this.getFallbackThemeJs()));
        }
        try {
          const baseLibs = await this.resources.fetchBaseLibraries();
          for (const [libPath, content] of baseLibs) {
            addFile(`libs/${libPath}`, content);
          }
        } catch {
        }
        const i18nContent = await this.generateI18nContent(meta.language || "en");
        addFile("libs/common_i18n.js", new TextEncoder().encode(i18nContent));
        const { files: allRequiredFiles, patterns } = this.getRequiredLibraryFilesForPages(pages, {
          includeAccessibilityToolbar: meta.addAccessibilityToolbar === true,
          includeMathJax: meta.addMathJax === true,
          skipMathJax: latexWasRendered && !meta.addMathJax
        });
        try {
          const libFiles = await this.resources.fetchLibraryFiles(allRequiredFiles, patterns);
          for (const [libPath, content] of libFiles) {
            const filePath = `libs/${libPath}`;
            if (!files.has(filePath)) {
              addFile(filePath, content);
            }
          }
        } catch {
        }
        const usedIdevices = this.getUsedIdevices(pages);
        for (const idevice of usedIdevices) {
          try {
            const normalizedType = this.resources.normalizeIdeviceType(idevice);
            const ideviceFiles = await this.resources.fetchIdeviceResources(idevice);
            for (const [filePath, content] of ideviceFiles) {
              addFile(`idevices/${normalizedType}/${filePath}`, content);
            }
          } catch {
          }
        }
        if (meta.globalFont && meta.globalFont !== "default") {
          try {
            const fontFiles = await this.resources.fetchGlobalFontFiles(meta.globalFont);
            if (fontFiles) {
              for (const [filePath, content] of fontFiles) {
                addFile(filePath, content);
              }
              console.log(
                `[Html5Exporter] Added ${fontFiles.size} global font files for preview: ${meta.globalFont}`
              );
            }
          } catch (e) {
            console.warn(
              `[Html5Exporter] Failed to fetch global font files for preview: ${meta.globalFont}`,
              e
            );
          }
        }
        await this.addAssetsToPreviewFiles(files, fileList);
        if (needsElpxDownload && fileList) {
          for (const entry of pageEntries) {
            if (!fileList.includes(entry.filename)) {
              fileList.push(entry.filename);
            }
          }
          fileList.push("libs/elpx-manifest.js");
          const manifestJs = this.generateElpxManifestFile(fileList);
          addFile("libs/elpx-manifest.js", manifestJs);
          const elpxLibFiles = ["fflate/fflate.umd.js", "exe_elpx_download/exe_elpx_download.js"];
          const missingLibs = elpxLibFiles.filter((f) => !files.has(`libs/${f}`));
          if (missingLibs.length > 0) {
            try {
              const libContents = await this.resources.fetchLibraryFiles(missingLibs);
              for (const [libPath, content] of libContents) {
                addFile(`libs/${libPath}`, content);
              }
            } catch {
            }
          }
        }
        for (const entry of pageEntries) {
          let { html } = entry;
          if (needsElpxDownload) {
            html = this.injectElpxScripts(html, entry.page, entry.index === 0);
          }
          addFile(entry.filename, html);
        }
        return files;
      } catch (error) {
        console.error("[Html5Exporter] generateForPreview failed:", error);
        throw error;
      }
    }
    /**
     * Add project assets to preview files map
     */
    async addAssetsToPreviewFiles(files, trackingList) {
      let assetsAdded = 0;
      try {
        const exportPathMap = await this.buildAssetExportPathMap();
        const processAsset = async (asset) => {
          const exportPath = exportPathMap.get(asset.id);
          if (!exportPath) return;
          const filePath = `content/resources/${exportPath}`;
          files.set(filePath, await this.toPreviewAssetBuffer(asset.data));
          if (trackingList) trackingList.push(filePath);
          assetsAdded++;
        };
        await this.forEachAsset(processAsset);
      } catch (e) {
        console.warn("[Html5Exporter] Failed to add assets to preview files:", e);
      }
      return assetsAdded;
    }
    toPreviewArrayBuffer(content) {
      if (content instanceof ArrayBuffer) {
        return content;
      }
      if (typeof content === "string") {
        return new TextEncoder().encode(content).buffer;
      }
      if (content.byteOffset === 0 && content.byteLength === content.buffer.byteLength) {
        return content.buffer;
      }
      return content.buffer.slice(content.byteOffset, content.byteOffset + content.byteLength);
    }
    async toPreviewAssetBuffer(content) {
      if (content instanceof Blob) {
        return content.arrayBuffer();
      }
      return this.toPreviewArrayBuffer(content);
    }
  };

  // src/shared/export/exporters/PageExporter.ts
  var NAMED_ANCHOR_RE = /<a\s+(?=[^>]*(?:\bid\b|\bname\b)=)(?![^>]*\bhref\b=)[^>]*>/gi;
  var ID_NAME_ATTR_RE = /\b(id|name)="([^"]+)"/gi;
  var PageExporter = class extends Html5Exporter {
    /**
     * Get file suffix for PAGE format
     */
    getFileSuffix() {
      return "_page";
    }
    /**
     * Export to single-page HTML ZIP
     */
    async export(options) {
      const exportFilename = options?.filename || this.buildFilename();
      try {
        let pages = this.buildPageList();
        const meta = this.getMetadata();
        const themeName = options?.theme || meta.theme || "base";
        pages = await this.preprocessPagesForExport(pages);
        pages = pages.filter((p) => this.isPageVisible(p, pages));
        const usedIdevices = this.getUsedIdevices(pages);
        const { themeFilesMap, faviconInfo } = await this.prepareThemeData(themeName);
        if (themeFilesMap) {
          for (const [filePath, content] of themeFilesMap) {
            this.zip.addFile(`theme/${filePath}`, content);
          }
        } else {
          this.zip.addFile("theme/style.css", this.getFallbackThemeCss());
          this.zip.addFile("theme/style.js", this.getFallbackThemeJs());
        }
        if (options?.preRenderMermaid) {
          for (const page of pages) {
            if (page.blocks) {
              for (const block of page.blocks) {
                if (block.components) {
                  for (const component of block.components) {
                    try {
                      if (component.content && (component.content.includes('class="mermaid"') || component.content.includes("class='mermaid'"))) {
                        const result = await options.preRenderMermaid(component.content);
                        if (result.mermaidRendered) {
                          component.content = result.html;
                        }
                      }
                    } catch (e) {
                      console.warn(
                        `[PageExporter] Mermaid pre-render error for component ${component.id}:`,
                        e
                      );
                    }
                  }
                }
              }
            }
          }
        }
        const navLabels = await this.fetchNavLabels(meta.language || "en", meta.license);
        const html = this.generateSinglePageHtml(pages, meta, usedIdevices, faviconInfo, [], false, navLabels);
        this.zip.addFile("index.html", html);
        const contentCssFiles = await this.resources.fetchContentCss();
        const baseCss = contentCssFiles.get("content/css/base.css");
        if (!baseCss) {
          throw new Error("Failed to fetch content/css/base.css");
        }
        this.zip.addFile("content/css/base.css", baseCss);
        this.zip.addFile("content/css/single-page.css", this.getSinglePageCss());
        if (meta.exportSource !== false) {
          const contentXml = this.generateContentXml(pages);
          this.zip.addFile("content.xml", contentXml);
        }
        if (meta.addExeLink !== false) {
          try {
            const logoData = await this.resources.fetchExeLogo();
            if (logoData) {
              this.zip.addFile("content/img/exe_powered_logo.png", logoData);
            }
          } catch {
          }
        }
        try {
          const baseLibs = await this.resources.fetchBaseLibraries();
          for (const [path, content] of baseLibs) {
            this.zip.addFile(`libs/${path}`, content);
          }
        } catch {
        }
        const { files: allRequiredFiles, patterns } = this.getRequiredLibraryFilesForPages(pages, {
          includeAccessibilityToolbar: meta.addAccessibilityToolbar === true,
          includeMathJax: meta.addMathJax === true
          // MATHJAX is included if requested
        });
        try {
          const libFiles = await this.resources.fetchLibraryFiles(allRequiredFiles, patterns);
          for (const [libPath, content] of libFiles) {
            const zipPath = `libs/${libPath}`;
            if (!this.zip.hasFile(zipPath)) {
              this.zip.addFile(zipPath, content);
            }
          }
        } catch {
        }
        const i18nContent = await this.generateI18nContent(meta.language || "en");
        this.zip.addFile("libs/common_i18n.js", i18nContent);
        const singlePageHtml = await this.generateSinglePageHtml(
          pages,
          meta,
          usedIdevices,
          faviconInfo,
          patterns.map((p) => p.name),
          meta.addMathJax === true,
          navLabels
        );
        this.zip.addFile(options?.filename || "index.html", singlePageHtml);
        const cssFiles = await this.resources.fetchContentCss();
        for (const idevice of usedIdevices) {
          try {
            const ideviceFiles = await this.resources.fetchIdeviceResources(idevice);
            for (const [path, content] of ideviceFiles) {
              this.zip.addFile(`idevices/${idevice}/${path}`, content);
            }
          } catch {
          }
        }
        await this.addAssetsToZipWithResourcePath();
        const buffer = await this.zip.generateAsync();
        return {
          success: true,
          filename: exportFilename,
          data: buffer
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
    /**
     * Generate single-page HTML with all pages
     */
    generateSinglePageHtml(pages, meta, usedIdevices, faviconInfo, detectedLibraries = [], addMathJax = false, navLabels) {
      return this.pageRenderer.renderSinglePage(pages, {
        projectTitle: meta.title || "eXeLearning",
        projectSubtitle: meta.subtitle || "",
        language: meta.language || "en",
        customStyles: meta.customStyles || "",
        usedIdevices,
        author: meta.author || "",
        license: meta.license || "",
        licenseUrl: meta.licenseUrl || "",
        faviconPath: faviconInfo?.path,
        faviconType: faviconInfo?.type,
        // Application version for generator meta tag
        version: meta.exelearningVersion,
        detectedLibraries,
        linkToElp: meta.exportSource !== false,
        addMathJax,
        addExeLink: meta.addExeLink ?? true,
        // Pre-translated nav labels (resolved from XLF at export time)
        navLabels
      });
    }
    /**
     * Override pre-processing to namespace named anchors before resolving internal links.
     * In single-page export all pages share one HTML document, so anchor ids like "intro"
     * on different pages would collide. We prefix them with the page id (e.g. "page-2--intro")
     * so that exe-node:page-2#intro resolves unambiguously.
     */
    async preprocessPagesForExport(pages) {
      const clonedPages = JSON.parse(JSON.stringify(pages));
      const pageUrlMap = this.buildPageUrlMap(clonedPages);
      for (let pageIndex = 0; pageIndex < clonedPages.length; pageIndex++) {
        const page = clonedPages[pageIndex];
        const isIndex = pageIndex === 0;
        for (const block of page.blocks || []) {
          for (const component of block.components || []) {
            if (component.content) {
              component.content = await this.addFilenamesToAssetUrls(component.content);
              component.content = this.namespaceSinglePageAnchors(component.content, page.id);
              component.content = this.replaceInternalLinks(component.content, pageUrlMap, isIndex);
            }
            if (component.properties && Object.keys(component.properties).length > 0) {
              const propsStr = JSON.stringify(component.properties);
              const processedStr = await this.addFilenamesToAssetUrls(propsStr);
              component.properties = JSON.parse(processedStr);
            }
          }
        }
      }
      return clonedPages;
    }
    /**
     * Prefix id/name attributes on named anchors (<a> without href) with the page id.
     * This avoids collisions when all pages are merged into a single HTML document.
     * E.g. <a id="intro"> on page "page-2" becomes <a id="page-2--intro">
     */
    namespaceSinglePageAnchors(content, pageId) {
      if (!content) return content;
      return content.replace(
        NAMED_ANCHOR_RE,
        (match) => match.replace(ID_NAME_ATTR_RE, (_, attr, value) => `${attr}="${pageId}--${value}"`)
      );
    }
    /**
     * Override page URL map for single-page export
     * Uses anchor fragments instead of file paths
     */
    buildPageUrlMap(pages) {
      const map = /* @__PURE__ */ new Map();
      for (const page of pages) {
        const anchor = `#section-${page.id}`;
        map.set(page.id, {
          url: anchor,
          urlFromSubpage: anchor
          // Same since it's all one page
        });
      }
      return map;
    }
    /**
     * Override internal link replacement for single-page export.
     * When a link carries its own anchor (exe-node:pageId#anchor), use just #anchor
     * since all content is in the same document. Without an anchor, use #section-pageId.
     */
    replaceInternalLinks(content, pageUrlMap, isFromIndex) {
      if (!content || !content.includes("exe-node:")) {
        return content;
      }
      return content.replace(/href=["']exe-node:([^"']+)["']/gi, (match, pageIdWithAnchor) => {
        const hashIdx = pageIdWithAnchor.indexOf("#");
        const pageId = hashIdx !== -1 ? pageIdWithAnchor.substring(0, hashIdx) : pageIdWithAnchor;
        const anchorFragment = hashIdx !== -1 ? pageIdWithAnchor.substring(hashIdx) : "";
        if (!pageUrlMap.has(pageId)) {
          console.warn(`[PageExporter] Internal link target not found: ${pageId}`);
          return match;
        }
        if (anchorFragment) {
          return `href="#${pageId}--${anchorFragment.substring(1)}"`;
        }
        const pageUrl = pageUrlMap.get(pageId);
        return `href="${isFromIndex ? pageUrl.url : pageUrl.urlFromSubpage}"`;
      });
    }
    /**
     * Get CSS specific to single-page layout
     */
    getSinglePageCss() {
      return `/* Single-page specific styles */
.exe-single-page .single-page-section {
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 40px;
  margin-bottom: 40px;
}

.exe-single-page .single-page-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.exe-single-page .single-page-nav {
  position: sticky;
  top: 0;
  max-height: 100vh;
  overflow-y: auto;
}

.exe-single-page .single-page-content {
  padding: 20px 30px;
}

/* Smooth scrolling for anchor links */
html {
  scroll-behavior: smooth;
}

/* Section target offset for fixed header */
.single-page-section:target {
  scroll-margin-top: 20px;
}

/* Print styles for single page */
@media print {
  .exe-single-page .single-page-nav {
    display: none;
  }
  .exe-single-page .single-page-section {
    page-break-inside: avoid;
  }
}
`;
    }
  };

  // src/shared/export/generators/Scorm12Manifest.ts
  var Scorm12ManifestGenerator = class {
    /**
     * @param projectId - Bare project identifier (used for organization id and resource ids)
     * @param pages - Pages from navigation structure
     * @param metadata - Project metadata
     * @param manifestIdentifier - Optional pre-built manifest@identifier. When provided
     *   it is used verbatim (no `eXe-MANIFEST-` prefix is prepended). Pass this from
     *   BaseExporter.getManifestIdentifier() so re-exports of the same project produce
     *   a stable identifier the LMS can track (see exelearning/exelearning#1785).
     */
    constructor(projectId, pages, metadata = {}, manifestIdentifier = null) {
      this.projectId = projectId || this.generateId();
      this.pages = pages || [];
      this.metadata = metadata;
      this.manifestIdentifier = manifestIdentifier;
    }
    /**
     * Generate a unique ID for the project
     * @returns Unique ID string
     */
    generateId() {
      return "exe-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    }
    /**
     * Generate complete imsmanifest.xml content
     * @param options - Generation options
     * @returns Complete XML string
     */
    generate(options = {}) {
      const { commonFiles = [], pageFiles = {}, allZipFiles } = options;
      let effectiveCommonFiles = commonFiles;
      if (allZipFiles && allZipFiles.length > 0) {
        effectiveCommonFiles = this.categorizeFilesForCommon(allZipFiles, pageFiles);
      }
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += this.generateManifestOpen();
      xml += this.generateMetadata();
      xml += this.generateOrganizations();
      xml += this.generateResources(effectiveCommonFiles, pageFiles);
      xml += "</manifest>\n";
      return xml;
    }
    /**
     * Categorize files into COMMON_FILES based on complete ZIP file list.
     * All files except page HTML files and imsmanifest.xml go into COMMON_FILES.
     * @param allFiles - Complete list of files in the ZIP
     * @param pageFiles - Map of page file info (to identify page HTML files)
     * @returns List of files for COMMON_FILES resource
     */
    categorizeFilesForCommon(allFiles, pageFiles) {
      const pageHtmlFiles = /* @__PURE__ */ new Set();
      for (const page of this.pages) {
        const pageFile = pageFiles[page.id];
        if (pageFile?.fileUrl) {
          pageHtmlFiles.add(pageFile.fileUrl);
        } else {
          const isIndex = this.pages.indexOf(page) === 0;
          const defaultUrl = isIndex ? "index.html" : `html/${this.sanitizeFilename(page.title)}.html`;
          pageHtmlFiles.add(defaultUrl);
        }
      }
      const excludedFiles = /* @__PURE__ */ new Set([...pageHtmlFiles, "imsmanifest.xml"]);
      return allFiles.filter((file) => !excludedFiles.has(file)).sort();
    }
    /**
     * Generate manifest opening tag with namespaces
     * @returns Manifest opening XML
     */
    generateManifestOpen() {
      const identifier = this.manifestIdentifier ?? `eXe-MANIFEST-${this.projectId}`;
      return `<manifest identifier="${this.escapeXml(identifier)}"
  xmlns="${SCORM_12_NAMESPACES.imscp}"
  xmlns:adlcp="${SCORM_12_NAMESPACES.adlcp}"
  xmlns:imsmd="${SCORM_12_NAMESPACES.imsmd}">
`;
    }
    /**
     * Generate metadata section
     * @returns Metadata XML
     */
    generateMetadata() {
      let xml = "  <metadata>\n";
      xml += "    <schema>ADL SCORM</schema>\n";
      xml += "    <schemaversion>1.2</schemaversion>\n";
      xml += "    <adlcp:location>imslrm.xml</adlcp:location>\n";
      xml += "  </metadata>\n";
      return xml;
    }
    /**
     * Generate organizations section with hierarchical structure
     * @returns Organizations XML
     */
    generateOrganizations() {
      const orgId = `eXe-${this.projectId}`;
      const title = this.metadata.title || "eXeLearning";
      let xml = `  <organizations default="${this.escapeXml(orgId)}">
`;
      xml += `    <organization identifier="${this.escapeXml(orgId)}" structure="hierarchical">
`;
      xml += `      <title>${this.escapeXml(title)}</title>
`;
      xml += this.generateItems();
      xml += "    </organization>\n";
      xml += "  </organizations>\n";
      return xml;
    }
    /**
     * Generate item elements for pages in hierarchical structure
     * @returns Items XML
     */
    generateItems() {
      const pageMap = /* @__PURE__ */ new Map();
      for (const page of this.pages) {
        pageMap.set(page.id, page);
      }
      const rootPages = this.pages.filter((p) => !p.parentId);
      let xml = "";
      for (const page of rootPages) {
        xml += this.generateItemRecursive(page, pageMap, 3);
      }
      return xml;
    }
    /**
     * Generate item element recursively for nested pages
     * @param page - Page object
     * @param pageMap - Map of all pages by ID
     * @param indent - Indentation level
     * @returns Item XML
     */
    generateItemRecursive(page, pageMap, indent) {
      const indentStr = "  ".repeat(indent);
      const isVisible = "true";
      let xml = `${indentStr}<item identifier="ITEM-${this.escapeXml(page.id)}" identifierref="RES-${this.escapeXml(page.id)}" isvisible="${isVisible}">
`;
      xml += `${indentStr}  <title>${this.escapeXml(page.title || "Page")}</title>
`;
      const children = this.pages.filter((p) => p.parentId === page.id);
      for (const child of children) {
        xml += this.generateItemRecursive(child, pageMap, indent + 1);
      }
      xml += `${indentStr}</item>
`;
      return xml;
    }
    /**
     * Generate resources section
     * @param commonFiles - List of common file paths
     * @param pageFiles - Map of pageId to file info
     * @returns Resources XML
     */
    generateResources(commonFiles, pageFiles) {
      let xml = "  <resources>\n";
      for (const page of this.pages) {
        const pageFile = pageFiles[page.id] || {};
        xml += this.generatePageResource(page, pageFile);
      }
      xml += this.generateCommonFilesResource(commonFiles);
      xml += "  </resources>\n";
      return xml;
    }
    /**
     * Generate resource element for a page
     * @param page - Page object
     * @param pageFile - Page file info
     * @returns Resource XML
     */
    generatePageResource(page, pageFile) {
      const pageId = page.id;
      const isIndex = this.pages.indexOf(page) === 0;
      const fileUrl = pageFile.fileUrl || (isIndex ? "index.html" : `html/${this.sanitizeFilename(page.title)}.html`);
      let xml = `    <resource identifier="RES-${this.escapeXml(pageId)}" type="webcontent" adlcp:scormtype="sco" href="${this.escapeXml(fileUrl)}">
`;
      xml += `      <file href="${this.escapeXml(fileUrl)}"/>
`;
      const files = pageFile.files || [];
      for (const file of files) {
        xml += `      <file href="${this.escapeXml(file)}"/>
`;
      }
      xml += '      <dependency identifierref="COMMON_FILES"/>\n';
      xml += "    </resource>\n";
      return xml;
    }
    /**
     * Generate COMMON_FILES resource for shared assets
     * @param commonFiles - List of common file paths
     * @returns Resource XML
     */
    generateCommonFilesResource(commonFiles) {
      let xml = '    <resource identifier="COMMON_FILES" type="webcontent" adlcp:scormtype="asset">\n';
      for (const file of commonFiles) {
        xml += `      <file href="${this.escapeXml(file)}"/>
`;
      }
      xml += "    </resource>\n";
      return xml;
    }
    /**
     * Escape XML special characters
     * @param str - String to escape
     * @returns Escaped string
     */
    escapeXml(str) {
      if (!str) return "";
      return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
    /**
     * Sanitize filename for use in paths
     * @param title - Title to sanitize
     * @returns Sanitized filename
     */
    sanitizeFilename(title) {
      if (!title) return "page";
      return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").substring(0, 50);
    }
  };

  // src/shared/export/generators/LomMetadata.ts
  var TRANSLATIONS = {
    "Metadata creation date": {
      en: "Metadata creation date",
      es: "Fecha de creaci\xF3n de los metadatos",
      fr: "Date de cr\xE9ation des m\xE9tadonn\xE9es",
      de: "Erstellungsdatum der Metadaten",
      pt: "Data de cria\xE7\xE3o dos metadados",
      ca: "Data de creaci\xF3 de les metadades",
      eu: "Metadatuen sorrera data",
      gl: "Data de creaci\xF3n dos metadatos"
    }
  };
  var LomMetadataGenerator = class {
    /**
     * @param projectId - Unique project identifier
     * @param metadata - Project metadata
     */
    constructor(projectId, metadata = {}) {
      this.projectId = projectId || this.generateId();
      this.metadata = metadata;
    }
    /**
     * Generate a unique ID for the project
     * @returns Unique ID string
     */
    generateId() {
      return "exe-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    }
    /**
     * Generate complete imslrm.xml content
     * @returns Complete XML string
     */
    generate() {
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += this.generateLomOpen();
      xml += this.generateGeneral();
      xml += this.generateLifeCycle();
      xml += this.generateMetaMetadata();
      xml += this.generateTechnical();
      xml += this.generateEducational();
      xml += this.generateRights();
      xml += "</lom>\n";
      return xml;
    }
    /**
     * Generate lom opening tag with namespaces
     * @returns LOM opening XML
     */
    generateLomOpen() {
      return `<lom xmlns="${LOM_NAMESPACES.lom}">
`;
    }
    /**
     * Generate general section
     * @returns General XML
     */
    generateGeneral() {
      const title = this.metadata.title || "eXe-p-" + this.projectId;
      const lang = this.metadata.language || "en";
      const description = this.metadata.description || "";
      const catalogName = this.metadata.catalogName || "none";
      const catalogEntry = this.metadata.catalogEntry || "ODE-" + this.projectId;
      let xml = '  <general uniqueElementName="general">\n';
      xml += "    <identifier>\n";
      xml += `      <catalog uniqueElementName="catalog">${this.escapeXml(catalogName)}</catalog>
`;
      xml += `      <entry uniqueElementName="entry">${this.escapeXml(catalogEntry)}</entry>
`;
      xml += "    </identifier>\n";
      xml += "    <title>\n";
      xml += `      <string language="${this.escapeXml(lang)}">${this.escapeXml(title)}</string>
`;
      xml += "    </title>\n";
      xml += `    <language>${this.escapeXml(lang)}</language>
`;
      xml += "    <description>\n";
      xml += `      <string language="${this.escapeXml(lang)}">${this.escapeXml(description)}</string>
`;
      xml += "    </description>\n";
      xml += '    <aggregationLevel uniqueElementName="aggregationLevel">\n';
      xml += '      <source uniqueElementName="source">LOM-ESv1.0</source>\n';
      xml += '      <value uniqueElementName="value">2</value>\n';
      xml += "    </aggregationLevel>\n";
      xml += "  </general>\n";
      return xml;
    }
    /**
     * Generate lifeCycle section
     * @returns LifeCycle XML
     */
    generateLifeCycle() {
      const author = this.metadata.author || "";
      const lang = this.metadata.language || "en";
      const dateTime = this.getCurrentDateTime();
      let xml = "  <lifeCycle>\n";
      xml += "    <contribute>\n";
      xml += '      <role uniqueElementName="role">\n';
      xml += '        <source uniqueElementName="source">LOM-ESv1.0</source>\n';
      xml += '        <value uniqueElementName="value">author</value>\n';
      xml += "      </role>\n";
      const vcard = `BEGIN:VCARD VERSION:3.0 FN:${author} EMAIL;TYPE=INTERNET: ORG: END:VCARD`;
      xml += `      <entity>${this.escapeXml(vcard)}</entity>
`;
      xml += "      <date>\n";
      xml += `        <dateTime uniqueElementName="dateTime">${dateTime}</dateTime>
`;
      xml += "        <description>\n";
      xml += `          <string language="${this.escapeXml(lang)}">${this.getLocalizedString("Metadata creation date", lang)}</string>
`;
      xml += "        </description>\n";
      xml += "      </date>\n";
      xml += "    </contribute>\n";
      xml += "  </lifeCycle>\n";
      return xml;
    }
    /**
     * Generate metaMetadata section
     * @returns MetaMetadata XML
     */
    generateMetaMetadata() {
      const author = this.metadata.author || "";
      const lang = this.metadata.language || "en";
      const dateTime = this.getCurrentDateTime();
      let xml = '  <metaMetadata uniqueElementName="metaMetadata">\n';
      xml += "    <contribute>\n";
      xml += '      <role uniqueElementName="role">\n';
      xml += '        <source uniqueElementName="source">LOM-ESv1.0</source>\n';
      xml += '        <value uniqueElementName="value">creator</value>\n';
      xml += "      </role>\n";
      const vcard = `BEGIN:VCARD VERSION:3.0 FN:${author} EMAIL;TYPE=INTERNET: ORG: END:VCARD`;
      xml += `      <entity>${this.escapeXml(vcard)}</entity>
`;
      xml += "      <date>\n";
      xml += `        <dateTime uniqueElementName="dateTime">${dateTime}</dateTime>
`;
      xml += "        <description>\n";
      xml += `          <string language="${this.escapeXml(lang)}">${this.getLocalizedString("Metadata creation date", lang)}</string>
`;
      xml += "        </description>\n";
      xml += "      </date>\n";
      xml += "    </contribute>\n";
      xml += "    <metadataSchema>LOM-ESv1.0</metadataSchema>\n";
      xml += `    <language>${this.escapeXml(lang)}</language>
`;
      xml += "  </metaMetadata>\n";
      return xml;
    }
    /**
     * Generate technical section
     * @returns Technical XML
     */
    generateTechnical() {
      const lang = this.metadata.language || "en";
      let xml = '  <technical uniqueElementName="technical">\n';
      xml += "    <otherPlatformRequirements>\n";
      xml += `      <string language="${this.escapeXml(lang)}">editor: eXe Learning</string>
`;
      xml += "    </otherPlatformRequirements>\n";
      xml += "  </technical>\n";
      return xml;
    }
    /**
     * Generate educational section
     * @returns Educational XML
     */
    generateEducational() {
      const lang = this.metadata.language || "en";
      let xml = "  <educational>\n";
      xml += `    <language>${this.escapeXml(lang)}</language>
`;
      xml += "  </educational>\n";
      return xml;
    }
    /**
     * Generate rights section
     * @returns Rights XML
     */
    generateRights() {
      const license = this.metadata.license || "";
      let xml = '  <rights uniqueElementName="rights">\n';
      xml += '    <copyrightAndOtherRestrictions uniqueElementName="copyrightAndOtherRestrictions">\n';
      xml += '      <source uniqueElementName="source">LOM-ESv1.0</source>\n';
      xml += `      <value uniqueElementName="value">${this.escapeXml(license)}</value>
`;
      xml += "    </copyrightAndOtherRestrictions>\n";
      xml += '    <access uniqueElementName="access">\n';
      xml += '      <accessType uniqueElementName="accessType">\n';
      xml += '        <source uniqueElementName="source">LOM-ESv1.0</source>\n';
      xml += '        <value uniqueElementName="value">universal</value>\n';
      xml += "      </accessType>\n";
      xml += "      <description>\n";
      xml += '        <string language="en">Default</string>\n';
      xml += "      </description>\n";
      xml += "    </access>\n";
      xml += "  </rights>\n";
      return xml;
    }
    /**
     * Get current date/time in ISO format with timezone
     * @returns ISO date time string
     */
    getCurrentDateTime() {
      const now = /* @__PURE__ */ new Date();
      const offset = now.getTimezoneOffset();
      const offsetHours = Math.abs(Math.floor(offset / 60)).toString().padStart(2, "0");
      const offsetMinutes = Math.abs(offset % 60).toString().padStart(2, "0");
      const offsetSign = offset <= 0 ? "+" : "-";
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, "0");
      const day = now.getDate().toString().padStart(2, "0");
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.00${offsetSign}${offsetHours}:${offsetMinutes}`;
    }
    /**
     * Get localized string (basic implementation)
     * @param key - Translation key
     * @param lang - Language code
     * @returns Localized string
     */
    getLocalizedString(key, lang) {
      const langShort = lang.substring(0, 2).toLowerCase();
      if (TRANSLATIONS[key]?.[langShort]) {
        return TRANSLATIONS[key][langShort];
      }
      return TRANSLATIONS[key]?.en || key;
    }
    /**
     * Escape XML special characters
     * @param str - String to escape
     * @returns Escaped string
     */
    escapeXml(str) {
      if (!str) return "";
      return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
  };

  // src/shared/export/exporters/Scorm12Exporter.ts
  var Scorm12Exporter = class extends Html5Exporter {
    constructor() {
      super(...arguments);
      this.manifestGenerator = null;
      this.lomGenerator = null;
    }
    /**
     * Get file suffix for SCORM 1.2 format
     */
    getFileSuffix() {
      return "_scorm";
    }
    /**
     * Export to SCORM 1.2 ZIP
     */
    async export(options) {
      const exportFilename = options?.filename || this.buildFilename();
      try {
        let pages = this.buildPageList();
        const meta = this.getMetadata();
        const themeName = options?.theme || meta.theme || "base";
        const manifestIdentifier = this.getManifestIdentifier();
        const projectId = this.getBareProjectIdentifier();
        pages = await this.preprocessPagesForExport(pages);
        pages = pages.filter((p) => this.isPageVisible(p, pages));
        const pageFilenameMap = this.buildPageFilenameMap(pages);
        const needsElpxDownload = this.needsElpxDownloadSupport(pages);
        const fileList = needsElpxDownload ? [] : null;
        const addFile = (path, content) => {
          this.zip.addFile(path, content);
          if (fileList) fileList.push(path);
        };
        this.manifestGenerator = new Scorm12ManifestGenerator(
          projectId,
          pages,
          {
            identifier: manifestIdentifier,
            pages,
            version: "1.2",
            title: meta.title || "eXeLearning",
            language: meta.language || "en",
            author: meta.author || "",
            description: meta.description || "",
            license: meta.license || ""
          },
          manifestIdentifier
        );
        this.lomGenerator = new LomMetadataGenerator(projectId, {
          title: meta.title || "eXeLearning",
          language: meta.language || "en",
          author: meta.author || "",
          description: meta.description || "",
          license: meta.license || ""
        });
        const commonFiles = [];
        const pageFiles = {};
        const { themeFilesMap, themeRootFiles, faviconInfo } = await this.prepareThemeData(themeName);
        this.ideviceRenderer.setThemeIconFiles(themeFilesMap);
        const navLabels = await this.fetchNavLabels(meta.language || "en", meta.license);
        const pageHtmlMap = /* @__PURE__ */ new Map();
        let latexWasRendered = false;
        let mermaidWasRendered = false;
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const isIndex = i === 0;
          let html = this.generateScormPageHtml(
            page,
            pages,
            meta,
            isIndex,
            themeRootFiles,
            i,
            faviconInfo,
            pageFilenameMap,
            navLabels
          );
          if (!meta.addMathJax) {
            if (options?.preRenderDataGameLatex) {
              try {
                const result = await options.preRenderDataGameLatex(html);
                if (result.count > 0) {
                  html = result.html;
                  latexWasRendered = true;
                  console.log(
                    `[Scorm12Exporter] Pre-rendered LaTeX in ${result.count} DataGame(s) on page: ${page.title}`
                  );
                }
              } catch (error) {
                console.warn(
                  "[Scorm12Exporter] DataGame LaTeX pre-render failed for page:",
                  page.title,
                  error
                );
              }
            }
            if (options?.preRenderLatex) {
              try {
                const result = await options.preRenderLatex(html);
                if (result.latexRendered) {
                  html = result.html;
                  latexWasRendered = true;
                  console.log(
                    `[Scorm12Exporter] Pre-rendered ${result.count} LaTeX expressions on page: ${page.title}`
                  );
                }
              } catch (error) {
                console.warn("[Scorm12Exporter] LaTeX pre-render failed for page:", page.title, error);
              }
            }
          }
          if (options?.preRenderMermaid) {
            try {
              const result = await options.preRenderMermaid(html);
              if (result.mermaidRendered) {
                html = result.html;
                mermaidWasRendered = true;
                console.log(
                  `[Scorm12Exporter] Pre-rendered ${result.count} Mermaid diagram(s) on page: ${page.title}`
                );
              }
            } catch (error) {
              console.warn("[Scorm12Exporter] Mermaid pre-render failed for page:", page.title, error);
            }
          }
          const uniqueFilename = pageFilenameMap.get(page.id) || "page.html";
          const pageFilename = isIndex ? "index.html" : `html/${uniqueFilename}`;
          pageHtmlMap.set(pageFilename, html);
          pageFiles[page.id] = {
            fileUrl: pageFilename,
            files: []
          };
        }
        const contentCssFiles = await this.resources.fetchContentCss();
        let baseCss = contentCssFiles.get("content/css/base.css");
        if (!baseCss) {
          throw new Error("Failed to fetch content/css/base.css");
        }
        if (latexWasRendered || mermaidWasRendered) {
          const decoder = new TextDecoder();
          let baseCssText = decoder.decode(baseCss);
          if (latexWasRendered) {
            baseCssText += "\n" + this.getPreRenderedLatexCss();
          }
          if (mermaidWasRendered) {
            baseCssText += "\n" + this.getPreRenderedMermaidCss();
          }
          const encoder = new TextEncoder();
          baseCss = encoder.encode(baseCssText);
        }
        addFile("content/css/base.css", baseCss);
        commonFiles.push("content/css/base.css");
        if (themeFilesMap) {
          for (const [filePath, content] of themeFilesMap) {
            addFile(`theme/${filePath}`, content);
            commonFiles.push(`theme/${filePath}`);
          }
        } else {
          addFile("theme/style.css", this.getFallbackThemeCss());
          addFile("theme/style.js", this.getFallbackThemeJs());
          commonFiles.push("theme/style.css", "theme/style.js");
        }
        if (meta.addExeLink !== false) {
          try {
            const logoData = await this.resources.fetchExeLogo();
            if (logoData) {
              addFile("content/img/exe_powered_logo.png", logoData);
              commonFiles.push("content/img/exe_powered_logo.png");
            }
          } catch {
          }
        }
        try {
          const baseLibs = await this.resources.fetchBaseLibraries();
          for (const [path, content] of baseLibs) {
            addFile(`libs/${path}`, content);
            commonFiles.push(`libs/${path}`);
          }
        } catch {
        }
        const i18nContent = await this.generateI18nContent(meta.language || "en");
        addFile("libs/common_i18n.js", new TextEncoder().encode(i18nContent));
        commonFiles.push("libs/common_i18n.js");
        const { files: allRequiredFiles, patterns } = this.getRequiredLibraryFilesForPages(pages, {
          includeAccessibilityToolbar: meta.addAccessibilityToolbar === true,
          includeMathJax: meta.addMathJax === true,
          skipMathJax: latexWasRendered && !meta.addMathJax
        });
        try {
          const libFiles = await this.resources.fetchLibraryFiles(allRequiredFiles, patterns);
          for (const [libPath, content] of libFiles) {
            const zipPath = `libs/${libPath}`;
            if (!this.zip.hasFile(zipPath)) {
              addFile(zipPath, content);
              commonFiles.push(zipPath);
            }
          }
        } catch {
        }
        if (needsElpxDownload) {
          await this.ensureElpxDownloadLibraries(addFile, commonFiles);
        }
        try {
          const scormFiles = await this.resources.fetchScormFiles("1.2");
          for (const [filePath, content] of scormFiles) {
            addFile(`libs/${filePath}`, content);
            commonFiles.push(`libs/${filePath}`);
          }
        } catch {
          addFile("libs/SCORM_API_wrapper.js", this.getScormApiWrapper());
          addFile("libs/SCOFunctions.js", this.getScoFunctions());
          commonFiles.push("libs/SCORM_API_wrapper.js", "libs/SCOFunctions.js");
        }
        try {
          const contentXml = await this.getContentXml();
          if (contentXml) {
            addFile("content.xml", contentXml);
            commonFiles.push("content.xml");
            addFile(ODE_DTD_FILENAME, ODE_DTD_CONTENT);
            commonFiles.push(ODE_DTD_FILENAME);
          }
        } catch {
        }
        const usedIdevices = this.getUsedIdevices(pages);
        for (const idevice of usedIdevices) {
          try {
            const normalizedType = this.resources.normalizeIdeviceType(idevice);
            const ideviceFiles = await this.resources.fetchIdeviceResources(idevice);
            for (const [path, content] of ideviceFiles) {
              addFile(`idevices/${normalizedType}/${path}`, content);
              commonFiles.push(`idevices/${normalizedType}/${path}`);
            }
          } catch {
          }
        }
        if (meta.globalFont && meta.globalFont !== "default") {
          try {
            const fontFiles = await this.resources.fetchGlobalFontFiles(meta.globalFont);
            if (fontFiles) {
              for (const [filePath, content] of fontFiles) {
                addFile(filePath, content);
                commonFiles.push(filePath);
              }
            }
          } catch (e) {
            console.warn(`[Scorm12Exporter] Failed to fetch global font files: ${meta.globalFont}`, e);
          }
        }
        await this.addAssetsToZipWithResourcePath(fileList);
        if (needsElpxDownload && fileList) {
          const pageUrls = Object.values(pageFiles).map((pf) => pf.fileUrl);
          this.addElpxManifestToZip(fileList, pageUrls, commonFiles);
        }
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const isIndex = i === 0;
          const uniqueFilename = pageFilenameMap.get(page.id) || "page.html";
          const filename = isIndex ? "index.html" : `html/${uniqueFilename}`;
          let html = pageHtmlMap.get(filename) || "";
          if (needsElpxDownload) {
            html = this.injectElpxScripts(html, page, isIndex);
          }
          this.zip.addFile(filename, html);
        }
        const lomXml = this.lomGenerator.generate();
        this.zip.addFile("imslrm.xml", lomXml);
        const allZipFiles = this.zip.getFilePaths();
        const manifestXml = this.manifestGenerator.generate({
          commonFiles,
          pageFiles,
          allZipFiles
        });
        this.zip.addFile("imsmanifest.xml", manifestXml);
        const buffer = await this.zip.generateAsync();
        return {
          success: true,
          filename: exportFilename,
          data: buffer
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
    /**
     * Generate a random low-level project ID.
     *
     * @deprecated Since #1785, the SCORM manifest identifier is derived from
     * the project's odeIdentifier via {@link BaseExporter.getManifestIdentifier}
     * so LMS tracking survives re-uploads. This helper is kept only for
     * external callers/tests and is no longer used by the export pipeline.
     */
    generateProjectId() {
      return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    }
    /**
     * Generate SCORM-enabled HTML page
     * @param page - Page data
     * @param allPages - All pages in the project
     * @param meta - Project metadata
     * @param isIndex - Whether this is the index page
     * @param themeFiles - List of root-level theme CSS/JS files
     * @param pageIndex - Index of the current page (for page counter)
     * @param faviconInfo - Favicon info (optional)
     * @param pageFilenameMap - Map of page IDs to unique filenames (optional, handles title collisions)
     */
    generateScormPageHtml(page, allPages, meta, isIndex, themeFiles, pageIndex, faviconInfo, pageFilenameMap, navLabels) {
      const basePath = isIndex ? "" : "../";
      const usedIdevices = this.getUsedIdevicesForPage(page);
      let customStyles = meta.customStyles || "";
      let bodyClass = "exe-export exe-scorm exe-scorm12";
      if (meta.globalFont && meta.globalFont !== "default") {
        const globalFontCss = GlobalFontGenerator.generateCss(meta.globalFont, basePath);
        if (globalFontCss) {
          customStyles = globalFontCss + "\n" + customStyles;
        }
        const fontBodyClass = GlobalFontGenerator.getBodyClassName(meta.globalFont);
        if (fontBodyClass) {
          bodyClass += ` ${fontBodyClass}`;
        }
      }
      return this.pageRenderer.render(page, {
        projectTitle: meta.title || "eXeLearning",
        projectSubtitle: meta.subtitle || "",
        language: meta.language || "en",
        theme: meta.theme || "base",
        customStyles,
        allPages,
        basePath,
        isIndex,
        usedIdevices,
        author: meta.author || "",
        license: meta.license || "",
        description: meta.description || "",
        licenseUrl: meta.licenseUrl || "",
        // Export options - SCORM specific overrides
        // SCORM/IMS exports don't use client-side search - LMS handles navigation
        addSearchBox: false,
        addExeLink: meta.addExeLink ?? true,
        addPagination: meta.addPagination ?? false,
        totalPages: allPages.length,
        currentPageIndex: pageIndex ?? 0,
        // SCORM-specific options
        isScorm: true,
        scormVersion: "1.2",
        bodyClass,
        extraHeadScripts: this.getScormHeadScripts(basePath),
        onLoadScript: "loadPage()",
        onUnloadScript: "unloadPage()",
        // Hide navigation elements - LMS handles navigation in SCORM
        hideNavigation: true,
        hideNavButtons: true,
        // Theme files for HTML head includes
        themeFiles: themeFiles || [],
        // Favicon options
        faviconPath: faviconInfo?.path,
        faviconType: faviconInfo?.type,
        // Page filename map for navigation links (handles title collisions)
        pageFilenameMap,
        // Pre-translated nav button labels (resolved from XLF at export time)
        navLabels,
        // Application version for generator meta tag
        version: meta.exelearningVersion
      });
    }
    /**
     * Get SCORM-specific head scripts
     */
    getScormHeadScripts(basePath) {
      return `<script src="${basePath}libs/SCORM_API_wrapper.js"><\/script>
<script src="${basePath}libs/SCOFunctions.js"><\/script>`;
    }
    /**
     * Get minimal SCORM API wrapper (fallback)
     */
    getScormApiWrapper() {
      return `/**
 * SCORM API Wrapper
 * Minimal implementation for SCORM 1.2 communication
 */
var pipwerks = pipwerks || {};

pipwerks.SCORM = {
  version: "1.2",
  API: { handle: null, isFound: false },
  data: { completionStatus: null, exitStatus: null },
  debug: { isActive: true }
};

pipwerks.SCORM.API.find = function(win) {
  var findAttempts = 0, findAttemptLimit = 500;
  while (!win.API && win.parent && win.parent !== win && findAttempts < findAttemptLimit) {
    findAttempts++;
    win = win.parent;
  }
  return win.API || null;
};

pipwerks.SCORM.API.get = function() {
  var win = window;
  if (win.parent && win.parent !== win) { this.handle = this.find(win.parent); }
  if (!this.handle && win.opener) { this.handle = this.find(win.opener); }
  if (this.handle) { this.isFound = true; }
  return this.handle;
};

pipwerks.SCORM.API.getHandle = function() {
  if (!this.handle) { this.get(); }
  return this.handle;
};

pipwerks.SCORM.connection = { isActive: false };

pipwerks.SCORM.init = function() {
  var success = false, API = this.API.getHandle();
  if (API) {
    success = API.LMSInitialize("");
    if (success) { this.connection.isActive = true; }
  }
  return success;
};

pipwerks.SCORM.quit = function() {
  var success = false, API = this.API.getHandle();
  if (API && this.connection.isActive) {
    success = API.LMSFinish("");
    if (success) { this.connection.isActive = false; }
  }
  return success;
};

pipwerks.SCORM.get = function(parameter) {
  var value = "", API = this.API.getHandle();
  if (API && this.connection.isActive) {
    value = API.LMSGetValue(parameter);
  }
  return value;
};

pipwerks.SCORM.set = function(parameter, value) {
  var success = false, API = this.API.getHandle();
  if (API && this.connection.isActive) {
    success = API.LMSSetValue(parameter, value);
  }
  return success;
};

pipwerks.SCORM.save = function() {
  var success = false, API = this.API.getHandle();
  if (API && this.connection.isActive) {
    success = API.LMSCommit("");
  }
  return success;
};

// Shorthand
var scorm = pipwerks.SCORM;
`;
    }
    /**
     * Get minimal SCO Functions (fallback)
     */
    getScoFunctions() {
      return `/**
 * SCO Functions for SCORM 1.2
 * Page load/unload handlers for SCORM communication
 */

var startTimeStamp = null;
var exitPageStatus = false;

function loadPage() {
  startTimeStamp = new Date();
  var result = scorm.init();
  if (result) {
    var status = scorm.get("cmi.core.lesson_status");
    if (status === "not attempted" || status === "") {
      scorm.set("cmi.core.lesson_status", "incomplete");
    }
  }
  return result;
}

function unloadPage() {
  if (!exitPageStatus) {
    exitPageStatus = true;
    computeTime();
    scorm.quit();
  }
}

function computeTime() {
  if (startTimeStamp != null) {
    var now = new Date();
    var elapsed = now.getTime() - startTimeStamp.getTime();
    elapsed = Math.round(elapsed / 1000);
    var hours = Math.floor(elapsed / 3600);
    var mins = Math.floor((elapsed - hours * 3600) / 60);
    var secs = elapsed - hours * 3600 - mins * 60;
    hours = hours < 10 ? "0" + hours : hours;
    mins = mins < 10 ? "0" + mins : mins;
    secs = secs < 10 ? "0" + secs : secs;
    var sessionTime = hours + ":" + mins + ":" + secs;
    scorm.set("cmi.core.session_time", sessionTime);
  }
}

function setComplete() {
  scorm.set("cmi.core.lesson_status", "completed");
  scorm.save();
}

function setIncomplete() {
  scorm.set("cmi.core.lesson_status", "incomplete");
  scorm.save();
}

function setScore(score, maxScore, minScore) {
  scorm.set("cmi.core.score.raw", score);
  if (maxScore !== undefined) scorm.set("cmi.core.score.max", maxScore);
  if (minScore !== undefined) scorm.set("cmi.core.score.min", minScore);
  scorm.save();
}
`;
    }
    /**
     * Get content.xml from the document for inclusion in SCORM package
     * This allows the package to be re-edited in eXeLearning
     */
    async getContentXml() {
      if ("getContentXml" in this.document && typeof this.document.getContentXml === "function") {
        return this.document.getContentXml();
      }
      return null;
    }
  };

  // src/shared/export/generators/Scorm2004Manifest.ts
  var Scorm2004ManifestGenerator = class {
    /**
     * @param projectId - Bare project identifier (used for organization id and resource ids)
     * @param pages - Pages from navigation structure
     * @param metadata - Project metadata
     * @param manifestIdentifier - Optional pre-built manifest@identifier. When provided
     *   it is used verbatim (no `eXe-MANIFEST-` prefix is prepended). Pass this from
     *   BaseExporter.getManifestIdentifier() so re-exports of the same project produce
     *   a stable identifier the LMS can track (see exelearning/exelearning#1785).
     */
    constructor(projectId, pages, metadata = {}, manifestIdentifier = null) {
      this.projectId = projectId || this.generateId();
      this.pages = pages || [];
      this.metadata = metadata;
      this.manifestIdentifier = manifestIdentifier;
    }
    /**
     * Generate a unique ID for the project
     * @returns Unique ID string
     */
    generateId() {
      return "exe-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    }
    /**
     * Generate complete imsmanifest.xml content
     * @param options - Generation options
     * @returns Complete XML string
     */
    generate(options = {}) {
      const { commonFiles = [], pageFiles = {}, allZipFiles } = options;
      let effectiveCommonFiles = commonFiles;
      if (allZipFiles && allZipFiles.length > 0) {
        effectiveCommonFiles = this.categorizeFilesForCommon(allZipFiles, pageFiles);
      }
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += this.generateManifestOpen();
      xml += this.generateMetadata();
      xml += this.generateOrganizations();
      xml += this.generateResources(effectiveCommonFiles, pageFiles);
      xml += "</manifest>\n";
      return xml;
    }
    /**
     * Categorize files into COMMON_FILES based on complete ZIP file list.
     * All files except page HTML files and imsmanifest.xml go into COMMON_FILES.
     * @param allFiles - Complete list of files in the ZIP
     * @param pageFiles - Map of page file info (to identify page HTML files)
     * @returns List of files for COMMON_FILES resource
     */
    categorizeFilesForCommon(allFiles, pageFiles) {
      const pageHtmlFiles = /* @__PURE__ */ new Set();
      for (const page of this.pages) {
        const pageFile = pageFiles[page.id];
        if (pageFile?.fileUrl) {
          pageHtmlFiles.add(pageFile.fileUrl);
        } else {
          const isIndex = this.pages.indexOf(page) === 0;
          const defaultUrl = isIndex ? "index.html" : `html/${this.sanitizeFilename(page.title)}.html`;
          pageHtmlFiles.add(defaultUrl);
        }
      }
      const excludedFiles = /* @__PURE__ */ new Set([...pageHtmlFiles, "imsmanifest.xml"]);
      return allFiles.filter((file) => !excludedFiles.has(file)).sort();
    }
    /**
     * Generate manifest opening tag with SCORM 2004 namespaces
     * @returns Manifest opening XML
     */
    generateManifestOpen() {
      const identifier = this.manifestIdentifier ?? `eXe-MANIFEST-${this.projectId}`;
      return `<manifest identifier="${this.escapeXml(identifier)}"
  xmlns="${SCORM_2004_NAMESPACES.imscp}"
  xmlns:adlcp="${SCORM_2004_NAMESPACES.adlcp}"
  xmlns:adlseq="${SCORM_2004_NAMESPACES.adlseq}"
  xmlns:adlnav="${SCORM_2004_NAMESPACES.adlnav}"
  xmlns:imsss="${SCORM_2004_NAMESPACES.imsss}">
`;
    }
    /**
     * Generate metadata section
     * @returns Metadata XML
     */
    generateMetadata() {
      let xml = "  <metadata>\n";
      xml += "    <schema>ADL SCORM</schema>\n";
      xml += "    <schemaversion>2004 4th Edition</schemaversion>\n";
      xml += "    <adlcp:location>imslrm.xml</adlcp:location>\n";
      xml += "  </metadata>\n";
      return xml;
    }
    /**
     * Generate organizations section with sequencing
     * @returns Organizations XML
     */
    generateOrganizations() {
      const orgId = `eXe-${this.projectId}`;
      const title = this.metadata.title || "eXeLearning";
      let xml = `  <organizations default="${this.escapeXml(orgId)}">
`;
      xml += `    <organization identifier="${this.escapeXml(orgId)}" structure="hierarchical">
`;
      xml += `      <title>${this.escapeXml(title)}</title>
`;
      xml += this.generateItems();
      xml += this.generateOrganizationSequencing();
      xml += "    </organization>\n";
      xml += "  </organizations>\n";
      return xml;
    }
    /**
     * Generate organization-level sequencing rules
     * @returns Sequencing XML
     */
    generateOrganizationSequencing() {
      return `      <imsss:sequencing>
        <imsss:controlMode choice="true" choiceExit="true" flow="true" forwardOnly="false"/>
      </imsss:sequencing>
`;
    }
    /**
     * Generate item elements for pages in hierarchical structure
     * @returns Items XML
     */
    generateItems() {
      const pageMap = /* @__PURE__ */ new Map();
      for (const page of this.pages) {
        pageMap.set(page.id, page);
      }
      const rootPages = this.pages.filter((p) => !p.parentId);
      let xml = "";
      for (const page of rootPages) {
        xml += this.generateItemRecursive(page, pageMap, 3);
      }
      return xml;
    }
    /**
     * Generate item element recursively for nested pages
     * @param page - Page object
     * @param pageMap - Map of all pages by ID
     * @param indent - Indentation level
     * @returns Item XML
     */
    generateItemRecursive(page, pageMap, indent) {
      const indentStr = "  ".repeat(indent);
      const isVisible = "true";
      const children = this.pages.filter((p) => p.parentId === page.id);
      const hasChildren = children.length > 0;
      let xml = `${indentStr}<item identifier="ITEM-${this.escapeXml(page.id)}" identifierref="RES-${this.escapeXml(page.id)}" isvisible="${isVisible}">
`;
      xml += `${indentStr}  <title>${this.escapeXml(page.title || "Page")}</title>
`;
      for (const child of children) {
        xml += this.generateItemRecursive(child, pageMap, indent + 1);
      }
      if (hasChildren) {
        xml += this.generateItemSequencing(indentStr + "  ");
      }
      xml += `${indentStr}</item>
`;
      return xml;
    }
    /**
     * Generate sequencing rules for a parent item (cluster)
     * @param indentStr - Indentation string
     * @returns Sequencing XML
     */
    generateItemSequencing(indentStr) {
      return `${indentStr}<imsss:sequencing>
${indentStr}  <imsss:controlMode choice="true" choiceExit="true" flow="true"/>
${indentStr}</imsss:sequencing>
`;
    }
    /**
     * Generate resources section
     * @param commonFiles - List of common file paths
     * @param pageFiles - Map of pageId to file info
     * @returns Resources XML
     */
    generateResources(commonFiles, pageFiles) {
      let xml = "  <resources>\n";
      for (const page of this.pages) {
        const pageFile = pageFiles[page.id] || {};
        xml += this.generatePageResource(page, pageFile);
      }
      xml += this.generateCommonFilesResource(commonFiles);
      xml += "  </resources>\n";
      return xml;
    }
    /**
     * Generate resource element for a page
     * @param page - Page object
     * @param pageFile - Page file info
     * @returns Resource XML
     */
    generatePageResource(page, pageFile) {
      const pageId = page.id;
      const isIndex = this.pages.indexOf(page) === 0;
      const fileUrl = pageFile.fileUrl || (isIndex ? "index.html" : `html/${this.sanitizeFilename(page.title)}.html`);
      let xml = `    <resource identifier="RES-${this.escapeXml(pageId)}" type="webcontent" adlcp:scormType="sco" href="${this.escapeXml(fileUrl)}">
`;
      xml += `      <file href="${this.escapeXml(fileUrl)}"/>
`;
      const files = pageFile.files || [];
      for (const file of files) {
        xml += `      <file href="${this.escapeXml(file)}"/>
`;
      }
      xml += '      <dependency identifierref="COMMON_FILES"/>\n';
      xml += "    </resource>\n";
      return xml;
    }
    /**
     * Generate COMMON_FILES resource for shared assets
     * @param commonFiles - List of common file paths
     * @returns Resource XML
     */
    generateCommonFilesResource(commonFiles) {
      let xml = '    <resource identifier="COMMON_FILES" type="webcontent" adlcp:scormType="asset">\n';
      for (const file of commonFiles) {
        xml += `      <file href="${this.escapeXml(file)}"/>
`;
      }
      xml += "    </resource>\n";
      return xml;
    }
    /**
     * Escape XML special characters
     * @param str - String to escape
     * @returns Escaped string
     */
    escapeXml(str) {
      if (!str) return "";
      return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
    /**
     * Sanitize filename for use in paths
     * @param title - Title to sanitize
     * @returns Sanitized filename
     */
    sanitizeFilename(title) {
      if (!title) return "page";
      return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").substring(0, 50);
    }
  };

  // src/shared/export/exporters/Scorm2004Exporter.ts
  var Scorm2004Exporter = class extends Html5Exporter {
    constructor() {
      super(...arguments);
      this.manifestGenerator = null;
      this.lomGenerator = null;
    }
    /**
     * Get file suffix for SCORM 2004 format
     */
    getFileSuffix() {
      return "_scorm2004";
    }
    /**
     * Export to SCORM 2004 ZIP
     */
    async export(options) {
      const exportFilename = options?.filename || this.buildFilename();
      try {
        let pages = this.buildPageList();
        const meta = this.getMetadata();
        const themeName = options?.theme || meta.theme || "base";
        const manifestIdentifier = this.getManifestIdentifier();
        const projectId = this.getBareProjectIdentifier();
        pages = await this.preprocessPagesForExport(pages);
        pages = pages.filter((p) => this.isPageVisible(p, pages));
        const pageFilenameMap = this.buildPageFilenameMap(pages);
        const needsElpxDownload = this.needsElpxDownloadSupport(pages);
        const fileList = needsElpxDownload ? [] : null;
        const addFile = (path, content) => {
          this.zip.addFile(path, content);
          if (fileList) fileList.push(path);
        };
        this.manifestGenerator = new Scorm2004ManifestGenerator(
          projectId,
          pages,
          {
            identifier: manifestIdentifier,
            pages,
            version: "2004",
            title: meta.title || "eXeLearning",
            language: meta.language || "en",
            author: meta.author || "",
            description: meta.description || "",
            license: meta.license || ""
          },
          manifestIdentifier
        );
        this.lomGenerator = new LomMetadataGenerator(projectId, {
          title: meta.title || "eXeLearning",
          language: meta.language || "en",
          author: meta.author || "",
          description: meta.description || "",
          license: meta.license || ""
        });
        const commonFiles = [];
        const pageFiles = {};
        const { themeFilesMap, themeRootFiles, faviconInfo } = await this.prepareThemeData(themeName);
        this.ideviceRenderer.setThemeIconFiles(themeFilesMap);
        const navLabels = await this.fetchNavLabels(meta.language || "en", meta.license);
        const pageHtmlMap = /* @__PURE__ */ new Map();
        let latexWasRendered = false;
        let mermaidWasRendered = false;
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const isIndex = i === 0;
          let html = this.generateScorm2004PageHtml(
            page,
            pages,
            meta,
            isIndex,
            themeRootFiles,
            i,
            faviconInfo,
            pageFilenameMap,
            navLabels
          );
          if (!meta.addMathJax) {
            if (options?.preRenderDataGameLatex) {
              try {
                const result = await options.preRenderDataGameLatex(html);
                if (result.count > 0) {
                  html = result.html;
                  latexWasRendered = true;
                  console.log(
                    `[Scorm2004Exporter] Pre-rendered LaTeX in ${result.count} DataGame(s) on page: ${page.title}`
                  );
                }
              } catch (error) {
                console.warn(
                  "[Scorm2004Exporter] DataGame LaTeX pre-render failed for page:",
                  page.title,
                  error
                );
              }
            }
            if (options?.preRenderLatex) {
              try {
                const result = await options.preRenderLatex(html);
                if (result.latexRendered) {
                  html = result.html;
                  latexWasRendered = true;
                  console.log(
                    `[Scorm2004Exporter] Pre-rendered ${result.count} LaTeX expressions on page: ${page.title}`
                  );
                }
              } catch (error) {
                console.warn("[Scorm2004Exporter] LaTeX pre-render failed for page:", page.title, error);
              }
            }
          }
          if (options?.preRenderMermaid) {
            try {
              const result = await options.preRenderMermaid(html);
              if (result.mermaidRendered) {
                html = result.html;
                mermaidWasRendered = true;
                console.log(
                  `[Scorm2004Exporter] Pre-rendered ${result.count} Mermaid diagram(s) on page: ${page.title}`
                );
              }
            } catch (error) {
              console.warn("[Scorm2004Exporter] Mermaid pre-render failed for page:", page.title, error);
            }
          }
          const uniqueFilename = pageFilenameMap.get(page.id) || "page.html";
          const pageFilename = isIndex ? "index.html" : `html/${uniqueFilename}`;
          pageHtmlMap.set(pageFilename, html);
          pageFiles[page.id] = {
            fileUrl: pageFilename,
            files: []
          };
        }
        const contentCssFiles = await this.resources.fetchContentCss();
        let baseCss = contentCssFiles.get("content/css/base.css");
        if (!baseCss) {
          throw new Error("Failed to fetch content/css/base.css");
        }
        if (latexWasRendered || mermaidWasRendered) {
          const decoder = new TextDecoder();
          let baseCssText = decoder.decode(baseCss);
          if (latexWasRendered) {
            baseCssText += "\n" + this.getPreRenderedLatexCss();
          }
          if (mermaidWasRendered) {
            baseCssText += "\n" + this.getPreRenderedMermaidCss();
          }
          const encoder = new TextEncoder();
          baseCss = encoder.encode(baseCssText);
        }
        addFile("content/css/base.css", baseCss);
        commonFiles.push("content/css/base.css");
        if (themeFilesMap) {
          for (const [filePath, content] of themeFilesMap) {
            addFile(`theme/${filePath}`, content);
            commonFiles.push(`theme/${filePath}`);
          }
        } else {
          addFile("theme/style.css", this.getFallbackThemeCss());
          addFile("theme/style.js", this.getFallbackThemeJs());
          commonFiles.push("theme/style.css", "theme/style.js");
        }
        try {
          const baseLibs = await this.resources.fetchBaseLibraries();
          for (const [path, content] of baseLibs) {
            addFile(`libs/${path}`, content);
            commonFiles.push(`libs/${path}`);
          }
        } catch {
        }
        const i18nContent = await this.generateI18nContent(meta.language || "en");
        addFile("libs/common_i18n.js", new TextEncoder().encode(i18nContent));
        commonFiles.push("libs/common_i18n.js");
        const { files: allRequiredFiles, patterns } = this.getRequiredLibraryFilesForPages(pages, {
          includeAccessibilityToolbar: meta.addAccessibilityToolbar === true,
          includeMathJax: meta.addMathJax === true,
          skipMathJax: latexWasRendered && !meta.addMathJax
        });
        try {
          const libFiles = await this.resources.fetchLibraryFiles(allRequiredFiles, patterns);
          for (const [libPath, content] of libFiles) {
            const zipPath = `libs/${libPath}`;
            if (!this.zip.hasFile(zipPath)) {
              addFile(zipPath, content);
              commonFiles.push(zipPath);
            }
          }
        } catch {
        }
        if (needsElpxDownload) {
          await this.ensureElpxDownloadLibraries(addFile, commonFiles);
        }
        try {
          const scormFiles = await this.resources.fetchScormFiles("2004");
          for (const [filePath, content] of scormFiles) {
            addFile(`libs/${filePath}`, content);
            commonFiles.push(`libs/${filePath}`);
          }
        } catch {
          addFile("libs/SCORM_API_wrapper.js", this.getScorm2004ApiWrapper());
          addFile("libs/SCOFunctions.js", this.getSco2004Functions());
          commonFiles.push("libs/SCORM_API_wrapper.js", "libs/SCOFunctions.js");
        }
        try {
          const contentXml = await this.getContentXml();
          if (contentXml) {
            addFile("content.xml", contentXml);
            commonFiles.push("content.xml");
            addFile(ODE_DTD_FILENAME, ODE_DTD_CONTENT);
            commonFiles.push(ODE_DTD_FILENAME);
          }
        } catch {
        }
        const usedIdevices = this.getUsedIdevices(pages);
        for (const idevice of usedIdevices) {
          try {
            const normalizedType = this.resources.normalizeIdeviceType(idevice);
            const ideviceFiles = await this.resources.fetchIdeviceResources(idevice);
            for (const [path, content] of ideviceFiles) {
              addFile(`idevices/${normalizedType}/${path}`, content);
              commonFiles.push(`idevices/${normalizedType}/${path}`);
            }
          } catch {
          }
        }
        if (meta.globalFont && meta.globalFont !== "default") {
          try {
            const fontFiles = await this.resources.fetchGlobalFontFiles(meta.globalFont);
            if (fontFiles) {
              for (const [filePath, content] of fontFiles) {
                addFile(filePath, content);
                commonFiles.push(filePath);
              }
            }
          } catch (e) {
            console.warn(`[Scorm2004Exporter] Failed to fetch global font files: ${meta.globalFont}`, e);
          }
        }
        await this.addAssetsToZipWithResourcePath(fileList);
        if (needsElpxDownload && fileList) {
          const pageUrls = Object.values(pageFiles).map((pf) => pf.fileUrl);
          this.addElpxManifestToZip(fileList, pageUrls, commonFiles);
        }
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const isIndex = i === 0;
          const uniqueFilename = pageFilenameMap.get(page.id) || "page.html";
          const filename = isIndex ? "index.html" : `html/${uniqueFilename}`;
          let html = pageHtmlMap.get(filename) || "";
          if (needsElpxDownload) {
            html = this.injectElpxScripts(html, page, isIndex);
          }
          this.zip.addFile(filename, html);
        }
        const lomXml = this.lomGenerator.generate();
        this.zip.addFile("imslrm.xml", lomXml);
        const allZipFiles = this.zip.getFilePaths();
        const manifestXml = this.manifestGenerator.generate({
          commonFiles,
          pageFiles,
          allZipFiles
        });
        this.zip.addFile("imsmanifest.xml", manifestXml);
        const buffer = await this.zip.generateAsync();
        return {
          success: true,
          filename: exportFilename,
          data: buffer
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
    /**
     * Generate a random low-level project ID.
     *
     * @deprecated Since #1785, the SCORM manifest identifier is derived from
     * the project's odeIdentifier via {@link BaseExporter.getManifestIdentifier}
     * so LMS tracking survives re-uploads. This helper is kept only for
     * external callers/tests and is no longer used by the export pipeline.
     */
    generateProjectId() {
      return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    }
    /**
     * Generate SCORM 2004-enabled HTML page
     * @param page - Page data
     * @param allPages - All pages in the project
     * @param meta - Project metadata
     * @param isIndex - Whether this is the index page
     * @param themeFiles - List of root-level theme CSS/JS files
     * @param pageIndex - Index of the current page (for page counter)
     * @param faviconInfo - Favicon info (optional)
     * @param pageFilenameMap - Map of page IDs to unique filenames (optional, handles title collisions)
     */
    generateScorm2004PageHtml(page, allPages, meta, isIndex, themeFiles, pageIndex, faviconInfo, pageFilenameMap, navLabels) {
      const basePath = isIndex ? "" : "../";
      const usedIdevices = this.getUsedIdevicesForPage(page);
      let customStyles = meta.customStyles || "";
      let bodyClass = "exe-export exe-scorm exe-scorm2004";
      if (meta.globalFont && meta.globalFont !== "default") {
        const globalFontCss = GlobalFontGenerator.generateCss(meta.globalFont, basePath);
        if (globalFontCss) {
          customStyles = globalFontCss + "\n" + customStyles;
        }
        const fontBodyClass = GlobalFontGenerator.getBodyClassName(meta.globalFont);
        if (fontBodyClass) {
          bodyClass += ` ${fontBodyClass}`;
        }
      }
      return this.pageRenderer.render(page, {
        projectTitle: meta.title || "eXeLearning",
        projectSubtitle: meta.subtitle || "",
        language: meta.language || "en",
        theme: meta.theme || "base",
        customStyles,
        allPages,
        basePath,
        isIndex,
        usedIdevices,
        author: meta.author || "",
        license: meta.license || "",
        description: meta.description || "",
        licenseUrl: meta.licenseUrl || "",
        addSearchBox: false,
        addExeLink: meta.addExeLink ?? true,
        addPagination: meta.addPagination ?? false,
        totalPages: allPages.length,
        currentPageIndex: pageIndex ?? 0,
        isScorm: true,
        scormVersion: "2004",
        bodyClass,
        extraHeadScripts: this.getScorm2004HeadScripts(basePath),
        onLoadScript: "loadPage()",
        onUnloadScript: "unloadPage()",
        hideNavigation: true,
        hideNavButtons: true,
        themeFiles: themeFiles || [],
        faviconPath: faviconInfo?.path,
        faviconType: faviconInfo?.type,
        pageFilenameMap,
        // Pre-translated nav button labels (resolved from XLF at export time)
        navLabels,
        version: meta.exelearningVersion
      });
    }
    /**
     * Get SCORM 2004-specific head scripts
     */
    getScorm2004HeadScripts(basePath) {
      return `<script src="${basePath}libs/SCORM_API_wrapper.js"><\/script>
<script src="${basePath}libs/SCOFunctions.js"><\/script>`;
    }
    /**
     * Get SCORM 2004 API wrapper (fallback)
     */
    getScorm2004ApiWrapper() {
      return `/**
 * SCORM 2004 API Wrapper
 * Minimal implementation for SCORM 2004 communication
 */
var pipwerks = pipwerks || {};

pipwerks.SCORM = {
  version: "2004",
  API: { handle: null, isFound: false },
  data: { completionStatus: null, exitStatus: null },
  debug: { isActive: true }
};

pipwerks.SCORM.API.find = function(win) {
  var findAttempts = 0, findAttemptLimit = 500;
  while (!win.API_1484_11 && win.parent && win.parent !== win && findAttempts < findAttemptLimit) {
    findAttempts++;
    win = win.parent;
  }
  return win.API_1484_11 || null;
};

pipwerks.SCORM.API.get = function() {
  var win = window;
  if (win.parent && win.parent !== win) { this.handle = this.find(win.parent); }
  if (!this.handle && win.opener) { this.handle = this.find(win.opener); }
  if (this.handle) { this.isFound = true; }
  return this.handle;
};

pipwerks.SCORM.API.getHandle = function() {
  if (!this.handle) { this.get(); }
  return this.handle;
};

pipwerks.SCORM.connection = { isActive: false };

pipwerks.SCORM.init = function() {
  var success = false, API = this.API.getHandle();
  if (API) {
    success = API.Initialize("");
    if (success === "true" || success === true) {
      this.connection.isActive = true;
      success = true;
    }
  }
  return success;
};

pipwerks.SCORM.quit = function() {
  var success = false, API = this.API.getHandle();
  if (API && this.connection.isActive) {
    success = API.Terminate("");
    if (success === "true" || success === true) {
      this.connection.isActive = false;
      success = true;
    }
  }
  return success;
};

pipwerks.SCORM.get = function(parameter) {
  var value = "", API = this.API.getHandle();
  if (API && this.connection.isActive) {
    value = API.GetValue(parameter);
  }
  return value;
};

pipwerks.SCORM.set = function(parameter, value) {
  var success = false, API = this.API.getHandle();
  if (API && this.connection.isActive) {
    success = API.SetValue(parameter, value);
    success = (success === "true" || success === true);
  }
  return success;
};

pipwerks.SCORM.save = function() {
  var success = false, API = this.API.getHandle();
  if (API && this.connection.isActive) {
    success = API.Commit("");
    success = (success === "true" || success === true);
  }
  return success;
};

// Shorthand
var scorm = pipwerks.SCORM;
`;
    }
    /**
     * Get SCO Functions for SCORM 2004 (fallback)
     */
    getSco2004Functions() {
      return `/**
 * SCO Functions for SCORM 2004
 * Page load/unload handlers for SCORM 2004 communication
 */

var startTimeStamp = null;
var exitPageStatus = false;

function loadPage() {
  startTimeStamp = new Date();
  var result = scorm.init();
  if (result) {
    var status = scorm.get("cmi.completion_status");
    if (status === "not attempted" || status === "unknown" || status === "") {
      scorm.set("cmi.completion_status", "incomplete");
    }
  }
  return result;
}

function unloadPage() {
  if (!exitPageStatus) {
    exitPageStatus = true;
    computeTime();
    scorm.set("cmi.exit", "suspend");
    scorm.save();
    scorm.quit();
  }
}

function computeTime() {
  if (startTimeStamp != null) {
    var now = new Date();
    var elapsed = now.getTime() - startTimeStamp.getTime();
    // SCORM 2004 uses ISO 8601 duration format
    var seconds = Math.round(elapsed / 1000);
    var hours = Math.floor(seconds / 3600);
    var mins = Math.floor((seconds - hours * 3600) / 60);
    var secs = seconds - hours * 3600 - mins * 60;
    // Format: PT#H#M#S
    var sessionTime = "PT" + hours + "H" + mins + "M" + secs + "S";
    scorm.set("cmi.session_time", sessionTime);
  }
}

function setComplete() {
  scorm.set("cmi.completion_status", "completed");
  scorm.set("cmi.success_status", "passed");
  scorm.save();
}

function setIncomplete() {
  scorm.set("cmi.completion_status", "incomplete");
  scorm.save();
}

function setScore(score, maxScore, minScore) {
  // SCORM 2004 score must be between 0 and 1
  var scaledScore = maxScore ? score / maxScore : score / 100;
  scorm.set("cmi.score.scaled", scaledScore);
  scorm.set("cmi.score.raw", score);
  if (maxScore !== undefined) scorm.set("cmi.score.max", maxScore);
  if (minScore !== undefined) scorm.set("cmi.score.min", minScore);
  scorm.save();
}
`;
    }
    /**
     * Get content.xml from the document for inclusion in SCORM package
     * This allows the package to be re-edited in eXeLearning
     */
    async getContentXml() {
      if ("getContentXml" in this.document && typeof this.document.getContentXml === "function") {
        return this.document.getContentXml();
      }
      return null;
    }
  };

  // src/shared/export/generators/ImsManifest.ts
  var ImsManifestGenerator = class {
    /**
     * @param projectId - Bare project identifier (used for organization id and resource ids)
     * @param pages - Pages from navigation structure
     * @param metadata - Project metadata
     * @param manifestIdentifier - Optional pre-built manifest@identifier. When provided
     *   it is used verbatim (no `eXe-MANIFEST-` prefix is prepended). Pass this from
     *   BaseExporter.getManifestIdentifier() so re-exports of the same project produce
     *   a stable identifier the LMS can track (see exelearning/exelearning#1785).
     */
    constructor(projectId, pages, metadata = {}, manifestIdentifier = null) {
      this.projectId = projectId || this.generateId();
      this.pages = pages || [];
      this.metadata = metadata;
      this.manifestIdentifier = manifestIdentifier;
    }
    /**
     * Generate a unique ID for the project
     * @returns Unique ID string
     */
    generateId() {
      return "exe-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    }
    /**
     * Generate complete imsmanifest.xml content
     * @param options - Generation options
     * @returns Complete XML string
     */
    generate(options = {}) {
      const { commonFiles = [], pageFiles = {}, allZipFiles } = options;
      let effectiveCommonFiles = commonFiles;
      if (allZipFiles && allZipFiles.length > 0) {
        effectiveCommonFiles = this.categorizeFilesForCommon(allZipFiles, pageFiles);
      }
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += this.generateManifestOpen();
      xml += this.generateMetadata();
      xml += this.generateOrganizations();
      xml += this.generateResources(effectiveCommonFiles, pageFiles);
      xml += "</manifest>\n";
      return xml;
    }
    /**
     * Categorize files into COMMON_FILES based on complete ZIP file list.
     * All files except page HTML files and imsmanifest.xml go into COMMON_FILES.
     * @param allFiles - Complete list of files in the ZIP
     * @param pageFiles - Map of page file info (to identify page HTML files)
     * @returns List of files for COMMON_FILES resource
     */
    categorizeFilesForCommon(allFiles, pageFiles) {
      const pageHtmlFiles = /* @__PURE__ */ new Set();
      for (const page of this.pages) {
        const pageFile = pageFiles[page.id];
        if (pageFile?.fileUrl) {
          pageHtmlFiles.add(pageFile.fileUrl);
        } else {
          const isIndex = this.pages.indexOf(page) === 0;
          const defaultUrl = isIndex ? "index.html" : `html/${this.sanitizeFilename(page.title)}.html`;
          pageHtmlFiles.add(defaultUrl);
        }
      }
      const excludedFiles = /* @__PURE__ */ new Set([...pageHtmlFiles, "imsmanifest.xml", "imslrm.xml"]);
      return allFiles.filter((file) => !excludedFiles.has(file)).sort();
    }
    /**
     * Generate manifest opening tag with IMS CP namespaces
     * @returns Manifest opening XML
     */
    generateManifestOpen() {
      const identifier = this.manifestIdentifier ?? `eXe-MANIFEST-${this.projectId}`;
      return `<manifest identifier="${this.escapeXml(identifier)}"
  xmlns="${IMS_NAMESPACES.imscp}"
  xmlns:imsmd="${IMS_NAMESPACES.imsmd}">
`;
    }
    /**
     * Generate metadata section with inline LOM
     * @returns Metadata XML
     */
    generateMetadata() {
      const title = this.metadata.title || "eXeLearning";
      const description = this.metadata.description || "";
      const language = this.metadata.language || "en";
      const author = this.metadata.author || "";
      let xml = "  <metadata>\n";
      xml += "    <schema>IMS Content</schema>\n";
      xml += "    <schemaversion>1.1.3</schemaversion>\n";
      xml += "    <imsmd:lom>\n";
      xml += "      <imsmd:general>\n";
      xml += `        <imsmd:title>
`;
      xml += `          <imsmd:langstring xml:lang="${this.escapeXml(language)}">${this.escapeXml(title)}</imsmd:langstring>
`;
      xml += `        </imsmd:title>
`;
      if (description) {
        xml += `        <imsmd:description>
`;
        xml += `          <imsmd:langstring xml:lang="${this.escapeXml(language)}">${this.escapeXml(description)}</imsmd:langstring>
`;
        xml += `        </imsmd:description>
`;
      }
      xml += `        <imsmd:language>${this.escapeXml(language)}</imsmd:language>
`;
      xml += "      </imsmd:general>\n";
      if (author) {
        xml += "      <imsmd:lifecycle>\n";
        xml += "        <imsmd:contribute>\n";
        xml += "          <imsmd:role>\n";
        xml += "            <imsmd:value>Author</imsmd:value>\n";
        xml += "          </imsmd:role>\n";
        xml += "          <imsmd:centity>\n";
        xml += `            <imsmd:vcard>BEGIN:VCARD\\nFN:${this.escapeXml(author)}\\nEND:VCARD</imsmd:vcard>
`;
        xml += "          </imsmd:centity>\n";
        xml += "        </imsmd:contribute>\n";
        xml += "      </imsmd:lifecycle>\n";
      }
      xml += "    </imsmd:lom>\n";
      xml += "  </metadata>\n";
      return xml;
    }
    /**
     * Generate organizations section
     * @returns Organizations XML
     */
    generateOrganizations() {
      const orgId = `eXe-${this.projectId}`;
      const title = this.metadata.title || "eXeLearning";
      let xml = `  <organizations default="${this.escapeXml(orgId)}">
`;
      xml += `    <organization identifier="${this.escapeXml(orgId)}" structure="hierarchical">
`;
      xml += `      <title>${this.escapeXml(title)}</title>
`;
      xml += this.generateItems();
      xml += "    </organization>\n";
      xml += "  </organizations>\n";
      return xml;
    }
    /**
     * Generate item elements for pages in hierarchical structure
     * @returns Items XML
     */
    generateItems() {
      const pageMap = /* @__PURE__ */ new Map();
      for (const page of this.pages) {
        pageMap.set(page.id, page);
      }
      const rootPages = this.pages.filter((p) => !p.parentId);
      let xml = "";
      for (const page of rootPages) {
        xml += this.generateItemRecursive(page, pageMap, 3);
      }
      return xml;
    }
    /**
     * Generate item element recursively for nested pages
     * @param page - Page object
     * @param pageMap - Map of all pages by ID
     * @param indent - Indentation level
     * @returns Item XML
     */
    generateItemRecursive(page, pageMap, indent) {
      const indentStr = "  ".repeat(indent);
      const isVisible = "true";
      const children = this.pages.filter((p) => p.parentId === page.id);
      let xml = `${indentStr}<item identifier="ITEM-${this.escapeXml(page.id)}" identifierref="RES-${this.escapeXml(page.id)}" isvisible="${isVisible}">
`;
      xml += `${indentStr}  <title>${this.escapeXml(page.title || "Page")}</title>
`;
      for (const child of children) {
        xml += this.generateItemRecursive(child, pageMap, indent + 1);
      }
      xml += `${indentStr}</item>
`;
      return xml;
    }
    /**
     * Generate resources section
     * @param commonFiles - List of common file paths
     * @param pageFiles - Map of pageId to file info
     * @returns Resources XML
     */
    generateResources(commonFiles, pageFiles) {
      let xml = "  <resources>\n";
      for (const page of this.pages) {
        const pageFile = pageFiles[page.id] || {};
        xml += this.generatePageResource(page, pageFile);
      }
      xml += this.generateCommonFilesResource(commonFiles);
      xml += "  </resources>\n";
      return xml;
    }
    /**
     * Generate resource element for a page
     * @param page - Page object
     * @param pageFile - Page file info
     * @returns Resource XML
     */
    generatePageResource(page, pageFile) {
      const pageId = page.id;
      const isIndex = this.pages.indexOf(page) === 0;
      const fileUrl = pageFile.fileUrl || (isIndex ? "index.html" : `html/${this.sanitizeFilename(page.title)}.html`);
      let xml = `    <resource identifier="RES-${this.escapeXml(pageId)}" type="webcontent" href="${this.escapeXml(fileUrl)}">
`;
      xml += `      <file href="${this.escapeXml(fileUrl)}"/>
`;
      const files = pageFile.files || [];
      for (const file of files) {
        xml += `      <file href="${this.escapeXml(file)}"/>
`;
      }
      xml += '      <dependency identifierref="COMMON_FILES"/>\n';
      xml += "    </resource>\n";
      return xml;
    }
    /**
     * Generate COMMON_FILES resource for shared assets
     * @param commonFiles - List of common file paths
     * @returns Resource XML
     */
    generateCommonFilesResource(commonFiles) {
      let xml = '    <resource identifier="COMMON_FILES" type="webcontent">\n';
      for (const file of commonFiles) {
        xml += `      <file href="${this.escapeXml(file)}"/>
`;
      }
      xml += "    </resource>\n";
      return xml;
    }
    /**
     * Escape XML special characters
     * @param str - String to escape
     * @returns Escaped string
     */
    escapeXml(str) {
      if (!str) return "";
      return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
    /**
     * Sanitize filename for use in paths
     * @param title - Title to sanitize
     * @returns Sanitized filename
     */
    sanitizeFilename(title) {
      if (!title) return "page";
      return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").substring(0, 50);
    }
  };

  // src/shared/export/exporters/ImsExporter.ts
  var ImsExporter = class extends Html5Exporter {
    constructor() {
      super(...arguments);
      this.manifestGenerator = null;
    }
    /**
     * Get file suffix for IMS CP format
     */
    getFileSuffix() {
      return "_ims";
    }
    /**
     * Export to IMS Content Package ZIP
     */
    async export(options) {
      const exportFilename = options?.filename || this.buildFilename();
      try {
        let pages = this.buildPageList();
        const meta = this.getMetadata();
        const themeName = options?.theme || meta.theme || "base";
        const manifestIdentifier = this.getManifestIdentifier();
        const projectId = this.getBareProjectIdentifier();
        pages = await this.preprocessPagesForExport(pages);
        pages = pages.filter((p) => this.isPageVisible(p, pages));
        const pageFilenameMap = this.buildPageFilenameMap(pages);
        const needsElpxDownload = this.needsElpxDownloadSupport(pages);
        const fileList = needsElpxDownload ? [] : null;
        const addFile = (path, content) => {
          this.zip.addFile(path, content);
          if (fileList) fileList.push(path);
        };
        this.manifestGenerator = new ImsManifestGenerator(
          projectId,
          pages,
          {
            identifier: manifestIdentifier,
            pages,
            title: meta.title || "eXeLearning",
            language: meta.language || "en",
            author: meta.author || "",
            description: meta.description || "",
            license: meta.license || ""
          },
          manifestIdentifier
        );
        const commonFiles = [];
        const pageFiles = {};
        const { themeFilesMap, themeRootFiles, faviconInfo } = await this.prepareThemeData(themeName);
        this.ideviceRenderer.setThemeIconFiles(themeFilesMap);
        const navLabels = await this.fetchNavLabels(meta.language || "en", meta.license);
        const pageHtmlMap = /* @__PURE__ */ new Map();
        let latexWasRendered = false;
        let mermaidWasRendered = false;
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const isIndex = i === 0;
          let html = this.generateImsPageHtml(
            page,
            pages,
            meta,
            isIndex,
            themeRootFiles,
            i,
            faviconInfo,
            pageFilenameMap,
            navLabels
          );
          if (!meta.addMathJax) {
            if (options?.preRenderDataGameLatex) {
              try {
                const result = await options.preRenderDataGameLatex(html);
                if (result.count > 0) {
                  html = result.html;
                  latexWasRendered = true;
                  console.log(
                    `[ImsExporter] Pre-rendered LaTeX in ${result.count} DataGame(s) on page: ${page.title}`
                  );
                }
              } catch (error) {
                console.warn("[ImsExporter] DataGame LaTeX pre-render failed for page:", page.title, error);
              }
            }
            if (options?.preRenderLatex) {
              try {
                const result = await options.preRenderLatex(html);
                if (result.latexRendered) {
                  html = result.html;
                  latexWasRendered = true;
                  console.log(
                    `[ImsExporter] Pre-rendered ${result.count} LaTeX expressions on page: ${page.title}`
                  );
                }
              } catch (error) {
                console.warn("[ImsExporter] LaTeX pre-render failed for page:", page.title, error);
              }
            }
          }
          if (options?.preRenderMermaid) {
            try {
              const result = await options.preRenderMermaid(html);
              if (result.mermaidRendered) {
                html = result.html;
                mermaidWasRendered = true;
                console.log(
                  `[ImsExporter] Pre-rendered ${result.count} Mermaid diagram(s) on page: ${page.title}`
                );
              }
            } catch (error) {
              console.warn("[ImsExporter] Mermaid pre-render failed for page:", page.title, error);
            }
          }
          const uniqueFilename = pageFilenameMap.get(page.id) || "page.html";
          const pageFilename = isIndex ? "index.html" : `html/${uniqueFilename}`;
          pageHtmlMap.set(pageFilename, html);
          pageFiles[page.id] = {
            fileUrl: pageFilename,
            files: []
          };
        }
        const contentCssFiles = await this.resources.fetchContentCss();
        let baseCss = contentCssFiles.get("content/css/base.css");
        if (!baseCss) {
          throw new Error("Failed to fetch content/css/base.css");
        }
        if (latexWasRendered || mermaidWasRendered) {
          const decoder = new TextDecoder();
          let baseCssText = decoder.decode(baseCss);
          if (latexWasRendered) {
            baseCssText += "\n" + this.getPreRenderedLatexCss();
          }
          if (mermaidWasRendered) {
            baseCssText += "\n" + this.getPreRenderedMermaidCss();
          }
          const encoder = new TextEncoder();
          baseCss = encoder.encode(baseCssText);
        }
        addFile("content/css/base.css", baseCss);
        commonFiles.push("content/css/base.css");
        if (meta.addExeLink !== false) {
          try {
            const logoData = await this.resources.fetchExeLogo();
            if (logoData) {
              addFile("content/img/exe_powered_logo.png", logoData);
              commonFiles.push("content/img/exe_powered_logo.png");
            }
          } catch {
          }
        }
        if (themeFilesMap) {
          for (const [filePath, content] of themeFilesMap) {
            addFile(`theme/${filePath}`, content);
            commonFiles.push(`theme/${filePath}`);
          }
        } else {
          addFile("theme/style.css", this.getFallbackThemeCss());
          addFile("theme/style.js", this.getFallbackThemeJs());
          commonFiles.push("theme/style.css", "theme/style.js");
        }
        try {
          const baseLibs = await this.resources.fetchBaseLibraries();
          for (const [path, content] of baseLibs) {
            addFile(`libs/${path}`, content);
            commonFiles.push(`libs/${path}`);
          }
        } catch {
        }
        const i18nContent = await this.generateI18nContent(meta.language || "en");
        addFile("libs/common_i18n.js", new TextEncoder().encode(i18nContent));
        commonFiles.push("libs/common_i18n.js");
        const { files: allRequiredFiles, patterns } = this.getRequiredLibraryFilesForPages(pages, {
          includeAccessibilityToolbar: meta.addAccessibilityToolbar === true,
          includeMathJax: meta.addMathJax === true,
          skipMathJax: latexWasRendered && !meta.addMathJax
        });
        try {
          const libFiles = await this.resources.fetchLibraryFiles(allRequiredFiles, patterns);
          for (const [libPath, content] of libFiles) {
            const zipPath = `libs/${libPath}`;
            if (!this.zip.hasFile(zipPath)) {
              addFile(zipPath, content);
              commonFiles.push(zipPath);
            }
          }
        } catch {
        }
        if (needsElpxDownload) {
          await this.ensureElpxDownloadLibraries(addFile, commonFiles);
        }
        const usedIdevices = this.getUsedIdevices(pages);
        for (const idevice of usedIdevices) {
          try {
            const normalizedType = this.resources.normalizeIdeviceType(idevice);
            const ideviceFiles = await this.resources.fetchIdeviceResources(idevice);
            for (const [path, content] of ideviceFiles) {
              addFile(`idevices/${normalizedType}/${path}`, content);
              commonFiles.push(`idevices/${normalizedType}/${path}`);
            }
          } catch {
          }
        }
        if (meta.globalFont && meta.globalFont !== "default") {
          try {
            const fontFiles = await this.resources.fetchGlobalFontFiles(meta.globalFont);
            if (fontFiles) {
              for (const [filePath, content] of fontFiles) {
                addFile(filePath, content);
                commonFiles.push(filePath);
              }
            }
          } catch (e) {
            console.warn(`[ImsExporter] Failed to fetch global font files: ${meta.globalFont}`, e);
          }
        }
        await this.addAssetsToZipWithResourcePath(fileList);
        const contentXml = generateOdeXml(meta, pages);
        addFile("content.xml", contentXml);
        addFile(ODE_DTD_FILENAME, ODE_DTD_CONTENT);
        commonFiles.push("content.xml", ODE_DTD_FILENAME);
        if (needsElpxDownload && fileList) {
          const pageUrls = Object.values(pageFiles).map((pf) => pf.fileUrl);
          this.addElpxManifestToZip(fileList, pageUrls, commonFiles);
        }
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const isIndex = i === 0;
          const uniqueFilename = pageFilenameMap.get(page.id) || "page.html";
          const filename = isIndex ? "index.html" : `html/${uniqueFilename}`;
          let html = pageHtmlMap.get(filename) || "";
          if (needsElpxDownload) {
            html = this.injectElpxScripts(html, page, isIndex);
          }
          this.zip.addFile(filename, html);
        }
        const allZipFiles = this.zip.getFilePaths();
        const manifestXml = this.manifestGenerator.generate({
          commonFiles,
          pageFiles,
          allZipFiles
        });
        this.zip.addFile("imsmanifest.xml", manifestXml);
        const buffer = await this.zip.generateAsync();
        return {
          success: true,
          filename: exportFilename,
          data: buffer
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
    /**
     * Generate a random low-level project ID.
     *
     * @deprecated Since #1785, the IMS manifest identifier is derived from
     * the project's odeIdentifier via {@link BaseExporter.getManifestIdentifier}
     * so LMS tracking survives re-uploads. This helper is kept only for
     * external callers/tests and is no longer used by the export pipeline.
     */
    generateProjectId() {
      return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    }
    /**
     * Generate IMS CP HTML page (standard website, no SCORM)
     * @param page - Page data
     * @param allPages - All pages in the project
     * @param meta - Project metadata
     * @param isIndex - Whether this is the index page
     * @param themeFiles - List of root-level theme CSS/JS files
     * @param pageIndex - Index of the current page (for page counter)
     * @param faviconInfo - Favicon info (optional)
     * @param pageFilenameMap - Map of page IDs to unique filenames (optional, handles title collisions)
     */
    generateImsPageHtml(page, allPages, meta, isIndex, themeFiles, pageIndex, faviconInfo, pageFilenameMap, navLabels) {
      const basePath = isIndex ? "" : "../";
      const usedIdevices = this.getUsedIdevicesForPage(page);
      let customStyles = meta.customStyles || "";
      let bodyClass = "exe-export exe-ims";
      if (meta.globalFont && meta.globalFont !== "default") {
        const globalFontCss = GlobalFontGenerator.generateCss(meta.globalFont, basePath);
        if (globalFontCss) {
          customStyles = globalFontCss + "\n" + customStyles;
        }
        const fontBodyClass = GlobalFontGenerator.getBodyClassName(meta.globalFont);
        if (fontBodyClass) {
          bodyClass += ` ${fontBodyClass}`;
        }
      }
      return this.pageRenderer.render(page, {
        projectTitle: meta.title || "eXeLearning",
        projectSubtitle: meta.subtitle || "",
        language: meta.language || "en",
        theme: meta.theme || "base",
        customStyles,
        allPages,
        basePath,
        isIndex,
        usedIdevices,
        author: meta.author || "",
        license: meta.license || "",
        description: meta.description || "",
        licenseUrl: meta.licenseUrl || "",
        // Export options - IMS specific overrides
        // IMS exports don't use client-side search - LMS handles navigation
        addSearchBox: false,
        addExeLink: meta.addExeLink ?? true,
        addPagination: meta.addPagination ?? false,
        totalPages: allPages.length,
        currentPageIndex: pageIndex ?? 0,
        bodyClass,
        // Hide navigation elements - LMS handles navigation in IMS
        hideNavigation: true,
        hideNavButtons: true,
        // Theme files for HTML head includes
        themeFiles: themeFiles || [],
        // Favicon options
        faviconPath: faviconInfo?.path,
        faviconType: faviconInfo?.type,
        // Page filename map for navigation links (handles title collisions)
        pageFilenameMap,
        // Pre-translated nav button labels (resolved from XLF at export time)
        navLabels,
        // Application version for generator meta tag
        version: meta.exelearningVersion
      });
    }
  };

  // src/shared/utils/html-constants.ts
  var VOID_ELEMENTS = [
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr"
  ];

  // src/shared/export/exporters/Epub3Exporter.ts
  var EPUB3_NAMESPACES = {
    OPF: "http://www.idpf.org/2007/opf",
    DC: "http://purl.org/dc/elements/1.1/",
    XHTML: "http://www.w3.org/1999/xhtml",
    EPUB: "http://www.idpf.org/2007/ops",
    CONTAINER: "urn:oasis:names:tc:opendocument:xmlns:container"
  };
  var EPUB3_MIMETYPE = "application/epub+zip";
  var MIME_TYPES = {
    ".xhtml": "application/xhtml+xml",
    ".html": "application/xhtml+xml",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".mp3": "audio/mpeg",
    ".mp4": "video/mp4",
    ".ogg": "audio/ogg",
    ".ogv": "video/ogg",
    ".webm": "video/webm",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
    ".eot": "application/vnd.ms-fontobject"
  };
  var Epub3Exporter = class extends BaseExporter {
    constructor() {
      super(...arguments);
      this.manifestItems = [];
      this.spineItems = [];
      this.usedIds = /* @__PURE__ */ new Set();
    }
    /**
     * Get file extension for EPUB3 format
     */
    getFileExtension() {
      return ".epub";
    }
    /**
     * Get file suffix for EPUB3 format
     */
    getFileSuffix() {
      return "";
    }
    /**
     * Export to EPUB3
     */
    async export(options) {
      const exportFilename = options?.filename || this.buildFilename();
      const epub3Options = options;
      try {
        this.manifestItems = [];
        this.spineItems = [];
        this.usedIds = /* @__PURE__ */ new Set();
        let pages = this.buildPageList();
        const meta = this.getMetadata();
        const themeName = epub3Options?.theme || meta.theme || "base";
        const bookId = epub3Options?.bookId || this.generateBookId();
        pages = await this.preprocessPagesForExport(pages);
        const pageFilenameMap = this.buildPageFilenameMap(pages);
        const { themeFilesMap, themeRootFiles, faviconInfo } = await this.prepareThemeData(themeName);
        this.zip.addFile("mimetype", EPUB3_MIMETYPE);
        this.zip.addFile("META-INF/container.xml", this.generateContainerXml());
        const navXhtml = this.generateNavXhtml(pages, meta, pageFilenameMap);
        this.zip.addFile("EPUB/nav.xhtml", navXhtml);
        this.addManifestItem("nav", "nav.xhtml", "application/xhtml+xml", "nav");
        const navLabels = await this.fetchNavLabels(meta.language || "en", meta.license);
        let latexWasRendered = false;
        let mermaidWasRendered = false;
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          let xhtml = this.generatePageXhtml(
            page,
            pages,
            meta,
            i === 0,
            i,
            themeRootFiles,
            faviconInfo,
            navLabels
          );
          if (!meta.addMathJax) {
            if (options?.preRenderDataGameLatex) {
              try {
                const result = await options.preRenderDataGameLatex(xhtml);
                if (result.count > 0) {
                  xhtml = result.html;
                  latexWasRendered = true;
                }
              } catch (error) {
              }
            }
            if (options?.preRenderLatex) {
              try {
                const result = await options.preRenderLatex(xhtml);
                if (result.latexRendered) {
                  xhtml = result.html;
                  latexWasRendered = true;
                }
              } catch (error) {
              }
            }
          }
          if (options?.preRenderMermaid) {
            try {
              const result = await options.preRenderMermaid(xhtml);
              if (result.mermaidRendered) {
                xhtml = result.html;
                mermaidWasRendered = true;
              }
            } catch (error) {
            }
          }
          const mapFilename = pageFilenameMap.get(page.id) || "page.html";
          const xhtmlFilename = mapFilename.replace(/\.html$/, ".xhtml");
          const filename = i === 0 ? "index.xhtml" : `html/${xhtmlFilename}`;
          this.zip.addFile(`EPUB/${filename}`, xhtml);
          const pageId = this.generateUniqueId(`page-${i}`);
          this.addManifestItem(pageId, filename, "application/xhtml+xml", "scripted");
          this.spineItems.push({ idref: pageId });
        }
        const contentCssFiles = await this.resources.fetchContentCss();
        const fetchedBaseCss = contentCssFiles.get("content/css/base.css");
        if (!fetchedBaseCss) {
          throw new Error("Failed to fetch content/css/base.css");
        }
        const baseCssContent = typeof fetchedBaseCss === "string" ? fetchedBaseCss : new TextDecoder().decode(fetchedBaseCss);
        let baseCss = baseCssContent + "\n" + this.getEpubSpecificCss();
        if (latexWasRendered) {
          baseCss += "\n" + this.getPreRenderedLatexCss();
        }
        if (mermaidWasRendered) {
          baseCss += "\n" + this.getPreRenderedMermaidCss();
        }
        this.zip.addFile("EPUB/content/css/base.css", baseCss);
        this.addManifestItem("css-base", "content/css/base.css", "text/css");
        if (meta.addExeLink !== false) {
          try {
            const logoData = await this.resources.fetchExeLogo();
            if (logoData) {
              this.zip.addFile("EPUB/content/img/exe_powered_logo.png", logoData);
              this.addManifestItem("exe-logo", "content/img/exe_powered_logo.png", "image/png");
            }
          } catch {
          }
        }
        if (themeFilesMap) {
          for (const [filePath, content] of themeFilesMap) {
            this.zip.addFile(`EPUB/theme/${filePath}`, content);
            const ext = this.getFileExtensionFromPath(filePath);
            const mimeType = MIME_TYPES[ext] || "application/octet-stream";
            this.addManifestItem(this.generateUniqueId(`theme-${filePath}`), `theme/${filePath}`, mimeType);
          }
        } else {
          this.zip.addFile("EPUB/theme/style.css", this.getFallbackThemeCss());
          this.addManifestItem("theme-css", "theme/style.css", "text/css");
        }
        const { files: allRequiredFiles, patterns } = this.getRequiredLibraryFilesForPages(pages, {
          includeAccessibilityToolbar: meta.addAccessibilityToolbar === true
        });
        try {
          const libFiles = await this.resources.fetchLibraryFiles(allRequiredFiles, patterns);
          for (const [path, content] of libFiles) {
            const finalContent = this.transformForEpub(path, content);
            this.zip.addFile(`EPUB/libs/${path}`, finalContent);
            const ext = this.getFileExtensionFromPath(path);
            const mimeType = MIME_TYPES[ext] || "application/octet-stream";
            this.addManifestItem(this.generateUniqueId(`lib-${path}`), `libs/${path}`, mimeType);
          }
        } catch {
          try {
            const baseLibs = await this.resources.fetchBaseLibraries();
            for (const [path, content] of baseLibs) {
              const finalContent = this.transformForEpub(path, content);
              this.zip.addFile(`EPUB/libs/${path}`, finalContent);
              const ext = this.getFileExtensionFromPath(path);
              const mimeType = MIME_TYPES[ext] || "application/octet-stream";
              this.addManifestItem(this.generateUniqueId(`lib-${path}`), `libs/${path}`, mimeType);
            }
          } catch {
          }
        }
        const i18nContent = await this.generateI18nContent(meta.language || "en");
        this.zip.addFile("EPUB/libs/common_i18n.js", i18nContent);
        this.addManifestItem("common-i18n", "libs/common_i18n.js", "application/javascript");
        const guardsScript = this.generateEpubGuardsScript();
        this.zip.addFile("EPUB/libs/exe_epub_guards.js", guardsScript);
        this.addManifestItem("epub-guards", "libs/exe_epub_guards.js", "application/javascript");
        try {
          const baseLibs = await this.resources.fetchBaseLibraries();
          for (const [path, content] of baseLibs) {
            const zipPath = `EPUB/libs/${path}`;
            if (!this.zip.hasFile(zipPath)) {
              this.zip.addFile(zipPath, content);
              const ext = this.getFileExtensionFromPath(path);
              const mimeType = MIME_TYPES[ext] || "application/octet-stream";
              this.addManifestItem(this.generateUniqueId(`baselib-${path}`), `libs/${path}`, mimeType);
            }
          }
        } catch {
        }
        const usedIdevices = this.getUsedIdevices(pages);
        for (const idevice of usedIdevices) {
          try {
            const ideviceFiles = await this.resources.fetchIdeviceResources(idevice);
            for (const [filePath, content] of ideviceFiles) {
              if (filePath.endsWith(".html")) {
                continue;
              }
              if (filePath.endsWith(".test.js") || filePath.endsWith(".spec.js")) {
                continue;
              }
              this.zip.addFile(`EPUB/idevices/${idevice}/${filePath}`, content);
              const ext = this.getFileExtensionFromPath(filePath);
              const mimeType = MIME_TYPES[ext] || "application/octet-stream";
              this.addManifestItem(
                this.generateUniqueId(`idevice-${idevice}-${filePath}`),
                `idevices/${idevice}/${filePath}`,
                mimeType
              );
            }
          } catch {
          }
        }
        if (meta.globalFont && meta.globalFont !== "default") {
          try {
            const fontFiles = await this.resources.fetchGlobalFontFiles(meta.globalFont);
            if (fontFiles) {
              for (const [filePath, content] of fontFiles) {
                this.zip.addFile(`EPUB/${filePath}`, content);
                const ext = this.getFileExtensionFromPath(filePath);
                const mimeType = MIME_TYPES[ext] || "application/octet-stream";
                this.addManifestItem(this.generateUniqueId(`font-${filePath}`), filePath, mimeType);
              }
            }
          } catch {
          }
        }
        const _assetsAdded = await this.addEpubAssets();
        if (meta.exportSource !== false) {
          try {
            const contentXml = await this.getContentXml();
            if (contentXml) {
              this.zip.addFile("EPUB/content.xml", contentXml);
              this.addManifestItem("content-xml", "content.xml", "application/xml");
              this.zip.addFile("EPUB/" + ODE_DTD_FILENAME, ODE_DTD_CONTENT);
              this.addManifestItem("content-dtd", ODE_DTD_FILENAME, "application/xml-dtd");
            }
          } catch {
          }
        }
        const packageOpf = this.generatePackageOpf(meta, bookId);
        this.zip.addFile("EPUB/package.opf", packageOpf);
        const buffer = await this.zip.generateAsync();
        return {
          success: true,
          filename: exportFilename,
          data: buffer
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
    /**
     * Generate unique book ID (URN UUID format)
     */
    generateBookId() {
      return `urn:uuid:${crypto.randomUUID()}`;
    }
    /**
     * Generate unique manifest ID
     */
    generateUniqueId(base) {
      const sanitized = base.replace(/[^a-zA-Z0-9-_]/g, "-").replace(/-+/g, "-").substring(0, 50);
      if (!this.usedIds.has(sanitized)) {
        this.usedIds.add(sanitized);
        return sanitized;
      }
      let counter = 1;
      while (this.usedIds.has(`${sanitized}-${counter}`)) {
        counter++;
      }
      const uniqueId = `${sanitized}-${counter}`;
      this.usedIds.add(uniqueId);
      return uniqueId;
    }
    /**
     * Add item to manifest
     */
    addManifestItem(id, href, mediaType, properties) {
      this.manifestItems.push({ id, href, mediaType, properties });
    }
    /**
     * Get file extension from path
     */
    getFileExtensionFromPath(filePath) {
      const lastDot = filePath.lastIndexOf(".");
      return lastDot > 0 ? filePath.substring(lastDot).toLowerCase() : "";
    }
    /**
     * Generate container.xml
     */
    generateContainerXml() {
      return `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="${EPUB3_NAMESPACES.CONTAINER}">
  <rootfiles>
    <rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
    }
    /**
     * Generate package.opf (OPF manifest)
     */
    generatePackageOpf(meta, bookId) {
      const modified = (/* @__PURE__ */ new Date()).toISOString().replace(/\.\d{3}Z$/, "Z");
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<package version="3.0" unique-identifier="pub-id" xmlns="${EPUB3_NAMESPACES.OPF}">
  <metadata xmlns:dc="${EPUB3_NAMESPACES.DC}">
    <dc:identifier id="pub-id">${this.escapeXml(bookId)}</dc:identifier>
    <dc:title>${this.escapeXml(meta.title || "eXeLearning")}</dc:title>
    <dc:language>${this.escapeXml(meta.language || "en")}</dc:language>
    <dc:creator>${this.escapeXml(meta.author || "")}</dc:creator>`;
      if (meta.description) {
        xml += `
    <dc:description>${this.escapeXml(meta.description)}</dc:description>`;
      }
      if (meta.license) {
        xml += `
    <dc:rights>${this.escapeXml(meta.license)}</dc:rights>`;
      }
      xml += `
    <meta property="dcterms:modified">${modified}</meta>
  </metadata>
  <manifest>`;
      for (const item of this.manifestItems) {
        const props = item.properties ? ` properties="${item.properties}"` : "";
        xml += `
    <item id="${this.escapeXml(item.id)}" href="${this.escapeXml(item.href)}" media-type="${item.mediaType}"${props}/>`;
      }
      xml += `
  </manifest>
  <spine>`;
      for (const item of this.spineItems) {
        xml += `
    <itemref idref="${this.escapeXml(item.idref)}"/>`;
      }
      xml += `
  </spine>
</package>`;
      return xml;
    }
    /**
     * Generate nav.xhtml (EPUB3 navigation document)
     * @param pages - All pages
     * @param meta - Export metadata
     * @param pageFilenameMap - Map of page IDs to unique filenames (optional, handles title collisions)
     */
    generateNavXhtml(pages, meta, pageFilenameMap) {
      const lang = meta.language || "en";
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="${EPUB3_NAMESPACES.XHTML}" xmlns:epub="${EPUB3_NAMESPACES.EPUB}" xml:lang="${lang}" lang="${lang}">
<head>
  <meta charset="UTF-8"/>
  <title>Table of Contents</title>
  <link rel="stylesheet" href="content/css/base.css"/>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>${this.escapeXml(meta.title || "Table of Contents")}</h1>
    <ol>`;
      xml += this.buildNavList(pages, pages, null, pageFilenameMap);
      xml += `
    </ol>
  </nav>
</body>
</html>`;
      return xml;
    }
    /**
     * Build navigation list recursively
     * @param pages - All pages
     * @param allPages - All pages (for first page detection)
     * @param parentId - Parent page ID (null for root)
     * @param pageFilenameMap - Map of page IDs to unique filenames (optional, handles title collisions)
     */
    buildNavList(pages, allPages, parentId = null, pageFilenameMap) {
      const children = parentId === null ? pages.filter((p) => !p.parentId) : pages.filter((p) => p.parentId === parentId);
      if (children.length === 0) return "";
      let html = "";
      for (const page of children) {
        const visibility = page.properties?.visibility;
        if (visibility === false || visibility === "false") {
          continue;
        }
        const filename = this.getPageFilename(page, allPages, pageFilenameMap);
        const grandchildren = pages.filter((p) => p.parentId === page.id);
        html += `
      <li><a href="${filename}">${this.escapeXml(page.title)}</a>`;
        if (grandchildren.length > 0) {
          html += `
        <ol>${this.buildNavList(pages, allPages, page.id, pageFilenameMap)}
        </ol>`;
        }
        html += `</li>`;
      }
      return html;
    }
    /**
     * Get page filename for navigation
     * @param page - Page data
     * @param allPages - All pages (for first page detection)
     * @param pageFilenameMap - Map of page IDs to unique filenames (optional, handles title collisions)
     */
    getPageFilename(page, allPages, pageFilenameMap) {
      const isFirst = page.id === allPages[0]?.id;
      if (isFirst) {
        return "index.xhtml";
      }
      const mapFilename = pageFilenameMap?.get(page.id);
      if (mapFilename) {
        return `html/${mapFilename.replace(/\.html$/, ".xhtml")}`;
      }
      return `html/${this.sanitizePageFilename(page.title)}.xhtml`;
    }
    /**
     * Generate XHTML page
     * @param page - Page data
     * @param allPages - All pages in the project
     * @param meta - Project metadata
     * @param isIndex - Whether this is the index page
     * @param themeFiles - List of root-level theme CSS/JS files
     * @param faviconInfo - Favicon info for theme or default
     */
    generatePageXhtml(page, allPages, meta, isIndex, pageIndex, themeFiles, faviconInfo, navLabels) {
      const lang = meta.language || "en";
      const basePath = isIndex ? "" : "../";
      const usedIdevices = this.getUsedIdevicesForPage(page);
      let customStyles = meta.customStyles || "";
      let bodyClass = "exe-export exe-epub";
      if (meta.globalFont && meta.globalFont !== "default") {
        const globalFontCss = GlobalFontGenerator.generateCss(meta.globalFont, basePath);
        if (globalFontCss) {
          customStyles = globalFontCss + "\n" + customStyles;
        }
        const fontBodyClass = GlobalFontGenerator.getBodyClassName(meta.globalFont);
        if (fontBodyClass) {
          bodyClass += ` ${fontBodyClass}`;
        }
      }
      const pageHtml = this.pageRenderer.render(page, {
        projectTitle: meta.title || "eXeLearning",
        projectSubtitle: meta.subtitle || "",
        language: lang,
        theme: meta.theme || "base",
        customStyles,
        allPages,
        basePath,
        isIndex,
        usedIdevices,
        author: meta.author || "",
        license: meta.license || "",
        description: meta.description || "",
        licenseUrl: meta.licenseUrl || "",
        bodyClass,
        // Theme files for HTML head includes
        themeFiles: themeFiles || [],
        // Favicon options
        faviconPath: faviconInfo?.path,
        faviconType: faviconInfo?.type,
        // Hide navigation - EPUB uses nav.xhtml for TOC, not embedded nav
        hideNavigation: true,
        // Hide nav buttons - EPUB reader handles navigation
        hideNavButtons: true,
        addExeLink: meta.addExeLink ?? true,
        addPagination: meta.addPagination === true,
        totalPages: allPages.length,
        currentPageIndex: pageIndex,
        // Pre-translated labels (resolved from XLF at export time)
        navLabels,
        // Application version for generator meta tag
        version: meta.exelearningVersion,
        // EPUB-specific: load guard script for duplicate execution protection
        isEpub: true
      });
      return this.htmlToXhtml(pageHtml, lang);
    }
    /**
     * Convert HTML to XHTML
     */
    htmlToXhtml(html, lang) {
      let xhtml = html;
      if (!xhtml.startsWith("<?xml")) {
        xhtml = `<?xml version="1.0" encoding="UTF-8"?>
${xhtml}`;
      }
      if (!xhtml.includes("<!DOCTYPE")) {
        xhtml = xhtml.replace(
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html>'
        );
      }
      xhtml = xhtml.replace(/<html([^>]*)>/i, (match, attrs) => {
        const cleanAttrs = attrs.replace(/\s+xml:lang=["'][^"']*["']/gi, "").replace(/\s+lang=["'][^"']*["']/gi, "");
        return `<html xmlns="${EPUB3_NAMESPACES.XHTML}" xml:lang="${lang}" lang="${lang}"${cleanAttrs}>`;
      });
      for (const element of VOID_ELEMENTS) {
        const regex = new RegExp(`<(${element})\\b([^>]*[^/])>`, "gi");
        xhtml = xhtml.replace(regex, "<$1$2/>");
        const simpleRegex = new RegExp(`<(${element})>`, "gi");
        xhtml = xhtml.replace(simpleRegex, "<$1/>");
      }
      xhtml = xhtml.replace(/&(?!(?:amp|lt|gt|quot|apos|nbsp|#\d+|#x[0-9a-fA-F]+);)/g, "&amp;");
      xhtml = xhtml.replace(/(\s)([a-zA-Z][a-zA-Z0-9-]*)=(true|false|[a-zA-Z0-9_-]+)(?=[\s>/])/g, '$1$2="$3"');
      xhtml = xhtml.replace(/(\s[a-zA-Z][a-zA-Z0-9-]*)=""([^"<>/]+)>/g, '$1="$2">');
      xhtml = xhtml.replace(/\.html(['"#\s])/g, ".xhtml$1");
      xhtml = xhtml.replace(/\.html$/g, ".xhtml");
      xhtml = xhtml.replace(/\s+style=["']\s*["']/g, "");
      return xhtml;
    }
    /**
     * Add assets to EPUB with manifest entries
     * Uses buildAssetExportPathMap for clean paths (matching SCORM/Website exports)
     */
    async addEpubAssets() {
      let assetsAdded = 0;
      try {
        const exportPathMap = await this.buildAssetExportPathMap();
        const processAsset = async (asset) => {
          const exportPath = exportPathMap.get(asset.id);
          if (!exportPath) {
            return;
          }
          const zipPath = `content/resources/${exportPath}`;
          this.zip.addFile(`EPUB/${zipPath}`, asset.data);
          const ext = this.getFileExtensionFromPath(exportPath);
          const mimeType = MIME_TYPES[ext] || asset.mime || "application/octet-stream";
          this.addManifestItem(this.generateUniqueId(`asset-${asset.id}`), zipPath, mimeType);
          assetsAdded++;
        };
        await this.forEachAsset(processAsset);
      } catch (e) {
        console.warn("[Epub3Exporter] Failed to add assets:", e);
      }
      return assetsAdded;
    }
    /**
     * Get EPUB-specific CSS additions
     */
    getEpubSpecificCss() {
      return `
/* EPUB3 Specific Styles */
body {
  margin: 0;
  padding: 1em;
}

/* Page breaks */
.page-break-before {
  page-break-before: always;
}
.page-break-after {
  page-break-after: always;
}
.avoid-page-break {
  page-break-inside: avoid;
}

/* Images */
img {
  max-width: 100%;
  height: auto;
}

/* Hide navigation in EPUB (handled by reader) */
#siteNav {
  display: none;
}

/* Pagination links hidden in EPUB */
.pagination {
  display: none;
}

/* Tables */
table {
  max-width: 100%;
  border-collapse: collapse;
}
td, th {
  padding: 0.5em;
  border: 1px solid #ccc;
}
`;
    }
    /**
     * Detect theme-specific favicon from theme files map
     * @param themeFilesMap - Map of theme files
     * @returns Favicon info or null if not found
     */
    detectFavicon(themeFilesMap) {
      if (themeFilesMap.has("img/favicon.ico")) {
        return { path: "theme/img/favicon.ico", type: "image/x-icon" };
      }
      if (themeFilesMap.has("img/favicon.png")) {
        return { path: "theme/img/favicon.png", type: "image/png" };
      }
      return null;
    }
    /**
     * Prepare theme data for export: fetch theme files, extract root-level CSS/JS, detect favicon
     * @param themeName - Name of the theme to fetch
     * @returns ThemeData with files, root files list, and favicon info
     */
    async prepareThemeData(themeName) {
      const themeRootFiles = [];
      let themeFilesMap = null;
      let faviconInfo = null;
      try {
        themeFilesMap = await this.resources.fetchTheme(themeName);
        for (const [filePath] of themeFilesMap) {
          if (!filePath.includes("/") && (filePath.endsWith(".css") || filePath.endsWith(".js"))) {
            themeRootFiles.push(filePath);
          }
        }
        faviconInfo = this.detectFavicon(themeFilesMap);
      } catch (e) {
        console.warn(`[Epub3Exporter] Failed to fetch theme: ${themeName}`, e);
        themeRootFiles.push("style.css", "style.js");
      }
      this.ideviceRenderer.setThemeIconFiles(themeFilesMap);
      return { themeFilesMap, themeRootFiles, faviconInfo };
    }
    /**
     * Get content.xml from the document for inclusion in EPUB package
     * This allows the package to be re-edited in eXeLearning
     */
    async getContentXml() {
      if ("getContentXml" in this.document && typeof this.document.getContentXml === "function") {
        return this.document.getContentXml();
      }
      return null;
    }
    /**
     * Get CSS for pre-rendered LaTeX (SVG+MathML)
     * This CSS is needed when LaTeX is pre-rendered instead of using MathJax at runtime
     */
    getPreRenderedLatexCss() {
      return `/* Pre-rendered LaTeX (SVG+MathML) - MathJax not included */
.exe-math-rendered { display: inline-block; vertical-align: middle; }
.exe-math-rendered[data-display="block"] { display: block; text-align: center; margin: 1em 0; }
.exe-math-rendered svg { vertical-align: middle; max-width: 100%; height: auto; }
/* Fix for MathJax array/table borders - SVG has stroke-width:0 which hides lines */
.exe-math-rendered svg line.mjx-solid { stroke-width: 60 !important; }
.exe-math-rendered svg rect[data-frame="true"] { fill: none; stroke-width: 60 !important; }
/* Hide MathML visually but keep accessible for screen readers */
.exe-math-rendered math { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }`;
    }
    /**
     * Get CSS for pre-rendered Mermaid diagrams (static SVG)
     * This CSS is needed when Mermaid is pre-rendered instead of using the library at runtime
     */
    getPreRenderedMermaidCss() {
      return `/* Pre-rendered Mermaid (static SVG) - Mermaid library not included */
.exe-mermaid-rendered { display: block; text-align: center; margin: 1.5em 0; }
.exe-mermaid-rendered svg { max-width: 100%; height: auto; }`;
    }
    /**
     * Transform JavaScript files for EPUB compatibility
     * Some scripts need to be wrapped in guards to prevent duplicate execution errors
     * when EPUB readers re-execute scripts during page navigation.
     *
     * @param path - The file path
     * @param content - The file content (string or Uint8Array)
     * @returns Transformed content (same type as input)
     */
    transformForEpub(path, content) {
      const filename = path.split(/[/\\]/).pop() || path;
      if (filename === "abcjs-basic-min.js") {
        const originalCode = typeof content === "string" ? content : new TextDecoder().decode(content);
        const umdPattern = '!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.abcjs=t():e.ABCJS=t()}';
        const forcedBinding = "!function(e,t){window.ABCJS=t()}";
        let transformedCode = originalCode.replace(umdPattern, forcedBinding);
        if (transformedCode !== originalCode) {
          transformedCode = `// EPUB-safe version - forced window.ABCJS binding
${transformedCode}`;
        } else {
          transformedCode = `// EPUB-safe version - fallback binding
${originalCode}
`;
          transformedCode += `(function(){ if(typeof window!=='undefined' && !window.ABCJS && typeof ABCJS!=='undefined'){window.ABCJS=ABCJS;} })();`;
        }
        if (typeof content === "string") {
          return transformedCode;
        }
        return new TextEncoder().encode(transformedCode);
      }
      if (filename === "exe_abc_music.js") {
        let originalCode = typeof content === "string" ? content : new TextDecoder().decode(content);
        originalCode = originalCode.replace(
          'console.warn("Error loading abcjs");',
          'console.warn("Error loading abcjs", error); console.warn("window.ABCJS is:", typeof window.ABCJS);'
        );
        originalCode = originalCode.replace(
          'var htmlSource = parent.document.querySelector("#htmlSource");',
          'var htmlSource = null; try { htmlSource = parent.document.querySelector("#htmlSource"); } catch(e) { console.warn("EPUB: Cannot access parent.document, using fallback"); }'
        );
        const transformedCode = `// EPUB-safe version - guards against redeclaration error
if (typeof window.__exeABCmusicLoaded !== 'undefined') {
    // Script already loaded, skip re-execution to prevent CursorControl redeclaration error
} else {
    window.__exeABCmusicLoaded = true;
    // Original script follows - variables remain in global scope
${originalCode}
}
`;
        if (typeof content === "string") {
          return transformedCode;
        }
        return new TextEncoder().encode(transformedCode);
      }
      if (filename === "exe_effects.js") {
        const originalCode = typeof content === "string" ? content : new TextDecoder().decode(content);
        const searchFor = `var currentAttrValue = $(this).attr('href');

        // IE7 retrieves link#hash instead of #hash
        currentAttrValue = currentAttrValue.split("#");
        currentAttrValue = "#" + currentAttrValue[1];
        // / IE7`;
        const replaceWith = `// EPUB PATCH: Deduce target from ID because href might be void
        var targetId = this.id.replace("-trigger", "").replace(/_/g, "-");
        var currentAttrValue = "#" + targetId;`;
        const normalizedSearch = searchFor.replace(/\s+/g, " ");
        const normalizedOriginal = originalCode.replace(/\s+/g, " ");
        let transformedCode = originalCode;
        if (originalCode.includes(searchFor)) {
          transformedCode = originalCode.replace(searchFor, replaceWith);
        } else {
          const fallbackSearch = "var currentAttrValue = $(this).attr('href');";
          const fallbackReplace = `var currentAttrValue = "#" + this.id.replace("-trigger", "").replace(/_/g, "-"); /* EPUB PATCH */
        /* Original: var currentAttrValue = $(this).attr('href'); */`;
          if (originalCode.includes(fallbackSearch)) {
            const regex = /var\s+currentAttrValue\s*=\s*\$\(this\)\.attr\('href'\);\s*\/\/ IE7[^/]*\/\/\s*\/ IE7/s;
            if (regex.test(originalCode)) {
              transformedCode = originalCode.replace(regex, replaceWith);
            } else {
              transformedCode = originalCode.replace(fallbackSearch, fallbackReplace);
            }
          } else {
            console.warn("[Epub3Exporter] Could not find exe_effects.js click handler to patch");
          }
        }
        const linkSearch = `href="#' + id + '"`;
        const linkReplace = 'href="javascript:void(0)"';
        if (transformedCode.includes(linkSearch)) {
          transformedCode = transformedCode.replace(linkSearch, linkReplace);
        } else {
          console.warn("[Epub3Exporter] Could not find exe_effects.js link generation to patch");
        }
        if (typeof content === "string") {
          return transformedCode;
        }
        return new TextEncoder().encode(transformedCode);
      }
      return content;
    }
    /**
     * Generate EPUB guards script that prevents duplicate execution errors
     * This script runs BEFORE any libraries load and patches the global scope
     * to handle EPUB readers that re-execute scripts during page navigation.
     */
    generateEpubGuardsScript() {
      return `/**
 * EPUB Library Guards - eXeLearning
 * Prevents duplicate execution errors when EPUB readers re-execute scripts
 */
(function() {
    'use strict';
    if (window.__exeEpubGuardsLoaded) return;
    window.__exeEpubGuardsLoaded = true;
    
    // Pre-declare globals that would cause redeclaration errors
    if (typeof window.CursorControl === 'undefined') window.CursorControl = null;
    if (typeof window.$exeABCmusic === 'undefined') window.$exeABCmusic = null;
    if (typeof window.$exeExport === 'undefined') window.$exeExport = null;
    if (typeof window.synthControl === 'undefined') window.synthControl = undefined;
    if (typeof window.is_n_audio_ok === 'undefined') window.is_n_audio_ok = undefined;
    if (typeof window.abc === 'undefined') window.abc = [];
    
    console.log('[EPUB Guards] Library guards initialized');
})();`;
    }
  };

  // src/shared/export/browser/xml-validator-shim.ts
  function validateXml(_xmlContent) {
    return { valid: true, errors: [], warnings: [] };
  }
  function formatValidationErrors(_result) {
    return "";
  }

  // src/shared/export/exporters/ElpxExporter.ts
  var ElpxExporter = class extends Html5Exporter {
    /**
     * Decode screenshot from base64 data URL or raw base64 to Uint8Array.
     * Returns null if the data is not valid PNG.
     */
    decodeScreenshotToBuffer(screenshot) {
      try {
        let base64Data = screenshot;
        if (base64Data.startsWith("data:")) {
          const commaIndex = base64Data.indexOf(",");
          if (commaIndex === -1) return null;
          base64Data = base64Data.substring(commaIndex + 1);
        }
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        if (bytes.length >= 8 && bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71 && bytes[4] === 13 && bytes[5] === 10 && bytes[6] === 26 && bytes[7] === 10) {
          return bytes;
        }
        console.warn("[ElpxExporter] Screenshot data is not a valid PNG");
        return null;
      } catch {
        return null;
      }
    }
    /**
     * Get file extension for ELPX format
     */
    getFileExtension() {
      return ".elpx";
    }
    /**
     * Get file suffix for ELPX format (no suffix for ELPX)
     */
    getFileSuffix() {
      return "";
    }
    /**
     * Export to ELPX format
     *
     * ELPX is a complete HTML5 export + content.xml (ODE format) + DTD for re-import.
     * This method generates all HTML5 content (index.html, html/*.html, libs/, theme/, etc.)
     * and then adds the content.xml with full ODE structure and DTD.
     */
    async export(options) {
      const exportFilename = options?.filename || this.buildFilename();
      const elpxOptions = options;
      try {
        this.logElpxExportDebugPhase("exporter:elpx:start");
        let pages = this.buildPageList();
        this.logElpxExportDebugPhase("exporter:build-page-list:end", {
          pages: pages.length
        });
        const meta = this.getMetadata();
        const themeName = elpxOptions?.theme || meta.theme || "base";
        const needsElpxDownload = this.needsElpxDownloadSupport(pages);
        pages = await this.preprocessPagesForExport(pages);
        this.logElpxExportDebugPhase("exporter:prepare-theme:start", {
          theme: themeName
        });
        const pageFilenameMap = this.buildPageFilenameMap(pages);
        const fileList = needsElpxDownload ? [] : null;
        const addFile = (path, content) => {
          this.zip.addFile(path, content);
          if (fileList) fileList.push(path);
        };
        const { themeFilesMap, themeRootFiles, faviconInfo } = await this.prepareThemeData(themeName);
        this.logElpxExportDebugPhase("exporter:prepare-theme:end", {
          theme: themeName,
          themeFiles: themeFilesMap?.size || 0
        });
        this.logElpxExportDebugPhase("exporter:nav-labels:start", {
          language: meta.language || "en"
        });
        const navLabels = await this.fetchNavLabels(meta.language || "en", meta.license);
        this.logElpxExportDebugPhase("exporter:nav-labels:end", {
          language: meta.language || "en"
        });
        const pageHtmlMap = /* @__PURE__ */ new Map();
        let mermaidWasRendered = false;
        this.logElpxExportDebugPhase("exporter:generate-pages:start", {
          pages: pages.length
        });
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          let html = this.generatePageHtml(
            page,
            pages,
            meta,
            i === 0,
            i,
            themeRootFiles,
            faviconInfo,
            pageFilenameMap,
            void 0,
            navLabels
          );
          if (options?.preRenderMermaid) {
            try {
              const result = await options.preRenderMermaid(html);
              if (result.mermaidRendered) {
                html = result.html;
                mermaidWasRendered = true;
                console.log(
                  `[ElpxExporter] Pre-rendered ${result.count} Mermaid diagram(s) on page: ${page.title}`
                );
              }
            } catch (error) {
              console.warn("[ElpxExporter] Mermaid pre-render failed for page:", page.title, error);
            }
          }
          const uniqueFilename = pageFilenameMap.get(page.id) || "page.html";
          const pageFilename = i === 0 ? "index.html" : `html/${uniqueFilename}`;
          pageHtmlMap.set(pageFilename, html);
        }
        this.logElpxExportDebugPhase("exporter:generate-pages:end", {
          pages: pageHtmlMap.size
        });
        if (meta.addSearchBox) {
          const searchIndexContent = this.pageRenderer.generateSearchIndexFile(pages, "", pageFilenameMap);
          addFile("search_index.js", searchIndexContent);
        }
        this.logElpxExportDebugPhase("exporter:content-css:start");
        const contentCssFiles = await this.resources.fetchContentCss();
        let baseCss = contentCssFiles.get("content/css/base.css");
        if (!baseCss) {
          throw new Error("Failed to fetch content/css/base.css");
        }
        if (mermaidWasRendered) {
          const decoder = new TextDecoder();
          let baseCssText = decoder.decode(baseCss);
          baseCssText += "\n" + this.getPreRenderedMermaidCss();
          const encoder = new TextEncoder();
          baseCss = encoder.encode(baseCssText);
        }
        addFile("content/css/base.css", baseCss);
        this.logElpxExportDebugPhase("exporter:content-css:end", {
          files: contentCssFiles.size
        });
        try {
          const logoData = await this.resources.fetchExeLogo();
          if (logoData) {
            addFile("content/img/exe_powered_logo.png", logoData);
          }
        } catch {
        }
        if (themeFilesMap) {
          for (const [filePath, content] of themeFilesMap) {
            addFile(`theme/${filePath}`, content);
          }
        } else {
          addFile("theme/style.css", this.getFallbackThemeCss());
          addFile("theme/style.js", this.getFallbackThemeJs());
        }
        try {
          this.logElpxExportDebugPhase("exporter:base-libs:start");
          const baseLibs = await this.resources.fetchBaseLibraries();
          for (const [libPath, content] of baseLibs) {
            addFile(`libs/${libPath}`, content);
          }
          this.logElpxExportDebugPhase("exporter:base-libs:end", {
            files: baseLibs.size
          });
        } catch {
        }
        const i18nContent = await this.generateI18nContent(meta.language || "en");
        addFile("libs/common_i18n.js", i18nContent);
        const { files: allRequiredFiles, patterns } = this.getRequiredLibraryFilesForPages(pages, {
          includeAccessibilityToolbar: meta.addAccessibilityToolbar === true
        });
        try {
          this.logElpxExportDebugPhase("exporter:content-libs:start", {
            requestedFiles: allRequiredFiles.length,
            patterns: patterns.length
          });
          const libFiles = await this.resources.fetchLibraryFiles(allRequiredFiles, patterns);
          for (const [libPath, content] of libFiles) {
            const zipPath = `libs/${libPath}`;
            if (!this.zip.hasFile(zipPath)) {
              addFile(zipPath, content);
            }
          }
          this.logElpxExportDebugPhase("exporter:content-libs:end", {
            files: libFiles.size
          });
        } catch {
        }
        const usedIdevices = this.getUsedIdevices(pages);
        this.logElpxExportDebugPhase("exporter:idevice-resources:start", {
          idevices: usedIdevices.length
        });
        for (const idevice of usedIdevices) {
          try {
            const normalizedType = this.resources.normalizeIdeviceType(idevice);
            const ideviceFiles = await this.resources.fetchIdeviceResources(idevice);
            for (const [filePath, content] of ideviceFiles) {
              addFile(`idevices/${normalizedType}/${filePath}`, content);
            }
          } catch {
          }
        }
        this.logElpxExportDebugPhase("exporter:idevice-resources:end", {
          idevices: usedIdevices.length
        });
        await this.addAssetsToZipWithResourcePath(fileList);
        if (needsElpxDownload && fileList) {
          for (const [htmlFile] of pageHtmlMap) {
            if (!fileList.includes(htmlFile)) {
              fileList.push(htmlFile);
            }
          }
          fileList.push("libs/elpx-manifest.js");
          const manifestJs = this.generateElpxManifestFile(fileList);
          this.zip.addFile("libs/elpx-manifest.js", manifestJs);
        }
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const pageFilename = pageFilenameMap.get(page.id) || "page.html";
          const filename = i === 0 ? "index.html" : `html/${pageFilename}`;
          let html = pageHtmlMap.get(filename) || "";
          if (needsElpxDownload && this.pageHasDownloadSourceFile(page)) {
            const basePath = i === 0 ? "" : "../";
            const manifestScriptTag = `<script src="${basePath}libs/elpx-manifest.js"> <\/script>`;
            html = html.replace(/<\/body>/i, `${manifestScriptTag}
</body>`);
          }
          this.zip.addFile(filename, html);
        }
        const contentXml = generateOdeXml(meta, pages);
        const validation = validateXml(contentXml);
        if (!validation.valid) {
          const errorMsg = formatValidationErrors(validation);
          console.error(`[ElpxExporter] Generated XML failed validation:
${errorMsg}`);
          throw new Error(`Generated content.xml is invalid:
${errorMsg}`);
        }
        if (validation.warnings.length > 0) {
          console.warn(`[ElpxExporter] XML validation warnings:
${formatValidationErrors(validation)}`);
        }
        this.zip.addFile("content.xml", contentXml);
        this.zip.addFile(ODE_DTD_FILENAME, ODE_DTD_CONTENT);
        let screenshotBuffer = null;
        if (meta.screenshot) {
          screenshotBuffer = this.decodeScreenshotToBuffer(meta.screenshot);
        }
        if (!screenshotBuffer && options?.generateScreenshot) {
          try {
            const firstPageHtml = pageHtmlMap.get("index.html");
            if (firstPageHtml) {
              const dataUrl = await options.generateScreenshot(firstPageHtml);
              if (dataUrl) {
                screenshotBuffer = this.decodeScreenshotToBuffer(dataUrl);
              }
            }
          } catch (error) {
            console.warn("[ElpxExporter] Screenshot auto-generation failed:", error);
          }
        }
        if (screenshotBuffer) {
          this.zip.addFile("screenshot.png", screenshotBuffer);
        }
        this.logElpxExportDebugPhase("exporter:zip-generate:start", {
          zipFiles: fileList?.length || this.zip.getFilePaths?.().length || null
        });
        const buffer = await this.zip.generateAsync();
        const zipStats = this.zip.getLastGenerateStats?.() || null;
        this.logElpxExportDebugPhase("exporter:zip-generate:end", {
          bytes: buffer.byteLength,
          deflatedFiles: zipStats?.deflatedFiles ?? null,
          storedFiles: zipStats?.storedFiles ?? null,
          deflatedBytes: zipStats?.deflatedBytes ?? null,
          storedBytes: zipStats?.storedBytes ?? null
        });
        return {
          success: true,
          filename: exportFilename,
          data: buffer
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
  };

  // src/shared/export/exporters/PrintPreviewExporter.ts
  var PrintPreviewExporter = class {
    /**
     * Create a PrintPreviewExporter
     * @param document - Export document adapter
     * @param resourceProvider - Resource provider for theme/iDevice info
     * @param assetProvider - Asset provider for resolving asset URLs (optional but recommended)
     */
    constructor(document2, resourceProvider, assetProvider = null) {
      this.assetExportPathMap = null;
      this.assetFilenameMap = null;
      this.document = document2;
      this.resources = resourceProvider;
      this.assets = assetProvider;
      this.ideviceRenderer = new IdeviceRenderer();
      this.pageRenderer = new PageRenderer(this.ideviceRenderer);
    }
    /**
     * Generate print preview HTML
     * @param options - Preview options
     * @returns Preview result with HTML string
     */
    async generatePreview(options = {}) {
      try {
        const pages = this.document.getNavigation();
        const meta = this.document.getMetadata();
        if (pages.length === 0) {
          return { success: false, error: "No pages to preview" };
        }
        let processedPages = await this.preprocessPages(pages);
        processedPages = this.deduplicateComponents(processedPages);
        const themeName = meta.theme || "base";
        try {
          const themeFilesMap = await this.resources.fetchTheme(themeName);
          this.ideviceRenderer.setThemeIconFiles(themeFilesMap);
        } catch {
        }
        const usedIdevices = this.getUsedIdevices(processedPages);
        const windowConfig = typeof window !== "undefined" ? window : void 0;
        const version = windowConfig?.eXeLearning?.config?.version || "v1.0.0";
        let html = this.pageRenderer.renderSinglePage(processedPages, {
          projectTitle: meta.title || "eXeLearning",
          projectSubtitle: meta.subtitle || "",
          language: meta.language || "en",
          customStyles: meta.customStyles || "",
          usedIdevices,
          author: meta.author || "",
          license: meta.license || "",
          addExeLink: meta.addExeLink ?? true,
          userFooterContent: meta.footer || "",
          version
          // From browser context
        });
        html = await this.preRenderContent(html, meta, options);
        html = this.patchPathsForServer(html, meta.theme || "base", usedIdevices, options);
        html = this.revealFeedback(html);
        html = this.hidePrintExtras(html);
        const baseUrl = options.baseUrl || "";
        const basePath = options.basePath || "";
        let versionStr = options.version;
        if (versionStr === void 0) {
          versionStr = version !== "v1.0.0" ? version : void 0;
        }
        const effectiveVersion = options.version ?? version;
        const getPath = (path) => {
          const cleanPath = path.startsWith("/") ? path.slice(1) : path;
          const cleanBasePath = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
          if (effectiveVersion && effectiveVersion !== "v1.0.0") {
            return `${baseUrl}${cleanBasePath}/${effectiveVersion}/${cleanPath}`;
          }
          const v = options.version === void 0 ? "v1.0.0" : options.version;
          return `${baseUrl}${cleanBasePath}/${v}/${cleanPath}`;
        };
        const logoUrl = getPath("app/common/exe_powered_logo/exe_powered_logo.png");
        html = this.injectPreviewStyles(html, logoUrl);
        if (options.printMode) {
          html = this.injectPrintSpecifics(html);
        } else {
          html = this.injectInitScripts(html);
        }
        return { success: true, html };
      } catch (error) {
        console.error("PrintPreview generate error:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: errorMessage };
      }
    }
    /**
     * Filter out pages that are marked as not visible in export
     */
    filterVisiblePages(pages) {
      return pages.filter((page) => {
        const isHidden = page.properties?.visibility === false || page.properties?.visibility === "false";
        return !isHidden;
      }).map((page) => {
        const newPage = { ...page };
        if (newPage.children && Array.isArray(newPage.children)) {
          newPage.children = this.filterVisiblePages(newPage.children);
        }
        return newPage;
      });
    }
    /**
     * Inject styles to force content to fit within the page width
     */
    injectPreviewStyles(html, logoUrl) {
      const logoCss = logoUrl ? `
/* Fix for eXe logo 404 */
#made-with-eXe a {
    background-image: url("${logoUrl}") !important;
}` : "";
      const styles = `
<style>
/* PREVIEW MODE (Screen) */
/* Create space around the document in preview mode */
body {
    padding: 40px;
    background-color: #f5f5f5; /* Light grey background for the "paper" effect */
}
/* The page content acts as the paper */
.exe-single-page {
    background-color: white;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    max-width: 210mm; /* A4 width approx */
    margin: 0 auto;
    padding: 20mm; /* A4 margins approx */
    box-sizing: border-box;
}

/* Force content to fit within the page (no horizontal scroll) */
img, figure, video, object, iframe, table, svg, canvas {
    max-width: 100%;
    height: auto;
    box-sizing: border-box;
}
/* Ensure figures behave responsively */
figure {
    margin: 1em 0;
}
figure img {
    max-width: 100%;
    height: auto;
}
/* Fix for specific eXe layout issues */
.iDevice_content {
    overflow-x: auto;
}

/* FIX: Force visibility globally (Screen & Print) */
/* The div with coordinates in Map iDevice should be visible even if js-hidden */
.mapa-LinkTextsPoints,
.js-hidden.mapa-LinkTextsPoints,
.js .js-hidden.mapa-LinkTextsPoints,
.mapa-IDevice .js-hidden.mapa-LinkTextsPoints {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
}

/* Force visibility for Definition List descriptions */
.js .exe-dl dd {
    display: block !important;
}

/* Force visibility for UDL Content Blocks */
.exe-udlContent-block,.exe-udlContent-block.js-hidden,
.js .exe-udlContent-block.js-hidden {
    display: block !important;
}

/* PRINT MODE */
@media print {
    /* Reset preview-specific styles */
    body {
        padding: 0 !important;
        background-color: transparent !important;
        overflow: visible !important;
        height: auto !important;
    }
    .exe-single-page {
        box-shadow: none !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 0 !important;
    }

    /* 1. Avoid cutting images between pages */
    img, figure, video, object, iframe, table, svg, canvas {
        max-width: 100% !important;
        height: auto !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
    }
    
    pre, blockquote {
        page-break-inside: avoid;
        break-inside: avoid;
        white-space: pre-wrap;
    }

    /* 2. Hide Title and Subtitle (Header) */
    /* The main header contains the project title and subtitle */
    /* Ensure package header (Project Title) is visible on the first page only */
    .package-header {
        display: block !important;
        visibility: visible !important; 
        position: static !important; /* Ensure it flows normally */
    }

    /* Hide individual page headers if needed, or other decorations */
    #nodeDecoration { 
        display: none !important; 
    }

    /* Hide navigation in print mode */
    #siteNav, .single-page-nav { display: none !important; }
    
    #made-with-eXe { display: none; }
    
    .single-page-section {
        page-break-inside: avoid;
        break-inside: avoid;
        border-bottom: none;
    }
}

/* Force visibility for feedback elements even if JS tries to hide them */
.feedback.js-hidden {
    display: block !important;
}
${logoCss}
</style>
`;
      return html.replace("</head>", `${styles}</head>`);
    }
    /**
     * Pre-process pages to resolve asset URLs
     * Replaces asset://UUID with content/resources/FILENAME
     */
    async preprocessPages(pages) {
      if (!this.assets) return this.filterVisiblePages(pages);
      if (!this.assetExportPathMap) {
        await this.buildAssetExportPathMap();
      }
      const visiblePages = this.filterVisiblePages(pages);
      const clonedPages = JSON.parse(JSON.stringify(visiblePages));
      for (const page of clonedPages) {
        for (const block of page.blocks || []) {
          for (const component of block.components || []) {
            if (component.content) {
              component.content = await this.resolveAssetUrls(component.content);
            }
            if (component.properties) {
              const propsStr = JSON.stringify(component.properties);
              const processedStr = await this.resolveAssetUrls(propsStr);
              component.properties = JSON.parse(processedStr);
            }
          }
        }
      }
      return clonedPages;
    }
    /**
     * Resolve asset:// and content/resources/ URLs to Blob URLs
     */
    async resolveAssetUrls(content) {
      if (!content || !this.assetExportPathMap) return content;
      return content.replace(/(?:asset:\/\/|content\/resources\/)([^"'\s\\]+)/gi, (_match, idOrFilename) => {
        let blobUrl = this.assetExportPathMap?.get(idOrFilename) || this.assetFilenameMap?.get(idOrFilename);
        if (!blobUrl && idOrFilename.includes(".")) {
          const idWithoutExt = idOrFilename.substring(0, idOrFilename.lastIndexOf("."));
          blobUrl = this.assetExportPathMap?.get(idWithoutExt);
        }
        if (blobUrl) {
          return blobUrl;
        }
        if (_match.startsWith("asset://")) {
          return `content/resources/${idOrFilename}`;
        }
        return _match;
      });
    }
    /**
     * Build map of asset UUIDs to Blob URLs
     */
    async buildAssetExportPathMap() {
      if (!this.assets) {
        console.warn("[PrintPreviewExporter] No assets provider available");
        return;
      }
      this.assetExportPathMap = /* @__PURE__ */ new Map();
      this.assetFilenameMap = /* @__PURE__ */ new Map();
      try {
        const processAsset = async (asset) => {
          let blobUrl = "";
          if (asset.data) {
            try {
              const blob = asset.data instanceof Blob ? asset.data : (
                // biome-ignore lint/suspicious/noExplicitAny: legacy data type compatibility
                new Blob([asset.data], { type: asset.mime })
              );
              blobUrl = URL.createObjectURL(blob);
            } catch (err2) {
              console.error("[PrintPreview] Failed to create Blob URL for asset:", asset.id, err2);
            }
          } else {
            console.warn("[PrintPreview] Asset has no data:", asset.id);
          }
          if (blobUrl) {
            this.assetExportPathMap.set(asset.id, blobUrl);
            if (asset.filename) {
              this.assetFilenameMap.set(asset.filename, blobUrl);
            }
          }
        };
        await this.iterateAssets(processAsset);
        console.log("[PrintPreview] Asset map built. Size:", this.assetExportPathMap.size);
      } catch (e) {
        console.warn("[PrintPreviewExporter] Failed to build asset map:", e);
      }
    }
    /**
     * Iterate over all assets using the most efficient method available.
     * Uses forEachAsset() when supported (streaming), otherwise falls back to getAllAssets().
     */
    async iterateAssets(callback) {
      if (this.assets.forEachAsset) {
        await this.assets.forEachAsset(callback);
      } else {
        const assets = await this.assets.getAllAssets();
        for (const asset of assets) {
          await callback(asset);
        }
      }
    }
    /**
     * Get all unique iDevice types used in pages
     */
    getUsedIdevices(pages) {
      const types = /* @__PURE__ */ new Set();
      for (const page of pages) {
        for (const block of page.blocks || []) {
          for (const component of block.components || []) {
            if (component.type) {
              types.add(component.type);
            }
          }
        }
      }
      return Array.from(types);
    }
    /**
     * Pre-render dynamic content (LaTeX, Mermaid) using provided hooks
     */
    async preRenderContent(html, meta, options) {
      let finalHtml = html;
      if (!meta.addMathJax) {
        if (options.preRenderDataGameLatex) {
          try {
            const result = await options.preRenderDataGameLatex(finalHtml);
            if (result.count > 0) finalHtml = result.html;
          } catch (e) {
            console.warn("DataGame LaTeX pre-render error:", e);
          }
        }
        if (options.preRenderLatex) {
          try {
            const result = await options.preRenderLatex(finalHtml);
            if (result.latexRendered) finalHtml = result.html;
          } catch (e) {
            console.warn("LaTeX pre-render error:", e);
          }
        }
      }
      if (options.preRenderMermaid) {
        try {
          const result = await options.preRenderMermaid(finalHtml);
          if (result.mermaidRendered) {
            finalHtml = result.html;
            console.log(`[PrintPreview] Pre-rendered ${result.count} Mermaid diagrams`);
          }
        } catch (e) {
          console.warn("Mermaid pre-render error:", e);
        }
      }
      return finalHtml;
    }
    /**
     * Patch relative paths generated by PageRenderer to point to server resources
     */
    patchPathsForServer(html, themeName, usedIdevices, options) {
      const baseUrl = options.baseUrl || "";
      const basePath = options.basePath || "";
      const version = options.version;
      const getPath = (path) => {
        const cleanPath = path.startsWith("/") ? path.slice(1) : path;
        const cleanBasePath = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
        if (version && version !== "v1.0.0") {
          return `${baseUrl}${cleanBasePath}/${version}/${cleanPath}`;
        }
        return `${baseUrl}${cleanBasePath}/${cleanPath}`;
      };
      let processed = html;
      const mappings = {
        // Core libraries (in zip: libs/ -> on server: /app/common/ or /libs/)
        "libs/jquery/jquery.min.js": getPath("libs/jquery/jquery.min.js"),
        "libs/bootstrap/bootstrap.bundle.min.js": getPath("libs/bootstrap/bootstrap.bundle.min.js"),
        "libs/bootstrap/bootstrap.min.css": getPath("libs/bootstrap/bootstrap.min.css"),
        "libs/common.js": getPath("app/common/common.js"),
        "libs/common_i18n.js": getPath("app/common/common_i18n.js"),
        "libs/exe_export.js": getPath("app/common/exe_export.js"),
        "libs/exe_math/tex-mml-svg.js": getPath("app/common/exe_math/tex-mml-svg.js"),
        "libs/favicon.ico": getPath("favicon.ico"),
        // Base CSS
        "content/css/base.css": getPath("style/workarea/base.css"),
        // Fallback/Core CSS
        // Theme (in zip: theme/ -> on server: /files/perm/themes/base/...)
        "theme/style.css": options.themeUrl ? `${options.themeUrl.replace(/\/$/, "")}/style.css` : getPath(`files/perm/themes/base/${themeName}/style.css`),
        "theme/style.js": options.themeUrl ? `${options.themeUrl.replace(/\/$/, "")}/style.js` : getPath(`files/perm/themes/base/${themeName}/style.js`),
        // Highlighter (exe_highlighter)
        // PageRenderer outputs libs/exe_highlighter/...
        // Server has it in app/common/exe_highlighter/...
        "libs/exe_highlighter/exe_highlighter.js": getPath("app/common/exe_highlighter/exe_highlighter.js"),
        "libs/exe_highlighter/exe_highlighter.css": getPath("app/common/exe_highlighter/exe_highlighter.css"),
        // ABC Music (abcjs)
        // PageRenderer outputs libs/abcjs/...
        // Server has it in libs/abcjs/... (direct mapping to public/libs)
        "libs/abcjs/abcjs-basic-min.js": getPath("libs/abcjs/abcjs-basic-min.js"),
        "libs/abcjs/exe_abc_music.js": getPath("libs/abcjs/exe_abc_music.js"),
        "libs/abcjs/abcjs-audio.css": getPath("libs/abcjs/abcjs-audio.css")
      };
      for (const [key, value] of Object.entries(mappings)) {
        processed = processed.replaceAll(`src="${key}"`, `src="${value}"`);
        processed = processed.replaceAll(`href="${key}"`, `href="${value}"`);
      }
      const serverIdeviceBase = getPath("files/perm/idevices/base/");
      const idevicePattern = /(src|href|data-idevice-path)\s*=\s*["']([^"']*idevices\/[^"']*)["']/gi;
      processed = processed.replace(idevicePattern, (match, attr, content) => {
        const parts = content.split("idevices/");
        if (parts.length < 2) return match;
        let relativePart = parts[1];
        if (relativePart.startsWith("/")) relativePart = relativePart.substring(1);
        const segments = relativePart.split("/");
        let typeIndex = 0;
        if (segments[0] === "base") {
          typeIndex = 1;
        }
        if (segments.length < typeIndex + 1) return match;
        const type = segments[typeIndex];
        let rest = segments.slice(typeIndex + 1).join("/");
        if (rest.startsWith("export/")) {
          rest = rest.substring(7);
        }
        const file = rest;
        const suffix = file ? `export/${file}` : "export/";
        return `${attr}="${serverIdeviceBase}${type}/${suffix}"`;
      });
      processed = processed.replaceAll('src="idevices/', `src="${serverIdeviceBase}`);
      processed = processed.replaceAll('href="idevices/', `href="${serverIdeviceBase}`);
      const serverResourceBase = getPath("content/resources/");
      const resourcePattern = /(src|href)=["'](?:(?:https?:\/\/[^/]+)?\/)?content\/resources\/([^"']+)["']/g;
      processed = processed.replace(resourcePattern, (match, attr, filename) => {
        return `${attr}="${serverResourceBase}${filename}"`;
      });
      return processed;
    }
    /**
     * Inject scripts/CSS required for the in-window Print Overlay
     */
    injectPrintSpecifics(html) {
      const printScript = `
<script>
window.onload = function() {
    // Force init for Print Preview (since window.eXeLearning is defined, auto-init doesn't run)
    if (typeof $exeABCmusic !== 'undefined' && typeof $exeABCmusic.init === 'function') {
         $exeABCmusic.init();
    }
    if (typeof $exeHighlighter !== 'undefined' && typeof $exeHighlighter.init === 'function') {
         $exeHighlighter.init();
    }

    setTimeout(function() {
        window.print();
    }, 1000);
};
<\/script>
<style>
/* Inject Single Page CSS (normally loaded from content/css/single-page.css in export) */
.exe-single-page .single-page-section {
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 40px;
  margin-bottom: 40px;
}

.exe-single-page .single-page-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.exe-single-page .single-page-nav {
  position: sticky;
  top: 0;
  max-height: 100vh;
  overflow-y: auto;
}

.exe-single-page .single-page-content {
  padding: 20px 30px;
}

/* Smooth scrolling for anchor links */
html {
  scroll-behavior: smooth;
}

/* Section target offset for fixed header */
.single-page-section:target {
  scroll-margin-top: 20px;
}

@media print {
    /* Hide navigation in print mode (matches user request) */
    #siteNav, .single-page-nav { display: none !important; }
    
    #made-with-eXe { display: none; }
    /* Ensure no scrollbars in print */
    body { overflow: visible !important; height: auto !important; }
    
    .single-page-section {
        page-break-inside: avoid;
        border-bottom: none;
    }
}
/* Ensure overlay content fits */
html, body { height: 100%; margin: 0; padding: 0; }
</style>
`;
      return html.replace("</body>", `${printScript}</body>`);
    }
    /**
     * Inject specific initialization scripts without print dialog
     */
    injectInitScripts(html) {
      const initScript = `
<script>
$(function() {
    // Force init for Print Preview (since window.eXeLearning is defined, auto-init doesn't run)
    if (typeof $exeABCmusic !== 'undefined' && typeof $exeABCmusic.init === 'function') {
         $exeABCmusic.init();
    }
    if (typeof $exeHighlighter !== 'undefined' && typeof $exeHighlighter.init === 'function') {
         $exeHighlighter.init();
    }
});
<\/script>
`;
      return html.replace("</body>", `${initScript}</body>`);
    }
    /**
     * Reveal hidden feedback elements by removing display: none style
     * Targets divs with classes 'feedback' and 'js-hidden'
     */
    revealFeedback(html) {
      return html.replace(/<div([^>]*)>/gi, (match, attributes) => {
        const classMatch = /class=["']([^"']*)["']/i.exec(attributes);
        if (!classMatch) return match;
        const classes = classMatch[1].split(/\s+/);
        if (classes.includes("feedback") && classes.includes("js-hidden")) {
          const newAttributes = attributes.replace(/style=(["'])(.*?)\1/i, (styleMatch, quote, styleContent) => {
            const newStyle = styleContent.replace(/display:\s*none;?/gi, "").trim();
            return newStyle ? `style=${quote}${newStyle}${quote}` : "";
          });
          return `<div${newAttributes}>`;
        }
        return match;
      });
    }
    /**
     * Deduplicate consecutive components that share the same type and ID prefix (timestamp)
     * This handles cases like 'Complete' iDevice where it splits into multiple components
     * but we only want to show the first one in print.
     */
    deduplicateComponents(pages) {
      return pages.map((page) => {
        const blocks = page.blocks || [];
        const newBlocks = blocks.map((block) => {
          const components = block.components || [];
          const uniqueComponents = [];
          let lastComponent = null;
          for (const component of components) {
            let isDuplicate = false;
            if (lastComponent && lastComponent.type === component.type) {
              const prefixLength = 14;
              if (lastComponent.id && component.id && lastComponent.id.substring(0, prefixLength) === component.id.substring(0, prefixLength)) {
                isDuplicate = true;
              }
            }
            if (!isDuplicate) {
              uniqueComponents.push(component);
              lastComponent = component;
            }
          }
          return {
            ...block,
            components: uniqueComponents
          };
        });
        return {
          ...page,
          blocks: newBlocks
          // ExportPage is flat list, no children property
        };
      });
    }
    /**
     * Hide specific elements from print preview based on class patterns
     * - divs with class ending in -version or -bns AND js-hidden
     * - imgs/links with class containing 'image', 'audio', 'video' AND js-hidden
     * - specific classes: exe-mindmap-code, form-Data, completa-DataGame
     */
    hidePrintExtras(html) {
      return html.replace(/<(div|img|a|p)([^>]*)>/gi, (match, tagName, attributes) => {
        const classMatch = /class=["']([^"']*)["']/i.exec(attributes);
        if (!classMatch) return match;
        const classes = classMatch[1].split(/\s+/);
        const lowerTagName = tagName.toLowerCase();
        let shouldHide = false;
        if (lowerTagName === "p" && classes.includes("exe-mindmap-code")) {
          shouldHide = true;
        }
        if (!shouldHide && classes.includes("js-hidden")) {
          if (lowerTagName === "div") {
            if (classes.some((c) => /.+-(version|bns)$/i.test(c))) {
              shouldHide = true;
            }
            if (classes.includes("form-Data") || classes.includes("completa-DataGame")) {
              shouldHide = true;
            }
          } else if (lowerTagName === "img" || lowerTagName === "a") {
            if (classes.some((c) => /image|audio|video/i.test(c))) {
              shouldHide = true;
            }
          }
        }
        if (shouldHide) {
          if (/style=(["'])/i.test(attributes)) {
            return match.replace(/style=(["'])(.*?)\1/i, (m, q, c) => {
              return `style=${q}${c}; display: none !important;${q}`;
            });
          } else {
            return `<${tagName} ${attributes} style="display: none !important">`;
          }
        }
        return match;
      });
    }
  };

  // src/shared/export/exporters/ComponentExporter.ts
  var ComponentExporter = class extends BaseExporter {
    /**
     * Get file extension for component export
     */
    getFileExtension() {
      return ".elp";
    }
    /**
     * Get file suffix for component export
     */
    getFileSuffix() {
      return "";
    }
    /**
     * Standard export method (not typically used for components)
     * Use exportComponent() instead for targeted exports
     */
    async export(options) {
      const componentOptions = options;
      if (!componentOptions?.blockId) {
        return {
          success: false,
          error: "blockId is required for component export"
        };
      }
      return this.exportComponent(componentOptions.blockId, componentOptions.ideviceId);
    }
    /**
     * Export a single component (iDevice) or entire block
     * @param blockId - Block ID to export
     * @param ideviceId - iDevice ID (null or 'null' = export whole block)
     * @returns Export result with data buffer
     */
    async exportComponent(blockId, ideviceId) {
      const isIdevice = ideviceId && ideviceId !== "null";
      const filename = isIdevice ? `${ideviceId}.idevice` : `${blockId}.block`;
      console.log(`[ComponentExporter] Exporting ${isIdevice ? "iDevice" : "block"}: ${filename}`);
      try {
        const { block, component, pageId } = this.findComponent(blockId, ideviceId);
        if (!block) {
          console.log(`[ComponentExporter] Block not found: ${blockId}`);
          return { success: false, error: "Block not found" };
        }
        if (isIdevice && !component) {
          console.log(`[ComponentExporter] Component not found: ${ideviceId}`);
          return { success: false, error: "Component not found" };
        }
        const processedBlock = await this.preprocessBlockForExport(block, component);
        const contentXml = this.generateComponentExportXml(
          processedBlock,
          component ? processedBlock.components[0] : null,
          pageId
        );
        this.zip.addFile("content.xml", new TextEncoder().encode(contentXml));
        await this.addComponentAssetsToZip(block, component);
        const data = await this.zip.generate();
        console.log(`[ComponentExporter] Export complete: ${filename}`);
        return { success: true, data, filename };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("[ComponentExporter] Export failed:", error);
        return { success: false, error: message };
      }
    }
    /**
     * Preprocess block for export: convert asset:// URLs to {{context_path}}/content/resources/path
     * Uses BaseExporter's addFilenamesToAssetUrls (same as ELPX export) for consistency.
     *
     * @param block - Original block data
     * @param singleComponent - Single component to export (null = all components in block)
     * @returns Processed block with URLs transformed
     */
    async preprocessBlockForExport(block, singleComponent) {
      const clonedBlock = JSON.parse(JSON.stringify(block));
      const components = singleComponent ? [clonedBlock.components.find((c) => c.id === singleComponent.id)] : clonedBlock.components || [];
      for (const comp of components) {
        if (comp.content) {
          comp.content = await this.addFilenamesToAssetUrls(comp.content);
        }
        if (comp.properties && Object.keys(comp.properties).length > 0) {
          const propsStr = JSON.stringify(comp.properties);
          const processedStr = await this.addFilenamesToAssetUrls(propsStr);
          comp.properties = JSON.parse(processedStr);
        }
      }
      if (singleComponent) {
        clonedBlock.components = components;
      }
      return clonedBlock;
    }
    /**
     * Export and trigger browser download
     * @param blockId - Block ID to export
     * @param ideviceId - iDevice ID (null = export whole block)
     * @returns Export result
     */
    async exportAndDownload(blockId, ideviceId) {
      const result = await this.exportComponent(blockId, ideviceId);
      if (result.success && result.data && result.filename) {
        this.downloadBlob(result.data, result.filename);
      }
      return result;
    }
    /**
     * Find block and component in document navigation structure
     * @param blockId - Block ID to find
     * @param ideviceId - Optional iDevice ID to find within block
     */
    findComponent(blockId, ideviceId) {
      const pages = this.buildPageList();
      for (const page of pages) {
        for (const block of page.blocks || []) {
          if (block.id === blockId) {
            if (ideviceId && ideviceId !== "null") {
              const component = (block.components || []).find((c) => c.id === ideviceId);
              return { block, component: component || null, pageId: page.id };
            }
            return { block, component: null, pageId: page.id };
          }
        }
      }
      return { block: null, component: null, pageId: null };
    }
    /**
     * Generate XML for component export (ODE format)
     * @param block - Block data
     * @param component - Single component to export (null = all components in block)
     * @param pageId - Page ID containing the block
     */
    generateComponentExportXml(block, component, pageId) {
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<ode xmlns="http://www.intef.es/xsd/ode" version="2.0">\n';
      xml += "<odeResources>\n";
      xml += "  <odeResource>\n";
      xml += "    <key>odeComponentsResources</key>\n";
      xml += "    <value>true</value>\n";
      xml += "  </odeResource>\n";
      xml += "</odeResources>\n";
      xml += "<odePagStructures>\n";
      xml += this.generateBlockExportXml(block, component, pageId);
      xml += "</odePagStructures>\n";
      xml += "</ode>";
      return xml;
    }
    /**
     * Generate XML for the block structure
     * @param block - Block data
     * @param singleComponent - Single component to include (null = all)
     * @param pageId - Page ID
     */
    generateBlockExportXml(block, singleComponent, pageId) {
      let xml = "  <odePagStructure>\n";
      xml += `    <odeBlockId>${this.escapeXml(block.id)}</odeBlockId>
`;
      xml += `    <blockName>${this.escapeXml(block.name || "Block")}</blockName>
`;
      xml += `    <iconName>${this.escapeXml(block.iconName || "")}</iconName>
`;
      xml += `    <odePagStructureOrder>0</odePagStructureOrder>
`;
      xml += `    <odePagStructureProperties>${this.escapeXml(JSON.stringify(block.properties || {}))}</odePagStructureProperties>
`;
      xml += "    <odeComponents>\n";
      const components = singleComponent ? [singleComponent] : block.components || [];
      for (const comp of components) {
        xml += this.generateIdeviceExportXml(comp, block.id, pageId);
      }
      xml += "    </odeComponents>\n";
      xml += "  </odePagStructure>\n";
      return xml;
    }
    /**
     * Generate XML for a single iDevice/component
     * Content is already preprocessed with {{context_path}} URLs by preprocessBlockForExport()
     *
     * @param comp - Component data (already preprocessed)
     * @param blockId - Parent block ID
     * @param pageId - Parent page ID
     */
    generateIdeviceExportXml(comp, blockId, pageId) {
      const htmlContent = comp.content || "";
      const propsJson = JSON.stringify(comp.properties || {});
      let xml = "      <odeComponent>\n";
      xml += `        <odeIdeviceId>${this.escapeXml(comp.id)}</odeIdeviceId>
`;
      xml += `        <odePageId>${this.escapeXml(pageId)}</odePageId>
`;
      xml += `        <odeBlockId>${this.escapeXml(blockId)}</odeBlockId>
`;
      xml += `        <odeIdeviceTypeName>${this.escapeXml(comp.type || "FreeTextIdevice")}</odeIdeviceTypeName>
`;
      xml += `        <ideviceSrcType>json</ideviceSrcType>
`;
      xml += `        <userIdevice>0</userIdevice>
`;
      xml += `        <htmlView><![CDATA[${this.escapeCdata(htmlContent)}]]></htmlView>
`;
      xml += `        <jsonProperties><![CDATA[${this.escapeCdata(propsJson)}]]></jsonProperties>
`;
      xml += `        <odeComponentsOrder>${comp.order || 0}</odeComponentsOrder>
`;
      xml += `        <odeComponentsProperties></odeComponentsProperties>
`;
      xml += "      </odeComponent>\n";
      return xml;
    }
    /**
     * Add only assets used by this component to ZIP
     * Scans component content for asset:// URLs and includes only those assets.
     *
     * Assets are stored at `content/resources/{folderPath}/{filename}` to match ELPX format.
     * Uses buildAssetExportPathMap() for consistent path generation with addFilenamesToAssetUrls().
     *
     * @param block - Block data (with original asset:// URLs for ID extraction)
     * @param singleComponent - Single component (null = all in block)
     */
    async addComponentAssetsToZip(block, singleComponent) {
      try {
        const exportPathMap = await this.buildAssetExportPathMap();
        const components = singleComponent ? [singleComponent] : block.components || [];
        const usedAssetIds = /* @__PURE__ */ new Set();
        for (const comp of components) {
          const content = comp.content || "";
          const matches = content.matchAll(/asset:\/\/([a-f0-9-]{36})/gi);
          for (const match of matches) {
            usedAssetIds.add(match[1]);
          }
          if (comp.properties) {
            const propsStr = JSON.stringify(comp.properties);
            const propsMatches = propsStr.matchAll(/asset:\/\/([a-f0-9-]{36})/gi);
            for (const match of propsMatches) {
              usedAssetIds.add(match[1]);
            }
          }
        }
        console.log(`[ComponentExporter] Found ${usedAssetIds.size} referenced assets`);
        let addedCount = 0;
        const processAsset = async (asset) => {
          if (usedAssetIds.has(asset.id)) {
            const exportPath = exportPathMap.get(asset.id);
            if (exportPath) {
              const zipPath = `content/resources/${exportPath}`;
              this.zip.addFile(zipPath, asset.data);
              console.log(`[ComponentExporter] Added asset: ${zipPath}`);
              addedCount++;
            } else {
              console.warn(`[ComponentExporter] No export path for asset: ${asset.id}`);
            }
          }
        };
        await this.forEachAsset(processAsset);
        console.log(`[ComponentExporter] Added ${addedCount} assets to ZIP`);
      } catch (e) {
        console.warn("[ComponentExporter] Failed to add assets:", e);
      }
    }
    /**
     * Trigger browser download of blob data
     * @param data - ZIP data buffer
     * @param filename - Download filename
     */
    downloadBlob(data, filename) {
      if (typeof window === "undefined" || typeof document === "undefined") {
        console.warn("[ComponentExporter] downloadBlob only works in browser environment");
        return;
      }
      const blob = new Blob([data], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // src/shared/export/exporters/PageElpxExporter.ts
  var PageElpxExporter = class extends ElpxExporter {
    constructor() {
      super(...arguments);
      // Set of asset IDs that are referenced by the pages being exported
      // null means no filtering (export all assets)
      this.filteredAssetIds = null;
    }
    /**
     * Get file extension for ELPX format
     */
    getFileExtension() {
      return ".elpx";
    }
    /**
     * Get file suffix for ELPX PAGE format
     */
    getFileSuffix() {
      return "";
    }
    /**
     * Export to ELPX format (subtree)
     *
     * Key: We extract asset IDs from the original pages BEFORE calling super.export(),
     * because super.export() will preprocess pages and transform asset:// URLs to
     * {{context_path}}/content/resources/ format, losing the asset UUIDs.
     */
    async export(options) {
      const elpxOptions = options;
      this.rootPageId = elpxOptions?.rootPageId;
      if (this.rootPageId) {
        const pages = this.buildPageList();
        this.filteredAssetIds = this.extractAssetIdsFromPages(pages);
        console.log(
          `[PageElpxExporter] Extracted ${this.filteredAssetIds.size} asset IDs from ${pages.length} pages`
        );
      } else {
        this.filteredAssetIds = null;
      }
      return super.export(options);
    }
    /**
     * Override to only add assets used by the exported page subtree
     *
     * This follows the same pattern as ComponentExporter.addComponentAssetsToZip()
     * which successfully filters assets for component exports.
     */
    async addAssetsToZipWithResourcePath(trackingList) {
      if (!this.filteredAssetIds) {
        return super.addAssetsToZipWithResourcePath(trackingList);
      }
      let assetsAdded = 0;
      try {
        const exportPathMap = await this.buildAssetExportPathMap();
        const processAsset = async (asset) => {
          if (this.filteredAssetIds.has(asset.id)) {
            const exportPath = exportPathMap.get(asset.id);
            if (exportPath) {
              const zipPath = `content/resources/${exportPath}`;
              this.zip.addFile(zipPath, asset.data);
              if (trackingList) trackingList.push(zipPath);
              assetsAdded++;
            } else {
              console.warn(`[PageElpxExporter] No export path for referenced asset: ${asset.id}`);
            }
          }
        };
        await this.forEachAsset(processAsset);
        console.log(`[PageElpxExporter] Added ${assetsAdded} filtered assets to ZIP`);
      } catch (e) {
        console.warn("[PageElpxExporter] Failed to add assets to ZIP:", e);
      }
      return assetsAdded;
    }
    /**
     * Extract asset IDs from all component content and properties in pages
     *
     * This scans for the asset:// URL pattern used in eXeLearning content.
     * Supports both formats:
     * - New format: asset://aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.jpg (UUID with extension)
     * - Legacy format: asset://aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/filename (UUID with path)
     * - ODE ID format: asset://20251009090601SQPBIF.jpg (18-char alphanumeric with extension)
     *
     * @param pages - Pages to scan for asset references
     * @returns Set of asset IDs found in the content
     */
    extractAssetIdsFromPages(pages) {
      const assetIds = /* @__PURE__ */ new Set();
      const assetPattern = /asset:\/\/([a-zA-Z0-9-]+)(?:[./"'])/gi;
      for (const page of pages) {
        for (const block of page.blocks || []) {
          for (const component of block.components || []) {
            if (component.content) {
              const matches = component.content.matchAll(assetPattern);
              for (const match of matches) {
                assetIds.add(match[1]);
              }
            }
            if (component.properties && Object.keys(component.properties).length > 0) {
              const propsStr = JSON.stringify(component.properties);
              const matches = propsStr.matchAll(assetPattern);
              for (const match of matches) {
                assetIds.add(match[1]);
              }
            }
          }
        }
      }
      return assetIds;
    }
    /**
     * Override buildPageList to filter subtree
     */
    buildPageList() {
      const allPages = super.buildPageList();
      if (!this.rootPageId) {
        return allPages;
      }
      const rootPage = allPages.find((p) => p.id === this.rootPageId);
      if (!rootPage) {
        console.warn(`[PageElpxExporter] Root page ${this.rootPageId} not found, exporting all.`);
        return allPages;
      }
      const subtree = [];
      const visited = /* @__PURE__ */ new Set();
      const collect = (parentId) => {
        const children = allPages.filter((p) => p.parentId === parentId);
        children.sort((a, b) => a.order - b.order);
        for (const child of children) {
          if (!visited.has(child.id)) {
            visited.add(child.id);
            subtree.push(child);
            collect(child.id);
          }
        }
      };
      const newRoot = { ...rootPage, parentId: null };
      visited.add(rootPage.id);
      subtree.push(newRoot);
      collect(rootPage.id);
      return subtree;
    }
  };

  // src/shared/export/browser/index.ts
  var import_LatexPreRenderer = __toESM(require_LatexPreRenderer());
  function createNullResourceProvider() {
    return {
      fetchTheme: async () => /* @__PURE__ */ new Map(),
      fetchIdeviceResources: async () => /* @__PURE__ */ new Map(),
      fetchBaseLibraries: async () => /* @__PURE__ */ new Map(),
      fetchScormFiles: async () => /* @__PURE__ */ new Map(),
      fetchLibraryFiles: async () => /* @__PURE__ */ new Map(),
      fetchLibraryDirectory: async () => /* @__PURE__ */ new Map(),
      fetchSchemas: async () => /* @__PURE__ */ new Map(),
      fetchContentCss: async () => /* @__PURE__ */ new Map(),
      normalizeIdeviceType: (type) => type.toLowerCase().replace(/idevice$/i, "") || "text",
      fetchExeLogo: async () => null,
      fetchGlobalFontFiles: async () => /* @__PURE__ */ new Map()
    };
  }
  function createNullAssetProvider() {
    return {
      getAsset: async () => null,
      hasAsset: async () => false,
      listAssets: async () => [],
      getAllAssets: async () => [],
      resolveAssetUrl: async () => null,
      getProjectAssets: async () => []
    };
  }
  function createExporter(format, documentManager, assetCache, resourceFetcher, assetManager) {
    if (!documentManager) {
      throw new Error("[SharedExporters] documentManager is required for export");
    }
    const document2 = new YjsDocumentAdapter(documentManager);
    let resources;
    if (resourceFetcher) {
      resources = new BrowserResourceProvider(resourceFetcher);
    } else {
      resources = createNullResourceProvider();
    }
    let assets;
    if (assetCache || assetManager) {
      assets = new BrowserAssetProvider(
        // biome-ignore lint/suspicious/noExplicitAny: legacy asset cache compatibility
        assetCache,
        // biome-ignore lint/suspicious/noExplicitAny: legacy asset manager compatibility
        assetManager
      );
    } else {
      assets = createNullAssetProvider();
    }
    const zip2 = new FflateZipProvider();
    const normalizedFormat = format.toLowerCase().replace("-", "");
    switch (normalizedFormat) {
      case "html5":
      case "web":
        return new Html5Exporter(document2, resources, assets, zip2);
      case "html5sp":
      case "page":
        return new PageExporter(document2, resources, assets, zip2);
      case "scorm12":
      case "scorm":
        return new Scorm12Exporter(document2, resources, assets, zip2);
      case "scorm2004":
        return new Scorm2004Exporter(document2, resources, assets, zip2);
      case "ims":
      case "imscp":
        return new ImsExporter(document2, resources, assets, zip2);
      case "epub3":
      case "epub":
        return new Epub3Exporter(document2, resources, assets, zip2);
      case "elpx":
      case "elp":
        return new ElpxExporter(document2, resources, assets, zip2);
      case "pageelpx":
      case "pageelp":
        return new PageElpxExporter(document2, resources, assets, zip2);
      case "component":
      case "block":
      case "idevice":
        return new ComponentExporter(document2, resources, assets, zip2);
      default:
        throw new Error(`Unknown export format: ${format}`);
    }
  }
  function pushLatexDebug(step, details) {
    if (typeof window === "undefined") return;
    const w = window;
    if (!w.__latexExportDebug) {
      w.__latexExportDebug = [];
    }
    w.__latexExportDebug.push({
      step,
      timestamp: Date.now(),
      details
    });
  }
  var latexPreRendererLoadPromise = null;
  async function ensureLatexPreRendererLoaded() {
    if (typeof window === "undefined") return false;
    const windowWithLatex = window;
    if (windowWithLatex.LatexPreRenderer) {
      pushLatexDebug("ensureLatexPreRendererLoaded.alreadyLoaded");
      return true;
    }
    if (latexPreRendererLoadPromise) {
      pushLatexDebug("ensureLatexPreRendererLoaded.awaitExistingPromise");
      return latexPreRendererLoadPromise;
    }
    latexPreRendererLoadPromise = new Promise((resolve) => {
      const existing = Array.from(document.querySelectorAll("script[src]")).find(
        (script2) => script2.getAttribute("src")?.includes("/app/common/LatexPreRenderer.js")
      );
      if (existing) {
        pushLatexDebug("ensureLatexPreRendererLoaded.foundExistingScript", {
          src: existing.getAttribute("src") || ""
        });
        existing.addEventListener("load", () => resolve(!!windowWithLatex.LatexPreRenderer), { once: true });
        existing.addEventListener("error", () => resolve(false), { once: true });
        if (windowWithLatex.LatexPreRenderer) {
          resolve(true);
        }
        return;
      }
      const exportersScript = Array.from(document.querySelectorAll("script[src]")).find((script2) => {
        const src = script2.getAttribute("src") || "";
        return src.includes("/app/yjs/exporters.bundle.js") || src.endsWith("exporters.bundle.js");
      });
      const exportersSrc = exportersScript?.getAttribute("src") || "";
      const latexSrc = exportersSrc ? exportersSrc.replace(/\/yjs\/exporters\.bundle\.js(\?.*)?$/, "/common/LatexPreRenderer.js") : "/app/common/LatexPreRenderer.js";
      const script = document.createElement("script");
      script.src = latexSrc;
      script.async = true;
      script.onload = () => {
        pushLatexDebug("ensureLatexPreRendererLoaded.injectedScriptLoaded", { src: latexSrc });
        resolve(!!windowWithLatex.LatexPreRenderer);
      };
      script.onerror = () => {
        pushLatexDebug("ensureLatexPreRendererLoaded.injectedScriptError", { src: latexSrc });
        resolve(false);
      };
      pushLatexDebug("ensureLatexPreRendererLoaded.injectedScript", { src: latexSrc });
      document.head.appendChild(script);
    });
    const loaded = await latexPreRendererLoadPromise;
    pushLatexDebug("ensureLatexPreRendererLoaded.resolved", { loaded });
    if (!loaded) {
      latexPreRendererLoadPromise = null;
    }
    return loaded;
  }
  async function ensureMathJaxForLatexPreRender() {
    if (typeof window === "undefined") return false;
    const windowWithMath = window;
    if (typeof windowWithMath.MathJax?.tex2svg === "function") {
      pushLatexDebug("ensureMathJaxForLatexPreRender.alreadyReady");
      return true;
    }
    const loadMathJax = windowWithMath.$exe?.math?.loadMathJax;
    if (typeof loadMathJax !== "function") {
      const exportersScript = Array.from(document.querySelectorAll("script[src]")).find((script) => {
        const src = script.getAttribute("src") || "";
        return src.includes("/app/yjs/exporters.bundle.js") || src.endsWith("exporters.bundle.js");
      });
      const exportersSrc = exportersScript?.getAttribute("src") || "";
      const mathJaxSrc = exportersSrc ? exportersSrc.replace(/\/yjs\/exporters\.bundle\.js(\?.*)?$/, "/common/exe_math/tex-mml-svg.js") : "/app/common/exe_math/tex-mml-svg.js";
      if (!document.querySelector(`script[src="${mathJaxSrc}"]`)) {
        windowWithMath.MathJax = windowWithMath.MathJax || {
          tex: {
            inlineMath: [["\\(", "\\)"]],
            displayMath: [
              ["$$", "$$"],
              ["\\[", "\\]"]
            ],
            processEscapes: true,
            tags: "ams"
          }
        };
        await new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = mathJaxSrc;
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => resolve();
          pushLatexDebug("ensureMathJaxForLatexPreRender.injectScript", { src: mathJaxSrc });
          document.head.appendChild(script);
        });
      }
    } else {
      pushLatexDebug("ensureMathJaxForLatexPreRender.useLoadMathJax");
      await new Promise((resolve) => {
        try {
          loadMathJax(() => resolve());
        } catch {
          resolve();
        }
      });
    }
    const maxWaitMs = 5e3;
    const intervalMs = 50;
    let elapsed = 0;
    while (elapsed < maxWaitMs) {
      if (typeof windowWithMath.MathJax?.tex2svg === "function") {
        pushLatexDebug("ensureMathJaxForLatexPreRender.readyAfterWait", { elapsed });
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      elapsed += intervalMs;
    }
    pushLatexDebug("ensureMathJaxForLatexPreRender.failed");
    return false;
  }
  async function getLatexPreRendererHooks() {
    if (typeof window === "undefined") return void 0;
    const latexRendererReady = await ensureLatexPreRendererLoaded();
    if (!latexRendererReady) {
      pushLatexDebug("getLatexPreRendererHooks.rendererNotReady");
      return void 0;
    }
    pushLatexDebug("getLatexPreRendererHooks.rendererReady");
    const windowLatexPreRenderer = window.LatexPreRenderer;
    if (!windowLatexPreRenderer) {
      return void 0;
    }
    return {
      preRenderLatex: async (html) => {
        const mathReady = await ensureMathJaxForLatexPreRender();
        const result = await windowLatexPreRenderer.preRender(html);
        pushLatexDebug("preRenderLatex.called", {
          mathReady,
          hasLatex: result.hasLatex,
          latexRendered: result.latexRendered,
          count: result.count
        });
        return result;
      },
      preRenderDataGameLatex: async (html) => {
        const mathReady = await ensureMathJaxForLatexPreRender();
        const result = await windowLatexPreRenderer.preRenderDataGameLatex(html);
        pushLatexDebug("preRenderDataGameLatex.called", {
          mathReady,
          count: result.count
        });
        return result;
      }
    };
  }
  function getMermaidPreRendererHooks() {
    if (typeof window === "undefined") return void 0;
    const windowMermaidPreRenderer = window.MermaidPreRenderer;
    if (windowMermaidPreRenderer) {
      return {
        preRenderMermaid: windowMermaidPreRenderer.preRender.bind(windowMermaidPreRenderer)
      };
    }
    return void 0;
  }
  async function quickExport(format, documentManager, assetCache, resourceFetcher, options, assetManager) {
    const exporter = createExporter(format, documentManager, assetCache, resourceFetcher, assetManager);
    const latexHooks = await getLatexPreRendererHooks();
    const mermaidHooks = getMermaidPreRendererHooks();
    const exportOptions = { ...options, ...latexHooks, ...mermaidHooks };
    return exporter.export(exportOptions);
  }
  async function exportAndDownload(format, documentManager, assetCache, resourceFetcher, filename, options, assetManager) {
    const exporter = createExporter(format, documentManager, assetCache, resourceFetcher, assetManager);
    const latexHooks = await getLatexPreRendererHooks();
    const mermaidHooks = getMermaidPreRendererHooks();
    const exportOptions = { ...options, ...latexHooks, ...mermaidHooks };
    const result = await exporter.export(exportOptions);
    if (!result.success || !result.data) {
      throw new Error(result.error || "Export failed");
    }
    const extension = exporter.getFileExtension();
    const fullFilename = filename.endsWith(extension) ? filename : `${filename}${extension}`;
    const blob = new Blob([result.data], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fullFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return result;
  }
  async function generatePrintPreview(documentManager, resourceFetcher, options, assetManager) {
    const document2 = new YjsDocumentAdapter(documentManager);
    let resources;
    if (resourceFetcher) {
      resources = new BrowserResourceProvider(resourceFetcher);
    } else {
      resources = createNullResourceProvider();
    }
    let assets = null;
    if (assetManager) {
      const isNewManager = "getProjectAssets" in assetManager;
      const cache = isNewManager ? null : assetManager;
      const manager = isNewManager ? assetManager : null;
      assets = new BrowserAssetProvider(cache, manager);
    }
    const exporter = new PrintPreviewExporter(
      document2,
      // biome-ignore lint/suspicious/noExplicitAny: legacy resource provider compatibility
      resources,
      assets
    );
    const latexHooks = await getLatexPreRendererHooks();
    const mermaidHooks = getMermaidPreRendererHooks();
    const previewOptions = {
      ...options,
      ...latexHooks,
      ...mermaidHooks
    };
    return exporter.generatePreview(previewOptions);
  }
  function createPrintPreviewExporter(documentManager, resourceFetcher, assetManager) {
    const document2 = new YjsDocumentAdapter(documentManager);
    let resources;
    if (resourceFetcher) {
      resources = new BrowserResourceProvider(resourceFetcher);
    } else {
      resources = createNullResourceProvider();
    }
    let assets = null;
    if (assetManager) {
      const isNewManager = "getProjectAssets" in assetManager;
      const cache = isNewManager ? null : assetManager;
      const manager = isNewManager ? assetManager : null;
      assets = new BrowserAssetProvider(cache, manager);
    }
    return new PrintPreviewExporter(
      document2,
      // biome-ignore lint/suspicious/noExplicitAny: resource provider compatibility
      resources,
      assets
    );
  }
  async function generatePreviewForSW(documentManager, assetCache, resourceFetcher, assetManager, options) {
    try {
      if (!documentManager) {
        throw new Error("[SharedExporters] documentManager is required for preview");
      }
      const document2 = new YjsDocumentAdapter(documentManager);
      let resources;
      if (resourceFetcher) {
        resources = new BrowserResourceProvider(resourceFetcher);
      } else {
        resources = createNullResourceProvider();
      }
      let assets;
      if (assetCache || assetManager) {
        assets = new BrowserAssetProvider(
          // biome-ignore lint/suspicious/noExplicitAny: legacy asset cache compatibility
          assetCache,
          // biome-ignore lint/suspicious/noExplicitAny: legacy asset manager compatibility
          assetManager
        );
      } else {
        assets = createNullAssetProvider();
      }
      const zip2 = new FflateZipProvider();
      const exporter = new Html5Exporter(document2, resources, assets, zip2);
      const latexHooks = await getLatexPreRendererHooks();
      const mermaidHooks = getMermaidPreRendererHooks();
      const exportOptions = { ...options, ...latexHooks, ...mermaidHooks };
      const filesMap = await exporter.generateForPreview(exportOptions);
      const files = Object.fromEntries(filesMap);
      console.log(`[SharedExporters] Generated ${Object.keys(files).length} preview files for SW`);
      return {
        success: true,
        files
      };
    } catch (error) {
      console.error("[SharedExporters] generatePreviewForSW failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  if (typeof window !== "undefined") {
    const windowExports = {
      // Factory functions
      createExporter,
      quickExport,
      exportAndDownload,
      // SW-based preview functions
      generatePreviewForSW,
      // Print preview functions
      generatePrintPreview,
      createPrintPreviewExporter,
      // Adapters
      YjsDocumentAdapter,
      BrowserResourceProvider,
      BrowserAssetProvider,
      ExportAssetResolver,
      // Providers
      FflateZipProvider,
      // Exporters
      Html5Exporter,
      PageExporter,
      Scorm12Exporter,
      Scorm2004Exporter,
      ImsExporter,
      Epub3Exporter,
      ElpxExporter,
      PrintPreviewExporter,
      ComponentExporter,
      PageElpxExporter,
      // Renderers
      IdeviceRenderer,
      PageRenderer,
      // Generators
      Scorm12ManifestGenerator,
      Scorm2004ManifestGenerator,
      ImsManifestGenerator,
      LomMetadataGenerator,
      // Utilities
      LibraryDetector
    };
    window.PrintPreviewExporter = PrintPreviewExporter;
    window.generatePrintPreview = generatePrintPreview;
    window.SharedExporters = windowExports;
    window.createSharedExporter = createExporter;
    window.createExporter = createExporter;
    window.ElpxExporter = ElpxExporter;
    console.log("[SharedExporters] Browser export system loaded");
  }
})();
