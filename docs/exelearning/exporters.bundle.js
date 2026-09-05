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

  // node_modules/@xmldom/xmldom/lib/conventions.js
  var require_conventions = __commonJS({
    "node_modules/@xmldom/xmldom/lib/conventions.js"(exports) {
      "use strict";
      function find(list, predicate, ac) {
        if (ac === void 0) {
          ac = Array.prototype;
        }
        if (list && typeof ac.find === "function") {
          return ac.find.call(list, predicate);
        }
        for (var i = 0; i < list.length; i++) {
          if (hasOwn(list, i)) {
            var item = list[i];
            if (predicate.call(void 0, item, i, list)) {
              return item;
            }
          }
        }
      }
      function freeze(object, oc) {
        if (oc === void 0) {
          oc = Object;
        }
        if (oc && typeof oc.getOwnPropertyDescriptors === "function") {
          object = oc.create(null, oc.getOwnPropertyDescriptors(object));
        }
        return oc && typeof oc.freeze === "function" ? oc.freeze(object) : object;
      }
      function hasOwn(object, key) {
        return Object.prototype.hasOwnProperty.call(object, key);
      }
      function assign(target, source) {
        if (target === null || typeof target !== "object") {
          throw new TypeError("target is not an object");
        }
        for (var key in source) {
          if (hasOwn(source, key)) {
            target[key] = source[key];
          }
        }
        return target;
      }
      var HTML_BOOLEAN_ATTRIBUTES = freeze({
        allowfullscreen: true,
        async: true,
        autofocus: true,
        autoplay: true,
        checked: true,
        controls: true,
        default: true,
        defer: true,
        disabled: true,
        formnovalidate: true,
        hidden: true,
        ismap: true,
        itemscope: true,
        loop: true,
        multiple: true,
        muted: true,
        nomodule: true,
        novalidate: true,
        open: true,
        playsinline: true,
        readonly: true,
        required: true,
        reversed: true,
        selected: true
      });
      function isHTMLBooleanAttribute(name) {
        return hasOwn(HTML_BOOLEAN_ATTRIBUTES, name.toLowerCase());
      }
      var HTML_VOID_ELEMENTS = freeze({
        area: true,
        base: true,
        br: true,
        col: true,
        embed: true,
        hr: true,
        img: true,
        input: true,
        link: true,
        meta: true,
        param: true,
        source: true,
        track: true,
        wbr: true
      });
      function isHTMLVoidElement(tagName) {
        return hasOwn(HTML_VOID_ELEMENTS, tagName.toLowerCase());
      }
      var HTML_RAW_TEXT_ELEMENTS = freeze({
        script: false,
        style: false,
        textarea: true,
        title: true
      });
      function isHTMLRawTextElement(tagName) {
        var key = tagName.toLowerCase();
        return hasOwn(HTML_RAW_TEXT_ELEMENTS, key) && !HTML_RAW_TEXT_ELEMENTS[key];
      }
      function isHTMLEscapableRawTextElement(tagName) {
        var key = tagName.toLowerCase();
        return hasOwn(HTML_RAW_TEXT_ELEMENTS, key) && HTML_RAW_TEXT_ELEMENTS[key];
      }
      function isHTMLMimeType(mimeType) {
        return mimeType === MIME_TYPE.HTML;
      }
      function hasDefaultHTMLNamespace(mimeType) {
        return isHTMLMimeType(mimeType) || mimeType === MIME_TYPE.XML_XHTML_APPLICATION;
      }
      var MIME_TYPE = freeze({
        /**
         * `text/html`, the only mime type that triggers treating an XML document as HTML.
         *
         * @see https://www.iana.org/assignments/media-types/text/html IANA MimeType registration
         * @see https://en.wikipedia.org/wiki/HTML Wikipedia
         * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString MDN
         * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-domparser-parsefromstring
         *      WHATWG HTML Spec
         */
        HTML: "text/html",
        /**
         * `application/xml`, the standard mime type for XML documents.
         *
         * @see https://www.iana.org/assignments/media-types/application/xml IANA MimeType
         *      registration
         * @see https://tools.ietf.org/html/rfc7303#section-9.1 RFC 7303
         * @see https://en.wikipedia.org/wiki/XML_and_MIME Wikipedia
         */
        XML_APPLICATION: "application/xml",
        /**
         * `text/xml`, an alias for `application/xml`.
         *
         * @see https://tools.ietf.org/html/rfc7303#section-9.2 RFC 7303
         * @see https://www.iana.org/assignments/media-types/text/xml IANA MimeType registration
         * @see https://en.wikipedia.org/wiki/XML_and_MIME Wikipedia
         */
        XML_TEXT: "text/xml",
        /**
         * `application/xhtml+xml`, indicates an XML document that has the default HTML namespace,
         * but is parsed as an XML document.
         *
         * @see https://www.iana.org/assignments/media-types/application/xhtml+xml IANA MimeType
         *      registration
         * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocument WHATWG DOM Spec
         * @see https://en.wikipedia.org/wiki/XHTML Wikipedia
         */
        XML_XHTML_APPLICATION: "application/xhtml+xml",
        /**
         * `image/svg+xml`,
         *
         * @see https://www.iana.org/assignments/media-types/image/svg+xml IANA MimeType registration
         * @see https://www.w3.org/TR/SVG11/ W3C SVG 1.1
         * @see https://en.wikipedia.org/wiki/Scalable_Vector_Graphics Wikipedia
         */
        XML_SVG_IMAGE: "image/svg+xml"
      });
      var _MIME_TYPES = Object.keys(MIME_TYPE).map(function(key) {
        return MIME_TYPE[key];
      });
      function isValidMimeType(mimeType) {
        return _MIME_TYPES.indexOf(mimeType) > -1;
      }
      var NAMESPACE = freeze({
        /**
         * The XHTML namespace.
         *
         * @see http://www.w3.org/1999/xhtml
         */
        HTML: "http://www.w3.org/1999/xhtml",
        /**
         * The SVG namespace.
         *
         * @see http://www.w3.org/2000/svg
         */
        SVG: "http://www.w3.org/2000/svg",
        /**
         * The `xml:` namespace.
         *
         * @see http://www.w3.org/XML/1998/namespace
         */
        XML: "http://www.w3.org/XML/1998/namespace",
        /**
         * The `xmlns:` namespace.
         *
         * @see https://www.w3.org/2000/xmlns/
         */
        XMLNS: "http://www.w3.org/2000/xmlns/"
      });
      exports.assign = assign;
      exports.find = find;
      exports.freeze = freeze;
      exports.HTML_BOOLEAN_ATTRIBUTES = HTML_BOOLEAN_ATTRIBUTES;
      exports.HTML_RAW_TEXT_ELEMENTS = HTML_RAW_TEXT_ELEMENTS;
      exports.HTML_VOID_ELEMENTS = HTML_VOID_ELEMENTS;
      exports.hasDefaultHTMLNamespace = hasDefaultHTMLNamespace;
      exports.hasOwn = hasOwn;
      exports.isHTMLBooleanAttribute = isHTMLBooleanAttribute;
      exports.isHTMLRawTextElement = isHTMLRawTextElement;
      exports.isHTMLEscapableRawTextElement = isHTMLEscapableRawTextElement;
      exports.isHTMLMimeType = isHTMLMimeType;
      exports.isHTMLVoidElement = isHTMLVoidElement;
      exports.isValidMimeType = isValidMimeType;
      exports.MIME_TYPE = MIME_TYPE;
      exports.NAMESPACE = NAMESPACE;
    }
  });

  // node_modules/@xmldom/xmldom/lib/errors.js
  var require_errors = __commonJS({
    "node_modules/@xmldom/xmldom/lib/errors.js"(exports) {
      "use strict";
      var conventions = require_conventions();
      function extendError(constructor, writableName) {
        constructor.prototype = Object.create(Error.prototype, {
          constructor: { value: constructor },
          name: { value: constructor.name, enumerable: true, writable: writableName }
        });
      }
      var DOMExceptionName = conventions.freeze({
        /**
         * the default value as defined by the spec
         */
        Error: "Error",
        /**
         * @deprecated
         * Use RangeError instead.
         */
        IndexSizeError: "IndexSizeError",
        /**
         * @deprecated
         * Just to match the related static code, not part of the spec.
         */
        DomstringSizeError: "DomstringSizeError",
        HierarchyRequestError: "HierarchyRequestError",
        WrongDocumentError: "WrongDocumentError",
        InvalidCharacterError: "InvalidCharacterError",
        /**
         * @deprecated
         * Just to match the related static code, not part of the spec.
         */
        NoDataAllowedError: "NoDataAllowedError",
        NoModificationAllowedError: "NoModificationAllowedError",
        NotFoundError: "NotFoundError",
        NotSupportedError: "NotSupportedError",
        InUseAttributeError: "InUseAttributeError",
        InvalidStateError: "InvalidStateError",
        SyntaxError: "SyntaxError",
        InvalidModificationError: "InvalidModificationError",
        NamespaceError: "NamespaceError",
        /**
         * @deprecated
         * Use TypeError for invalid arguments,
         * "NotSupportedError" DOMException for unsupported operations,
         * and "NotAllowedError" DOMException for denied requests instead.
         */
        InvalidAccessError: "InvalidAccessError",
        /**
         * @deprecated
         * Just to match the related static code, not part of the spec.
         */
        ValidationError: "ValidationError",
        /**
         * @deprecated
         * Use TypeError instead.
         */
        TypeMismatchError: "TypeMismatchError",
        SecurityError: "SecurityError",
        NetworkError: "NetworkError",
        AbortError: "AbortError",
        /**
         * @deprecated
         * Just to match the related static code, not part of the spec.
         */
        URLMismatchError: "URLMismatchError",
        QuotaExceededError: "QuotaExceededError",
        TimeoutError: "TimeoutError",
        InvalidNodeTypeError: "InvalidNodeTypeError",
        DataCloneError: "DataCloneError",
        EncodingError: "EncodingError",
        NotReadableError: "NotReadableError",
        UnknownError: "UnknownError",
        ConstraintError: "ConstraintError",
        DataError: "DataError",
        TransactionInactiveError: "TransactionInactiveError",
        ReadOnlyError: "ReadOnlyError",
        VersionError: "VersionError",
        OperationError: "OperationError",
        NotAllowedError: "NotAllowedError",
        OptOutError: "OptOutError"
      });
      var DOMExceptionNames = Object.keys(DOMExceptionName);
      function isValidDomExceptionCode(value) {
        return typeof value === "number" && value >= 1 && value <= 25;
      }
      function endsWithError(value) {
        return typeof value === "string" && value.substring(value.length - DOMExceptionName.Error.length) === DOMExceptionName.Error;
      }
      function DOMException(messageOrCode, nameOrMessage) {
        if (isValidDomExceptionCode(messageOrCode)) {
          this.name = DOMExceptionNames[messageOrCode];
          this.message = nameOrMessage || "";
        } else {
          this.message = messageOrCode;
          this.name = endsWithError(nameOrMessage) ? nameOrMessage : DOMExceptionName.Error;
        }
        if (Error.captureStackTrace) Error.captureStackTrace(this, DOMException);
      }
      extendError(DOMException, true);
      Object.defineProperties(DOMException.prototype, {
        code: {
          enumerable: true,
          get: function() {
            var code = DOMExceptionNames.indexOf(this.name);
            if (isValidDomExceptionCode(code)) return code;
            return 0;
          }
        }
      });
      var ExceptionCode = {
        INDEX_SIZE_ERR: 1,
        DOMSTRING_SIZE_ERR: 2,
        HIERARCHY_REQUEST_ERR: 3,
        WRONG_DOCUMENT_ERR: 4,
        INVALID_CHARACTER_ERR: 5,
        NO_DATA_ALLOWED_ERR: 6,
        NO_MODIFICATION_ALLOWED_ERR: 7,
        NOT_FOUND_ERR: 8,
        NOT_SUPPORTED_ERR: 9,
        INUSE_ATTRIBUTE_ERR: 10,
        INVALID_STATE_ERR: 11,
        SYNTAX_ERR: 12,
        INVALID_MODIFICATION_ERR: 13,
        NAMESPACE_ERR: 14,
        INVALID_ACCESS_ERR: 15,
        VALIDATION_ERR: 16,
        TYPE_MISMATCH_ERR: 17,
        SECURITY_ERR: 18,
        NETWORK_ERR: 19,
        ABORT_ERR: 20,
        URL_MISMATCH_ERR: 21,
        QUOTA_EXCEEDED_ERR: 22,
        TIMEOUT_ERR: 23,
        INVALID_NODE_TYPE_ERR: 24,
        DATA_CLONE_ERR: 25
      };
      var entries = Object.entries(ExceptionCode);
      for (i = 0; i < entries.length; i++) {
        key = entries[i][0];
        DOMException[key] = entries[i][1];
      }
      var key;
      var i;
      function ParseError(message, locator) {
        this.message = message;
        this.locator = locator;
        if (Error.captureStackTrace) Error.captureStackTrace(this, ParseError);
      }
      extendError(ParseError);
      exports.DOMException = DOMException;
      exports.DOMExceptionName = DOMExceptionName;
      exports.ExceptionCode = ExceptionCode;
      exports.ParseError = ParseError;
    }
  });

  // node_modules/@xmldom/xmldom/lib/grammar.js
  var require_grammar = __commonJS({
    "node_modules/@xmldom/xmldom/lib/grammar.js"(exports) {
      "use strict";
      function detectUnicodeSupport(RegExpImpl) {
        try {
          if (typeof RegExpImpl !== "function") {
            RegExpImpl = RegExp;
          }
          var match = new RegExpImpl("\u{1D306}", "u").exec("\u{1D306}");
          return !!match && match[0].length === 2;
        } catch (error) {
        }
        return false;
      }
      var UNICODE_SUPPORT = detectUnicodeSupport();
      function chars(regexp) {
        if (regexp.source[0] !== "[") {
          throw new Error(regexp + " can not be used with chars");
        }
        return regexp.source.slice(1, regexp.source.lastIndexOf("]"));
      }
      function chars_without(regexp, search) {
        if (regexp.source[0] !== "[") {
          throw new Error("/" + regexp.source + "/ can not be used with chars_without");
        }
        if (!search || typeof search !== "string") {
          throw new Error(JSON.stringify(search) + " is not a valid search");
        }
        if (regexp.source.indexOf(search) === -1) {
          throw new Error('"' + search + '" is not is /' + regexp.source + "/");
        }
        if (search === "-" && regexp.source.indexOf(search) !== 1) {
          throw new Error('"' + search + '" is not at the first postion of /' + regexp.source + "/");
        }
        return new RegExp(regexp.source.replace(search, ""), UNICODE_SUPPORT ? "u" : "");
      }
      function reg(args) {
        var self = this;
        return new RegExp(
          Array.prototype.slice.call(arguments).map(function(part) {
            var isStr = typeof part === "string";
            if (isStr && self === void 0 && part === "|") {
              throw new Error("use regg instead of reg to wrap expressions with `|`!");
            }
            return isStr ? part : part.source;
          }).join(""),
          UNICODE_SUPPORT ? "mu" : "m"
        );
      }
      function regg(args) {
        if (arguments.length === 0) {
          throw new Error("no parameters provided");
        }
        return reg.apply(regg, ["(?:"].concat(Array.prototype.slice.call(arguments), [")"]));
      }
      var UNICODE_REPLACEMENT_CHARACTER = "\uFFFD";
      var Char = /[-\x09\x0A\x0D\x20-\x2C\x2E-\uD7FF\uE000-\uFFFD]/;
      if (UNICODE_SUPPORT) {
        Char = reg("[", chars(Char), "\\u{10000}-\\u{10FFFF}", "]");
      }
      var InvalidChar = new RegExp("[^" + chars(Char) + "]", UNICODE_SUPPORT ? "u" : "");
      var _SChar = /[\x20\x09\x0D\x0A]/;
      var SChar_s = chars(_SChar);
      var S = reg(_SChar, "+");
      var S_OPT = reg(_SChar, "*");
      var NameStartChar = /[:_a-zA-Z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
      if (UNICODE_SUPPORT) {
        NameStartChar = reg("[", chars(NameStartChar), "\\u{10000}-\\u{10FFFF}", "]");
      }
      var NameStartChar_s = chars(NameStartChar);
      var NameChar = reg("[", NameStartChar_s, chars(/[-.0-9\xB7]/), chars(/[\u0300-\u036F\u203F-\u2040]/), "]");
      var Name = reg(NameStartChar, NameChar, "*");
      var Nmtoken = reg(NameChar, "+");
      var EntityRef = reg("&", Name, ";");
      var CharRef = regg(/&#[0-9]+;|&#x[0-9a-fA-F]+;/);
      var Reference = regg(EntityRef, "|", CharRef);
      var PEReference = reg("%", Name, ";");
      var EntityValue = regg(
        reg('"', regg(/[^%&"]/, "|", PEReference, "|", Reference), "*", '"'),
        "|",
        reg("'", regg(/[^%&']/, "|", PEReference, "|", Reference), "*", "'")
      );
      var AttValue = regg('"', regg(/[^<&"]/, "|", Reference), "*", '"', "|", "'", regg(/[^<&']/, "|", Reference), "*", "'");
      var NCNameStartChar = chars_without(NameStartChar, ":");
      var NCNameChar = chars_without(NameChar, ":");
      var NCName = reg(NCNameStartChar, NCNameChar, "*");
      var QName = reg(NCName, regg(":", NCName), "?");
      var QName_exact = reg("^", QName, "$");
      var QName_group = reg("(", QName, ")");
      var SystemLiteral = regg(/"[^"]*"|'[^']*'/);
      var PI = reg(/^<\?/, "(", Name, ")", regg(S, "(", Char, "*?)"), "?", /\?>/);
      var PubidChar = /[\x20\x0D\x0Aa-zA-Z0-9-'()+,./:=?;!*#@$_%]/;
      var PubidLiteral = regg('"', PubidChar, '*"', "|", "'", chars_without(PubidChar, "'"), "*'");
      var COMMENT_START = "<!--";
      var COMMENT_END = "-->";
      var Comment = reg(COMMENT_START, regg(chars_without(Char, "-"), "|", reg("-", chars_without(Char, "-"))), "*", COMMENT_END);
      var PCDATA = "#PCDATA";
      var Mixed = regg(
        reg(/\(/, S_OPT, PCDATA, regg(S_OPT, /\|/, S_OPT, QName), "*", S_OPT, /\)\*/),
        "|",
        reg(/\(/, S_OPT, PCDATA, S_OPT, /\)/)
      );
      var _children_quantity = /[?*+]?/;
      var children = reg(
        /\([^>]+\)/,
        _children_quantity
        /*regg(choice, '|', seq), _children_quantity*/
      );
      var contentspec = regg("EMPTY", "|", "ANY", "|", Mixed, "|", children);
      var ELEMENTDECL_START = "<!ELEMENT";
      var elementdecl = reg(ELEMENTDECL_START, S, regg(QName, "|", PEReference), S, regg(contentspec, "|", PEReference), S_OPT, ">");
      var NotationType = reg("NOTATION", S, /\(/, S_OPT, Name, regg(S_OPT, /\|/, S_OPT, Name), "*", S_OPT, /\)/);
      var Enumeration = reg(/\(/, S_OPT, Nmtoken, regg(S_OPT, /\|/, S_OPT, Nmtoken), "*", S_OPT, /\)/);
      var EnumeratedType = regg(NotationType, "|", Enumeration);
      var AttType = regg(/CDATA|ID|IDREF|IDREFS|ENTITY|ENTITIES|NMTOKEN|NMTOKENS/, "|", EnumeratedType);
      var DefaultDecl = regg(/#REQUIRED|#IMPLIED/, "|", regg(regg("#FIXED", S), "?", AttValue));
      var AttDef = regg(S, Name, S, AttType, S, DefaultDecl);
      var ATTLIST_DECL_START = "<!ATTLIST";
      var AttlistDecl = reg(ATTLIST_DECL_START, S, Name, AttDef, "*", S_OPT, ">");
      var ABOUT_LEGACY_COMPAT = "about:legacy-compat";
      var ABOUT_LEGACY_COMPAT_SystemLiteral = regg('"' + ABOUT_LEGACY_COMPAT + '"', "|", "'" + ABOUT_LEGACY_COMPAT + "'");
      var SYSTEM = "SYSTEM";
      var PUBLIC = "PUBLIC";
      var ExternalID = regg(regg(SYSTEM, S, SystemLiteral), "|", regg(PUBLIC, S, PubidLiteral, S, SystemLiteral));
      var ExternalID_match = reg(
        "^",
        regg(
          regg(SYSTEM, S, "(?<SystemLiteralOnly>", SystemLiteral, ")"),
          "|",
          regg(PUBLIC, S, "(?<PubidLiteral>", PubidLiteral, ")", S, "(?<SystemLiteral>", SystemLiteral, ")")
        )
      );
      var PubidLiteral_match = reg("^", PubidLiteral, "$");
      var SystemLiteral_match = reg("^", SystemLiteral, "$");
      var NDataDecl = regg(S, "NDATA", S, Name);
      var EntityDef = regg(EntityValue, "|", regg(ExternalID, NDataDecl, "?"));
      var ENTITY_DECL_START = "<!ENTITY";
      var GEDecl = reg(ENTITY_DECL_START, S, Name, S, EntityDef, S_OPT, ">");
      var PEDef = regg(EntityValue, "|", ExternalID);
      var PEDecl = reg(ENTITY_DECL_START, S, "%", S, Name, S, PEDef, S_OPT, ">");
      var EntityDecl = regg(GEDecl, "|", PEDecl);
      var PublicID = reg(PUBLIC, S, PubidLiteral);
      var NotationDecl = reg("<!NOTATION", S, Name, S, regg(ExternalID, "|", PublicID), S_OPT, ">");
      var Eq = reg(S_OPT, "=", S_OPT);
      var VersionNum = /1[.]\d+/;
      var VersionInfo = reg(S, "version", Eq, regg("'", VersionNum, "'", "|", '"', VersionNum, '"'));
      var EncName = /[A-Za-z][-A-Za-z0-9._]*/;
      var EncodingDecl = regg(S, "encoding", Eq, regg('"', EncName, '"', "|", "'", EncName, "'"));
      var SDDecl = regg(S, "standalone", Eq, regg("'", regg("yes", "|", "no"), "'", "|", '"', regg("yes", "|", "no"), '"'));
      var XMLDecl = reg(/^<\?xml/, VersionInfo, EncodingDecl, "?", SDDecl, "?", S_OPT, /\?>/);
      var DOCTYPE_DECL_START = "<!DOCTYPE";
      var CDATA_START = "<![CDATA[";
      var CDATA_END = "]]>";
      var CDStart = /<!\[CDATA\[/;
      var CDEnd = /\]\]>/;
      var CData = reg(Char, "*?", CDEnd);
      var CDSect = reg(CDStart, CData);
      exports.chars = chars;
      exports.chars_without = chars_without;
      exports.detectUnicodeSupport = detectUnicodeSupport;
      exports.reg = reg;
      exports.regg = regg;
      exports.ABOUT_LEGACY_COMPAT = ABOUT_LEGACY_COMPAT;
      exports.ABOUT_LEGACY_COMPAT_SystemLiteral = ABOUT_LEGACY_COMPAT_SystemLiteral;
      exports.AttlistDecl = AttlistDecl;
      exports.CDATA_START = CDATA_START;
      exports.CDATA_END = CDATA_END;
      exports.CDSect = CDSect;
      exports.Char = Char;
      exports.Comment = Comment;
      exports.COMMENT_START = COMMENT_START;
      exports.COMMENT_END = COMMENT_END;
      exports.DOCTYPE_DECL_START = DOCTYPE_DECL_START;
      exports.elementdecl = elementdecl;
      exports.EntityDecl = EntityDecl;
      exports.EntityValue = EntityValue;
      exports.ExternalID = ExternalID;
      exports.ExternalID_match = ExternalID_match;
      exports.Name = Name;
      exports.NotationDecl = NotationDecl;
      exports.Reference = Reference;
      exports.PEReference = PEReference;
      exports.PI = PI;
      exports.PUBLIC = PUBLIC;
      exports.PubidLiteral = PubidLiteral;
      exports.PubidLiteral_match = PubidLiteral_match;
      exports.QName = QName;
      exports.QName_exact = QName_exact;
      exports.QName_group = QName_group;
      exports.S = S;
      exports.SChar_s = SChar_s;
      exports.S_OPT = S_OPT;
      exports.SYSTEM = SYSTEM;
      exports.SystemLiteral = SystemLiteral;
      exports.SystemLiteral_match = SystemLiteral_match;
      exports.InvalidChar = InvalidChar;
      exports.UNICODE_REPLACEMENT_CHARACTER = UNICODE_REPLACEMENT_CHARACTER;
      exports.UNICODE_SUPPORT = UNICODE_SUPPORT;
      exports.XMLDecl = XMLDecl;
    }
  });

  // node_modules/@xmldom/xmldom/lib/dom.js
  var require_dom = __commonJS({
    "node_modules/@xmldom/xmldom/lib/dom.js"(exports) {
      "use strict";
      var conventions = require_conventions();
      var find = conventions.find;
      var hasDefaultHTMLNamespace = conventions.hasDefaultHTMLNamespace;
      var hasOwn = conventions.hasOwn;
      var isHTMLMimeType = conventions.isHTMLMimeType;
      var isHTMLRawTextElement = conventions.isHTMLRawTextElement;
      var isHTMLVoidElement = conventions.isHTMLVoidElement;
      var MIME_TYPE = conventions.MIME_TYPE;
      var NAMESPACE = conventions.NAMESPACE;
      var PDC = /* @__PURE__ */ Symbol();
      var errors = require_errors();
      var DOMException = errors.DOMException;
      var DOMExceptionName = errors.DOMExceptionName;
      var g = require_grammar();
      function checkSymbol(symbol) {
        if (symbol !== PDC) {
          throw new TypeError("Illegal constructor");
        }
      }
      function notEmptyString(input) {
        return input !== "";
      }
      function splitOnASCIIWhitespace(input) {
        return input ? input.split(/[\t\n\f\r ]+/).filter(notEmptyString) : [];
      }
      function orderedSetReducer(current, element) {
        if (!hasOwn(current, element)) {
          current[element] = true;
        }
        return current;
      }
      function toOrderedSet(input) {
        if (!input) return [];
        var list = splitOnASCIIWhitespace(input);
        return Object.keys(list.reduce(orderedSetReducer, {}));
      }
      function arrayIncludes(list) {
        return function(element) {
          return list && list.indexOf(element) !== -1;
        };
      }
      function validateQualifiedName(qualifiedName) {
        if (!g.QName_exact.test(qualifiedName)) {
          throw new DOMException(DOMException.INVALID_CHARACTER_ERR, 'invalid character in qualified name "' + qualifiedName + '"');
        }
      }
      function validateAndExtract(namespace, qualifiedName) {
        validateQualifiedName(qualifiedName);
        namespace = namespace || null;
        var prefix = null;
        var localName = qualifiedName;
        if (qualifiedName.indexOf(":") >= 0) {
          var splitResult = qualifiedName.split(":");
          prefix = splitResult[0];
          localName = splitResult[1];
        }
        if (prefix !== null && namespace === null) {
          throw new DOMException(DOMException.NAMESPACE_ERR, "prefix is non-null and namespace is null");
        }
        if (prefix === "xml" && namespace !== conventions.NAMESPACE.XML) {
          throw new DOMException(DOMException.NAMESPACE_ERR, 'prefix is "xml" and namespace is not the XML namespace');
        }
        if ((prefix === "xmlns" || qualifiedName === "xmlns") && namespace !== conventions.NAMESPACE.XMLNS) {
          throw new DOMException(
            DOMException.NAMESPACE_ERR,
            'either qualifiedName or prefix is "xmlns" and namespace is not the XMLNS namespace'
          );
        }
        if (namespace === conventions.NAMESPACE.XMLNS && prefix !== "xmlns" && qualifiedName !== "xmlns") {
          throw new DOMException(
            DOMException.NAMESPACE_ERR,
            'namespace is the XMLNS namespace and neither qualifiedName nor prefix is "xmlns"'
          );
        }
        return [namespace, prefix, localName];
      }
      function copy(src, dest) {
        for (var p in src) {
          if (hasOwn(src, p)) {
            dest[p] = src[p];
          }
        }
      }
      function _extends(Class, Super) {
        var pt = Class.prototype;
        if (!(pt instanceof Super)) {
          let t = function() {
          };
          t.prototype = Super.prototype;
          t = new t();
          copy(pt, t);
          Class.prototype = pt = t;
        }
        if (pt.constructor != Class) {
          if (typeof Class != "function") {
            console.error("unknown Class:" + Class);
          }
          pt.constructor = Class;
        }
      }
      var NodeType = {};
      var ELEMENT_NODE = NodeType.ELEMENT_NODE = 1;
      var ATTRIBUTE_NODE = NodeType.ATTRIBUTE_NODE = 2;
      var TEXT_NODE = NodeType.TEXT_NODE = 3;
      var CDATA_SECTION_NODE = NodeType.CDATA_SECTION_NODE = 4;
      var ENTITY_REFERENCE_NODE = NodeType.ENTITY_REFERENCE_NODE = 5;
      var ENTITY_NODE = NodeType.ENTITY_NODE = 6;
      var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
      var COMMENT_NODE = NodeType.COMMENT_NODE = 8;
      var DOCUMENT_NODE = NodeType.DOCUMENT_NODE = 9;
      var DOCUMENT_TYPE_NODE = NodeType.DOCUMENT_TYPE_NODE = 10;
      var DOCUMENT_FRAGMENT_NODE = NodeType.DOCUMENT_FRAGMENT_NODE = 11;
      var NOTATION_NODE = NodeType.NOTATION_NODE = 12;
      var DocumentPosition = conventions.freeze({
        DOCUMENT_POSITION_DISCONNECTED: 1,
        DOCUMENT_POSITION_PRECEDING: 2,
        DOCUMENT_POSITION_FOLLOWING: 4,
        DOCUMENT_POSITION_CONTAINS: 8,
        DOCUMENT_POSITION_CONTAINED_BY: 16,
        DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 32
      });
      function commonAncestor(a, b) {
        if (b.length < a.length) return commonAncestor(b, a);
        var c = null;
        for (var n in a) {
          if (a[n] !== b[n]) return c;
          c = a[n];
        }
        return c;
      }
      function docGUID(doc) {
        if (!doc.guid) doc.guid = Math.random();
        return doc.guid;
      }
      function NodeList() {
      }
      NodeList.prototype = {
        /**
         * The number of nodes in the list. The range of valid child node indices is 0 to length-1
         * inclusive.
         *
         * @type {number}
         */
        length: 0,
        /**
         * Returns the item at `index`. If index is greater than or equal to the number of nodes in
         * the list, this returns null.
         *
         * @param index
         * Unsigned long Index into the collection.
         * @returns {Node | null}
         * The node at position `index` in the NodeList,
         * or null if that is not a valid index.
         */
        item: function(index) {
          return index >= 0 && index < this.length ? this[index] : null;
        },
        /**
         * Returns a string representation of the NodeList.
         *
         * Accepts the same `options` object as `XMLSerializer.prototype.serializeToString`
         * (`requireWellFormed`, `splitCDATASections`, `nodeFilter`). Passing a function is treated as
         * a legacy `nodeFilter` for backward compatibility.
         *
         * @param {Object | function} [options]
         * @param {boolean} [options.requireWellFormed=false]
         * @param {boolean} [options.splitCDATASections=true]
         * @param {function} [options.nodeFilter]
         * @returns {string}
         */
        toString: function(options) {
          var opts;
          if (typeof options === "function") {
            opts = { requireWellFormed: false, splitCDATASections: true, nodeFilter: options };
          } else if (!!options) {
            opts = {
              requireWellFormed: !!options.requireWellFormed,
              splitCDATASections: options.splitCDATASections !== false,
              nodeFilter: options.nodeFilter || null
            };
          } else {
            opts = { requireWellFormed: false, splitCDATASections: true, nodeFilter: null };
          }
          for (var buf = [], i = 0; i < this.length; i++) {
            serializeToString(this[i], buf, null, opts);
          }
          return buf.join("");
        },
        /**
         * Filters the NodeList based on a predicate.
         *
         * @param {function(Node): boolean} predicate
         * - A predicate function to filter the NodeList.
         * @returns {Node[]}
         * An array of nodes that satisfy the predicate.
         * @private
         */
        filter: function(predicate) {
          return Array.prototype.filter.call(this, predicate);
        },
        /**
         * Returns the first index at which a given node can be found in the NodeList, or -1 if it is
         * not present.
         *
         * @param {Node} item
         * - The Node item to locate in the NodeList.
         * @returns {number}
         * The first index of the node in the NodeList; -1 if not found.
         * @private
         */
        indexOf: function(item) {
          return Array.prototype.indexOf.call(this, item);
        }
      };
      NodeList.prototype[Symbol.iterator] = function() {
        var me = this;
        var index = 0;
        return {
          next: function() {
            if (index < me.length) {
              return {
                value: me[index++],
                done: false
              };
            } else {
              return {
                done: true
              };
            }
          },
          return: function() {
            return {
              done: true
            };
          }
        };
      };
      function LiveNodeList(node, refresh) {
        this._node = node;
        this._refresh = refresh;
        _updateLiveList(this);
      }
      function _updateLiveList(list) {
        var inc = list._node._inc || list._node.ownerDocument._inc;
        if (list._inc !== inc) {
          var ls = list._refresh(list._node);
          __set__(list, "length", ls.length);
          if (!list.$$length || ls.length < list.$$length) {
            for (var i = ls.length; i in list; i++) {
              if (hasOwn(list, i)) {
                delete list[i];
              }
            }
          }
          copy(ls, list);
          list._inc = inc;
        }
      }
      LiveNodeList.prototype.item = function(i) {
        _updateLiveList(this);
        return this[i] || null;
      };
      _extends(LiveNodeList, NodeList);
      function NamedNodeMap() {
      }
      function _findNodeIndex(list, node) {
        var i = 0;
        while (i < list.length) {
          if (list[i] === node) {
            return i;
          }
          i++;
        }
      }
      function _addNamedNode(el, list, newAttr, oldAttr) {
        if (oldAttr) {
          list[_findNodeIndex(list, oldAttr)] = newAttr;
        } else {
          list[list.length] = newAttr;
          list.length++;
        }
        if (el) {
          newAttr.ownerElement = el;
          var doc = el.ownerDocument;
          if (doc) {
            oldAttr && _onRemoveAttribute(doc, el, oldAttr);
            _onAddAttribute(doc, el, newAttr);
          }
        }
      }
      function _removeNamedNode(el, list, attr) {
        var i = _findNodeIndex(list, attr);
        if (i >= 0) {
          var lastIndex = list.length - 1;
          while (i <= lastIndex) {
            list[i] = list[++i];
          }
          list.length = lastIndex;
          if (el) {
            var doc = el.ownerDocument;
            if (doc) {
              _onRemoveAttribute(doc, el, attr);
            }
            attr.ownerElement = null;
          }
        }
      }
      NamedNodeMap.prototype = {
        length: 0,
        item: NodeList.prototype.item,
        /**
         * Get an attribute by name. Note: Name is in lower case in case of HTML namespace and
         * document.
         *
         * @param {string} localName
         * The local name of the attribute.
         * @returns {Attr | null}
         * The attribute with the given local name, or null if no such attribute exists.
         * @see https://dom.spec.whatwg.org/#concept-element-attributes-get-by-name
         */
        getNamedItem: function(localName) {
          if (this._ownerElement && this._ownerElement._isInHTMLDocumentAndNamespace()) {
            localName = localName.toLowerCase();
          }
          var i = 0;
          while (i < this.length) {
            var attr = this[i];
            if (attr.nodeName === localName) {
              return attr;
            }
            i++;
          }
          return null;
        },
        /**
         * Set an attribute.
         *
         * @param {Attr} attr
         * The attribute to set.
         * @returns {Attr | null}
         * The old attribute with the same local name and namespace URI as the new one, or null if no
         * such attribute exists.
         * @throws {DOMException}
         * With code:
         * - {@link INUSE_ATTRIBUTE_ERR} - If the attribute is already an attribute of another
         * element.
         * @see https://dom.spec.whatwg.org/#concept-element-attributes-set
         */
        setNamedItem: function(attr) {
          var el = attr.ownerElement;
          if (el && el !== this._ownerElement) {
            throw new DOMException(DOMException.INUSE_ATTRIBUTE_ERR);
          }
          var oldAttr = this.getNamedItemNS(attr.namespaceURI, attr.localName);
          if (oldAttr === attr) {
            return attr;
          }
          _addNamedNode(this._ownerElement, this, attr, oldAttr);
          return oldAttr;
        },
        /**
         * Set an attribute, replacing an existing attribute with the same local name and namespace
         * URI if one exists.
         *
         * @param {Attr} attr
         * The attribute to set.
         * @returns {Attr | null}
         * The old attribute with the same local name and namespace URI as the new one, or null if no
         * such attribute exists.
         * @throws {DOMException}
         * Throws a DOMException with the name "InUseAttributeError" if the attribute is already an
         * attribute of another element.
         * @see https://dom.spec.whatwg.org/#concept-element-attributes-set
         */
        setNamedItemNS: function(attr) {
          return this.setNamedItem(attr);
        },
        /**
         * Removes an attribute specified by the local name.
         *
         * @param {string} localName
         * The local name of the attribute to be removed.
         * @returns {Attr}
         * The attribute node that was removed.
         * @throws {DOMException}
         * With code:
         * - {@link DOMException.NOT_FOUND_ERR} if no attribute with the given name is found.
         * @see https://dom.spec.whatwg.org/#dom-namednodemap-removenameditem
         * @see https://dom.spec.whatwg.org/#concept-element-attributes-remove-by-name
         */
        removeNamedItem: function(localName) {
          var attr = this.getNamedItem(localName);
          if (!attr) {
            throw new DOMException(DOMException.NOT_FOUND_ERR, localName);
          }
          _removeNamedNode(this._ownerElement, this, attr);
          return attr;
        },
        /**
         * Removes an attribute specified by the namespace and local name.
         *
         * @param {string | null} namespaceURI
         * The namespace URI of the attribute to be removed.
         * @param {string} localName
         * The local name of the attribute to be removed.
         * @returns {Attr}
         * The attribute node that was removed.
         * @throws {DOMException}
         * With code:
         * - {@link DOMException.NOT_FOUND_ERR} if no attribute with the given namespace URI and local
         * name is found.
         * @see https://dom.spec.whatwg.org/#dom-namednodemap-removenameditemns
         * @see https://dom.spec.whatwg.org/#concept-element-attributes-remove-by-namespace
         */
        removeNamedItemNS: function(namespaceURI, localName) {
          var attr = this.getNamedItemNS(namespaceURI, localName);
          if (!attr) {
            throw new DOMException(DOMException.NOT_FOUND_ERR, namespaceURI ? namespaceURI + " : " + localName : localName);
          }
          _removeNamedNode(this._ownerElement, this, attr);
          return attr;
        },
        /**
         * Get an attribute by namespace and local name.
         *
         * @param {string | null} namespaceURI
         * The namespace URI of the attribute.
         * @param {string} localName
         * The local name of the attribute.
         * @returns {Attr | null}
         * The attribute with the given namespace URI and local name, or null if no such attribute
         * exists.
         * @see https://dom.spec.whatwg.org/#concept-element-attributes-get-by-namespace
         */
        getNamedItemNS: function(namespaceURI, localName) {
          if (!namespaceURI) {
            namespaceURI = null;
          }
          var i = 0;
          while (i < this.length) {
            var node = this[i];
            if (node.localName === localName && node.namespaceURI === namespaceURI) {
              return node;
            }
            i++;
          }
          return null;
        }
      };
      NamedNodeMap.prototype[Symbol.iterator] = function() {
        var me = this;
        var index = 0;
        return {
          next: function() {
            if (index < me.length) {
              return {
                value: me[index++],
                done: false
              };
            } else {
              return {
                done: true
              };
            }
          },
          return: function() {
            return {
              done: true
            };
          }
        };
      };
      function DOMImplementation() {
      }
      DOMImplementation.prototype = {
        /**
         * Test if the DOM implementation implements a specific feature and version, as specified in
         * {@link https://www.w3.org/TR/DOM-Level-3-Core/core.html#DOMFeatures DOM Features}.
         *
         * The DOMImplementation.hasFeature() method returns a Boolean flag indicating if a given
         * feature is supported. The different implementations fairly diverged in what kind of
         * features were reported. The latest version of the spec settled to force this method to
         * always return true, where the functionality was accurate and in use.
         *
         * @deprecated
         * It is deprecated and modern browsers return true in all cases.
         * @function DOMImplementation#hasFeature
         * @param {string} feature
         * The name of the feature to test.
         * @param {string} [version]
         * This is the version number of the feature to test.
         * @returns {boolean}
         * Always returns true.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/hasFeature MDN
         * @see https://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-5CED94D7 DOM Level 1 Core
         * @see https://dom.spec.whatwg.org/#dom-domimplementation-hasfeature DOM Living Standard
         * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-5CED94D7 DOM Level 3 Core
         */
        hasFeature: function(feature, version) {
          return true;
        },
        /**
         * Creates a DOM Document object of the specified type with its document element. Note that
         * based on the {@link DocumentType}
         * given to create the document, the implementation may instantiate specialized
         * {@link Document} objects that support additional features than the "Core", such as "HTML"
         * {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#DOM2HTML DOM Level 2 HTML}.
         * On the other hand, setting the {@link DocumentType} after the document was created makes
         * this very unlikely to happen. Alternatively, specialized {@link Document} creation methods,
         * such as createHTMLDocument
         * {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#DOM2HTML DOM Level 2 HTML},
         * can be used to obtain specific types of {@link Document} objects.
         *
         * __It behaves slightly different from the description in the living standard__:
         * - There is no interface/class `XMLDocument`, it returns a `Document`
         * instance (with it's `type` set to `'xml'`).
         * - `encoding`, `mode`, `origin`, `url` fields are currently not declared.
         *
         * @function DOMImplementation.createDocument
         * @param {string | null} namespaceURI
         * The
         * {@link https://www.w3.org/TR/DOM-Level-3-Core/glossary.html#dt-namespaceURI namespace URI}
         * of the document element to create or null.
         * @param {string | null} qualifiedName
         * The
         * {@link https://www.w3.org/TR/DOM-Level-3-Core/glossary.html#dt-qualifiedname qualified name}
         * of the document element to be created or null.
         * @param {DocumentType | null} [doctype=null]
         * The type of document to be created or null. When doctype is not null, its
         * {@link Node#ownerDocument} attribute is set to the document being created. Default is
         * `null`
         * @returns {Document}
         * A new {@link Document} object with its document element. If the NamespaceURI,
         * qualifiedName, and doctype are null, the returned {@link Document} is empty with no
         * document element.
         * @throws {DOMException}
         * With code:
         *
         * - `INVALID_CHARACTER_ERR`: Raised if the specified qualified name is not an XML name
         * according to {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#XML XML 1.0}.
         * - `NAMESPACE_ERR`: Raised if the qualifiedName is malformed, if the qualifiedName has a
         * prefix and the namespaceURI is null, or if the qualifiedName is null and the namespaceURI
         * is different from null, or if the qualifiedName has a prefix that is "xml" and the
         * namespaceURI is different from "{@link http://www.w3.org/XML/1998/namespace}"
         * {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#Namespaces XML Namespaces},
         * or if the DOM implementation does not support the "XML" feature but a non-null namespace
         * URI was provided, since namespaces were defined by XML.
         * - `WRONG_DOCUMENT_ERR`: Raised if doctype has already been used with a different document
         * or was created from a different implementation.
         * - `NOT_SUPPORTED_ERR`: May be raised if the implementation does not support the feature
         * "XML" and the language exposed through the Document does not support XML Namespaces (such
         * as {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#HTML40 HTML 4.01}).
         * @since DOM Level 2.
         * @see {@link #createHTMLDocument}
         * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createDocument MDN
         * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocument DOM Living Standard
         * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Level-2-Core-DOM-createDocument DOM
         *      Level 3 Core
         * @see https://www.w3.org/TR/DOM-Level-2-Core/core.html#Level-2-Core-DOM-createDocument DOM
         *      Level 2 Core (initial)
         */
        createDocument: function(namespaceURI, qualifiedName, doctype) {
          var contentType = MIME_TYPE.XML_APPLICATION;
          if (namespaceURI === NAMESPACE.HTML) {
            contentType = MIME_TYPE.XML_XHTML_APPLICATION;
          } else if (namespaceURI === NAMESPACE.SVG) {
            contentType = MIME_TYPE.XML_SVG_IMAGE;
          }
          var doc = new Document(PDC, { contentType });
          doc.implementation = this;
          doc.childNodes = new NodeList();
          doc.doctype = doctype || null;
          if (doctype) {
            doc.appendChild(doctype);
          }
          if (qualifiedName) {
            var root = doc.createElementNS(namespaceURI, qualifiedName);
            doc.appendChild(root);
          }
          return doc;
        },
        /**
         * Creates an empty DocumentType node. Entity declarations and notations are not made
         * available. Entity reference expansions and default attribute additions do not occur.
         *
         * **This behavior is slightly different from the one in the specs**:
         * - `encoding`, `mode`, `origin`, `url` fields are currently not declared.
         * - `publicId` and `systemId` contain the raw data including any possible quotes,
         *   so they can always be serialized back to the original value
         * - `internalSubset` contains the raw string between `[` and `]` if present,
         *   but is not parsed or validated in any form.
         *
         * @function DOMImplementation#createDocumentType
         * @param {string} qualifiedName
         * The {@link https://www.w3.org/TR/DOM-Level-3-Core/glossary.html#dt-qualifiedname qualified
         * name} of the document type to be created.
         * @param {string} [publicId]
         * The external subset public identifier. Stored verbatim including surrounding quotes.
         * When serialized with `requireWellFormed: true`, the serializer throws `InvalidStateError`
         * if the value is non-empty and does not match the XML `PubidLiteral` production
         * (W3C DOM Parsing §3.2.1.3; XML 1.0 production [12]). Creation-time validation is not
         * enforced — deferred to a future breaking release.
         * @param {string} [systemId]
         * The external subset system identifier. Stored verbatim including surrounding quotes.
         * When serialized with `requireWellFormed: true`, the serializer throws `InvalidStateError`
         * if the value is non-empty and does not match the XML `SystemLiteral` production
         * (W3C DOM Parsing §3.2.1.3; XML 1.0 production [11]). Creation-time validation is not
         * enforced — deferred to a future breaking release.
         * @param {string} [internalSubset]
         * The internal subset or an empty string if it is not present. Stored verbatim.
         * When serialized with `requireWellFormed: true`, the serializer throws `InvalidStateError`
         * if the value contains `"]>"`. Creation-time validation is not enforced.
         * @returns {DocumentType}
         * A new {@link DocumentType} node with {@link Node#ownerDocument} set to null.
         * @throws {DOMException}
         * With code:
         *
         * - `INVALID_CHARACTER_ERR`: Raised if the specified qualified name is not an XML name
         * according to {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#XML XML 1.0}.
         * - `NAMESPACE_ERR`: Raised if the qualifiedName is malformed.
         * - `NOT_SUPPORTED_ERR`: May be raised if the implementation does not support the feature
         * "XML" and the language exposed through the Document does not support XML Namespaces (such
         * as {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#HTML40 HTML 4.01}).
         * @since DOM Level 2.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createDocumentType
         *      MDN
         * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocumenttype DOM Living
         *      Standard
         * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Level-3-Core-DOM-createDocType DOM
         *      Level 3 Core
         * @see https://www.w3.org/TR/DOM-Level-2-Core/core.html#Level-2-Core-DOM-createDocType DOM
         *      Level 2 Core
         * @see https://github.com/xmldom/xmldom/blob/master/CHANGELOG.md#050
         * @see https://www.w3.org/TR/DOM-Level-2-Core/#core-ID-Core-DocType-internalSubset
         * @prettierignore
         */
        createDocumentType: function(qualifiedName, publicId, systemId, internalSubset) {
          validateQualifiedName(qualifiedName);
          var node = new DocumentType(PDC);
          node.name = qualifiedName;
          node.nodeName = qualifiedName;
          node.publicId = publicId || "";
          node.systemId = systemId || "";
          node.internalSubset = internalSubset || "";
          node.childNodes = new NodeList();
          return node;
        },
        /**
         * Returns an HTML document, that might already have a basic DOM structure.
         *
         * __It behaves slightly different from the description in the living standard__:
         * - If the first argument is `false` no initial nodes are added (steps 3-7 in the specs are
         * omitted)
         * - `encoding`, `mode`, `origin`, `url` fields are currently not declared.
         *
         * @param {string | false} [title]
         * A string containing the title to give the new HTML document.
         * @returns {Document}
         * The HTML document.
         * @since WHATWG Living Standard.
         * @see {@link #createDocument}
         * @see https://dom.spec.whatwg.org/#dom-domimplementation-createhtmldocument
         * @see https://dom.spec.whatwg.org/#html-document
         */
        createHTMLDocument: function(title) {
          var doc = new Document(PDC, { contentType: MIME_TYPE.HTML });
          doc.implementation = this;
          doc.childNodes = new NodeList();
          if (title !== false) {
            doc.doctype = this.createDocumentType("html");
            doc.doctype.ownerDocument = doc;
            doc.appendChild(doc.doctype);
            var htmlNode = doc.createElement("html");
            doc.appendChild(htmlNode);
            var headNode = doc.createElement("head");
            htmlNode.appendChild(headNode);
            if (typeof title === "string") {
              var titleNode = doc.createElement("title");
              titleNode.appendChild(doc.createTextNode(title));
              headNode.appendChild(titleNode);
            }
            htmlNode.appendChild(doc.createElement("body"));
          }
          return doc;
        }
      };
      function Node2(symbol) {
        checkSymbol(symbol);
      }
      Node2.prototype = {
        /**
         * The first child of this node.
         *
         * @type {Node | null}
         */
        firstChild: null,
        /**
         * The last child of this node.
         *
         * @type {Node | null}
         */
        lastChild: null,
        /**
         * The previous sibling of this node.
         *
         * @type {Node | null}
         */
        previousSibling: null,
        /**
         * The next sibling of this node.
         *
         * @type {Node | null}
         */
        nextSibling: null,
        /**
         * The parent node of this node.
         *
         * @type {Node | null}
         */
        parentNode: null,
        /**
         * The parent element of this node.
         *
         * @type {Element | null}
         */
        get parentElement() {
          return this.parentNode && this.parentNode.nodeType === this.ELEMENT_NODE ? this.parentNode : null;
        },
        /**
         * The child nodes of this node.
         *
         * @type {NodeList}
         */
        childNodes: null,
        /**
         * The document object associated with this node.
         *
         * @type {Document | null}
         */
        ownerDocument: null,
        /**
         * The value of this node.
         *
         * @type {string | null}
         */
        nodeValue: null,
        /**
         * The namespace URI of this node.
         *
         * @type {string | null}
         */
        namespaceURI: null,
        /**
         * The prefix of the namespace for this node.
         *
         * @type {string | null}
         */
        prefix: null,
        /**
         * The local part of the qualified name of this node.
         *
         * @type {string | null}
         */
        localName: null,
        /**
         * The baseURI is currently always `about:blank`,
         * since that's what happens when you create a document from scratch.
         *
         * @type {'about:blank'}
         */
        baseURI: "about:blank",
        /**
         * Is true if this node is part of a document.
         *
         * @type {boolean}
         */
        get isConnected() {
          var rootNode = this.getRootNode();
          return rootNode && rootNode.nodeType === rootNode.DOCUMENT_NODE;
        },
        /**
         * Checks whether `other` is an inclusive descendant of this node.
         *
         * @param {Node | null | undefined} other
         * The node to check.
         * @returns {boolean}
         * True if `other` is an inclusive descendant of this node; false otherwise.
         * @see https://dom.spec.whatwg.org/#dom-node-contains
         */
        contains: function(other) {
          if (!other) return false;
          var parent = other;
          do {
            if (this === parent) return true;
            parent = parent.parentNode;
          } while (parent);
          return false;
        },
        /**
         * @typedef GetRootNodeOptions
         * @property {boolean} [composed=false]
         */
        /**
         * Searches for the root node of this node.
         *
         * **This behavior is slightly different from the in the specs**:
         * - ignores `options.composed`, since `ShadowRoot`s are unsupported, always returns root.
         *
         * @param {GetRootNodeOptions} [options]
         * @returns {Node}
         * Root node.
         * @see https://dom.spec.whatwg.org/#dom-node-getrootnode
         * @see https://dom.spec.whatwg.org/#concept-shadow-including-root
         */
        getRootNode: function(options) {
          var parent = this;
          do {
            if (!parent.parentNode) {
              return parent;
            }
            parent = parent.parentNode;
          } while (parent);
        },
        /**
         * Checks whether the given node is equal to this node.
         *
         * Two nodes are equal when they have the same type, defining characteristics (for the type),
         * and the same childNodes. The comparison is iterative to avoid stack overflows on
         * deeply-nested trees. Attribute nodes of each Element pair are also pushed onto the stack
         * and compared the same way.
         *
         * @param {Node} [otherNode]
         * @returns {boolean}
         * @see https://dom.spec.whatwg.org/#concept-node-equals
         * @see ../docs/walk-dom.md.
         */
        isEqualNode: function(otherNode) {
          if (!otherNode) return false;
          var stack = [{ node: this, other: otherNode }];
          while (stack.length > 0) {
            var pair = stack.pop();
            var node = pair.node;
            var other = pair.other;
            if (node.nodeType !== other.nodeType) return false;
            switch (node.nodeType) {
              case node.DOCUMENT_TYPE_NODE:
                if (node.name !== other.name) return false;
                if (node.publicId !== other.publicId) return false;
                if (node.systemId !== other.systemId) return false;
                break;
              case node.ELEMENT_NODE:
                if (node.namespaceURI !== other.namespaceURI) return false;
                if (node.prefix !== other.prefix) return false;
                if (node.localName !== other.localName) return false;
                if (node.attributes.length !== other.attributes.length) return false;
                for (var i = 0; i < node.attributes.length; i++) {
                  var attr = node.attributes.item(i);
                  var otherAttr = other.getAttributeNodeNS(attr.namespaceURI, attr.localName);
                  if (!otherAttr) return false;
                  stack.push({ node: attr, other: otherAttr });
                }
                break;
              case node.ATTRIBUTE_NODE:
                if (node.namespaceURI !== other.namespaceURI) return false;
                if (node.localName !== other.localName) return false;
                if (node.value !== other.value) return false;
                break;
              case node.PROCESSING_INSTRUCTION_NODE:
                if (node.target !== other.target || node.data !== other.data) return false;
                break;
              case node.TEXT_NODE:
              case node.CDATA_SECTION_NODE:
              case node.COMMENT_NODE:
                if (node.data !== other.data) return false;
                break;
            }
            if (node.childNodes.length !== other.childNodes.length) return false;
            for (var i = node.childNodes.length - 1; i >= 0; i--) {
              stack.push({ node: node.childNodes[i], other: other.childNodes[i] });
            }
          }
          return true;
        },
        /**
         * Checks whether or not the given node is this node.
         *
         * @param {Node} [otherNode]
         */
        isSameNode: function(otherNode) {
          return this === otherNode;
        },
        /**
         * Inserts a node before a reference node as a child of this node.
         *
         * @param {Node} newChild
         * The new child node to be inserted.
         * @param {Node | null} refChild
         * The reference node before which newChild will be inserted.
         * @returns {Node}
         * The new child node successfully inserted.
         * @throws {DOMException}
         * Throws a DOMException if inserting the node would result in a DOM tree that is not
         * well-formed, or if `child` is provided but is not a child of `parent`.
         * See {@link _insertBefore} for more details.
         * @since Modified in DOM L2
         */
        insertBefore: function(newChild, refChild) {
          return _insertBefore(this, newChild, refChild);
        },
        /**
         * Replaces an old child node with a new child node within this node.
         *
         * @param {Node} newChild
         * The new node that is to replace the old node.
         * If it already exists in the DOM, it is removed from its original position.
         * @param {Node} oldChild
         * The existing child node to be replaced.
         * @returns {Node}
         * Returns the replaced child node.
         * @throws {DOMException}
         * Throws a DOMException if replacing the node would result in a DOM tree that is not
         * well-formed, or if `oldChild` is not a child of `this`.
         * This can also occur if the pre-replacement validity assertion fails.
         * See {@link _insertBefore}, {@link Node.removeChild}, and
         * {@link assertPreReplacementValidityInDocument} for more details.
         * @see https://dom.spec.whatwg.org/#concept-node-replace
         */
        replaceChild: function(newChild, oldChild) {
          _insertBefore(this, newChild, oldChild, assertPreReplacementValidityInDocument);
          if (oldChild) {
            this.removeChild(oldChild);
          }
        },
        /**
         * Removes an existing child node from this node.
         *
         * @param {Node} oldChild
         * The child node to be removed.
         * @returns {Node}
         * Returns the removed child node.
         * @throws {DOMException}
         * Throws a DOMException if `oldChild` is not a child of `this`.
         * See {@link _removeChild} for more details.
         */
        removeChild: function(oldChild) {
          return _removeChild(this, oldChild);
        },
        /**
         * Appends a child node to this node.
         *
         * @param {Node} newChild
         * The child node to be appended to this node.
         * If it already exists in the DOM, it is removed from its original position.
         * @returns {Node}
         * Returns the appended child node.
         * @throws {DOMException}
         * Throws a DOMException if appending the node would result in a DOM tree that is not
         * well-formed, or if `newChild` is not a valid Node.
         * See {@link insertBefore} for more details.
         */
        appendChild: function(newChild) {
          return this.insertBefore(newChild, null);
        },
        /**
         * Determines whether this node has any child nodes.
         *
         * @returns {boolean}
         * Returns true if this node has any child nodes, and false otherwise.
         */
        hasChildNodes: function() {
          return this.firstChild != null;
        },
        /**
         * Creates a copy of the calling node.
         *
         * @param {boolean} deep
         * If true, the contents of the node are recursively copied.
         * If false, only the node itself (and its attributes, if it is an element) are copied.
         * @returns {Node}
         * Returns the newly created copy of the node.
         * @throws {DOMException}
         * May throw a DOMException if operations within {@link Element#setAttributeNode} or
         * {@link Node#appendChild} (which are potentially invoked in this method) do not meet their
         * specific constraints.
         * @see {@link cloneNode}
         */
        cloneNode: function(deep) {
          return cloneNode(this.ownerDocument || this, this, deep);
        },
        /**
         * Puts the specified node and all of its subtree into a "normalized" form. In a normalized
         * subtree, no text nodes in the subtree are empty and there are no adjacent text nodes.
         *
         * Specifically, this method merges any adjacent text nodes (i.e., nodes for which `nodeType`
         * is `TEXT_NODE`) into a single node with the combined data. It also removes any empty text
         * nodes.
         *
         * This method iterativly traverses all child nodes to normalize all descendent nodes within
         * the subtree.
         *
         * @throws {DOMException}
         * May throw a DOMException if operations within removeChild or appendData (which are
         * potentially invoked in this method) do not meet their specific constraints.
         * @since Modified in DOM Level 2
         * @see {@link Node.removeChild}
         * @see {@link CharacterData.appendData}
         * @see ../docs/walk-dom.md.
         */
        normalize: function() {
          walkDOM(this, null, {
            enter: function(node) {
              var child = node.firstChild;
              while (child) {
                var next = child.nextSibling;
                if (next !== null && next.nodeType === TEXT_NODE && child.nodeType === TEXT_NODE) {
                  node.removeChild(next);
                  child.appendData(next.data);
                } else {
                  child = next;
                }
              }
              return true;
            }
          });
        },
        /**
         * Checks whether the DOM implementation implements a specific feature and its version.
         *
         * @deprecated
         * Since `DOMImplementation.hasFeature` is deprecated and always returns true.
         * @param {string} feature
         * The package name of the feature to test. This is the same name that can be passed to the
         * method `hasFeature` on `DOMImplementation`.
         * @param {string} version
         * This is the version number of the package name to test.
         * @returns {boolean}
         * Returns true in all cases in the current implementation.
         * @since Introduced in DOM Level 2
         * @see {@link DOMImplementation.hasFeature}
         */
        isSupported: function(feature, version) {
          return this.ownerDocument.implementation.hasFeature(feature, version);
        },
        /**
         * Look up the prefix associated to the given namespace URI, starting from this node.
         * **The default namespace declarations are ignored by this method.**
         * See Namespace Prefix Lookup for details on the algorithm used by this method.
         *
         * **This behavior is different from the in the specs**:
         * - no node type specific handling
         * - uses the internal attribute _nsMap for resolving namespaces that is updated when changing attributes
         *
         * @param {string | null} namespaceURI
         * The namespace URI for which to find the associated prefix.
         * @returns {string | null}
         * The associated prefix, if found; otherwise, null.
         * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-lookupNamespacePrefix
         * @see https://www.w3.org/TR/DOM-Level-3-Core/namespaces-algorithms.html#lookupNamespacePrefixAlgo
         * @see https://dom.spec.whatwg.org/#dom-node-lookupprefix
         * @see https://github.com/xmldom/xmldom/issues/322
         * @prettierignore
         */
        lookupPrefix: function(namespaceURI) {
          var el = this;
          while (el) {
            var map = el._nsMap;
            if (map) {
              for (var n in map) {
                if (hasOwn(map, n) && map[n] === namespaceURI) {
                  return n;
                }
              }
            }
            el = el.nodeType == ATTRIBUTE_NODE ? el.ownerDocument : el.parentNode;
          }
          return null;
        },
        /**
         * This function is used to look up the namespace URI associated with the given prefix,
         * starting from this node.
         *
         * **This behavior is different from the in the specs**:
         * - no node type specific handling
         * - uses the internal attribute _nsMap for resolving namespaces that is updated when changing attributes
         *
         * @param {string | null} prefix
         * The prefix for which to find the associated namespace URI.
         * @returns {string | null}
         * The associated namespace URI, if found; otherwise, null.
         * @since DOM Level 3
         * @see https://dom.spec.whatwg.org/#dom-node-lookupnamespaceuri
         * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-lookupNamespaceURI
         * @prettierignore
         */
        lookupNamespaceURI: function(prefix) {
          var el = this;
          while (el) {
            var map = el._nsMap;
            if (map) {
              if (hasOwn(map, prefix)) {
                return map[prefix];
              }
            }
            el = el.nodeType == ATTRIBUTE_NODE ? el.ownerDocument : el.parentNode;
          }
          return null;
        },
        /**
         * Determines whether the given namespace URI is the default namespace.
         *
         * The function works by looking up the prefix associated with the given namespace URI. If no
         * prefix is found (i.e., the namespace URI is not registered in the namespace map of this
         * node or any of its ancestors), it returns `true`, implying the namespace URI is considered
         * the default.
         *
         * **This behavior is different from the in the specs**:
         * - no node type specific handling
         * - uses the internal attribute _nsMap for resolving namespaces that is updated when changing attributes
         *
         * @param {string | null} namespaceURI
         * The namespace URI to be checked.
         * @returns {boolean}
         * Returns true if the given namespace URI is the default namespace, false otherwise.
         * @since DOM Level 3
         * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-isDefaultNamespace
         * @see https://dom.spec.whatwg.org/#dom-node-isdefaultnamespace
         * @prettierignore
         */
        isDefaultNamespace: function(namespaceURI) {
          var prefix = this.lookupPrefix(namespaceURI);
          return prefix == null;
        },
        /**
         * Compares the reference node with a node with regard to their position in the document and
         * according to the document order.
         *
         * @param {Node} other
         * The node to compare the reference node to.
         * @returns {number}
         * Returns how the node is positioned relatively to the reference node according to the
         * bitmask. 0 if reference node and given node are the same.
         * @since DOM Level 3
         * @see https://www.w3.org/TR/2004/REC-DOM-Level-3-Core-20040407/core.html#Node3-compare
         * @see https://dom.spec.whatwg.org/#dom-node-comparedocumentposition
         */
        compareDocumentPosition: function(other) {
          if (this === other) return 0;
          var node1 = other;
          var node2 = this;
          var attr1 = null;
          var attr2 = null;
          if (node1 instanceof Attr) {
            attr1 = node1;
            node1 = attr1.ownerElement;
          }
          if (node2 instanceof Attr) {
            attr2 = node2;
            node2 = attr2.ownerElement;
            if (attr1 && node1 && node2 === node1) {
              for (var i = 0, attr; attr = node2.attributes[i]; i++) {
                if (attr === attr1)
                  return DocumentPosition.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC + DocumentPosition.DOCUMENT_POSITION_PRECEDING;
                if (attr === attr2)
                  return DocumentPosition.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC + DocumentPosition.DOCUMENT_POSITION_FOLLOWING;
              }
            }
          }
          if (!node1 || !node2 || node2.ownerDocument !== node1.ownerDocument) {
            return DocumentPosition.DOCUMENT_POSITION_DISCONNECTED + DocumentPosition.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC + (docGUID(node2.ownerDocument) > docGUID(node1.ownerDocument) ? DocumentPosition.DOCUMENT_POSITION_FOLLOWING : DocumentPosition.DOCUMENT_POSITION_PRECEDING);
          }
          if (attr2 && node1 === node2) {
            return DocumentPosition.DOCUMENT_POSITION_CONTAINS + DocumentPosition.DOCUMENT_POSITION_PRECEDING;
          }
          if (attr1 && node1 === node2) {
            return DocumentPosition.DOCUMENT_POSITION_CONTAINED_BY + DocumentPosition.DOCUMENT_POSITION_FOLLOWING;
          }
          var chain1 = [];
          var ancestor1 = node1.parentNode;
          while (ancestor1) {
            if (!attr2 && ancestor1 === node2) {
              return DocumentPosition.DOCUMENT_POSITION_CONTAINED_BY + DocumentPosition.DOCUMENT_POSITION_FOLLOWING;
            }
            chain1.push(ancestor1);
            ancestor1 = ancestor1.parentNode;
          }
          chain1.reverse();
          var chain2 = [];
          var ancestor2 = node2.parentNode;
          while (ancestor2) {
            if (!attr1 && ancestor2 === node1) {
              return DocumentPosition.DOCUMENT_POSITION_CONTAINS + DocumentPosition.DOCUMENT_POSITION_PRECEDING;
            }
            chain2.push(ancestor2);
            ancestor2 = ancestor2.parentNode;
          }
          chain2.reverse();
          var ca = commonAncestor(chain1, chain2);
          for (var n in ca.childNodes) {
            var child = ca.childNodes[n];
            if (child === node2) return DocumentPosition.DOCUMENT_POSITION_FOLLOWING;
            if (child === node1) return DocumentPosition.DOCUMENT_POSITION_PRECEDING;
            if (chain2.indexOf(child) >= 0) return DocumentPosition.DOCUMENT_POSITION_FOLLOWING;
            if (chain1.indexOf(child) >= 0) return DocumentPosition.DOCUMENT_POSITION_PRECEDING;
          }
          return 0;
        }
      };
      function _xmlEncoder(c) {
        return c == "<" && "&lt;" || c == ">" && "&gt;" || c == "&" && "&amp;" || c == '"' && "&quot;" || "&#" + c.charCodeAt() + ";";
      }
      copy(NodeType, Node2);
      copy(NodeType, Node2.prototype);
      copy(DocumentPosition, Node2);
      copy(DocumentPosition, Node2.prototype);
      function _visitNode(node, callback) {
        walkDOM(node, null, {
          enter: function(n) {
            return callback(n) ? walkDOM.STOP : true;
          }
        });
      }
      function walkDOM(node, context, callbacks) {
        var stack = [{ node, context, phase: walkDOM.ENTER }];
        while (stack.length > 0) {
          var frame = stack.pop();
          if (frame.phase === walkDOM.ENTER) {
            var childContext = callbacks.enter(frame.node, frame.context);
            if (childContext === walkDOM.STOP) {
              return walkDOM.STOP;
            }
            stack.push({ node: frame.node, context: childContext, phase: walkDOM.EXIT });
            if (childContext === null || childContext === void 0) {
              continue;
            }
            var child = frame.node.lastChild;
            while (child) {
              stack.push({ node: child, context: childContext, phase: walkDOM.ENTER });
              child = child.previousSibling;
            }
          } else {
            if (callbacks.exit) {
              callbacks.exit(frame.node, frame.context);
            }
          }
        }
      }
      walkDOM.STOP = /* @__PURE__ */ Symbol("walkDOM.STOP");
      walkDOM.ENTER = 0;
      walkDOM.EXIT = 1;
      function Document(symbol, options) {
        checkSymbol(symbol);
        var opt = options || {};
        this.ownerDocument = this;
        this.contentType = opt.contentType || MIME_TYPE.XML_APPLICATION;
        this.type = isHTMLMimeType(this.contentType) ? "html" : "xml";
      }
      function _onAddAttribute(doc, el, newAttr) {
        doc && doc._inc++;
        var ns = newAttr.namespaceURI;
        if (ns === NAMESPACE.XMLNS) {
          el._nsMap[newAttr.prefix ? newAttr.localName : ""] = newAttr.value;
        }
      }
      function _onRemoveAttribute(doc, el, newAttr, remove) {
        doc && doc._inc++;
        var ns = newAttr.namespaceURI;
        if (ns === NAMESPACE.XMLNS) {
          delete el._nsMap[newAttr.prefix ? newAttr.localName : ""];
        }
      }
      function _onUpdateChild(doc, parent, newChild) {
        if (doc && doc._inc) {
          doc._inc++;
          var childNodes = parent.childNodes;
          if (newChild && !newChild.nextSibling) {
            childNodes[childNodes.length++] = newChild;
          } else {
            var child = parent.firstChild;
            var i = 0;
            while (child) {
              childNodes[i++] = child;
              child = child.nextSibling;
            }
            childNodes.length = i;
            delete childNodes[childNodes.length];
          }
        }
      }
      function _removeChild(parentNode, child) {
        if (parentNode !== child.parentNode) {
          throw new DOMException(DOMException.NOT_FOUND_ERR, "child's parent is not parent");
        }
        var oldPreviousSibling = child.previousSibling;
        var oldNextSibling = child.nextSibling;
        if (oldPreviousSibling) {
          oldPreviousSibling.nextSibling = oldNextSibling;
        } else {
          parentNode.firstChild = oldNextSibling;
        }
        if (oldNextSibling) {
          oldNextSibling.previousSibling = oldPreviousSibling;
        } else {
          parentNode.lastChild = oldPreviousSibling;
        }
        _onUpdateChild(parentNode.ownerDocument, parentNode);
        child.parentNode = null;
        child.previousSibling = null;
        child.nextSibling = null;
        return child;
      }
      function hasValidParentNodeType(node) {
        return node && (node.nodeType === Node2.DOCUMENT_NODE || node.nodeType === Node2.DOCUMENT_FRAGMENT_NODE || node.nodeType === Node2.ELEMENT_NODE);
      }
      function hasInsertableNodeType(node) {
        return node && (node.nodeType === Node2.CDATA_SECTION_NODE || node.nodeType === Node2.COMMENT_NODE || node.nodeType === Node2.DOCUMENT_FRAGMENT_NODE || node.nodeType === Node2.DOCUMENT_TYPE_NODE || node.nodeType === Node2.ELEMENT_NODE || node.nodeType === Node2.PROCESSING_INSTRUCTION_NODE || node.nodeType === Node2.TEXT_NODE);
      }
      function isDocTypeNode(node) {
        return node && node.nodeType === Node2.DOCUMENT_TYPE_NODE;
      }
      function isElementNode(node) {
        return node && node.nodeType === Node2.ELEMENT_NODE;
      }
      function isTextNode(node) {
        return node && node.nodeType === Node2.TEXT_NODE;
      }
      function isElementInsertionPossible(doc, child) {
        var parentChildNodes = doc.childNodes || [];
        if (find(parentChildNodes, isElementNode) || isDocTypeNode(child)) {
          return false;
        }
        var docTypeNode = find(parentChildNodes, isDocTypeNode);
        return !(child && docTypeNode && parentChildNodes.indexOf(docTypeNode) > parentChildNodes.indexOf(child));
      }
      function isElementReplacementPossible(doc, child) {
        var parentChildNodes = doc.childNodes || [];
        function hasElementChildThatIsNotChild(node) {
          return isElementNode(node) && node !== child;
        }
        if (find(parentChildNodes, hasElementChildThatIsNotChild)) {
          return false;
        }
        var docTypeNode = find(parentChildNodes, isDocTypeNode);
        return !(child && docTypeNode && parentChildNodes.indexOf(docTypeNode) > parentChildNodes.indexOf(child));
      }
      function assertPreInsertionValidity1to5(parent, node, child) {
        if (!hasValidParentNodeType(parent)) {
          throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Unexpected parent node type " + parent.nodeType);
        }
        if (child && child.parentNode !== parent) {
          throw new DOMException(DOMException.NOT_FOUND_ERR, "child not in parent");
        }
        if (
          // 4. If `node` is not a DocumentFragment, DocumentType, Element, or CharacterData node, then throw a "HierarchyRequestError" DOMException.
          !hasInsertableNodeType(node) || // 5. If either `node` is a Text node and `parent` is a document,
          // the sax parser currently adds top level text nodes, this will be fixed in 0.9.0
          // || (node.nodeType === Node.TEXT_NODE && parent.nodeType === Node.DOCUMENT_NODE)
          // or `node` is a doctype and `parent` is not a document, then throw a "HierarchyRequestError" DOMException.
          isDocTypeNode(node) && parent.nodeType !== Node2.DOCUMENT_NODE
        ) {
          throw new DOMException(
            DOMException.HIERARCHY_REQUEST_ERR,
            "Unexpected node type " + node.nodeType + " for parent node type " + parent.nodeType
          );
        }
      }
      function assertPreInsertionValidityInDocument(parent, node, child) {
        var parentChildNodes = parent.childNodes || [];
        var nodeChildNodes = node.childNodes || [];
        if (node.nodeType === Node2.DOCUMENT_FRAGMENT_NODE) {
          var nodeChildElements = nodeChildNodes.filter(isElementNode);
          if (nodeChildElements.length > 1 || find(nodeChildNodes, isTextNode)) {
            throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "More than one element or text in fragment");
          }
          if (nodeChildElements.length === 1 && !isElementInsertionPossible(parent, child)) {
            throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Element in fragment can not be inserted before doctype");
          }
        }
        if (isElementNode(node)) {
          if (!isElementInsertionPossible(parent, child)) {
            throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Only one element can be added and only after doctype");
          }
        }
        if (isDocTypeNode(node)) {
          if (find(parentChildNodes, isDocTypeNode)) {
            throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Only one doctype is allowed");
          }
          var parentElementChild = find(parentChildNodes, isElementNode);
          if (child && parentChildNodes.indexOf(parentElementChild) < parentChildNodes.indexOf(child)) {
            throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Doctype can only be inserted before an element");
          }
          if (!child && parentElementChild) {
            throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Doctype can not be appended since element is present");
          }
        }
      }
      function assertPreReplacementValidityInDocument(parent, node, child) {
        var parentChildNodes = parent.childNodes || [];
        var nodeChildNodes = node.childNodes || [];
        if (node.nodeType === Node2.DOCUMENT_FRAGMENT_NODE) {
          var nodeChildElements = nodeChildNodes.filter(isElementNode);
          if (nodeChildElements.length > 1 || find(nodeChildNodes, isTextNode)) {
            throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "More than one element or text in fragment");
          }
          if (nodeChildElements.length === 1 && !isElementReplacementPossible(parent, child)) {
            throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Element in fragment can not be inserted before doctype");
          }
        }
        if (isElementNode(node)) {
          if (!isElementReplacementPossible(parent, child)) {
            throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Only one element can be added and only after doctype");
          }
        }
        if (isDocTypeNode(node)) {
          let hasDoctypeChildThatIsNotChild = function(node2) {
            return isDocTypeNode(node2) && node2 !== child;
          };
          if (find(parentChildNodes, hasDoctypeChildThatIsNotChild)) {
            throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Only one doctype is allowed");
          }
          var parentElementChild = find(parentChildNodes, isElementNode);
          if (child && parentChildNodes.indexOf(parentElementChild) < parentChildNodes.indexOf(child)) {
            throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Doctype can only be inserted before an element");
          }
        }
      }
      function _insertBefore(parent, node, child, _inDocumentAssertion) {
        assertPreInsertionValidity1to5(parent, node, child);
        if (parent.nodeType === Node2.DOCUMENT_NODE) {
          (_inDocumentAssertion || assertPreInsertionValidityInDocument)(parent, node, child);
        }
        var cp = node.parentNode;
        if (cp) {
          cp.removeChild(node);
        }
        if (node.nodeType === DOCUMENT_FRAGMENT_NODE) {
          var newFirst = node.firstChild;
          if (newFirst == null) {
            return node;
          }
          var newLast = node.lastChild;
        } else {
          newFirst = newLast = node;
        }
        var pre = child ? child.previousSibling : parent.lastChild;
        newFirst.previousSibling = pre;
        newLast.nextSibling = child;
        if (pre) {
          pre.nextSibling = newFirst;
        } else {
          parent.firstChild = newFirst;
        }
        if (child == null) {
          parent.lastChild = newLast;
        } else {
          child.previousSibling = newLast;
        }
        do {
          newFirst.parentNode = parent;
        } while (newFirst !== newLast && (newFirst = newFirst.nextSibling));
        _onUpdateChild(parent.ownerDocument || parent, parent, node);
        if (node.nodeType == DOCUMENT_FRAGMENT_NODE) {
          node.firstChild = node.lastChild = null;
        }
        return node;
      }
      Document.prototype = {
        /**
         * The implementation that created this document.
         *
         * @type DOMImplementation
         * @readonly
         */
        implementation: null,
        nodeName: "#document",
        nodeType: DOCUMENT_NODE,
        /**
         * The DocumentType node of the document.
         *
         * @type DocumentType
         * @readonly
         */
        doctype: null,
        documentElement: null,
        _inc: 1,
        insertBefore: function(newChild, refChild) {
          if (newChild.nodeType === DOCUMENT_FRAGMENT_NODE) {
            var child = newChild.firstChild;
            while (child) {
              var next = child.nextSibling;
              this.insertBefore(child, refChild);
              child = next;
            }
            return newChild;
          }
          _insertBefore(this, newChild, refChild);
          newChild.ownerDocument = this;
          if (this.documentElement === null && newChild.nodeType === ELEMENT_NODE) {
            this.documentElement = newChild;
          }
          return newChild;
        },
        removeChild: function(oldChild) {
          var removed = _removeChild(this, oldChild);
          if (removed === this.documentElement) {
            this.documentElement = null;
          }
          return removed;
        },
        replaceChild: function(newChild, oldChild) {
          _insertBefore(this, newChild, oldChild, assertPreReplacementValidityInDocument);
          newChild.ownerDocument = this;
          if (oldChild) {
            this.removeChild(oldChild);
          }
          if (isElementNode(newChild)) {
            this.documentElement = newChild;
          }
        },
        /**
         * Imports a node from another document into this document, creating a new copy owned by this
         * document. The source node and its subtree are not modified.
         *
         * @param {Node} importedNode
         * The node to import.
         * @param {boolean} deep
         * If true, the contents of the node are recursively imported.
         * If false, only the node itself (and its attributes, if it is an element) are imported.
         * @returns {Node}
         * Returns the newly created import of the node.
         * @see {@link importNode}
         * @see {@link https://dom.spec.whatwg.org/#dom-document-importnode}
         */
        importNode: function(importedNode, deep) {
          return importNode(this, importedNode, deep);
        },
        // Introduced in DOM Level 2:
        getElementById: function(id) {
          var rtv = null;
          _visitNode(this.documentElement, function(node) {
            if (node.nodeType == ELEMENT_NODE) {
              if (node.getAttribute("id") == id) {
                rtv = node;
                return true;
              }
            }
          });
          return rtv;
        },
        /**
         * Creates a new `Element` that is owned by this `Document`.
         * In HTML Documents `localName` is the lower cased `tagName`,
         * otherwise no transformation is being applied.
         * When `contentType` implies the HTML namespace, it will be set as `namespaceURI`.
         *
         * __This implementation differs from the specification:__ - The provided name is not checked
         * against the `Name` production,
         * so no related error will be thrown.
         * - There is no interface `HTMLElement`, it is always an `Element`.
         * - There is no support for a second argument to indicate using custom elements.
         *
         * @param {string} tagName
         * @returns {Element}
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
         * @see https://dom.spec.whatwg.org/#dom-document-createelement
         * @see https://dom.spec.whatwg.org/#concept-create-element
         */
        createElement: function(tagName) {
          var node = new Element(PDC);
          node.ownerDocument = this;
          if (this.type === "html") {
            tagName = tagName.toLowerCase();
          }
          if (hasDefaultHTMLNamespace(this.contentType)) {
            node.namespaceURI = NAMESPACE.HTML;
          }
          node.nodeName = tagName;
          node.tagName = tagName;
          node.localName = tagName;
          node.childNodes = new NodeList();
          var attrs = node.attributes = new NamedNodeMap();
          attrs._ownerElement = node;
          return node;
        },
        /**
         * @returns {DocumentFragment}
         */
        createDocumentFragment: function() {
          var node = new DocumentFragment(PDC);
          node.ownerDocument = this;
          node.childNodes = new NodeList();
          return node;
        },
        /**
         * @param {string} data
         * @returns {Text}
         */
        createTextNode: function(data) {
          var node = new Text(PDC);
          node.ownerDocument = this;
          node.childNodes = new NodeList();
          node.appendData(data);
          return node;
        },
        /**
         * @param {string} data
         * @returns {Comment}
         * @see https://dom.spec.whatwg.org/#dom-document-createcomment
         * @see https://www.w3.org/TR/xml/#NT-Comment XML 1.0 production [15]
         * @see https://www.w3.org/TR/DOM-Parsing/#dfn-concept-serialize-xml §3.2.1.3
         *
         *      Note: no validation is performed at creation time. When the resulting document is
         *      serialized with `requireWellFormed: true`, the serializer throws `InvalidStateError`
         *      if the comment data contains `--` anywhere, ends with `-`, or contains characters
         *      outside the XML Char production (W3C DOM Parsing §3.2.1.3). Without that option the
         *      data is emitted verbatim.
         */
        createComment: function(data) {
          var node = new Comment(PDC);
          node.ownerDocument = this;
          node.childNodes = new NodeList();
          node.appendData(data);
          return node;
        },
        /**
         * Returns a new CDATASection node whose data is `data`.
         *
         * __This implementation differs from the specification:__ - calling this method on an HTML
         * document does not throw `NotSupportedError`.
         *
         * @param {string} data
         * @returns {CDATASection}
         * @throws {DOMException}
         * With code `INVALID_CHARACTER_ERR` if `data` contains `"]]>"`.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/createCDATASection
         * @see https://dom.spec.whatwg.org/#dom-document-createcdatasection
         */
        createCDATASection: function(data) {
          if (data.indexOf("]]>") !== -1) {
            throw new DOMException(DOMException.INVALID_CHARACTER_ERR, 'data contains "]]>"');
          }
          var node = new CDATASection(PDC);
          node.ownerDocument = this;
          node.childNodes = new NodeList();
          node.appendData(data);
          return node;
        },
        /**
         * Returns a ProcessingInstruction node whose target is target and data is data.
         *
         * __This behavior is slightly different from the in the specs__:
         * - it does not do any input validation on the arguments and doesn't throw
         * "InvalidCharacterError".
         *
         * Note: When the resulting document is serialized with `requireWellFormed: true`, the
         * serializer throws `InvalidStateError` if `.target` contains `:` or is an ASCII
         * case-insensitive match for `"xml"`, or if `.data` contains `?>` or characters outside the
         * XML Char production (W3C DOM Parsing §3.2.1.7). Without that option the data is emitted
         * verbatim.
         *
         * @param {string} target
         * @param {string} data
         * @returns {ProcessingInstruction}
         * @see https://developer.mozilla.org/docs/Web/API/Document/createProcessingInstruction
         * @see https://dom.spec.whatwg.org/#dom-document-createprocessinginstruction
         * @see https://www.w3.org/TR/DOM-Parsing/#dfn-concept-serialize-xml §3.2.1.7
         */
        createProcessingInstruction: function(target, data) {
          var node = new ProcessingInstruction(PDC);
          node.ownerDocument = this;
          node.childNodes = new NodeList();
          node.nodeName = node.target = target;
          node.nodeValue = node.data = data;
          return node;
        },
        /**
         * Creates an `Attr` node that is owned by this document.
         * In HTML Documents `localName` is the lower cased `name`,
         * otherwise no transformation is being applied.
         *
         * __This implementation differs from the specification:__ - The provided name is not checked
         * against the `Name` production,
         * so no related error will be thrown.
         *
         * @param {string} name
         * @returns {Attr}
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/createAttribute
         * @see https://dom.spec.whatwg.org/#dom-document-createattribute
         */
        createAttribute: function(name) {
          if (!g.QName_exact.test(name)) {
            throw new DOMException(DOMException.INVALID_CHARACTER_ERR, 'invalid character in name "' + name + '"');
          }
          if (this.type === "html") {
            name = name.toLowerCase();
          }
          return this._createAttribute(name);
        },
        _createAttribute: function(name) {
          var node = new Attr(PDC);
          node.ownerDocument = this;
          node.childNodes = new NodeList();
          node.name = name;
          node.nodeName = name;
          node.localName = name;
          node.specified = true;
          return node;
        },
        /**
         * Creates an EntityReference object.
         * The current implementation does not fill the `childNodes` with those of the corresponding
         * `Entity`
         *
         * @deprecated
         * In DOM Level 4.
         * @param {string} name
         * The name of the entity to reference. No namespace well-formedness checks are performed.
         * @returns {EntityReference}
         * @throws {DOMException}
         * With code `INVALID_CHARACTER_ERR` when `name` is not valid.
         * @throws {DOMException}
         * with code `NOT_SUPPORTED_ERR` when the document is of type `html`
         * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-392B75AE
         */
        createEntityReference: function(name) {
          if (!g.Name.test(name)) {
            throw new DOMException(DOMException.INVALID_CHARACTER_ERR, 'not a valid xml name "' + name + '"');
          }
          if (this.type === "html") {
            throw new DOMException("document is an html document", DOMExceptionName.NotSupportedError);
          }
          var node = new EntityReference(PDC);
          node.ownerDocument = this;
          node.childNodes = new NodeList();
          node.nodeName = name;
          return node;
        },
        // Introduced in DOM Level 2:
        /**
         * @param {string} namespaceURI
         * @param {string} qualifiedName
         * @returns {Element}
         */
        createElementNS: function(namespaceURI, qualifiedName) {
          var validated = validateAndExtract(namespaceURI, qualifiedName);
          var node = new Element(PDC);
          var attrs = node.attributes = new NamedNodeMap();
          node.childNodes = new NodeList();
          node.ownerDocument = this;
          node.nodeName = qualifiedName;
          node.tagName = qualifiedName;
          node.namespaceURI = validated[0];
          node.prefix = validated[1];
          node.localName = validated[2];
          attrs._ownerElement = node;
          return node;
        },
        // Introduced in DOM Level 2:
        /**
         * @param {string} namespaceURI
         * @param {string} qualifiedName
         * @returns {Attr}
         */
        createAttributeNS: function(namespaceURI, qualifiedName) {
          var validated = validateAndExtract(namespaceURI, qualifiedName);
          var node = new Attr(PDC);
          node.ownerDocument = this;
          node.childNodes = new NodeList();
          node.nodeName = qualifiedName;
          node.name = qualifiedName;
          node.specified = true;
          node.namespaceURI = validated[0];
          node.prefix = validated[1];
          node.localName = validated[2];
          return node;
        }
      };
      _extends(Document, Node2);
      function Element(symbol) {
        checkSymbol(symbol);
        this._nsMap = /* @__PURE__ */ Object.create(null);
      }
      Element.prototype = {
        nodeType: ELEMENT_NODE,
        /**
         * The attributes of this element.
         *
         * @type {NamedNodeMap | null}
         */
        attributes: null,
        getQualifiedName: function() {
          return this.prefix ? this.prefix + ":" + this.localName : this.localName;
        },
        _isInHTMLDocumentAndNamespace: function() {
          return this.ownerDocument.type === "html" && this.namespaceURI === NAMESPACE.HTML;
        },
        /**
         * Implementaton of Level2 Core function hasAttributes.
         *
         * @returns {boolean}
         * True if attribute list is not empty.
         * @see https://www.w3.org/TR/DOM-Level-2-Core/#core-ID-NodeHasAttrs
         */
        hasAttributes: function() {
          return !!(this.attributes && this.attributes.length);
        },
        hasAttribute: function(name) {
          return !!this.getAttributeNode(name);
        },
        /**
         * Returns element’s first attribute whose qualified name is `name`, and `null`
         * if there is no such attribute.
         *
         * @param {string} name
         * @returns {string | null}
         */
        getAttribute: function(name) {
          var attr = this.getAttributeNode(name);
          return attr ? attr.value : null;
        },
        getAttributeNode: function(name) {
          if (this._isInHTMLDocumentAndNamespace()) {
            name = name.toLowerCase();
          }
          return this.attributes.getNamedItem(name);
        },
        /**
         * Sets the value of element’s first attribute whose qualified name is qualifiedName to value.
         *
         * @param {string} name
         * @param {string} value
         */
        setAttribute: function(name, value) {
          if (this._isInHTMLDocumentAndNamespace()) {
            name = name.toLowerCase();
          }
          var attr = this.getAttributeNode(name);
          if (attr) {
            attr.value = attr.nodeValue = "" + value;
          } else {
            attr = this.ownerDocument._createAttribute(name);
            attr.value = attr.nodeValue = "" + value;
            this.setAttributeNode(attr);
          }
        },
        removeAttribute: function(name) {
          var attr = this.getAttributeNode(name);
          attr && this.removeAttributeNode(attr);
        },
        setAttributeNode: function(newAttr) {
          return this.attributes.setNamedItem(newAttr);
        },
        setAttributeNodeNS: function(newAttr) {
          return this.attributes.setNamedItemNS(newAttr);
        },
        removeAttributeNode: function(oldAttr) {
          return this.attributes.removeNamedItem(oldAttr.nodeName);
        },
        //get real attribute name,and remove it by removeAttributeNode
        removeAttributeNS: function(namespaceURI, localName) {
          var old = this.getAttributeNodeNS(namespaceURI, localName);
          old && this.removeAttributeNode(old);
        },
        hasAttributeNS: function(namespaceURI, localName) {
          return this.getAttributeNodeNS(namespaceURI, localName) != null;
        },
        /**
         * Returns element’s attribute whose namespace is `namespaceURI` and local name is
         * `localName`,
         * or `null` if there is no such attribute.
         *
         * @param {string} namespaceURI
         * @param {string} localName
         * @returns {string | null}
         */
        getAttributeNS: function(namespaceURI, localName) {
          var attr = this.getAttributeNodeNS(namespaceURI, localName);
          return attr ? attr.value : null;
        },
        /**
         * Sets the value of element’s attribute whose namespace is `namespaceURI` and local name is
         * `localName` to value.
         *
         * @param {string} namespaceURI
         * @param {string} qualifiedName
         * @param {string} value
         * @see https://dom.spec.whatwg.org/#dom-element-setattributens
         */
        setAttributeNS: function(namespaceURI, qualifiedName, value) {
          var validated = validateAndExtract(namespaceURI, qualifiedName);
          var localName = validated[2];
          var attr = this.getAttributeNodeNS(namespaceURI, localName);
          if (attr) {
            attr.value = attr.nodeValue = "" + value;
          } else {
            attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
            attr.value = attr.nodeValue = "" + value;
            this.setAttributeNode(attr);
          }
        },
        getAttributeNodeNS: function(namespaceURI, localName) {
          return this.attributes.getNamedItemNS(namespaceURI, localName);
        },
        /**
         * Returns a LiveNodeList of all child elements which have **all** of the given class name(s).
         *
         * Returns an empty list if `classNames` is an empty string or only contains HTML white space
         * characters.
         *
         * Warning: This returns a live LiveNodeList.
         * Changes in the DOM will reflect in the array as the changes occur.
         * If an element selected by this array no longer qualifies for the selector,
         * it will automatically be removed. Be aware of this for iteration purposes.
         *
         * @param {string} classNames
         * Is a string representing the class name(s) to match; multiple class names are separated by
         * (ASCII-)whitespace.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByClassName
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByClassName
         * @see https://dom.spec.whatwg.org/#concept-getelementsbyclassname
         */
        getElementsByClassName: function(classNames) {
          var classNamesSet = toOrderedSet(classNames);
          return new LiveNodeList(this, function(base) {
            var ls = [];
            if (classNamesSet.length > 0) {
              _visitNode(base, function(node) {
                if (node !== base && node.nodeType === ELEMENT_NODE) {
                  var nodeClassNames = node.getAttribute("class");
                  if (nodeClassNames) {
                    var matches = classNames === nodeClassNames;
                    if (!matches) {
                      var nodeClassNamesSet = toOrderedSet(nodeClassNames);
                      matches = classNamesSet.every(arrayIncludes(nodeClassNamesSet));
                    }
                    if (matches) {
                      ls.push(node);
                    }
                  }
                }
              });
            }
            return ls;
          });
        },
        /**
         * Returns a LiveNodeList of elements with the given qualifiedName.
         * Searching for all descendants can be done by passing `*` as `qualifiedName`.
         *
         * All descendants of the specified element are searched, but not the element itself.
         * The returned list is live, which means it updates itself with the DOM tree automatically.
         * Therefore, there is no need to call `Element.getElementsByTagName()`
         * with the same element and arguments repeatedly if the DOM changes in between calls.
         *
         * When called on an HTML element in an HTML document,
         * `getElementsByTagName` lower-cases the argument before searching for it.
         * This is undesirable when trying to match camel-cased SVG elements (such as
         * `<linearGradient>`) in an HTML document.
         * Instead, use `Element.getElementsByTagNameNS()`,
         * which preserves the capitalization of the tag name.
         *
         * `Element.getElementsByTagName` is similar to `Document.getElementsByTagName()`,
         * except that it only searches for elements that are descendants of the specified element.
         *
         * @param {string} qualifiedName
         * @returns {LiveNodeList}
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByTagName
         * @see https://dom.spec.whatwg.org/#concept-getelementsbytagname
         */
        getElementsByTagName: function(qualifiedName) {
          var isHTMLDocument = (this.nodeType === DOCUMENT_NODE ? this : this.ownerDocument).type === "html";
          var lowerQualifiedName = qualifiedName.toLowerCase();
          return new LiveNodeList(this, function(base) {
            var ls = [];
            _visitNode(base, function(node) {
              if (node === base || node.nodeType !== ELEMENT_NODE) {
                return;
              }
              if (qualifiedName === "*") {
                ls.push(node);
              } else {
                var nodeQualifiedName = node.getQualifiedName();
                var matchingQName = isHTMLDocument && node.namespaceURI === NAMESPACE.HTML ? lowerQualifiedName : qualifiedName;
                if (nodeQualifiedName === matchingQName) {
                  ls.push(node);
                }
              }
            });
            return ls;
          });
        },
        getElementsByTagNameNS: function(namespaceURI, localName) {
          return new LiveNodeList(this, function(base) {
            var ls = [];
            _visitNode(base, function(node) {
              if (node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === "*" || node.namespaceURI === namespaceURI) && (localName === "*" || node.localName == localName)) {
                ls.push(node);
              }
            });
            return ls;
          });
        }
      };
      Document.prototype.getElementsByClassName = Element.prototype.getElementsByClassName;
      Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
      Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;
      _extends(Element, Node2);
      function Attr(symbol) {
        checkSymbol(symbol);
        this.namespaceURI = null;
        this.prefix = null;
        this.ownerElement = null;
      }
      Attr.prototype.nodeType = ATTRIBUTE_NODE;
      _extends(Attr, Node2);
      function CharacterData(symbol) {
        checkSymbol(symbol);
      }
      CharacterData.prototype = {
        data: "",
        substringData: function(offset, count) {
          return this.data.substring(offset, offset + count);
        },
        appendData: function(text) {
          text = this.data + text;
          this.nodeValue = this.data = text;
          this.length = text.length;
        },
        insertData: function(offset, text) {
          this.replaceData(offset, 0, text);
        },
        deleteData: function(offset, count) {
          this.replaceData(offset, count, "");
        },
        replaceData: function(offset, count, text) {
          var start = this.data.substring(0, offset);
          var end = this.data.substring(offset + count);
          text = start + text + end;
          this.nodeValue = this.data = text;
          this.length = text.length;
        }
      };
      _extends(CharacterData, Node2);
      function Text(symbol) {
        checkSymbol(symbol);
      }
      Text.prototype = {
        nodeName: "#text",
        nodeType: TEXT_NODE,
        splitText: function(offset) {
          var text = this.data;
          var newText = text.substring(offset);
          text = text.substring(0, offset);
          this.data = this.nodeValue = text;
          this.length = text.length;
          var newNode = this.ownerDocument.createTextNode(newText);
          if (this.parentNode) {
            this.parentNode.insertBefore(newNode, this.nextSibling);
          }
          return newNode;
        }
      };
      _extends(Text, CharacterData);
      function Comment(symbol) {
        checkSymbol(symbol);
      }
      Comment.prototype = {
        nodeName: "#comment",
        nodeType: COMMENT_NODE
      };
      _extends(Comment, CharacterData);
      function CDATASection(symbol) {
        checkSymbol(symbol);
      }
      CDATASection.prototype = {
        nodeName: "#cdata-section",
        nodeType: CDATA_SECTION_NODE
      };
      _extends(CDATASection, Text);
      function DocumentType(symbol) {
        checkSymbol(symbol);
      }
      DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
      _extends(DocumentType, Node2);
      function Notation(symbol) {
        checkSymbol(symbol);
      }
      Notation.prototype.nodeType = NOTATION_NODE;
      _extends(Notation, Node2);
      function Entity(symbol) {
        checkSymbol(symbol);
      }
      Entity.prototype.nodeType = ENTITY_NODE;
      _extends(Entity, Node2);
      function EntityReference(symbol) {
        checkSymbol(symbol);
      }
      EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
      _extends(EntityReference, Node2);
      function DocumentFragment(symbol) {
        checkSymbol(symbol);
      }
      DocumentFragment.prototype.nodeName = "#document-fragment";
      DocumentFragment.prototype.nodeType = DOCUMENT_FRAGMENT_NODE;
      _extends(DocumentFragment, Node2);
      function ProcessingInstruction(symbol) {
        checkSymbol(symbol);
      }
      ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
      _extends(ProcessingInstruction, CharacterData);
      function XMLSerializer2() {
      }
      XMLSerializer2.prototype.serializeToString = function(node, options) {
        return nodeSerializeToString.call(node, options);
      };
      Node2.prototype.toString = nodeSerializeToString;
      function nodeSerializeToString(options) {
        var opts;
        if (typeof options === "function") {
          opts = { requireWellFormed: false, splitCDATASections: true, nodeFilter: options };
        } else if (options != null) {
          opts = {
            requireWellFormed: !!options.requireWellFormed,
            splitCDATASections: options.splitCDATASections !== false,
            nodeFilter: options.nodeFilter || null
          };
        } else {
          opts = { requireWellFormed: false, splitCDATASections: true, nodeFilter: null };
        }
        var buf = [];
        var refNode = this.nodeType === DOCUMENT_NODE && this.documentElement || this;
        var prefix = refNode.prefix;
        var uri = refNode.namespaceURI;
        if (uri && prefix == null) {
          var prefix = refNode.lookupPrefix(uri);
          if (prefix == null) {
            var visibleNamespaces = [
              { namespace: uri, prefix: null }
              //{namespace:uri,prefix:''}
            ];
          }
        }
        serializeToString(this, buf, visibleNamespaces, opts);
        return buf.join("");
      }
      function needNamespaceDefine(node, isHTML, visibleNamespaces) {
        var prefix = node.prefix || "";
        var uri = node.namespaceURI;
        if (!uri) {
          return false;
        }
        if (prefix === "xml" && uri === NAMESPACE.XML || uri === NAMESPACE.XMLNS) {
          return false;
        }
        var i = visibleNamespaces.length;
        while (i--) {
          var ns = visibleNamespaces[i];
          if (ns.prefix === prefix) {
            return ns.namespace !== uri;
          }
        }
        return true;
      }
      function addSerializedAttribute(buf, qualifiedName, value) {
        buf.push(" ", qualifiedName, '="', value.replace(/[<>&"\t\n\r]/g, _xmlEncoder), '"');
      }
      function serializeToString(node, buf, visibleNamespaces, opts) {
        if (!visibleNamespaces) {
          visibleNamespaces = [];
        }
        var nodeFilter = opts.nodeFilter;
        var requireWellFormed = opts.requireWellFormed;
        var splitCDATASections = opts.splitCDATASections;
        var doc = node.nodeType === DOCUMENT_NODE ? node : node.ownerDocument;
        var isHTML = doc.type === "html";
        walkDOM(
          node,
          { ns: visibleNamespaces },
          {
            enter: function(n, ctx) {
              var namespaces = ctx.ns;
              if (nodeFilter) {
                n = nodeFilter(n);
                if (n) {
                  if (typeof n == "string") {
                    buf.push(n);
                    return null;
                  }
                } else {
                  return null;
                }
              }
              switch (n.nodeType) {
                case ELEMENT_NODE:
                  var attrs = n.attributes;
                  var len = attrs.length;
                  var nodeName = n.tagName;
                  var prefixedNodeName = nodeName;
                  if (!isHTML && !n.prefix && n.namespaceURI) {
                    var defaultNS;
                    for (var ai = 0; ai < attrs.length; ai++) {
                      if (attrs.item(ai).name === "xmlns") {
                        defaultNS = attrs.item(ai).value;
                        break;
                      }
                    }
                    if (!defaultNS) {
                      for (var nsi = namespaces.length - 1; nsi >= 0; nsi--) {
                        var nsEntry = namespaces[nsi];
                        if (nsEntry.prefix === "" && nsEntry.namespace === n.namespaceURI) {
                          defaultNS = nsEntry.namespace;
                          break;
                        }
                      }
                    }
                    if (defaultNS !== n.namespaceURI) {
                      for (var nsi = namespaces.length - 1; nsi >= 0; nsi--) {
                        var nsEntry = namespaces[nsi];
                        if (nsEntry.namespace === n.namespaceURI) {
                          if (nsEntry.prefix) {
                            prefixedNodeName = nsEntry.prefix + ":" + nodeName;
                          }
                          break;
                        }
                      }
                    }
                  }
                  buf.push("<", prefixedNodeName);
                  var childNamespaces = namespaces.slice();
                  for (var i = 0; i < len; i++) {
                    var attr = attrs.item(i);
                    if (attr.prefix == "xmlns") {
                      childNamespaces.push({
                        prefix: attr.localName,
                        namespace: attr.value
                      });
                    } else if (attr.nodeName == "xmlns") {
                      childNamespaces.push({ prefix: "", namespace: attr.value });
                    }
                  }
                  for (var i = 0; i < len; i++) {
                    var attr = attrs.item(i);
                    if (needNamespaceDefine(attr, isHTML, childNamespaces)) {
                      var attrPrefix = attr.prefix || "";
                      var uri = attr.namespaceURI;
                      addSerializedAttribute(buf, attrPrefix ? "xmlns:" + attrPrefix : "xmlns", uri);
                      childNamespaces.push({ prefix: attrPrefix, namespace: uri });
                    }
                    var filteredAttr = nodeFilter ? nodeFilter(attr) : attr;
                    if (filteredAttr) {
                      if (typeof filteredAttr === "string") {
                        buf.push(filteredAttr);
                      } else {
                        addSerializedAttribute(buf, filteredAttr.name, filteredAttr.value);
                      }
                    }
                  }
                  if (nodeName === prefixedNodeName && needNamespaceDefine(n, isHTML, childNamespaces)) {
                    var nodePrefix = n.prefix || "";
                    var uri = n.namespaceURI;
                    addSerializedAttribute(buf, nodePrefix ? "xmlns:" + nodePrefix : "xmlns", uri);
                    childNamespaces.push({ prefix: nodePrefix, namespace: uri });
                  }
                  var canCloseTag = !n.firstChild;
                  if (canCloseTag && (isHTML || n.namespaceURI === NAMESPACE.HTML)) {
                    canCloseTag = isHTMLVoidElement(nodeName);
                  }
                  if (canCloseTag) {
                    buf.push("/>");
                    return null;
                  }
                  buf.push(">");
                  if (isHTML && isHTMLRawTextElement(nodeName)) {
                    var child = n.firstChild;
                    while (child) {
                      if (child.data) {
                        buf.push(child.data);
                      } else {
                        serializeToString(child, buf, childNamespaces.slice(), opts);
                      }
                      child = child.nextSibling;
                    }
                    buf.push("</", prefixedNodeName, ">");
                    return null;
                  }
                  return { ns: childNamespaces, tag: prefixedNodeName };
                case DOCUMENT_NODE:
                case DOCUMENT_FRAGMENT_NODE:
                  if (requireWellFormed && n.nodeType === DOCUMENT_NODE && n.documentElement == null) {
                    throw new DOMException("The Document has no documentElement", DOMExceptionName.InvalidStateError);
                  }
                  return { ns: namespaces };
                case ATTRIBUTE_NODE:
                  addSerializedAttribute(buf, n.name, n.value);
                  return null;
                case TEXT_NODE:
                  if (requireWellFormed && g.InvalidChar.test(n.data)) {
                    throw new DOMException(
                      "The Text node data contains characters outside the XML Char production",
                      DOMExceptionName.InvalidStateError
                    );
                  }
                  buf.push(n.data.replace(/[<&>]/g, _xmlEncoder));
                  return null;
                case CDATA_SECTION_NODE:
                  if (requireWellFormed && n.data.indexOf("]]>") !== -1) {
                    throw new DOMException('The CDATASection data contains "]]>"', DOMExceptionName.InvalidStateError);
                  }
                  if (splitCDATASections) {
                    buf.push(g.CDATA_START, n.data.replace(/]]>/g, "]]]]><![CDATA[>"), g.CDATA_END);
                  } else {
                    buf.push(g.CDATA_START, n.data, g.CDATA_END);
                  }
                  return null;
                case COMMENT_NODE:
                  if (requireWellFormed) {
                    if (g.InvalidChar.test(n.data)) {
                      throw new DOMException(
                        "The comment node data contains characters outside the XML Char production",
                        DOMExceptionName.InvalidStateError
                      );
                    }
                    if (n.data.indexOf("--") !== -1 || n.data[n.data.length - 1] === "-") {
                      throw new DOMException(
                        'The comment node data contains "--" or ends with "-"',
                        DOMExceptionName.InvalidStateError
                      );
                    }
                  }
                  buf.push(g.COMMENT_START, n.data, g.COMMENT_END);
                  return null;
                case DOCUMENT_TYPE_NODE:
                  var pubid = n.publicId;
                  var sysid = n.systemId;
                  if (requireWellFormed) {
                    if (pubid && !g.PubidLiteral_match.test(pubid)) {
                      throw new DOMException("DocumentType publicId is not a valid PubidLiteral", DOMExceptionName.InvalidStateError);
                    }
                    if (sysid && sysid !== "." && !g.SystemLiteral_match.test(sysid)) {
                      throw new DOMException("DocumentType systemId is not a valid SystemLiteral", DOMExceptionName.InvalidStateError);
                    }
                    if (n.internalSubset && n.internalSubset.indexOf("]>") !== -1) {
                      throw new DOMException('DocumentType internalSubset contains "]>"', DOMExceptionName.InvalidStateError);
                    }
                  }
                  buf.push(g.DOCTYPE_DECL_START, " ", n.name);
                  if (pubid) {
                    buf.push(" ", g.PUBLIC, " ", pubid);
                    if (sysid && sysid !== ".") {
                      buf.push(" ", sysid);
                    }
                  } else if (sysid && sysid !== ".") {
                    buf.push(" ", g.SYSTEM, " ", sysid);
                  }
                  if (n.internalSubset) {
                    buf.push(" [", n.internalSubset, "]");
                  }
                  buf.push(">");
                  return null;
                case PROCESSING_INSTRUCTION_NODE:
                  if (requireWellFormed) {
                    if (n.target.indexOf(":") !== -1 || n.target.toLowerCase() === "xml") {
                      throw new DOMException("The ProcessingInstruction target is not well-formed", DOMExceptionName.InvalidStateError);
                    }
                    if (g.InvalidChar.test(n.data)) {
                      throw new DOMException(
                        "The ProcessingInstruction data contains characters outside the XML Char production",
                        DOMExceptionName.InvalidStateError
                      );
                    }
                    if (n.data.indexOf("?>") !== -1) {
                      throw new DOMException('The ProcessingInstruction data contains "?>"', DOMExceptionName.InvalidStateError);
                    }
                  }
                  buf.push("<?", n.target, " ", n.data, "?>");
                  return null;
                case ENTITY_REFERENCE_NODE:
                  buf.push("&", n.nodeName, ";");
                  return null;
                //case ENTITY_NODE:
                //case NOTATION_NODE:
                default:
                  buf.push("??", n.nodeName);
                  return null;
              }
            },
            exit: function(n, childCtx) {
              if (childCtx && childCtx.tag) {
                buf.push("</", childCtx.tag, ">");
              }
            }
          }
        );
      }
      function importNode(doc, node, deep) {
        var destRoot;
        walkDOM(node, null, {
          enter: function(srcNode, destParent) {
            var destNode = srcNode.cloneNode(false);
            destNode.ownerDocument = doc;
            destNode.parentNode = null;
            if (destParent === null) {
              destRoot = destNode;
            } else {
              destParent.appendChild(destNode);
            }
            var shouldDeep = srcNode.nodeType === ATTRIBUTE_NODE || deep;
            return shouldDeep ? destNode : null;
          }
        });
        return destRoot;
      }
      function cloneNode(doc, node, deep) {
        var destRoot;
        walkDOM(node, null, {
          enter: function(srcNode, destParent) {
            var destNode = new srcNode.constructor(PDC);
            for (var n in srcNode) {
              if (hasOwn(srcNode, n)) {
                var v = srcNode[n];
                if (typeof v != "object") {
                  if (v != destNode[n]) {
                    destNode[n] = v;
                  }
                }
              }
            }
            if (srcNode.childNodes) {
              destNode.childNodes = new NodeList();
            }
            destNode.ownerDocument = doc;
            var shouldDeep = deep;
            switch (destNode.nodeType) {
              case ELEMENT_NODE:
                var attrs = srcNode.attributes;
                var attrs2 = destNode.attributes = new NamedNodeMap();
                var len = attrs.length;
                attrs2._ownerElement = destNode;
                for (var i = 0; i < len; i++) {
                  destNode.setAttributeNode(cloneNode(doc, attrs.item(i), true));
                }
                break;
              case ATTRIBUTE_NODE:
                shouldDeep = true;
            }
            if (destParent !== null) {
              destParent.appendChild(destNode);
            } else {
              destRoot = destNode;
            }
            return shouldDeep ? destNode : null;
          }
        });
        return destRoot;
      }
      function __set__(object, key, value) {
        object[key] = value;
      }
      function childrenRefresh(node) {
        var ls = [];
        var child = node.firstChild;
        while (child) {
          if (child.nodeType === ELEMENT_NODE) {
            ls.push(child);
          }
          child = child.nextSibling;
        }
        return ls;
      }
      try {
        if (Object.defineProperty) {
          Object.defineProperty(LiveNodeList.prototype, "length", {
            get: function() {
              _updateLiveList(this);
              return this.$$length;
            }
          });
          Object.defineProperty(Node2.prototype, "textContent", {
            get: function() {
              if (this.nodeType === ELEMENT_NODE || this.nodeType === DOCUMENT_FRAGMENT_NODE) {
                var buf = [];
                walkDOM(this, null, {
                  enter: function(n) {
                    if (n.nodeType === ELEMENT_NODE || n.nodeType === DOCUMENT_FRAGMENT_NODE) {
                      return true;
                    }
                    if (n.nodeType === PROCESSING_INSTRUCTION_NODE || n.nodeType === COMMENT_NODE) {
                      return null;
                    }
                    buf.push(n.nodeValue);
                  }
                });
                return buf.join("");
              }
              return this.nodeValue;
            },
            set: function(data) {
              switch (this.nodeType) {
                case ELEMENT_NODE:
                case DOCUMENT_FRAGMENT_NODE:
                  while (this.firstChild) {
                    this.removeChild(this.firstChild);
                  }
                  if (data || String(data)) {
                    this.appendChild(this.ownerDocument.createTextNode(data));
                  }
                  break;
                default:
                  this.data = data;
                  this.value = data;
                  this.nodeValue = data;
              }
            }
          });
          Object.defineProperty(Element.prototype, "children", {
            get: function() {
              return new LiveNodeList(this, childrenRefresh);
            }
          });
          Object.defineProperty(Document.prototype, "children", {
            get: function() {
              return new LiveNodeList(this, childrenRefresh);
            }
          });
          Object.defineProperty(DocumentFragment.prototype, "children", {
            get: function() {
              return new LiveNodeList(this, childrenRefresh);
            }
          });
          __set__ = function(object, key, value) {
            object["$$" + key] = value;
          };
        }
      } catch (e) {
      }
      exports._updateLiveList = _updateLiveList;
      exports.Attr = Attr;
      exports.CDATASection = CDATASection;
      exports.CharacterData = CharacterData;
      exports.Comment = Comment;
      exports.Document = Document;
      exports.DocumentFragment = DocumentFragment;
      exports.DocumentType = DocumentType;
      exports.DOMImplementation = DOMImplementation;
      exports.Element = Element;
      exports.Entity = Entity;
      exports.EntityReference = EntityReference;
      exports.LiveNodeList = LiveNodeList;
      exports.NamedNodeMap = NamedNodeMap;
      exports.Node = Node2;
      exports.NodeList = NodeList;
      exports.Notation = Notation;
      exports.Text = Text;
      exports.ProcessingInstruction = ProcessingInstruction;
      exports.walkDOM = walkDOM;
      exports.XMLSerializer = XMLSerializer2;
    }
  });

  // node_modules/@xmldom/xmldom/lib/entities.js
  var require_entities = __commonJS({
    "node_modules/@xmldom/xmldom/lib/entities.js"(exports) {
      "use strict";
      var freeze = require_conventions().freeze;
      exports.XML_ENTITIES = freeze({
        amp: "&",
        apos: "'",
        gt: ">",
        lt: "<",
        quot: '"'
      });
      exports.HTML_ENTITIES = freeze({
        Aacute: "\xC1",
        aacute: "\xE1",
        Abreve: "\u0102",
        abreve: "\u0103",
        ac: "\u223E",
        acd: "\u223F",
        acE: "\u223E\u0333",
        Acirc: "\xC2",
        acirc: "\xE2",
        acute: "\xB4",
        Acy: "\u0410",
        acy: "\u0430",
        AElig: "\xC6",
        aelig: "\xE6",
        af: "\u2061",
        Afr: "\u{1D504}",
        afr: "\u{1D51E}",
        Agrave: "\xC0",
        agrave: "\xE0",
        alefsym: "\u2135",
        aleph: "\u2135",
        Alpha: "\u0391",
        alpha: "\u03B1",
        Amacr: "\u0100",
        amacr: "\u0101",
        amalg: "\u2A3F",
        AMP: "&",
        amp: "&",
        And: "\u2A53",
        and: "\u2227",
        andand: "\u2A55",
        andd: "\u2A5C",
        andslope: "\u2A58",
        andv: "\u2A5A",
        ang: "\u2220",
        ange: "\u29A4",
        angle: "\u2220",
        angmsd: "\u2221",
        angmsdaa: "\u29A8",
        angmsdab: "\u29A9",
        angmsdac: "\u29AA",
        angmsdad: "\u29AB",
        angmsdae: "\u29AC",
        angmsdaf: "\u29AD",
        angmsdag: "\u29AE",
        angmsdah: "\u29AF",
        angrt: "\u221F",
        angrtvb: "\u22BE",
        angrtvbd: "\u299D",
        angsph: "\u2222",
        angst: "\xC5",
        angzarr: "\u237C",
        Aogon: "\u0104",
        aogon: "\u0105",
        Aopf: "\u{1D538}",
        aopf: "\u{1D552}",
        ap: "\u2248",
        apacir: "\u2A6F",
        apE: "\u2A70",
        ape: "\u224A",
        apid: "\u224B",
        apos: "'",
        ApplyFunction: "\u2061",
        approx: "\u2248",
        approxeq: "\u224A",
        Aring: "\xC5",
        aring: "\xE5",
        Ascr: "\u{1D49C}",
        ascr: "\u{1D4B6}",
        Assign: "\u2254",
        ast: "*",
        asymp: "\u2248",
        asympeq: "\u224D",
        Atilde: "\xC3",
        atilde: "\xE3",
        Auml: "\xC4",
        auml: "\xE4",
        awconint: "\u2233",
        awint: "\u2A11",
        backcong: "\u224C",
        backepsilon: "\u03F6",
        backprime: "\u2035",
        backsim: "\u223D",
        backsimeq: "\u22CD",
        Backslash: "\u2216",
        Barv: "\u2AE7",
        barvee: "\u22BD",
        Barwed: "\u2306",
        barwed: "\u2305",
        barwedge: "\u2305",
        bbrk: "\u23B5",
        bbrktbrk: "\u23B6",
        bcong: "\u224C",
        Bcy: "\u0411",
        bcy: "\u0431",
        bdquo: "\u201E",
        becaus: "\u2235",
        Because: "\u2235",
        because: "\u2235",
        bemptyv: "\u29B0",
        bepsi: "\u03F6",
        bernou: "\u212C",
        Bernoullis: "\u212C",
        Beta: "\u0392",
        beta: "\u03B2",
        beth: "\u2136",
        between: "\u226C",
        Bfr: "\u{1D505}",
        bfr: "\u{1D51F}",
        bigcap: "\u22C2",
        bigcirc: "\u25EF",
        bigcup: "\u22C3",
        bigodot: "\u2A00",
        bigoplus: "\u2A01",
        bigotimes: "\u2A02",
        bigsqcup: "\u2A06",
        bigstar: "\u2605",
        bigtriangledown: "\u25BD",
        bigtriangleup: "\u25B3",
        biguplus: "\u2A04",
        bigvee: "\u22C1",
        bigwedge: "\u22C0",
        bkarow: "\u290D",
        blacklozenge: "\u29EB",
        blacksquare: "\u25AA",
        blacktriangle: "\u25B4",
        blacktriangledown: "\u25BE",
        blacktriangleleft: "\u25C2",
        blacktriangleright: "\u25B8",
        blank: "\u2423",
        blk12: "\u2592",
        blk14: "\u2591",
        blk34: "\u2593",
        block: "\u2588",
        bne: "=\u20E5",
        bnequiv: "\u2261\u20E5",
        bNot: "\u2AED",
        bnot: "\u2310",
        Bopf: "\u{1D539}",
        bopf: "\u{1D553}",
        bot: "\u22A5",
        bottom: "\u22A5",
        bowtie: "\u22C8",
        boxbox: "\u29C9",
        boxDL: "\u2557",
        boxDl: "\u2556",
        boxdL: "\u2555",
        boxdl: "\u2510",
        boxDR: "\u2554",
        boxDr: "\u2553",
        boxdR: "\u2552",
        boxdr: "\u250C",
        boxH: "\u2550",
        boxh: "\u2500",
        boxHD: "\u2566",
        boxHd: "\u2564",
        boxhD: "\u2565",
        boxhd: "\u252C",
        boxHU: "\u2569",
        boxHu: "\u2567",
        boxhU: "\u2568",
        boxhu: "\u2534",
        boxminus: "\u229F",
        boxplus: "\u229E",
        boxtimes: "\u22A0",
        boxUL: "\u255D",
        boxUl: "\u255C",
        boxuL: "\u255B",
        boxul: "\u2518",
        boxUR: "\u255A",
        boxUr: "\u2559",
        boxuR: "\u2558",
        boxur: "\u2514",
        boxV: "\u2551",
        boxv: "\u2502",
        boxVH: "\u256C",
        boxVh: "\u256B",
        boxvH: "\u256A",
        boxvh: "\u253C",
        boxVL: "\u2563",
        boxVl: "\u2562",
        boxvL: "\u2561",
        boxvl: "\u2524",
        boxVR: "\u2560",
        boxVr: "\u255F",
        boxvR: "\u255E",
        boxvr: "\u251C",
        bprime: "\u2035",
        Breve: "\u02D8",
        breve: "\u02D8",
        brvbar: "\xA6",
        Bscr: "\u212C",
        bscr: "\u{1D4B7}",
        bsemi: "\u204F",
        bsim: "\u223D",
        bsime: "\u22CD",
        bsol: "\\",
        bsolb: "\u29C5",
        bsolhsub: "\u27C8",
        bull: "\u2022",
        bullet: "\u2022",
        bump: "\u224E",
        bumpE: "\u2AAE",
        bumpe: "\u224F",
        Bumpeq: "\u224E",
        bumpeq: "\u224F",
        Cacute: "\u0106",
        cacute: "\u0107",
        Cap: "\u22D2",
        cap: "\u2229",
        capand: "\u2A44",
        capbrcup: "\u2A49",
        capcap: "\u2A4B",
        capcup: "\u2A47",
        capdot: "\u2A40",
        CapitalDifferentialD: "\u2145",
        caps: "\u2229\uFE00",
        caret: "\u2041",
        caron: "\u02C7",
        Cayleys: "\u212D",
        ccaps: "\u2A4D",
        Ccaron: "\u010C",
        ccaron: "\u010D",
        Ccedil: "\xC7",
        ccedil: "\xE7",
        Ccirc: "\u0108",
        ccirc: "\u0109",
        Cconint: "\u2230",
        ccups: "\u2A4C",
        ccupssm: "\u2A50",
        Cdot: "\u010A",
        cdot: "\u010B",
        cedil: "\xB8",
        Cedilla: "\xB8",
        cemptyv: "\u29B2",
        cent: "\xA2",
        CenterDot: "\xB7",
        centerdot: "\xB7",
        Cfr: "\u212D",
        cfr: "\u{1D520}",
        CHcy: "\u0427",
        chcy: "\u0447",
        check: "\u2713",
        checkmark: "\u2713",
        Chi: "\u03A7",
        chi: "\u03C7",
        cir: "\u25CB",
        circ: "\u02C6",
        circeq: "\u2257",
        circlearrowleft: "\u21BA",
        circlearrowright: "\u21BB",
        circledast: "\u229B",
        circledcirc: "\u229A",
        circleddash: "\u229D",
        CircleDot: "\u2299",
        circledR: "\xAE",
        circledS: "\u24C8",
        CircleMinus: "\u2296",
        CirclePlus: "\u2295",
        CircleTimes: "\u2297",
        cirE: "\u29C3",
        cire: "\u2257",
        cirfnint: "\u2A10",
        cirmid: "\u2AEF",
        cirscir: "\u29C2",
        ClockwiseContourIntegral: "\u2232",
        CloseCurlyDoubleQuote: "\u201D",
        CloseCurlyQuote: "\u2019",
        clubs: "\u2663",
        clubsuit: "\u2663",
        Colon: "\u2237",
        colon: ":",
        Colone: "\u2A74",
        colone: "\u2254",
        coloneq: "\u2254",
        comma: ",",
        commat: "@",
        comp: "\u2201",
        compfn: "\u2218",
        complement: "\u2201",
        complexes: "\u2102",
        cong: "\u2245",
        congdot: "\u2A6D",
        Congruent: "\u2261",
        Conint: "\u222F",
        conint: "\u222E",
        ContourIntegral: "\u222E",
        Copf: "\u2102",
        copf: "\u{1D554}",
        coprod: "\u2210",
        Coproduct: "\u2210",
        COPY: "\xA9",
        copy: "\xA9",
        copysr: "\u2117",
        CounterClockwiseContourIntegral: "\u2233",
        crarr: "\u21B5",
        Cross: "\u2A2F",
        cross: "\u2717",
        Cscr: "\u{1D49E}",
        cscr: "\u{1D4B8}",
        csub: "\u2ACF",
        csube: "\u2AD1",
        csup: "\u2AD0",
        csupe: "\u2AD2",
        ctdot: "\u22EF",
        cudarrl: "\u2938",
        cudarrr: "\u2935",
        cuepr: "\u22DE",
        cuesc: "\u22DF",
        cularr: "\u21B6",
        cularrp: "\u293D",
        Cup: "\u22D3",
        cup: "\u222A",
        cupbrcap: "\u2A48",
        CupCap: "\u224D",
        cupcap: "\u2A46",
        cupcup: "\u2A4A",
        cupdot: "\u228D",
        cupor: "\u2A45",
        cups: "\u222A\uFE00",
        curarr: "\u21B7",
        curarrm: "\u293C",
        curlyeqprec: "\u22DE",
        curlyeqsucc: "\u22DF",
        curlyvee: "\u22CE",
        curlywedge: "\u22CF",
        curren: "\xA4",
        curvearrowleft: "\u21B6",
        curvearrowright: "\u21B7",
        cuvee: "\u22CE",
        cuwed: "\u22CF",
        cwconint: "\u2232",
        cwint: "\u2231",
        cylcty: "\u232D",
        Dagger: "\u2021",
        dagger: "\u2020",
        daleth: "\u2138",
        Darr: "\u21A1",
        dArr: "\u21D3",
        darr: "\u2193",
        dash: "\u2010",
        Dashv: "\u2AE4",
        dashv: "\u22A3",
        dbkarow: "\u290F",
        dblac: "\u02DD",
        Dcaron: "\u010E",
        dcaron: "\u010F",
        Dcy: "\u0414",
        dcy: "\u0434",
        DD: "\u2145",
        dd: "\u2146",
        ddagger: "\u2021",
        ddarr: "\u21CA",
        DDotrahd: "\u2911",
        ddotseq: "\u2A77",
        deg: "\xB0",
        Del: "\u2207",
        Delta: "\u0394",
        delta: "\u03B4",
        demptyv: "\u29B1",
        dfisht: "\u297F",
        Dfr: "\u{1D507}",
        dfr: "\u{1D521}",
        dHar: "\u2965",
        dharl: "\u21C3",
        dharr: "\u21C2",
        DiacriticalAcute: "\xB4",
        DiacriticalDot: "\u02D9",
        DiacriticalDoubleAcute: "\u02DD",
        DiacriticalGrave: "`",
        DiacriticalTilde: "\u02DC",
        diam: "\u22C4",
        Diamond: "\u22C4",
        diamond: "\u22C4",
        diamondsuit: "\u2666",
        diams: "\u2666",
        die: "\xA8",
        DifferentialD: "\u2146",
        digamma: "\u03DD",
        disin: "\u22F2",
        div: "\xF7",
        divide: "\xF7",
        divideontimes: "\u22C7",
        divonx: "\u22C7",
        DJcy: "\u0402",
        djcy: "\u0452",
        dlcorn: "\u231E",
        dlcrop: "\u230D",
        dollar: "$",
        Dopf: "\u{1D53B}",
        dopf: "\u{1D555}",
        Dot: "\xA8",
        dot: "\u02D9",
        DotDot: "\u20DC",
        doteq: "\u2250",
        doteqdot: "\u2251",
        DotEqual: "\u2250",
        dotminus: "\u2238",
        dotplus: "\u2214",
        dotsquare: "\u22A1",
        doublebarwedge: "\u2306",
        DoubleContourIntegral: "\u222F",
        DoubleDot: "\xA8",
        DoubleDownArrow: "\u21D3",
        DoubleLeftArrow: "\u21D0",
        DoubleLeftRightArrow: "\u21D4",
        DoubleLeftTee: "\u2AE4",
        DoubleLongLeftArrow: "\u27F8",
        DoubleLongLeftRightArrow: "\u27FA",
        DoubleLongRightArrow: "\u27F9",
        DoubleRightArrow: "\u21D2",
        DoubleRightTee: "\u22A8",
        DoubleUpArrow: "\u21D1",
        DoubleUpDownArrow: "\u21D5",
        DoubleVerticalBar: "\u2225",
        DownArrow: "\u2193",
        Downarrow: "\u21D3",
        downarrow: "\u2193",
        DownArrowBar: "\u2913",
        DownArrowUpArrow: "\u21F5",
        DownBreve: "\u0311",
        downdownarrows: "\u21CA",
        downharpoonleft: "\u21C3",
        downharpoonright: "\u21C2",
        DownLeftRightVector: "\u2950",
        DownLeftTeeVector: "\u295E",
        DownLeftVector: "\u21BD",
        DownLeftVectorBar: "\u2956",
        DownRightTeeVector: "\u295F",
        DownRightVector: "\u21C1",
        DownRightVectorBar: "\u2957",
        DownTee: "\u22A4",
        DownTeeArrow: "\u21A7",
        drbkarow: "\u2910",
        drcorn: "\u231F",
        drcrop: "\u230C",
        Dscr: "\u{1D49F}",
        dscr: "\u{1D4B9}",
        DScy: "\u0405",
        dscy: "\u0455",
        dsol: "\u29F6",
        Dstrok: "\u0110",
        dstrok: "\u0111",
        dtdot: "\u22F1",
        dtri: "\u25BF",
        dtrif: "\u25BE",
        duarr: "\u21F5",
        duhar: "\u296F",
        dwangle: "\u29A6",
        DZcy: "\u040F",
        dzcy: "\u045F",
        dzigrarr: "\u27FF",
        Eacute: "\xC9",
        eacute: "\xE9",
        easter: "\u2A6E",
        Ecaron: "\u011A",
        ecaron: "\u011B",
        ecir: "\u2256",
        Ecirc: "\xCA",
        ecirc: "\xEA",
        ecolon: "\u2255",
        Ecy: "\u042D",
        ecy: "\u044D",
        eDDot: "\u2A77",
        Edot: "\u0116",
        eDot: "\u2251",
        edot: "\u0117",
        ee: "\u2147",
        efDot: "\u2252",
        Efr: "\u{1D508}",
        efr: "\u{1D522}",
        eg: "\u2A9A",
        Egrave: "\xC8",
        egrave: "\xE8",
        egs: "\u2A96",
        egsdot: "\u2A98",
        el: "\u2A99",
        Element: "\u2208",
        elinters: "\u23E7",
        ell: "\u2113",
        els: "\u2A95",
        elsdot: "\u2A97",
        Emacr: "\u0112",
        emacr: "\u0113",
        empty: "\u2205",
        emptyset: "\u2205",
        EmptySmallSquare: "\u25FB",
        emptyv: "\u2205",
        EmptyVerySmallSquare: "\u25AB",
        emsp: "\u2003",
        emsp13: "\u2004",
        emsp14: "\u2005",
        ENG: "\u014A",
        eng: "\u014B",
        ensp: "\u2002",
        Eogon: "\u0118",
        eogon: "\u0119",
        Eopf: "\u{1D53C}",
        eopf: "\u{1D556}",
        epar: "\u22D5",
        eparsl: "\u29E3",
        eplus: "\u2A71",
        epsi: "\u03B5",
        Epsilon: "\u0395",
        epsilon: "\u03B5",
        epsiv: "\u03F5",
        eqcirc: "\u2256",
        eqcolon: "\u2255",
        eqsim: "\u2242",
        eqslantgtr: "\u2A96",
        eqslantless: "\u2A95",
        Equal: "\u2A75",
        equals: "=",
        EqualTilde: "\u2242",
        equest: "\u225F",
        Equilibrium: "\u21CC",
        equiv: "\u2261",
        equivDD: "\u2A78",
        eqvparsl: "\u29E5",
        erarr: "\u2971",
        erDot: "\u2253",
        Escr: "\u2130",
        escr: "\u212F",
        esdot: "\u2250",
        Esim: "\u2A73",
        esim: "\u2242",
        Eta: "\u0397",
        eta: "\u03B7",
        ETH: "\xD0",
        eth: "\xF0",
        Euml: "\xCB",
        euml: "\xEB",
        euro: "\u20AC",
        excl: "!",
        exist: "\u2203",
        Exists: "\u2203",
        expectation: "\u2130",
        ExponentialE: "\u2147",
        exponentiale: "\u2147",
        fallingdotseq: "\u2252",
        Fcy: "\u0424",
        fcy: "\u0444",
        female: "\u2640",
        ffilig: "\uFB03",
        fflig: "\uFB00",
        ffllig: "\uFB04",
        Ffr: "\u{1D509}",
        ffr: "\u{1D523}",
        filig: "\uFB01",
        FilledSmallSquare: "\u25FC",
        FilledVerySmallSquare: "\u25AA",
        fjlig: "fj",
        flat: "\u266D",
        fllig: "\uFB02",
        fltns: "\u25B1",
        fnof: "\u0192",
        Fopf: "\u{1D53D}",
        fopf: "\u{1D557}",
        ForAll: "\u2200",
        forall: "\u2200",
        fork: "\u22D4",
        forkv: "\u2AD9",
        Fouriertrf: "\u2131",
        fpartint: "\u2A0D",
        frac12: "\xBD",
        frac13: "\u2153",
        frac14: "\xBC",
        frac15: "\u2155",
        frac16: "\u2159",
        frac18: "\u215B",
        frac23: "\u2154",
        frac25: "\u2156",
        frac34: "\xBE",
        frac35: "\u2157",
        frac38: "\u215C",
        frac45: "\u2158",
        frac56: "\u215A",
        frac58: "\u215D",
        frac78: "\u215E",
        frasl: "\u2044",
        frown: "\u2322",
        Fscr: "\u2131",
        fscr: "\u{1D4BB}",
        gacute: "\u01F5",
        Gamma: "\u0393",
        gamma: "\u03B3",
        Gammad: "\u03DC",
        gammad: "\u03DD",
        gap: "\u2A86",
        Gbreve: "\u011E",
        gbreve: "\u011F",
        Gcedil: "\u0122",
        Gcirc: "\u011C",
        gcirc: "\u011D",
        Gcy: "\u0413",
        gcy: "\u0433",
        Gdot: "\u0120",
        gdot: "\u0121",
        gE: "\u2267",
        ge: "\u2265",
        gEl: "\u2A8C",
        gel: "\u22DB",
        geq: "\u2265",
        geqq: "\u2267",
        geqslant: "\u2A7E",
        ges: "\u2A7E",
        gescc: "\u2AA9",
        gesdot: "\u2A80",
        gesdoto: "\u2A82",
        gesdotol: "\u2A84",
        gesl: "\u22DB\uFE00",
        gesles: "\u2A94",
        Gfr: "\u{1D50A}",
        gfr: "\u{1D524}",
        Gg: "\u22D9",
        gg: "\u226B",
        ggg: "\u22D9",
        gimel: "\u2137",
        GJcy: "\u0403",
        gjcy: "\u0453",
        gl: "\u2277",
        gla: "\u2AA5",
        glE: "\u2A92",
        glj: "\u2AA4",
        gnap: "\u2A8A",
        gnapprox: "\u2A8A",
        gnE: "\u2269",
        gne: "\u2A88",
        gneq: "\u2A88",
        gneqq: "\u2269",
        gnsim: "\u22E7",
        Gopf: "\u{1D53E}",
        gopf: "\u{1D558}",
        grave: "`",
        GreaterEqual: "\u2265",
        GreaterEqualLess: "\u22DB",
        GreaterFullEqual: "\u2267",
        GreaterGreater: "\u2AA2",
        GreaterLess: "\u2277",
        GreaterSlantEqual: "\u2A7E",
        GreaterTilde: "\u2273",
        Gscr: "\u{1D4A2}",
        gscr: "\u210A",
        gsim: "\u2273",
        gsime: "\u2A8E",
        gsiml: "\u2A90",
        Gt: "\u226B",
        GT: ">",
        gt: ">",
        gtcc: "\u2AA7",
        gtcir: "\u2A7A",
        gtdot: "\u22D7",
        gtlPar: "\u2995",
        gtquest: "\u2A7C",
        gtrapprox: "\u2A86",
        gtrarr: "\u2978",
        gtrdot: "\u22D7",
        gtreqless: "\u22DB",
        gtreqqless: "\u2A8C",
        gtrless: "\u2277",
        gtrsim: "\u2273",
        gvertneqq: "\u2269\uFE00",
        gvnE: "\u2269\uFE00",
        Hacek: "\u02C7",
        hairsp: "\u200A",
        half: "\xBD",
        hamilt: "\u210B",
        HARDcy: "\u042A",
        hardcy: "\u044A",
        hArr: "\u21D4",
        harr: "\u2194",
        harrcir: "\u2948",
        harrw: "\u21AD",
        Hat: "^",
        hbar: "\u210F",
        Hcirc: "\u0124",
        hcirc: "\u0125",
        hearts: "\u2665",
        heartsuit: "\u2665",
        hellip: "\u2026",
        hercon: "\u22B9",
        Hfr: "\u210C",
        hfr: "\u{1D525}",
        HilbertSpace: "\u210B",
        hksearow: "\u2925",
        hkswarow: "\u2926",
        hoarr: "\u21FF",
        homtht: "\u223B",
        hookleftarrow: "\u21A9",
        hookrightarrow: "\u21AA",
        Hopf: "\u210D",
        hopf: "\u{1D559}",
        horbar: "\u2015",
        HorizontalLine: "\u2500",
        Hscr: "\u210B",
        hscr: "\u{1D4BD}",
        hslash: "\u210F",
        Hstrok: "\u0126",
        hstrok: "\u0127",
        HumpDownHump: "\u224E",
        HumpEqual: "\u224F",
        hybull: "\u2043",
        hyphen: "\u2010",
        Iacute: "\xCD",
        iacute: "\xED",
        ic: "\u2063",
        Icirc: "\xCE",
        icirc: "\xEE",
        Icy: "\u0418",
        icy: "\u0438",
        Idot: "\u0130",
        IEcy: "\u0415",
        iecy: "\u0435",
        iexcl: "\xA1",
        iff: "\u21D4",
        Ifr: "\u2111",
        ifr: "\u{1D526}",
        Igrave: "\xCC",
        igrave: "\xEC",
        ii: "\u2148",
        iiiint: "\u2A0C",
        iiint: "\u222D",
        iinfin: "\u29DC",
        iiota: "\u2129",
        IJlig: "\u0132",
        ijlig: "\u0133",
        Im: "\u2111",
        Imacr: "\u012A",
        imacr: "\u012B",
        image: "\u2111",
        ImaginaryI: "\u2148",
        imagline: "\u2110",
        imagpart: "\u2111",
        imath: "\u0131",
        imof: "\u22B7",
        imped: "\u01B5",
        Implies: "\u21D2",
        in: "\u2208",
        incare: "\u2105",
        infin: "\u221E",
        infintie: "\u29DD",
        inodot: "\u0131",
        Int: "\u222C",
        int: "\u222B",
        intcal: "\u22BA",
        integers: "\u2124",
        Integral: "\u222B",
        intercal: "\u22BA",
        Intersection: "\u22C2",
        intlarhk: "\u2A17",
        intprod: "\u2A3C",
        InvisibleComma: "\u2063",
        InvisibleTimes: "\u2062",
        IOcy: "\u0401",
        iocy: "\u0451",
        Iogon: "\u012E",
        iogon: "\u012F",
        Iopf: "\u{1D540}",
        iopf: "\u{1D55A}",
        Iota: "\u0399",
        iota: "\u03B9",
        iprod: "\u2A3C",
        iquest: "\xBF",
        Iscr: "\u2110",
        iscr: "\u{1D4BE}",
        isin: "\u2208",
        isindot: "\u22F5",
        isinE: "\u22F9",
        isins: "\u22F4",
        isinsv: "\u22F3",
        isinv: "\u2208",
        it: "\u2062",
        Itilde: "\u0128",
        itilde: "\u0129",
        Iukcy: "\u0406",
        iukcy: "\u0456",
        Iuml: "\xCF",
        iuml: "\xEF",
        Jcirc: "\u0134",
        jcirc: "\u0135",
        Jcy: "\u0419",
        jcy: "\u0439",
        Jfr: "\u{1D50D}",
        jfr: "\u{1D527}",
        jmath: "\u0237",
        Jopf: "\u{1D541}",
        jopf: "\u{1D55B}",
        Jscr: "\u{1D4A5}",
        jscr: "\u{1D4BF}",
        Jsercy: "\u0408",
        jsercy: "\u0458",
        Jukcy: "\u0404",
        jukcy: "\u0454",
        Kappa: "\u039A",
        kappa: "\u03BA",
        kappav: "\u03F0",
        Kcedil: "\u0136",
        kcedil: "\u0137",
        Kcy: "\u041A",
        kcy: "\u043A",
        Kfr: "\u{1D50E}",
        kfr: "\u{1D528}",
        kgreen: "\u0138",
        KHcy: "\u0425",
        khcy: "\u0445",
        KJcy: "\u040C",
        kjcy: "\u045C",
        Kopf: "\u{1D542}",
        kopf: "\u{1D55C}",
        Kscr: "\u{1D4A6}",
        kscr: "\u{1D4C0}",
        lAarr: "\u21DA",
        Lacute: "\u0139",
        lacute: "\u013A",
        laemptyv: "\u29B4",
        lagran: "\u2112",
        Lambda: "\u039B",
        lambda: "\u03BB",
        Lang: "\u27EA",
        lang: "\u27E8",
        langd: "\u2991",
        langle: "\u27E8",
        lap: "\u2A85",
        Laplacetrf: "\u2112",
        laquo: "\xAB",
        Larr: "\u219E",
        lArr: "\u21D0",
        larr: "\u2190",
        larrb: "\u21E4",
        larrbfs: "\u291F",
        larrfs: "\u291D",
        larrhk: "\u21A9",
        larrlp: "\u21AB",
        larrpl: "\u2939",
        larrsim: "\u2973",
        larrtl: "\u21A2",
        lat: "\u2AAB",
        lAtail: "\u291B",
        latail: "\u2919",
        late: "\u2AAD",
        lates: "\u2AAD\uFE00",
        lBarr: "\u290E",
        lbarr: "\u290C",
        lbbrk: "\u2772",
        lbrace: "{",
        lbrack: "[",
        lbrke: "\u298B",
        lbrksld: "\u298F",
        lbrkslu: "\u298D",
        Lcaron: "\u013D",
        lcaron: "\u013E",
        Lcedil: "\u013B",
        lcedil: "\u013C",
        lceil: "\u2308",
        lcub: "{",
        Lcy: "\u041B",
        lcy: "\u043B",
        ldca: "\u2936",
        ldquo: "\u201C",
        ldquor: "\u201E",
        ldrdhar: "\u2967",
        ldrushar: "\u294B",
        ldsh: "\u21B2",
        lE: "\u2266",
        le: "\u2264",
        LeftAngleBracket: "\u27E8",
        LeftArrow: "\u2190",
        Leftarrow: "\u21D0",
        leftarrow: "\u2190",
        LeftArrowBar: "\u21E4",
        LeftArrowRightArrow: "\u21C6",
        leftarrowtail: "\u21A2",
        LeftCeiling: "\u2308",
        LeftDoubleBracket: "\u27E6",
        LeftDownTeeVector: "\u2961",
        LeftDownVector: "\u21C3",
        LeftDownVectorBar: "\u2959",
        LeftFloor: "\u230A",
        leftharpoondown: "\u21BD",
        leftharpoonup: "\u21BC",
        leftleftarrows: "\u21C7",
        LeftRightArrow: "\u2194",
        Leftrightarrow: "\u21D4",
        leftrightarrow: "\u2194",
        leftrightarrows: "\u21C6",
        leftrightharpoons: "\u21CB",
        leftrightsquigarrow: "\u21AD",
        LeftRightVector: "\u294E",
        LeftTee: "\u22A3",
        LeftTeeArrow: "\u21A4",
        LeftTeeVector: "\u295A",
        leftthreetimes: "\u22CB",
        LeftTriangle: "\u22B2",
        LeftTriangleBar: "\u29CF",
        LeftTriangleEqual: "\u22B4",
        LeftUpDownVector: "\u2951",
        LeftUpTeeVector: "\u2960",
        LeftUpVector: "\u21BF",
        LeftUpVectorBar: "\u2958",
        LeftVector: "\u21BC",
        LeftVectorBar: "\u2952",
        lEg: "\u2A8B",
        leg: "\u22DA",
        leq: "\u2264",
        leqq: "\u2266",
        leqslant: "\u2A7D",
        les: "\u2A7D",
        lescc: "\u2AA8",
        lesdot: "\u2A7F",
        lesdoto: "\u2A81",
        lesdotor: "\u2A83",
        lesg: "\u22DA\uFE00",
        lesges: "\u2A93",
        lessapprox: "\u2A85",
        lessdot: "\u22D6",
        lesseqgtr: "\u22DA",
        lesseqqgtr: "\u2A8B",
        LessEqualGreater: "\u22DA",
        LessFullEqual: "\u2266",
        LessGreater: "\u2276",
        lessgtr: "\u2276",
        LessLess: "\u2AA1",
        lesssim: "\u2272",
        LessSlantEqual: "\u2A7D",
        LessTilde: "\u2272",
        lfisht: "\u297C",
        lfloor: "\u230A",
        Lfr: "\u{1D50F}",
        lfr: "\u{1D529}",
        lg: "\u2276",
        lgE: "\u2A91",
        lHar: "\u2962",
        lhard: "\u21BD",
        lharu: "\u21BC",
        lharul: "\u296A",
        lhblk: "\u2584",
        LJcy: "\u0409",
        ljcy: "\u0459",
        Ll: "\u22D8",
        ll: "\u226A",
        llarr: "\u21C7",
        llcorner: "\u231E",
        Lleftarrow: "\u21DA",
        llhard: "\u296B",
        lltri: "\u25FA",
        Lmidot: "\u013F",
        lmidot: "\u0140",
        lmoust: "\u23B0",
        lmoustache: "\u23B0",
        lnap: "\u2A89",
        lnapprox: "\u2A89",
        lnE: "\u2268",
        lne: "\u2A87",
        lneq: "\u2A87",
        lneqq: "\u2268",
        lnsim: "\u22E6",
        loang: "\u27EC",
        loarr: "\u21FD",
        lobrk: "\u27E6",
        LongLeftArrow: "\u27F5",
        Longleftarrow: "\u27F8",
        longleftarrow: "\u27F5",
        LongLeftRightArrow: "\u27F7",
        Longleftrightarrow: "\u27FA",
        longleftrightarrow: "\u27F7",
        longmapsto: "\u27FC",
        LongRightArrow: "\u27F6",
        Longrightarrow: "\u27F9",
        longrightarrow: "\u27F6",
        looparrowleft: "\u21AB",
        looparrowright: "\u21AC",
        lopar: "\u2985",
        Lopf: "\u{1D543}",
        lopf: "\u{1D55D}",
        loplus: "\u2A2D",
        lotimes: "\u2A34",
        lowast: "\u2217",
        lowbar: "_",
        LowerLeftArrow: "\u2199",
        LowerRightArrow: "\u2198",
        loz: "\u25CA",
        lozenge: "\u25CA",
        lozf: "\u29EB",
        lpar: "(",
        lparlt: "\u2993",
        lrarr: "\u21C6",
        lrcorner: "\u231F",
        lrhar: "\u21CB",
        lrhard: "\u296D",
        lrm: "\u200E",
        lrtri: "\u22BF",
        lsaquo: "\u2039",
        Lscr: "\u2112",
        lscr: "\u{1D4C1}",
        Lsh: "\u21B0",
        lsh: "\u21B0",
        lsim: "\u2272",
        lsime: "\u2A8D",
        lsimg: "\u2A8F",
        lsqb: "[",
        lsquo: "\u2018",
        lsquor: "\u201A",
        Lstrok: "\u0141",
        lstrok: "\u0142",
        Lt: "\u226A",
        LT: "<",
        lt: "<",
        ltcc: "\u2AA6",
        ltcir: "\u2A79",
        ltdot: "\u22D6",
        lthree: "\u22CB",
        ltimes: "\u22C9",
        ltlarr: "\u2976",
        ltquest: "\u2A7B",
        ltri: "\u25C3",
        ltrie: "\u22B4",
        ltrif: "\u25C2",
        ltrPar: "\u2996",
        lurdshar: "\u294A",
        luruhar: "\u2966",
        lvertneqq: "\u2268\uFE00",
        lvnE: "\u2268\uFE00",
        macr: "\xAF",
        male: "\u2642",
        malt: "\u2720",
        maltese: "\u2720",
        Map: "\u2905",
        map: "\u21A6",
        mapsto: "\u21A6",
        mapstodown: "\u21A7",
        mapstoleft: "\u21A4",
        mapstoup: "\u21A5",
        marker: "\u25AE",
        mcomma: "\u2A29",
        Mcy: "\u041C",
        mcy: "\u043C",
        mdash: "\u2014",
        mDDot: "\u223A",
        measuredangle: "\u2221",
        MediumSpace: "\u205F",
        Mellintrf: "\u2133",
        Mfr: "\u{1D510}",
        mfr: "\u{1D52A}",
        mho: "\u2127",
        micro: "\xB5",
        mid: "\u2223",
        midast: "*",
        midcir: "\u2AF0",
        middot: "\xB7",
        minus: "\u2212",
        minusb: "\u229F",
        minusd: "\u2238",
        minusdu: "\u2A2A",
        MinusPlus: "\u2213",
        mlcp: "\u2ADB",
        mldr: "\u2026",
        mnplus: "\u2213",
        models: "\u22A7",
        Mopf: "\u{1D544}",
        mopf: "\u{1D55E}",
        mp: "\u2213",
        Mscr: "\u2133",
        mscr: "\u{1D4C2}",
        mstpos: "\u223E",
        Mu: "\u039C",
        mu: "\u03BC",
        multimap: "\u22B8",
        mumap: "\u22B8",
        nabla: "\u2207",
        Nacute: "\u0143",
        nacute: "\u0144",
        nang: "\u2220\u20D2",
        nap: "\u2249",
        napE: "\u2A70\u0338",
        napid: "\u224B\u0338",
        napos: "\u0149",
        napprox: "\u2249",
        natur: "\u266E",
        natural: "\u266E",
        naturals: "\u2115",
        nbsp: "\xA0",
        nbump: "\u224E\u0338",
        nbumpe: "\u224F\u0338",
        ncap: "\u2A43",
        Ncaron: "\u0147",
        ncaron: "\u0148",
        Ncedil: "\u0145",
        ncedil: "\u0146",
        ncong: "\u2247",
        ncongdot: "\u2A6D\u0338",
        ncup: "\u2A42",
        Ncy: "\u041D",
        ncy: "\u043D",
        ndash: "\u2013",
        ne: "\u2260",
        nearhk: "\u2924",
        neArr: "\u21D7",
        nearr: "\u2197",
        nearrow: "\u2197",
        nedot: "\u2250\u0338",
        NegativeMediumSpace: "\u200B",
        NegativeThickSpace: "\u200B",
        NegativeThinSpace: "\u200B",
        NegativeVeryThinSpace: "\u200B",
        nequiv: "\u2262",
        nesear: "\u2928",
        nesim: "\u2242\u0338",
        NestedGreaterGreater: "\u226B",
        NestedLessLess: "\u226A",
        NewLine: "\n",
        nexist: "\u2204",
        nexists: "\u2204",
        Nfr: "\u{1D511}",
        nfr: "\u{1D52B}",
        ngE: "\u2267\u0338",
        nge: "\u2271",
        ngeq: "\u2271",
        ngeqq: "\u2267\u0338",
        ngeqslant: "\u2A7E\u0338",
        nges: "\u2A7E\u0338",
        nGg: "\u22D9\u0338",
        ngsim: "\u2275",
        nGt: "\u226B\u20D2",
        ngt: "\u226F",
        ngtr: "\u226F",
        nGtv: "\u226B\u0338",
        nhArr: "\u21CE",
        nharr: "\u21AE",
        nhpar: "\u2AF2",
        ni: "\u220B",
        nis: "\u22FC",
        nisd: "\u22FA",
        niv: "\u220B",
        NJcy: "\u040A",
        njcy: "\u045A",
        nlArr: "\u21CD",
        nlarr: "\u219A",
        nldr: "\u2025",
        nlE: "\u2266\u0338",
        nle: "\u2270",
        nLeftarrow: "\u21CD",
        nleftarrow: "\u219A",
        nLeftrightarrow: "\u21CE",
        nleftrightarrow: "\u21AE",
        nleq: "\u2270",
        nleqq: "\u2266\u0338",
        nleqslant: "\u2A7D\u0338",
        nles: "\u2A7D\u0338",
        nless: "\u226E",
        nLl: "\u22D8\u0338",
        nlsim: "\u2274",
        nLt: "\u226A\u20D2",
        nlt: "\u226E",
        nltri: "\u22EA",
        nltrie: "\u22EC",
        nLtv: "\u226A\u0338",
        nmid: "\u2224",
        NoBreak: "\u2060",
        NonBreakingSpace: "\xA0",
        Nopf: "\u2115",
        nopf: "\u{1D55F}",
        Not: "\u2AEC",
        not: "\xAC",
        NotCongruent: "\u2262",
        NotCupCap: "\u226D",
        NotDoubleVerticalBar: "\u2226",
        NotElement: "\u2209",
        NotEqual: "\u2260",
        NotEqualTilde: "\u2242\u0338",
        NotExists: "\u2204",
        NotGreater: "\u226F",
        NotGreaterEqual: "\u2271",
        NotGreaterFullEqual: "\u2267\u0338",
        NotGreaterGreater: "\u226B\u0338",
        NotGreaterLess: "\u2279",
        NotGreaterSlantEqual: "\u2A7E\u0338",
        NotGreaterTilde: "\u2275",
        NotHumpDownHump: "\u224E\u0338",
        NotHumpEqual: "\u224F\u0338",
        notin: "\u2209",
        notindot: "\u22F5\u0338",
        notinE: "\u22F9\u0338",
        notinva: "\u2209",
        notinvb: "\u22F7",
        notinvc: "\u22F6",
        NotLeftTriangle: "\u22EA",
        NotLeftTriangleBar: "\u29CF\u0338",
        NotLeftTriangleEqual: "\u22EC",
        NotLess: "\u226E",
        NotLessEqual: "\u2270",
        NotLessGreater: "\u2278",
        NotLessLess: "\u226A\u0338",
        NotLessSlantEqual: "\u2A7D\u0338",
        NotLessTilde: "\u2274",
        NotNestedGreaterGreater: "\u2AA2\u0338",
        NotNestedLessLess: "\u2AA1\u0338",
        notni: "\u220C",
        notniva: "\u220C",
        notnivb: "\u22FE",
        notnivc: "\u22FD",
        NotPrecedes: "\u2280",
        NotPrecedesEqual: "\u2AAF\u0338",
        NotPrecedesSlantEqual: "\u22E0",
        NotReverseElement: "\u220C",
        NotRightTriangle: "\u22EB",
        NotRightTriangleBar: "\u29D0\u0338",
        NotRightTriangleEqual: "\u22ED",
        NotSquareSubset: "\u228F\u0338",
        NotSquareSubsetEqual: "\u22E2",
        NotSquareSuperset: "\u2290\u0338",
        NotSquareSupersetEqual: "\u22E3",
        NotSubset: "\u2282\u20D2",
        NotSubsetEqual: "\u2288",
        NotSucceeds: "\u2281",
        NotSucceedsEqual: "\u2AB0\u0338",
        NotSucceedsSlantEqual: "\u22E1",
        NotSucceedsTilde: "\u227F\u0338",
        NotSuperset: "\u2283\u20D2",
        NotSupersetEqual: "\u2289",
        NotTilde: "\u2241",
        NotTildeEqual: "\u2244",
        NotTildeFullEqual: "\u2247",
        NotTildeTilde: "\u2249",
        NotVerticalBar: "\u2224",
        npar: "\u2226",
        nparallel: "\u2226",
        nparsl: "\u2AFD\u20E5",
        npart: "\u2202\u0338",
        npolint: "\u2A14",
        npr: "\u2280",
        nprcue: "\u22E0",
        npre: "\u2AAF\u0338",
        nprec: "\u2280",
        npreceq: "\u2AAF\u0338",
        nrArr: "\u21CF",
        nrarr: "\u219B",
        nrarrc: "\u2933\u0338",
        nrarrw: "\u219D\u0338",
        nRightarrow: "\u21CF",
        nrightarrow: "\u219B",
        nrtri: "\u22EB",
        nrtrie: "\u22ED",
        nsc: "\u2281",
        nsccue: "\u22E1",
        nsce: "\u2AB0\u0338",
        Nscr: "\u{1D4A9}",
        nscr: "\u{1D4C3}",
        nshortmid: "\u2224",
        nshortparallel: "\u2226",
        nsim: "\u2241",
        nsime: "\u2244",
        nsimeq: "\u2244",
        nsmid: "\u2224",
        nspar: "\u2226",
        nsqsube: "\u22E2",
        nsqsupe: "\u22E3",
        nsub: "\u2284",
        nsubE: "\u2AC5\u0338",
        nsube: "\u2288",
        nsubset: "\u2282\u20D2",
        nsubseteq: "\u2288",
        nsubseteqq: "\u2AC5\u0338",
        nsucc: "\u2281",
        nsucceq: "\u2AB0\u0338",
        nsup: "\u2285",
        nsupE: "\u2AC6\u0338",
        nsupe: "\u2289",
        nsupset: "\u2283\u20D2",
        nsupseteq: "\u2289",
        nsupseteqq: "\u2AC6\u0338",
        ntgl: "\u2279",
        Ntilde: "\xD1",
        ntilde: "\xF1",
        ntlg: "\u2278",
        ntriangleleft: "\u22EA",
        ntrianglelefteq: "\u22EC",
        ntriangleright: "\u22EB",
        ntrianglerighteq: "\u22ED",
        Nu: "\u039D",
        nu: "\u03BD",
        num: "#",
        numero: "\u2116",
        numsp: "\u2007",
        nvap: "\u224D\u20D2",
        nVDash: "\u22AF",
        nVdash: "\u22AE",
        nvDash: "\u22AD",
        nvdash: "\u22AC",
        nvge: "\u2265\u20D2",
        nvgt: ">\u20D2",
        nvHarr: "\u2904",
        nvinfin: "\u29DE",
        nvlArr: "\u2902",
        nvle: "\u2264\u20D2",
        nvlt: "<\u20D2",
        nvltrie: "\u22B4\u20D2",
        nvrArr: "\u2903",
        nvrtrie: "\u22B5\u20D2",
        nvsim: "\u223C\u20D2",
        nwarhk: "\u2923",
        nwArr: "\u21D6",
        nwarr: "\u2196",
        nwarrow: "\u2196",
        nwnear: "\u2927",
        Oacute: "\xD3",
        oacute: "\xF3",
        oast: "\u229B",
        ocir: "\u229A",
        Ocirc: "\xD4",
        ocirc: "\xF4",
        Ocy: "\u041E",
        ocy: "\u043E",
        odash: "\u229D",
        Odblac: "\u0150",
        odblac: "\u0151",
        odiv: "\u2A38",
        odot: "\u2299",
        odsold: "\u29BC",
        OElig: "\u0152",
        oelig: "\u0153",
        ofcir: "\u29BF",
        Ofr: "\u{1D512}",
        ofr: "\u{1D52C}",
        ogon: "\u02DB",
        Ograve: "\xD2",
        ograve: "\xF2",
        ogt: "\u29C1",
        ohbar: "\u29B5",
        ohm: "\u03A9",
        oint: "\u222E",
        olarr: "\u21BA",
        olcir: "\u29BE",
        olcross: "\u29BB",
        oline: "\u203E",
        olt: "\u29C0",
        Omacr: "\u014C",
        omacr: "\u014D",
        Omega: "\u03A9",
        omega: "\u03C9",
        Omicron: "\u039F",
        omicron: "\u03BF",
        omid: "\u29B6",
        ominus: "\u2296",
        Oopf: "\u{1D546}",
        oopf: "\u{1D560}",
        opar: "\u29B7",
        OpenCurlyDoubleQuote: "\u201C",
        OpenCurlyQuote: "\u2018",
        operp: "\u29B9",
        oplus: "\u2295",
        Or: "\u2A54",
        or: "\u2228",
        orarr: "\u21BB",
        ord: "\u2A5D",
        order: "\u2134",
        orderof: "\u2134",
        ordf: "\xAA",
        ordm: "\xBA",
        origof: "\u22B6",
        oror: "\u2A56",
        orslope: "\u2A57",
        orv: "\u2A5B",
        oS: "\u24C8",
        Oscr: "\u{1D4AA}",
        oscr: "\u2134",
        Oslash: "\xD8",
        oslash: "\xF8",
        osol: "\u2298",
        Otilde: "\xD5",
        otilde: "\xF5",
        Otimes: "\u2A37",
        otimes: "\u2297",
        otimesas: "\u2A36",
        Ouml: "\xD6",
        ouml: "\xF6",
        ovbar: "\u233D",
        OverBar: "\u203E",
        OverBrace: "\u23DE",
        OverBracket: "\u23B4",
        OverParenthesis: "\u23DC",
        par: "\u2225",
        para: "\xB6",
        parallel: "\u2225",
        parsim: "\u2AF3",
        parsl: "\u2AFD",
        part: "\u2202",
        PartialD: "\u2202",
        Pcy: "\u041F",
        pcy: "\u043F",
        percnt: "%",
        period: ".",
        permil: "\u2030",
        perp: "\u22A5",
        pertenk: "\u2031",
        Pfr: "\u{1D513}",
        pfr: "\u{1D52D}",
        Phi: "\u03A6",
        phi: "\u03C6",
        phiv: "\u03D5",
        phmmat: "\u2133",
        phone: "\u260E",
        Pi: "\u03A0",
        pi: "\u03C0",
        pitchfork: "\u22D4",
        piv: "\u03D6",
        planck: "\u210F",
        planckh: "\u210E",
        plankv: "\u210F",
        plus: "+",
        plusacir: "\u2A23",
        plusb: "\u229E",
        pluscir: "\u2A22",
        plusdo: "\u2214",
        plusdu: "\u2A25",
        pluse: "\u2A72",
        PlusMinus: "\xB1",
        plusmn: "\xB1",
        plussim: "\u2A26",
        plustwo: "\u2A27",
        pm: "\xB1",
        Poincareplane: "\u210C",
        pointint: "\u2A15",
        Popf: "\u2119",
        popf: "\u{1D561}",
        pound: "\xA3",
        Pr: "\u2ABB",
        pr: "\u227A",
        prap: "\u2AB7",
        prcue: "\u227C",
        prE: "\u2AB3",
        pre: "\u2AAF",
        prec: "\u227A",
        precapprox: "\u2AB7",
        preccurlyeq: "\u227C",
        Precedes: "\u227A",
        PrecedesEqual: "\u2AAF",
        PrecedesSlantEqual: "\u227C",
        PrecedesTilde: "\u227E",
        preceq: "\u2AAF",
        precnapprox: "\u2AB9",
        precneqq: "\u2AB5",
        precnsim: "\u22E8",
        precsim: "\u227E",
        Prime: "\u2033",
        prime: "\u2032",
        primes: "\u2119",
        prnap: "\u2AB9",
        prnE: "\u2AB5",
        prnsim: "\u22E8",
        prod: "\u220F",
        Product: "\u220F",
        profalar: "\u232E",
        profline: "\u2312",
        profsurf: "\u2313",
        prop: "\u221D",
        Proportion: "\u2237",
        Proportional: "\u221D",
        propto: "\u221D",
        prsim: "\u227E",
        prurel: "\u22B0",
        Pscr: "\u{1D4AB}",
        pscr: "\u{1D4C5}",
        Psi: "\u03A8",
        psi: "\u03C8",
        puncsp: "\u2008",
        Qfr: "\u{1D514}",
        qfr: "\u{1D52E}",
        qint: "\u2A0C",
        Qopf: "\u211A",
        qopf: "\u{1D562}",
        qprime: "\u2057",
        Qscr: "\u{1D4AC}",
        qscr: "\u{1D4C6}",
        quaternions: "\u210D",
        quatint: "\u2A16",
        quest: "?",
        questeq: "\u225F",
        QUOT: '"',
        quot: '"',
        rAarr: "\u21DB",
        race: "\u223D\u0331",
        Racute: "\u0154",
        racute: "\u0155",
        radic: "\u221A",
        raemptyv: "\u29B3",
        Rang: "\u27EB",
        rang: "\u27E9",
        rangd: "\u2992",
        range: "\u29A5",
        rangle: "\u27E9",
        raquo: "\xBB",
        Rarr: "\u21A0",
        rArr: "\u21D2",
        rarr: "\u2192",
        rarrap: "\u2975",
        rarrb: "\u21E5",
        rarrbfs: "\u2920",
        rarrc: "\u2933",
        rarrfs: "\u291E",
        rarrhk: "\u21AA",
        rarrlp: "\u21AC",
        rarrpl: "\u2945",
        rarrsim: "\u2974",
        Rarrtl: "\u2916",
        rarrtl: "\u21A3",
        rarrw: "\u219D",
        rAtail: "\u291C",
        ratail: "\u291A",
        ratio: "\u2236",
        rationals: "\u211A",
        RBarr: "\u2910",
        rBarr: "\u290F",
        rbarr: "\u290D",
        rbbrk: "\u2773",
        rbrace: "}",
        rbrack: "]",
        rbrke: "\u298C",
        rbrksld: "\u298E",
        rbrkslu: "\u2990",
        Rcaron: "\u0158",
        rcaron: "\u0159",
        Rcedil: "\u0156",
        rcedil: "\u0157",
        rceil: "\u2309",
        rcub: "}",
        Rcy: "\u0420",
        rcy: "\u0440",
        rdca: "\u2937",
        rdldhar: "\u2969",
        rdquo: "\u201D",
        rdquor: "\u201D",
        rdsh: "\u21B3",
        Re: "\u211C",
        real: "\u211C",
        realine: "\u211B",
        realpart: "\u211C",
        reals: "\u211D",
        rect: "\u25AD",
        REG: "\xAE",
        reg: "\xAE",
        ReverseElement: "\u220B",
        ReverseEquilibrium: "\u21CB",
        ReverseUpEquilibrium: "\u296F",
        rfisht: "\u297D",
        rfloor: "\u230B",
        Rfr: "\u211C",
        rfr: "\u{1D52F}",
        rHar: "\u2964",
        rhard: "\u21C1",
        rharu: "\u21C0",
        rharul: "\u296C",
        Rho: "\u03A1",
        rho: "\u03C1",
        rhov: "\u03F1",
        RightAngleBracket: "\u27E9",
        RightArrow: "\u2192",
        Rightarrow: "\u21D2",
        rightarrow: "\u2192",
        RightArrowBar: "\u21E5",
        RightArrowLeftArrow: "\u21C4",
        rightarrowtail: "\u21A3",
        RightCeiling: "\u2309",
        RightDoubleBracket: "\u27E7",
        RightDownTeeVector: "\u295D",
        RightDownVector: "\u21C2",
        RightDownVectorBar: "\u2955",
        RightFloor: "\u230B",
        rightharpoondown: "\u21C1",
        rightharpoonup: "\u21C0",
        rightleftarrows: "\u21C4",
        rightleftharpoons: "\u21CC",
        rightrightarrows: "\u21C9",
        rightsquigarrow: "\u219D",
        RightTee: "\u22A2",
        RightTeeArrow: "\u21A6",
        RightTeeVector: "\u295B",
        rightthreetimes: "\u22CC",
        RightTriangle: "\u22B3",
        RightTriangleBar: "\u29D0",
        RightTriangleEqual: "\u22B5",
        RightUpDownVector: "\u294F",
        RightUpTeeVector: "\u295C",
        RightUpVector: "\u21BE",
        RightUpVectorBar: "\u2954",
        RightVector: "\u21C0",
        RightVectorBar: "\u2953",
        ring: "\u02DA",
        risingdotseq: "\u2253",
        rlarr: "\u21C4",
        rlhar: "\u21CC",
        rlm: "\u200F",
        rmoust: "\u23B1",
        rmoustache: "\u23B1",
        rnmid: "\u2AEE",
        roang: "\u27ED",
        roarr: "\u21FE",
        robrk: "\u27E7",
        ropar: "\u2986",
        Ropf: "\u211D",
        ropf: "\u{1D563}",
        roplus: "\u2A2E",
        rotimes: "\u2A35",
        RoundImplies: "\u2970",
        rpar: ")",
        rpargt: "\u2994",
        rppolint: "\u2A12",
        rrarr: "\u21C9",
        Rrightarrow: "\u21DB",
        rsaquo: "\u203A",
        Rscr: "\u211B",
        rscr: "\u{1D4C7}",
        Rsh: "\u21B1",
        rsh: "\u21B1",
        rsqb: "]",
        rsquo: "\u2019",
        rsquor: "\u2019",
        rthree: "\u22CC",
        rtimes: "\u22CA",
        rtri: "\u25B9",
        rtrie: "\u22B5",
        rtrif: "\u25B8",
        rtriltri: "\u29CE",
        RuleDelayed: "\u29F4",
        ruluhar: "\u2968",
        rx: "\u211E",
        Sacute: "\u015A",
        sacute: "\u015B",
        sbquo: "\u201A",
        Sc: "\u2ABC",
        sc: "\u227B",
        scap: "\u2AB8",
        Scaron: "\u0160",
        scaron: "\u0161",
        sccue: "\u227D",
        scE: "\u2AB4",
        sce: "\u2AB0",
        Scedil: "\u015E",
        scedil: "\u015F",
        Scirc: "\u015C",
        scirc: "\u015D",
        scnap: "\u2ABA",
        scnE: "\u2AB6",
        scnsim: "\u22E9",
        scpolint: "\u2A13",
        scsim: "\u227F",
        Scy: "\u0421",
        scy: "\u0441",
        sdot: "\u22C5",
        sdotb: "\u22A1",
        sdote: "\u2A66",
        searhk: "\u2925",
        seArr: "\u21D8",
        searr: "\u2198",
        searrow: "\u2198",
        sect: "\xA7",
        semi: ";",
        seswar: "\u2929",
        setminus: "\u2216",
        setmn: "\u2216",
        sext: "\u2736",
        Sfr: "\u{1D516}",
        sfr: "\u{1D530}",
        sfrown: "\u2322",
        sharp: "\u266F",
        SHCHcy: "\u0429",
        shchcy: "\u0449",
        SHcy: "\u0428",
        shcy: "\u0448",
        ShortDownArrow: "\u2193",
        ShortLeftArrow: "\u2190",
        shortmid: "\u2223",
        shortparallel: "\u2225",
        ShortRightArrow: "\u2192",
        ShortUpArrow: "\u2191",
        shy: "\xAD",
        Sigma: "\u03A3",
        sigma: "\u03C3",
        sigmaf: "\u03C2",
        sigmav: "\u03C2",
        sim: "\u223C",
        simdot: "\u2A6A",
        sime: "\u2243",
        simeq: "\u2243",
        simg: "\u2A9E",
        simgE: "\u2AA0",
        siml: "\u2A9D",
        simlE: "\u2A9F",
        simne: "\u2246",
        simplus: "\u2A24",
        simrarr: "\u2972",
        slarr: "\u2190",
        SmallCircle: "\u2218",
        smallsetminus: "\u2216",
        smashp: "\u2A33",
        smeparsl: "\u29E4",
        smid: "\u2223",
        smile: "\u2323",
        smt: "\u2AAA",
        smte: "\u2AAC",
        smtes: "\u2AAC\uFE00",
        SOFTcy: "\u042C",
        softcy: "\u044C",
        sol: "/",
        solb: "\u29C4",
        solbar: "\u233F",
        Sopf: "\u{1D54A}",
        sopf: "\u{1D564}",
        spades: "\u2660",
        spadesuit: "\u2660",
        spar: "\u2225",
        sqcap: "\u2293",
        sqcaps: "\u2293\uFE00",
        sqcup: "\u2294",
        sqcups: "\u2294\uFE00",
        Sqrt: "\u221A",
        sqsub: "\u228F",
        sqsube: "\u2291",
        sqsubset: "\u228F",
        sqsubseteq: "\u2291",
        sqsup: "\u2290",
        sqsupe: "\u2292",
        sqsupset: "\u2290",
        sqsupseteq: "\u2292",
        squ: "\u25A1",
        Square: "\u25A1",
        square: "\u25A1",
        SquareIntersection: "\u2293",
        SquareSubset: "\u228F",
        SquareSubsetEqual: "\u2291",
        SquareSuperset: "\u2290",
        SquareSupersetEqual: "\u2292",
        SquareUnion: "\u2294",
        squarf: "\u25AA",
        squf: "\u25AA",
        srarr: "\u2192",
        Sscr: "\u{1D4AE}",
        sscr: "\u{1D4C8}",
        ssetmn: "\u2216",
        ssmile: "\u2323",
        sstarf: "\u22C6",
        Star: "\u22C6",
        star: "\u2606",
        starf: "\u2605",
        straightepsilon: "\u03F5",
        straightphi: "\u03D5",
        strns: "\xAF",
        Sub: "\u22D0",
        sub: "\u2282",
        subdot: "\u2ABD",
        subE: "\u2AC5",
        sube: "\u2286",
        subedot: "\u2AC3",
        submult: "\u2AC1",
        subnE: "\u2ACB",
        subne: "\u228A",
        subplus: "\u2ABF",
        subrarr: "\u2979",
        Subset: "\u22D0",
        subset: "\u2282",
        subseteq: "\u2286",
        subseteqq: "\u2AC5",
        SubsetEqual: "\u2286",
        subsetneq: "\u228A",
        subsetneqq: "\u2ACB",
        subsim: "\u2AC7",
        subsub: "\u2AD5",
        subsup: "\u2AD3",
        succ: "\u227B",
        succapprox: "\u2AB8",
        succcurlyeq: "\u227D",
        Succeeds: "\u227B",
        SucceedsEqual: "\u2AB0",
        SucceedsSlantEqual: "\u227D",
        SucceedsTilde: "\u227F",
        succeq: "\u2AB0",
        succnapprox: "\u2ABA",
        succneqq: "\u2AB6",
        succnsim: "\u22E9",
        succsim: "\u227F",
        SuchThat: "\u220B",
        Sum: "\u2211",
        sum: "\u2211",
        sung: "\u266A",
        Sup: "\u22D1",
        sup: "\u2283",
        sup1: "\xB9",
        sup2: "\xB2",
        sup3: "\xB3",
        supdot: "\u2ABE",
        supdsub: "\u2AD8",
        supE: "\u2AC6",
        supe: "\u2287",
        supedot: "\u2AC4",
        Superset: "\u2283",
        SupersetEqual: "\u2287",
        suphsol: "\u27C9",
        suphsub: "\u2AD7",
        suplarr: "\u297B",
        supmult: "\u2AC2",
        supnE: "\u2ACC",
        supne: "\u228B",
        supplus: "\u2AC0",
        Supset: "\u22D1",
        supset: "\u2283",
        supseteq: "\u2287",
        supseteqq: "\u2AC6",
        supsetneq: "\u228B",
        supsetneqq: "\u2ACC",
        supsim: "\u2AC8",
        supsub: "\u2AD4",
        supsup: "\u2AD6",
        swarhk: "\u2926",
        swArr: "\u21D9",
        swarr: "\u2199",
        swarrow: "\u2199",
        swnwar: "\u292A",
        szlig: "\xDF",
        Tab: "	",
        target: "\u2316",
        Tau: "\u03A4",
        tau: "\u03C4",
        tbrk: "\u23B4",
        Tcaron: "\u0164",
        tcaron: "\u0165",
        Tcedil: "\u0162",
        tcedil: "\u0163",
        Tcy: "\u0422",
        tcy: "\u0442",
        tdot: "\u20DB",
        telrec: "\u2315",
        Tfr: "\u{1D517}",
        tfr: "\u{1D531}",
        there4: "\u2234",
        Therefore: "\u2234",
        therefore: "\u2234",
        Theta: "\u0398",
        theta: "\u03B8",
        thetasym: "\u03D1",
        thetav: "\u03D1",
        thickapprox: "\u2248",
        thicksim: "\u223C",
        ThickSpace: "\u205F\u200A",
        thinsp: "\u2009",
        ThinSpace: "\u2009",
        thkap: "\u2248",
        thksim: "\u223C",
        THORN: "\xDE",
        thorn: "\xFE",
        Tilde: "\u223C",
        tilde: "\u02DC",
        TildeEqual: "\u2243",
        TildeFullEqual: "\u2245",
        TildeTilde: "\u2248",
        times: "\xD7",
        timesb: "\u22A0",
        timesbar: "\u2A31",
        timesd: "\u2A30",
        tint: "\u222D",
        toea: "\u2928",
        top: "\u22A4",
        topbot: "\u2336",
        topcir: "\u2AF1",
        Topf: "\u{1D54B}",
        topf: "\u{1D565}",
        topfork: "\u2ADA",
        tosa: "\u2929",
        tprime: "\u2034",
        TRADE: "\u2122",
        trade: "\u2122",
        triangle: "\u25B5",
        triangledown: "\u25BF",
        triangleleft: "\u25C3",
        trianglelefteq: "\u22B4",
        triangleq: "\u225C",
        triangleright: "\u25B9",
        trianglerighteq: "\u22B5",
        tridot: "\u25EC",
        trie: "\u225C",
        triminus: "\u2A3A",
        TripleDot: "\u20DB",
        triplus: "\u2A39",
        trisb: "\u29CD",
        tritime: "\u2A3B",
        trpezium: "\u23E2",
        Tscr: "\u{1D4AF}",
        tscr: "\u{1D4C9}",
        TScy: "\u0426",
        tscy: "\u0446",
        TSHcy: "\u040B",
        tshcy: "\u045B",
        Tstrok: "\u0166",
        tstrok: "\u0167",
        twixt: "\u226C",
        twoheadleftarrow: "\u219E",
        twoheadrightarrow: "\u21A0",
        Uacute: "\xDA",
        uacute: "\xFA",
        Uarr: "\u219F",
        uArr: "\u21D1",
        uarr: "\u2191",
        Uarrocir: "\u2949",
        Ubrcy: "\u040E",
        ubrcy: "\u045E",
        Ubreve: "\u016C",
        ubreve: "\u016D",
        Ucirc: "\xDB",
        ucirc: "\xFB",
        Ucy: "\u0423",
        ucy: "\u0443",
        udarr: "\u21C5",
        Udblac: "\u0170",
        udblac: "\u0171",
        udhar: "\u296E",
        ufisht: "\u297E",
        Ufr: "\u{1D518}",
        ufr: "\u{1D532}",
        Ugrave: "\xD9",
        ugrave: "\xF9",
        uHar: "\u2963",
        uharl: "\u21BF",
        uharr: "\u21BE",
        uhblk: "\u2580",
        ulcorn: "\u231C",
        ulcorner: "\u231C",
        ulcrop: "\u230F",
        ultri: "\u25F8",
        Umacr: "\u016A",
        umacr: "\u016B",
        uml: "\xA8",
        UnderBar: "_",
        UnderBrace: "\u23DF",
        UnderBracket: "\u23B5",
        UnderParenthesis: "\u23DD",
        Union: "\u22C3",
        UnionPlus: "\u228E",
        Uogon: "\u0172",
        uogon: "\u0173",
        Uopf: "\u{1D54C}",
        uopf: "\u{1D566}",
        UpArrow: "\u2191",
        Uparrow: "\u21D1",
        uparrow: "\u2191",
        UpArrowBar: "\u2912",
        UpArrowDownArrow: "\u21C5",
        UpDownArrow: "\u2195",
        Updownarrow: "\u21D5",
        updownarrow: "\u2195",
        UpEquilibrium: "\u296E",
        upharpoonleft: "\u21BF",
        upharpoonright: "\u21BE",
        uplus: "\u228E",
        UpperLeftArrow: "\u2196",
        UpperRightArrow: "\u2197",
        Upsi: "\u03D2",
        upsi: "\u03C5",
        upsih: "\u03D2",
        Upsilon: "\u03A5",
        upsilon: "\u03C5",
        UpTee: "\u22A5",
        UpTeeArrow: "\u21A5",
        upuparrows: "\u21C8",
        urcorn: "\u231D",
        urcorner: "\u231D",
        urcrop: "\u230E",
        Uring: "\u016E",
        uring: "\u016F",
        urtri: "\u25F9",
        Uscr: "\u{1D4B0}",
        uscr: "\u{1D4CA}",
        utdot: "\u22F0",
        Utilde: "\u0168",
        utilde: "\u0169",
        utri: "\u25B5",
        utrif: "\u25B4",
        uuarr: "\u21C8",
        Uuml: "\xDC",
        uuml: "\xFC",
        uwangle: "\u29A7",
        vangrt: "\u299C",
        varepsilon: "\u03F5",
        varkappa: "\u03F0",
        varnothing: "\u2205",
        varphi: "\u03D5",
        varpi: "\u03D6",
        varpropto: "\u221D",
        vArr: "\u21D5",
        varr: "\u2195",
        varrho: "\u03F1",
        varsigma: "\u03C2",
        varsubsetneq: "\u228A\uFE00",
        varsubsetneqq: "\u2ACB\uFE00",
        varsupsetneq: "\u228B\uFE00",
        varsupsetneqq: "\u2ACC\uFE00",
        vartheta: "\u03D1",
        vartriangleleft: "\u22B2",
        vartriangleright: "\u22B3",
        Vbar: "\u2AEB",
        vBar: "\u2AE8",
        vBarv: "\u2AE9",
        Vcy: "\u0412",
        vcy: "\u0432",
        VDash: "\u22AB",
        Vdash: "\u22A9",
        vDash: "\u22A8",
        vdash: "\u22A2",
        Vdashl: "\u2AE6",
        Vee: "\u22C1",
        vee: "\u2228",
        veebar: "\u22BB",
        veeeq: "\u225A",
        vellip: "\u22EE",
        Verbar: "\u2016",
        verbar: "|",
        Vert: "\u2016",
        vert: "|",
        VerticalBar: "\u2223",
        VerticalLine: "|",
        VerticalSeparator: "\u2758",
        VerticalTilde: "\u2240",
        VeryThinSpace: "\u200A",
        Vfr: "\u{1D519}",
        vfr: "\u{1D533}",
        vltri: "\u22B2",
        vnsub: "\u2282\u20D2",
        vnsup: "\u2283\u20D2",
        Vopf: "\u{1D54D}",
        vopf: "\u{1D567}",
        vprop: "\u221D",
        vrtri: "\u22B3",
        Vscr: "\u{1D4B1}",
        vscr: "\u{1D4CB}",
        vsubnE: "\u2ACB\uFE00",
        vsubne: "\u228A\uFE00",
        vsupnE: "\u2ACC\uFE00",
        vsupne: "\u228B\uFE00",
        Vvdash: "\u22AA",
        vzigzag: "\u299A",
        Wcirc: "\u0174",
        wcirc: "\u0175",
        wedbar: "\u2A5F",
        Wedge: "\u22C0",
        wedge: "\u2227",
        wedgeq: "\u2259",
        weierp: "\u2118",
        Wfr: "\u{1D51A}",
        wfr: "\u{1D534}",
        Wopf: "\u{1D54E}",
        wopf: "\u{1D568}",
        wp: "\u2118",
        wr: "\u2240",
        wreath: "\u2240",
        Wscr: "\u{1D4B2}",
        wscr: "\u{1D4CC}",
        xcap: "\u22C2",
        xcirc: "\u25EF",
        xcup: "\u22C3",
        xdtri: "\u25BD",
        Xfr: "\u{1D51B}",
        xfr: "\u{1D535}",
        xhArr: "\u27FA",
        xharr: "\u27F7",
        Xi: "\u039E",
        xi: "\u03BE",
        xlArr: "\u27F8",
        xlarr: "\u27F5",
        xmap: "\u27FC",
        xnis: "\u22FB",
        xodot: "\u2A00",
        Xopf: "\u{1D54F}",
        xopf: "\u{1D569}",
        xoplus: "\u2A01",
        xotime: "\u2A02",
        xrArr: "\u27F9",
        xrarr: "\u27F6",
        Xscr: "\u{1D4B3}",
        xscr: "\u{1D4CD}",
        xsqcup: "\u2A06",
        xuplus: "\u2A04",
        xutri: "\u25B3",
        xvee: "\u22C1",
        xwedge: "\u22C0",
        Yacute: "\xDD",
        yacute: "\xFD",
        YAcy: "\u042F",
        yacy: "\u044F",
        Ycirc: "\u0176",
        ycirc: "\u0177",
        Ycy: "\u042B",
        ycy: "\u044B",
        yen: "\xA5",
        Yfr: "\u{1D51C}",
        yfr: "\u{1D536}",
        YIcy: "\u0407",
        yicy: "\u0457",
        Yopf: "\u{1D550}",
        yopf: "\u{1D56A}",
        Yscr: "\u{1D4B4}",
        yscr: "\u{1D4CE}",
        YUcy: "\u042E",
        yucy: "\u044E",
        Yuml: "\u0178",
        yuml: "\xFF",
        Zacute: "\u0179",
        zacute: "\u017A",
        Zcaron: "\u017D",
        zcaron: "\u017E",
        Zcy: "\u0417",
        zcy: "\u0437",
        Zdot: "\u017B",
        zdot: "\u017C",
        zeetrf: "\u2128",
        ZeroWidthSpace: "\u200B",
        Zeta: "\u0396",
        zeta: "\u03B6",
        Zfr: "\u2128",
        zfr: "\u{1D537}",
        ZHcy: "\u0416",
        zhcy: "\u0436",
        zigrarr: "\u21DD",
        Zopf: "\u2124",
        zopf: "\u{1D56B}",
        Zscr: "\u{1D4B5}",
        zscr: "\u{1D4CF}",
        zwj: "\u200D",
        zwnj: "\u200C"
      });
      exports.entityMap = exports.HTML_ENTITIES;
    }
  });

  // node_modules/@xmldom/xmldom/lib/sax.js
  var require_sax = __commonJS({
    "node_modules/@xmldom/xmldom/lib/sax.js"(exports) {
      "use strict";
      var conventions = require_conventions();
      var g = require_grammar();
      var errors = require_errors();
      var isHTMLEscapableRawTextElement = conventions.isHTMLEscapableRawTextElement;
      var isHTMLMimeType = conventions.isHTMLMimeType;
      var isHTMLRawTextElement = conventions.isHTMLRawTextElement;
      var hasOwn = conventions.hasOwn;
      var NAMESPACE = conventions.NAMESPACE;
      var ParseError = errors.ParseError;
      var DOMException = errors.DOMException;
      var S_TAG = 0;
      var S_ATTR = 1;
      var S_ATTR_SPACE = 2;
      var S_EQ = 3;
      var S_ATTR_NOQUOT_VALUE = 4;
      var S_ATTR_END = 5;
      var S_TAG_SPACE = 6;
      var S_TAG_CLOSE = 7;
      function XMLReader() {
      }
      XMLReader.prototype = {
        parse: function(source, defaultNSMap, entityMap) {
          var domBuilder = this.domBuilder;
          domBuilder.startDocument();
          _copy(defaultNSMap, defaultNSMap = /* @__PURE__ */ Object.create(null));
          parse(source, defaultNSMap, entityMap, domBuilder, this.errorHandler);
          domBuilder.endDocument();
        }
      };
      var ENTITY_REG = /&#?\w+;?/g;
      function parse(source, defaultNSMapCopy, entityMap, domBuilder, errorHandler) {
        var isHTML = isHTMLMimeType(domBuilder.mimeType);
        if (source.indexOf(g.UNICODE_REPLACEMENT_CHARACTER) >= 0) {
          errorHandler.warning("Unicode replacement character detected, source encoding issues?");
        }
        function fixedFromCharCode(code) {
          if (code > 65535) {
            code -= 65536;
            var surrogate1 = 55296 + (code >> 10), surrogate2 = 56320 + (code & 1023);
            return String.fromCharCode(surrogate1, surrogate2);
          } else {
            return String.fromCharCode(code);
          }
        }
        function entityReplacer(a2) {
          var complete = a2[a2.length - 1] === ";" ? a2 : a2 + ";";
          if (!isHTML && complete !== a2) {
            errorHandler.error("EntityRef: expecting ;");
            return a2;
          }
          var match = g.Reference.exec(complete);
          if (!match || match[0].length !== complete.length) {
            errorHandler.error("entity not matching Reference production: " + a2);
            return a2;
          }
          var k = complete.slice(1, -1);
          if (hasOwn(entityMap, k)) {
            return entityMap[k];
          } else if (k.charAt(0) === "#") {
            return fixedFromCharCode(parseInt(k.substring(1).replace("x", "0x")));
          } else {
            errorHandler.error("entity not found:" + a2);
            return a2;
          }
        }
        function appendText(end2) {
          if (end2 > start) {
            var xt = source.substring(start, end2).replace(ENTITY_REG, entityReplacer);
            locator && position(start);
            domBuilder.characters(xt, 0, end2 - start);
            start = end2;
          }
        }
        var lineStart = 0;
        var lineEnd = 0;
        var linePattern = /\r\n?|\n|$/g;
        var locator = domBuilder.locator;
        function position(p, m) {
          while (p >= lineEnd && (m = linePattern.exec(source))) {
            lineStart = lineEnd;
            lineEnd = m.index + m[0].length;
            locator.lineNumber++;
          }
          locator.columnNumber = p - lineStart + 1;
        }
        var parseStack = [{ currentNSMap: defaultNSMapCopy }];
        var unclosedTags = [];
        var start = 0;
        while (true) {
          try {
            var tagStart = source.indexOf("<", start);
            if (tagStart < 0) {
              if (!isHTML && unclosedTags.length > 0) {
                return errorHandler.fatalError("unclosed xml tag(s): " + unclosedTags.join(", "));
              }
              if (!source.substring(start).match(/^\s*$/)) {
                var doc = domBuilder.doc;
                var text = doc.createTextNode(source.substring(start));
                if (doc.documentElement) {
                  return errorHandler.error("Extra content at the end of the document");
                }
                doc.appendChild(text);
                domBuilder.currentElement = text;
              }
              return;
            }
            if (tagStart > start) {
              var fromSource = source.substring(start, tagStart);
              if (!isHTML && unclosedTags.length === 0) {
                fromSource = fromSource.replace(new RegExp(g.S_OPT.source, "g"), "");
                fromSource && errorHandler.error("Unexpected content outside root element: '" + fromSource + "'");
              }
              appendText(tagStart);
            }
            switch (source.charAt(tagStart + 1)) {
              case "/":
                var end = source.indexOf(">", tagStart + 2);
                var tagNameRaw = source.substring(tagStart + 2, end > 0 ? end : void 0);
                if (!tagNameRaw) {
                  return errorHandler.fatalError("end tag name missing");
                }
                var tagNameMatch = end > 0 && g.reg("^", g.QName_group, g.S_OPT, "$").exec(tagNameRaw);
                if (!tagNameMatch) {
                  return errorHandler.fatalError('end tag name contains invalid characters: "' + tagNameRaw + '"');
                }
                if (!domBuilder.currentElement && !domBuilder.doc.documentElement) {
                  return;
                }
                var currentTagName = unclosedTags[unclosedTags.length - 1] || domBuilder.currentElement.tagName || domBuilder.doc.documentElement.tagName || "";
                if (currentTagName !== tagNameMatch[1]) {
                  var tagNameLower = tagNameMatch[1].toLowerCase();
                  if (!isHTML || currentTagName.toLowerCase() !== tagNameLower) {
                    return errorHandler.fatalError('Opening and ending tag mismatch: "' + currentTagName + '" != "' + tagNameRaw + '"');
                  }
                }
                var config = parseStack.pop();
                unclosedTags.pop();
                var localNSMap = config.localNSMap;
                domBuilder.endElement(config.uri, config.localName, currentTagName);
                if (localNSMap) {
                  for (var prefix in localNSMap) {
                    if (hasOwn(localNSMap, prefix)) {
                      domBuilder.endPrefixMapping(prefix);
                    }
                  }
                }
                end++;
                break;
              // end element
              case "?":
                locator && position(tagStart);
                end = parseProcessingInstruction(source, tagStart, domBuilder, errorHandler);
                break;
              case "!":
                locator && position(tagStart);
                end = parseDoctypeCommentOrCData(source, tagStart, domBuilder, errorHandler, isHTML);
                break;
              default:
                locator && position(tagStart);
                var el = new ElementAttributes();
                var currentNSMap = parseStack[parseStack.length - 1].currentNSMap;
                var end = parseElementStartPart(source, tagStart, el, currentNSMap, entityReplacer, errorHandler, isHTML);
                var len = el.length;
                if (!el.closed) {
                  if (isHTML && conventions.isHTMLVoidElement(el.tagName)) {
                    el.closed = true;
                  } else {
                    unclosedTags.push(el.tagName);
                  }
                }
                if (locator && len) {
                  var locator2 = copyLocator(locator, {});
                  for (var i = 0; i < len; i++) {
                    var a = el[i];
                    position(a.offset);
                    a.locator = copyLocator(locator, {});
                  }
                  domBuilder.locator = locator2;
                  if (appendElement(el, domBuilder, currentNSMap)) {
                    parseStack.push(el);
                  }
                  domBuilder.locator = locator;
                } else {
                  if (appendElement(el, domBuilder, currentNSMap)) {
                    parseStack.push(el);
                  }
                }
                if (isHTML && !el.closed) {
                  end = parseHtmlSpecialContent(source, end, el.tagName, entityReplacer, domBuilder);
                } else {
                  end++;
                }
            }
          } catch (e) {
            if (e instanceof ParseError) {
              throw e;
            } else if (e instanceof DOMException) {
              throw new ParseError(e.name + ": " + e.message, domBuilder.locator, e);
            }
            errorHandler.error("element parse error: " + e);
            end = -1;
          }
          if (end > start) {
            start = end;
          } else {
            appendText(Math.max(tagStart, start) + 1);
          }
        }
      }
      function copyLocator(f, t) {
        t.lineNumber = f.lineNumber;
        t.columnNumber = f.columnNumber;
        return t;
      }
      function parseElementStartPart(source, start, el, currentNSMap, entityReplacer, errorHandler, isHTML) {
        function addAttribute(qname, value2, startIndex) {
          if (hasOwn(el.attributeNames, qname)) {
            return errorHandler.fatalError("Attribute " + qname + " redefined");
          }
          if (!isHTML && value2.indexOf("<") >= 0) {
            return errorHandler.fatalError("Unescaped '<' not allowed in attributes values");
          }
          el.addValue(
            qname,
            // @see https://www.w3.org/TR/xml/#AVNormalize
            // since the xmldom sax parser does not "interpret" DTD the following is not implemented:
            // - recursive replacement of (DTD) entity references
            // - trimming and collapsing multiple spaces into a single one for attributes that are not of type CDATA
            value2.replace(/[\t\n\r]/g, " ").replace(ENTITY_REG, entityReplacer),
            startIndex
          );
        }
        var attrName;
        var value;
        var p = ++start;
        var s = S_TAG;
        while (true) {
          var c = source.charAt(p);
          switch (c) {
            case "=":
              if (s === S_ATTR) {
                attrName = source.slice(start, p);
                s = S_EQ;
              } else if (s === S_ATTR_SPACE) {
                s = S_EQ;
              } else {
                throw new Error("attribute equal must after attrName");
              }
              break;
            case "'":
            case '"':
              if (s === S_EQ || s === S_ATTR) {
                if (s === S_ATTR) {
                  errorHandler.warning('attribute value must after "="');
                  attrName = source.slice(start, p);
                }
                start = p + 1;
                p = source.indexOf(c, start);
                if (p > 0) {
                  value = source.slice(start, p);
                  addAttribute(attrName, value, start - 1);
                  s = S_ATTR_END;
                } else {
                  throw new Error("attribute value no end '" + c + "' match");
                }
              } else if (s == S_ATTR_NOQUOT_VALUE) {
                value = source.slice(start, p);
                addAttribute(attrName, value, start);
                errorHandler.warning('attribute "' + attrName + '" missed start quot(' + c + ")!!");
                start = p + 1;
                s = S_ATTR_END;
              } else {
                throw new Error('attribute value must after "="');
              }
              break;
            case "/":
              switch (s) {
                case S_TAG:
                  el.setTagName(source.slice(start, p));
                case S_ATTR_END:
                case S_TAG_SPACE:
                case S_TAG_CLOSE:
                  s = S_TAG_CLOSE;
                  el.closed = true;
                case S_ATTR_NOQUOT_VALUE:
                case S_ATTR:
                  break;
                case S_ATTR_SPACE:
                  el.closed = true;
                  break;
                //case S_EQ:
                default:
                  throw new Error("attribute invalid close char('/')");
              }
              break;
            case "":
              errorHandler.error("unexpected end of input");
              if (s == S_TAG) {
                el.setTagName(source.slice(start, p));
              }
              return p;
            case ">":
              switch (s) {
                case S_TAG:
                  el.setTagName(source.slice(start, p));
                case S_ATTR_END:
                case S_TAG_SPACE:
                case S_TAG_CLOSE:
                  break;
                //normal
                case S_ATTR_NOQUOT_VALUE:
                //Compatible state
                case S_ATTR:
                  value = source.slice(start, p);
                  if (value.slice(-1) === "/") {
                    el.closed = true;
                    value = value.slice(0, -1);
                  }
                case S_ATTR_SPACE:
                  if (s === S_ATTR_SPACE) {
                    value = attrName;
                  }
                  if (s == S_ATTR_NOQUOT_VALUE) {
                    errorHandler.warning('attribute "' + value + '" missed quot(")!');
                    addAttribute(attrName, value, start);
                  } else {
                    if (!isHTML) {
                      errorHandler.warning('attribute "' + value + '" missed value!! "' + value + '" instead!!');
                    }
                    addAttribute(value, value, start);
                  }
                  break;
                case S_EQ:
                  if (!isHTML) {
                    return errorHandler.fatalError(`AttValue: ' or " expected`);
                  }
              }
              return p;
            /*xml space '\x20' | #x9 | #xD | #xA; */
            case "\x80":
              c = " ";
            default:
              if (c <= " ") {
                switch (s) {
                  case S_TAG:
                    el.setTagName(source.slice(start, p));
                    s = S_TAG_SPACE;
                    break;
                  case S_ATTR:
                    attrName = source.slice(start, p);
                    s = S_ATTR_SPACE;
                    break;
                  case S_ATTR_NOQUOT_VALUE:
                    var value = source.slice(start, p);
                    errorHandler.warning('attribute "' + value + '" missed quot(")!!');
                    addAttribute(attrName, value, start);
                  case S_ATTR_END:
                    s = S_TAG_SPACE;
                    break;
                }
              } else {
                switch (s) {
                  //case S_TAG:void();break;
                  //case S_ATTR:void();break;
                  //case S_ATTR_NOQUOT_VALUE:void();break;
                  case S_ATTR_SPACE:
                    if (!isHTML) {
                      errorHandler.warning('attribute "' + attrName + '" missed value!! "' + attrName + '" instead2!!');
                    }
                    addAttribute(attrName, attrName, start);
                    start = p;
                    s = S_ATTR;
                    break;
                  case S_ATTR_END:
                    errorHandler.warning('attribute space is required"' + attrName + '"!!');
                  case S_TAG_SPACE:
                    s = S_ATTR;
                    start = p;
                    break;
                  case S_EQ:
                    s = S_ATTR_NOQUOT_VALUE;
                    start = p;
                    break;
                  case S_TAG_CLOSE:
                    throw new Error("elements closed character '/' and '>' must be connected to");
                }
              }
          }
          p++;
        }
      }
      function appendElement(el, domBuilder, currentNSMap) {
        var tagName = el.tagName;
        var localNSMap = null;
        var i = el.length;
        while (i--) {
          var a = el[i];
          var qName = a.qName;
          var value = a.value;
          var nsp = qName.indexOf(":");
          if (nsp > 0) {
            var prefix = a.prefix = qName.slice(0, nsp);
            var localName = qName.slice(nsp + 1);
            var nsPrefix = prefix === "xmlns" && localName;
          } else {
            localName = qName;
            prefix = null;
            nsPrefix = qName === "xmlns" && "";
          }
          a.localName = localName;
          if (nsPrefix !== false) {
            if (localNSMap == null) {
              localNSMap = /* @__PURE__ */ Object.create(null);
              _copy(currentNSMap, currentNSMap = /* @__PURE__ */ Object.create(null));
            }
            currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
            a.uri = NAMESPACE.XMLNS;
            domBuilder.startPrefixMapping(nsPrefix, value);
          }
        }
        var i = el.length;
        while (i--) {
          a = el[i];
          if (a.prefix) {
            if (a.prefix === "xml") {
              a.uri = NAMESPACE.XML;
            }
            if (a.prefix !== "xmlns") {
              a.uri = currentNSMap[a.prefix];
            }
          }
        }
        var nsp = tagName.indexOf(":");
        if (nsp > 0) {
          prefix = el.prefix = tagName.slice(0, nsp);
          localName = el.localName = tagName.slice(nsp + 1);
        } else {
          prefix = null;
          localName = el.localName = tagName;
        }
        var ns = el.uri = currentNSMap[prefix || ""];
        domBuilder.startElement(ns, localName, tagName, el);
        if (el.closed) {
          domBuilder.endElement(ns, localName, tagName);
          if (localNSMap) {
            for (prefix in localNSMap) {
              if (hasOwn(localNSMap, prefix)) {
                domBuilder.endPrefixMapping(prefix);
              }
            }
          }
        } else {
          el.currentNSMap = currentNSMap;
          el.localNSMap = localNSMap;
          return true;
        }
      }
      function parseHtmlSpecialContent(source, elStartEnd, tagName, entityReplacer, domBuilder) {
        var isEscapableRaw = isHTMLEscapableRawTextElement(tagName);
        if (isEscapableRaw || isHTMLRawTextElement(tagName)) {
          var elEndStart = source.indexOf("</" + tagName + ">", elStartEnd);
          var text = source.substring(elStartEnd + 1, elEndStart);
          if (isEscapableRaw) {
            text = text.replace(ENTITY_REG, entityReplacer);
          }
          domBuilder.characters(text, 0, text.length);
          return elEndStart;
        }
        return elStartEnd + 1;
      }
      function _copy(source, target) {
        for (var n in source) {
          if (hasOwn(source, n)) {
            target[n] = source[n];
          }
        }
      }
      function parseUtils(source, start) {
        var index = start;
        function char(n) {
          n = n || 0;
          return source.charAt(index + n);
        }
        function skip(n) {
          n = n || 1;
          index += n;
        }
        function skipBlanks() {
          var blanks = 0;
          while (index < source.length) {
            var c = char();
            if (c !== " " && c !== "\n" && c !== "	" && c !== "\r") {
              return blanks;
            }
            blanks++;
            skip();
          }
          return -1;
        }
        function substringFromIndex() {
          return source.substring(index);
        }
        function substringStartsWith(text) {
          return source.substring(index, index + text.length) === text;
        }
        function substringStartsWithCaseInsensitive(text) {
          return source.substring(index, index + text.length).toUpperCase() === text.toUpperCase();
        }
        function getMatch(args) {
          var expr = g.reg("^", args);
          var match = expr.exec(substringFromIndex());
          if (match) {
            skip(match[0].length);
            return match[0];
          }
          return null;
        }
        return {
          char,
          getIndex: function() {
            return index;
          },
          getMatch,
          getSource: function() {
            return source;
          },
          skip,
          skipBlanks,
          substringFromIndex,
          substringStartsWith,
          substringStartsWithCaseInsensitive
        };
      }
      function parseDoctypeInternalSubset(p, errorHandler) {
        function parsePI(p2, errorHandler2) {
          var match = g.PI.exec(p2.substringFromIndex());
          if (!match) {
            return errorHandler2.fatalError("processing instruction is not well-formed at position " + p2.getIndex());
          }
          if (match[1].toLowerCase() === "xml") {
            return errorHandler2.fatalError(
              "xml declaration is only allowed at the start of the document, but found at position " + p2.getIndex()
            );
          }
          p2.skip(match[0].length);
          return match[0];
        }
        var source = p.getSource();
        if (p.char() === "[") {
          p.skip(1);
          var intSubsetStart = p.getIndex();
          while (p.getIndex() < source.length) {
            p.skipBlanks();
            if (p.char() === "]") {
              var internalSubset = source.substring(intSubsetStart, p.getIndex());
              p.skip(1);
              return internalSubset;
            }
            var current = null;
            if (p.char() === "<" && p.char(1) === "!") {
              switch (p.char(2)) {
                case "E":
                  if (p.char(3) === "L") {
                    current = p.getMatch(g.elementdecl);
                  } else if (p.char(3) === "N") {
                    current = p.getMatch(g.EntityDecl);
                  }
                  break;
                case "A":
                  current = p.getMatch(g.AttlistDecl);
                  break;
                case "N":
                  current = p.getMatch(g.NotationDecl);
                  break;
                case "-":
                  current = p.getMatch(g.Comment);
                  break;
              }
            } else if (p.char() === "<" && p.char(1) === "?") {
              current = parsePI(p, errorHandler);
            } else if (p.char() === "%") {
              current = p.getMatch(g.PEReference);
            } else {
              return errorHandler.fatalError("Error detected in Markup declaration");
            }
            if (!current) {
              return errorHandler.fatalError("Error in internal subset at position " + p.getIndex());
            }
          }
          return errorHandler.fatalError("doctype internal subset is not well-formed, missing ]");
        }
      }
      function parseDoctypeCommentOrCData(source, start, domBuilder, errorHandler, isHTML) {
        var p = parseUtils(source, start);
        switch (isHTML ? p.char(2).toUpperCase() : p.char(2)) {
          case "-":
            var comment = p.getMatch(g.Comment);
            if (comment) {
              domBuilder.comment(comment, g.COMMENT_START.length, comment.length - g.COMMENT_START.length - g.COMMENT_END.length);
              return p.getIndex();
            } else {
              return errorHandler.fatalError("comment is not well-formed at position " + p.getIndex());
            }
          case "[":
            var cdata = p.getMatch(g.CDSect);
            if (cdata) {
              if (!isHTML && !domBuilder.currentElement) {
                return errorHandler.fatalError("CDATA outside of element");
              }
              domBuilder.startCDATA();
              domBuilder.characters(cdata, g.CDATA_START.length, cdata.length - g.CDATA_START.length - g.CDATA_END.length);
              domBuilder.endCDATA();
              return p.getIndex();
            } else {
              return errorHandler.fatalError("Invalid CDATA starting at position " + start);
            }
          case "D": {
            if (domBuilder.doc && domBuilder.doc.documentElement) {
              return errorHandler.fatalError("Doctype not allowed inside or after documentElement at position " + p.getIndex());
            }
            if (isHTML ? !p.substringStartsWithCaseInsensitive(g.DOCTYPE_DECL_START) : !p.substringStartsWith(g.DOCTYPE_DECL_START)) {
              return errorHandler.fatalError("Expected " + g.DOCTYPE_DECL_START + " at position " + p.getIndex());
            }
            p.skip(g.DOCTYPE_DECL_START.length);
            if (p.skipBlanks() < 1) {
              return errorHandler.fatalError("Expected whitespace after " + g.DOCTYPE_DECL_START + " at position " + p.getIndex());
            }
            var doctype = {
              name: void 0,
              publicId: void 0,
              systemId: void 0,
              internalSubset: void 0
            };
            doctype.name = p.getMatch(g.Name);
            if (!doctype.name)
              return errorHandler.fatalError("doctype name missing or contains unexpected characters at position " + p.getIndex());
            if (isHTML && doctype.name.toLowerCase() !== "html") {
              errorHandler.warning("Unexpected DOCTYPE in HTML document at position " + p.getIndex());
            }
            p.skipBlanks();
            if (p.substringStartsWith(g.PUBLIC) || p.substringStartsWith(g.SYSTEM)) {
              var match = g.ExternalID_match.exec(p.substringFromIndex());
              if (!match) {
                return errorHandler.fatalError("doctype external id is not well-formed at position " + p.getIndex());
              }
              if (match.groups.SystemLiteralOnly !== void 0) {
                doctype.systemId = match.groups.SystemLiteralOnly;
              } else {
                doctype.systemId = match.groups.SystemLiteral;
                doctype.publicId = match.groups.PubidLiteral;
              }
              p.skip(match[0].length);
            } else if (isHTML && p.substringStartsWithCaseInsensitive(g.SYSTEM)) {
              p.skip(g.SYSTEM.length);
              if (p.skipBlanks() < 1) {
                return errorHandler.fatalError("Expected whitespace after " + g.SYSTEM + " at position " + p.getIndex());
              }
              doctype.systemId = p.getMatch(g.ABOUT_LEGACY_COMPAT_SystemLiteral);
              if (!doctype.systemId) {
                return errorHandler.fatalError(
                  "Expected " + g.ABOUT_LEGACY_COMPAT + " in single or double quotes after " + g.SYSTEM + " at position " + p.getIndex()
                );
              }
            }
            if (isHTML && doctype.systemId && !g.ABOUT_LEGACY_COMPAT_SystemLiteral.test(doctype.systemId)) {
              errorHandler.warning("Unexpected doctype.systemId in HTML document at position " + p.getIndex());
            }
            if (!isHTML) {
              p.skipBlanks();
              doctype.internalSubset = parseDoctypeInternalSubset(p, errorHandler);
            }
            p.skipBlanks();
            if (p.char() !== ">") {
              return errorHandler.fatalError("doctype not terminated with > at position " + p.getIndex());
            }
            p.skip(1);
            domBuilder.startDTD(doctype.name, doctype.publicId, doctype.systemId, doctype.internalSubset);
            domBuilder.endDTD();
            return p.getIndex();
          }
          default:
            return errorHandler.fatalError('Not well-formed XML starting with "<!" at position ' + start);
        }
      }
      function parseProcessingInstruction(source, start, domBuilder, errorHandler) {
        var match = source.substring(start).match(g.PI);
        if (!match) {
          return errorHandler.fatalError("Invalid processing instruction starting at position " + start);
        }
        if (match[1].toLowerCase() === "xml") {
          if (start > 0) {
            return errorHandler.fatalError(
              "processing instruction at position " + start + " is an xml declaration which is only at the start of the document"
            );
          }
          if (!g.XMLDecl.test(source.substring(start))) {
            return errorHandler.fatalError("xml declaration is not well-formed");
          }
        }
        domBuilder.processingInstruction(match[1], match[2]);
        return start + match[0].length;
      }
      function ElementAttributes() {
        this.attributeNames = /* @__PURE__ */ Object.create(null);
      }
      ElementAttributes.prototype = {
        setTagName: function(tagName) {
          if (!g.QName_exact.test(tagName)) {
            throw new Error("invalid tagName:" + tagName);
          }
          this.tagName = tagName;
        },
        addValue: function(qName, value, offset) {
          if (!g.QName_exact.test(qName)) {
            throw new Error("invalid attribute:" + qName);
          }
          this.attributeNames[qName] = this.length;
          this[this.length++] = { qName, value, offset };
        },
        length: 0,
        getLocalName: function(i) {
          return this[i].localName;
        },
        getLocator: function(i) {
          return this[i].locator;
        },
        getQName: function(i) {
          return this[i].qName;
        },
        getURI: function(i) {
          return this[i].uri;
        },
        getValue: function(i) {
          return this[i].value;
        }
        //	,getIndex:function(uri, localName)){
        //		if(localName){
        //
        //		}else{
        //			var qName = uri
        //		}
        //	},
        //	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
        //	getType:function(uri,localName){}
        //	getType:function(i){},
      };
      exports.XMLReader = XMLReader;
      exports.parseUtils = parseUtils;
      exports.parseDoctypeCommentOrCData = parseDoctypeCommentOrCData;
    }
  });

  // node_modules/@xmldom/xmldom/lib/dom-parser.js
  var require_dom_parser = __commonJS({
    "node_modules/@xmldom/xmldom/lib/dom-parser.js"(exports) {
      "use strict";
      var conventions = require_conventions();
      var dom = require_dom();
      var errors = require_errors();
      var entities = require_entities();
      var sax = require_sax();
      var DOMImplementation = dom.DOMImplementation;
      var hasDefaultHTMLNamespace = conventions.hasDefaultHTMLNamespace;
      var isHTMLMimeType = conventions.isHTMLMimeType;
      var isValidMimeType = conventions.isValidMimeType;
      var MIME_TYPE = conventions.MIME_TYPE;
      var NAMESPACE = conventions.NAMESPACE;
      var ParseError = errors.ParseError;
      var XMLReader = sax.XMLReader;
      function normalizeLineEndings(input) {
        return input.replace(/\r[\n\u0085]/g, "\n").replace(/[\r\u0085\u2028\u2029]/g, "\n");
      }
      function DOMParser3(options) {
        options = options || {};
        if (options.locator === void 0) {
          options.locator = true;
        }
        this.assign = options.assign || conventions.assign;
        this.domHandler = options.domHandler || DOMHandler;
        this.onError = options.onError || options.errorHandler;
        if (options.errorHandler && typeof options.errorHandler !== "function") {
          throw new TypeError("errorHandler object is no longer supported, switch to onError!");
        } else if (options.errorHandler) {
          options.errorHandler("warning", "The `errorHandler` option has been deprecated, use `onError` instead!", this);
        }
        this.normalizeLineEndings = options.normalizeLineEndings || normalizeLineEndings;
        this.locator = !!options.locator;
        this.xmlns = this.assign(/* @__PURE__ */ Object.create(null), options.xmlns);
      }
      DOMParser3.prototype.parseFromString = function(source, mimeType) {
        if (!isValidMimeType(mimeType)) {
          throw new TypeError('DOMParser.parseFromString: the provided mimeType "' + mimeType + '" is not valid.');
        }
        var defaultNSMap = this.assign(/* @__PURE__ */ Object.create(null), this.xmlns);
        var entityMap = entities.XML_ENTITIES;
        var defaultNamespace = defaultNSMap[""] || null;
        if (hasDefaultHTMLNamespace(mimeType)) {
          entityMap = entities.HTML_ENTITIES;
          defaultNamespace = NAMESPACE.HTML;
        } else if (mimeType === MIME_TYPE.XML_SVG_IMAGE) {
          defaultNamespace = NAMESPACE.SVG;
        }
        defaultNSMap[""] = defaultNamespace;
        defaultNSMap.xml = defaultNSMap.xml || NAMESPACE.XML;
        var domBuilder = new this.domHandler({
          mimeType,
          defaultNamespace,
          onError: this.onError
        });
        var locator = this.locator ? {} : void 0;
        if (this.locator) {
          domBuilder.setDocumentLocator(locator);
        }
        var sax2 = new XMLReader();
        sax2.errorHandler = domBuilder;
        sax2.domBuilder = domBuilder;
        var isXml = !conventions.isHTMLMimeType(mimeType);
        if (isXml && typeof source !== "string") {
          sax2.errorHandler.fatalError("source is not a string");
        }
        sax2.parse(this.normalizeLineEndings(String(source)), defaultNSMap, entityMap);
        if (!domBuilder.doc.documentElement) {
          sax2.errorHandler.fatalError("missing root element");
        }
        return domBuilder.doc;
      };
      function DOMHandler(options) {
        var opt = options || {};
        this.mimeType = opt.mimeType || MIME_TYPE.XML_APPLICATION;
        this.defaultNamespace = opt.defaultNamespace || null;
        this.cdata = false;
        this.currentElement = void 0;
        this.doc = void 0;
        this.locator = void 0;
        this.onError = opt.onError;
      }
      function position(locator, node) {
        node.lineNumber = locator.lineNumber;
        node.columnNumber = locator.columnNumber;
      }
      DOMHandler.prototype = {
        /**
         * Either creates an XML or an HTML document and stores it under `this.doc`.
         * If it is an XML document, `this.defaultNamespace` is used to create it,
         * and it will not contain any `childNodes`.
         * If it is an HTML document, it will be created without any `childNodes`.
         *
         * @see http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
         */
        startDocument: function() {
          var impl = new DOMImplementation();
          this.doc = isHTMLMimeType(this.mimeType) ? impl.createHTMLDocument(false) : impl.createDocument(this.defaultNamespace, "");
        },
        startElement: function(namespaceURI, localName, qName, attrs) {
          var doc = this.doc;
          var el = doc.createElementNS(namespaceURI, qName || localName);
          var len = attrs.length;
          appendElement(this, el);
          this.currentElement = el;
          this.locator && position(this.locator, el);
          for (var i = 0; i < len; i++) {
            var namespaceURI = attrs.getURI(i);
            var value = attrs.getValue(i);
            var qName = attrs.getQName(i);
            var attr = doc.createAttributeNS(namespaceURI, qName);
            this.locator && position(attrs.getLocator(i), attr);
            attr.value = attr.nodeValue = value;
            el.setAttributeNode(attr);
          }
        },
        endElement: function(namespaceURI, localName, qName) {
          this.currentElement = this.currentElement.parentNode;
        },
        startPrefixMapping: function(prefix, uri) {
        },
        endPrefixMapping: function(prefix) {
        },
        processingInstruction: function(target, data) {
          var ins = this.doc.createProcessingInstruction(target, data);
          this.locator && position(this.locator, ins);
          appendElement(this, ins);
        },
        ignorableWhitespace: function(ch, start, length) {
        },
        characters: function(chars, start, length) {
          chars = _toString.apply(this, arguments);
          if (chars) {
            if (this.cdata) {
              var charNode = this.doc.createCDATASection(chars);
            } else {
              var charNode = this.doc.createTextNode(chars);
            }
            if (this.currentElement) {
              this.currentElement.appendChild(charNode);
            } else if (/^\s*$/.test(chars)) {
              this.doc.appendChild(charNode);
            }
            this.locator && position(this.locator, charNode);
          }
        },
        skippedEntity: function(name) {
        },
        endDocument: function() {
          this.doc.normalize();
        },
        /**
         * Stores the locator to be able to set the `columnNumber` and `lineNumber`
         * on the created DOM nodes.
         *
         * @param {Locator} locator
         */
        setDocumentLocator: function(locator) {
          if (locator) {
            locator.lineNumber = 0;
          }
          this.locator = locator;
        },
        //LexicalHandler
        comment: function(chars, start, length) {
          chars = _toString.apply(this, arguments);
          var comm = this.doc.createComment(chars);
          this.locator && position(this.locator, comm);
          appendElement(this, comm);
        },
        startCDATA: function() {
          this.cdata = true;
        },
        endCDATA: function() {
          this.cdata = false;
        },
        startDTD: function(name, publicId, systemId, internalSubset) {
          var impl = this.doc.implementation;
          if (impl && impl.createDocumentType) {
            var dt = impl.createDocumentType(name, publicId, systemId, internalSubset);
            this.locator && position(this.locator, dt);
            appendElement(this, dt);
            this.doc.doctype = dt;
          }
        },
        reportError: function(level, message) {
          if (typeof this.onError === "function") {
            try {
              this.onError(level, message, this);
            } catch (e) {
              throw new ParseError("Reporting " + level + ' "' + message + '" caused ' + e, this.locator);
            }
          } else {
            console.error("[xmldom " + level + "]	" + message, _locator(this.locator));
          }
        },
        /**
         * @see http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
         */
        warning: function(message) {
          this.reportError("warning", message);
        },
        error: function(message) {
          this.reportError("error", message);
        },
        /**
         * This function reports a fatal error and throws a ParseError.
         *
         * @param {string} message
         * - The message to be used for reporting and throwing the error.
         * @returns {never}
         * This function always throws an error and never returns a value.
         * @throws {ParseError}
         * Always throws a ParseError with the provided message.
         */
        fatalError: function(message) {
          this.reportError("fatalError", message);
          throw new ParseError(message, this.locator);
        }
      };
      function _locator(l) {
        if (l) {
          return "\n@#[line:" + l.lineNumber + ",col:" + l.columnNumber + "]";
        }
      }
      function _toString(chars, start, length) {
        if (typeof chars == "string") {
          return chars.substr(start, length);
        } else {
          if (chars.length >= start + length || start) {
            return new java.lang.String(chars, start, length) + "";
          }
          return chars;
        }
      }
      "endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(
        /\w+/g,
        function(key) {
          DOMHandler.prototype[key] = function() {
            return null;
          };
        }
      );
      function appendElement(handler, node) {
        if (!handler.currentElement) {
          handler.doc.appendChild(node);
        } else {
          handler.currentElement.appendChild(node);
        }
      }
      function onErrorStopParsing(level) {
        if (level === "error") throw "onErrorStopParsing";
      }
      function onWarningStopParsing() {
        throw "onWarningStopParsing";
      }
      exports.__DOMHandler = DOMHandler;
      exports.DOMParser = DOMParser3;
      exports.normalizeLineEndings = normalizeLineEndings;
      exports.onErrorStopParsing = onErrorStopParsing;
      exports.onWarningStopParsing = onWarningStopParsing;
    }
  });

  // node_modules/@xmldom/xmldom/lib/index.js
  var require_lib = __commonJS({
    "node_modules/@xmldom/xmldom/lib/index.js"(exports) {
      "use strict";
      var conventions = require_conventions();
      exports.assign = conventions.assign;
      exports.hasDefaultHTMLNamespace = conventions.hasDefaultHTMLNamespace;
      exports.isHTMLMimeType = conventions.isHTMLMimeType;
      exports.isValidMimeType = conventions.isValidMimeType;
      exports.MIME_TYPE = conventions.MIME_TYPE;
      exports.NAMESPACE = conventions.NAMESPACE;
      var errors = require_errors();
      exports.DOMException = errors.DOMException;
      exports.DOMExceptionName = errors.DOMExceptionName;
      exports.ExceptionCode = errors.ExceptionCode;
      exports.ParseError = errors.ParseError;
      var dom = require_dom();
      exports.Attr = dom.Attr;
      exports.CDATASection = dom.CDATASection;
      exports.CharacterData = dom.CharacterData;
      exports.Comment = dom.Comment;
      exports.Document = dom.Document;
      exports.DocumentFragment = dom.DocumentFragment;
      exports.DocumentType = dom.DocumentType;
      exports.DOMImplementation = dom.DOMImplementation;
      exports.Element = dom.Element;
      exports.Entity = dom.Entity;
      exports.EntityReference = dom.EntityReference;
      exports.LiveNodeList = dom.LiveNodeList;
      exports.NamedNodeMap = dom.NamedNodeMap;
      exports.Node = dom.Node;
      exports.NodeList = dom.NodeList;
      exports.Notation = dom.Notation;
      exports.ProcessingInstruction = dom.ProcessingInstruction;
      exports.Text = dom.Text;
      exports.XMLSerializer = dom.XMLSerializer;
      var domParser = require_dom_parser();
      exports.DOMParser = domParser.DOMParser;
      exports.normalizeLineEndings = domParser.normalizeLineEndings;
      exports.onErrorStopParsing = domParser.onErrorStopParsing;
      exports.onWarningStopParsing = domParser.onWarningStopParsing;
    }
  });

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
        const RECURSIVE_JSON_LATEX_IDEVICES = /* @__PURE__ */ new Set(["trueorfalse", "adaptative-quiz", "scrambled-list", "form"]);
        const NON_RENDERABLE_JSON_KEYS = /* @__PURE__ */ new Set(["codeAccess", "buttonText", "wrongAnswersValue"]);
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
            const ideviceType = element.getAttribute("data-idevice-type") || "";
            try {
              const jsonData = JSON.parse(jsonStr);
              let newJsonStr;
              let renderedCount;
              if (RECURSIVE_JSON_LATEX_IDEVICES.has(ideviceType)) {
                const processed = await preRenderLatexInGameData(jsonData);
                newJsonStr = JSON.stringify(processed);
                renderedCount = 1;
              } else {
                const result = await processJsonProperties(jsonData);
                newJsonStr = result.updated ? JSON.stringify(result.jsonData) : jsonStr;
                renderedCount = result.updated ? result.count : 0;
              }
              if (newJsonStr !== jsonStr) {
                element.setAttribute("data-idevice-json-data", newJsonStr);
                totalReplaced += renderedCount;
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
              result[key] = NON_RENDERABLE_JSON_KEYS.has(key) ? value : await preRenderLatexInGameData(value);
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
      "markdown-text",
      "file-attachment"
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
    // Always-on xAPI emitter (every export is xAPI-compatible out of the box)
    "xapi/exe_xapi.js",
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
    "application/octet-stream": ".bin",
    "application/x-subrip": ".srt",
    "text/vtt": ".vtt"
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
  function hasUserFooterContent(userFooterContent) {
    return (userFooterContent ?? "").trim().length > 0;
  }
  function hasSiteFooterContent(license, userFooterContent) {
    return shouldShowLicenseFooter(license) || hasUserFooterContent(userFooterContent);
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
  var PRERENDERED_LATEX_CSS = `/* Pre-rendered LaTeX (SVG+MathML) - MathJax not included */
.exe-math-rendered { display: inline-block; line-height: 0; }
.exe-math-rendered[data-display="block"] { display: block; text-align: center; margin: 1em 0; }
.exe-math-rendered svg { max-width: 100%; height: auto; }
/* Fix for MathJax array/table borders - SVG has stroke-width:0 which hides lines */
.exe-math-rendered svg line.mjx-solid { stroke-width: 60 !important; }
.exe-math-rendered svg rect[data-frame="true"] { fill: none; stroke-width: 60 !important; }
/* Hide assistive MathML visually but keep it accessible for screen readers.
   position:absolute removes it from layout so it never shifts the SVG baseline. */
.exe-math-rendered math { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); clip-path: inset(50%); }`;
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
      const contentHtml = this.addReferrerPolicyToEmbeds(escapedContent);
      return `<div id="${this.escapeAttr(ideviceId)}" class="${classes.join(" ")}"${dataAttrs}>
${contentHtml}
</div>`;
    }
    /**
     * Add `referrerpolicy="strict-origin-when-cross-origin"` to YouTube/Vimeo `<iframe>`
     * elements that lack it. Those providers need the HTTP Referer header to identify the
     * embedding page; without the attribute, a host page with a restrictive Referrer-Policy
     * makes YouTube return "Error 153". Only provider iframes are touched, and an existing
     * `referrerpolicy` is left as-is.
     */
    addReferrerPolicyToEmbeds(html) {
      if (!html || !/<iframe/i.test(html)) return html;
      const POLICY = ' referrerpolicy="strict-origin-when-cross-origin"';
      const IFRAME_TAG = /<iframe\b(?:"[^"]*"|'[^']*'|[^"'>])*>/gi;
      return html.replace(IFRAME_TAG, (tag) => {
        if (/\breferrerpolicy\s*=/i.test(tag)) return tag;
        const srcMatch = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
        if (!srcMatch || !this.isReferrerSensitiveEmbed(srcMatch[1])) return tag;
        return tag.endsWith("/>") ? `${tag.slice(0, -2)}${POLICY} />` : `${tag.slice(0, -1)}${POLICY}>`;
      });
    }
    /**
     * Whether an iframe `src` points at a provider that needs the Referer header. Compared on the
     * parsed hostname — exact match or a subdomain — rather than a substring, so a lookalike host
     * such as `vimeo.com.example.org` is not mistaken for the provider.
     */
    isReferrerSensitiveEmbed(src) {
      const PROVIDER_HOSTS = ["youtube.com", "youtube-nocookie.com", "youtu.be", "vimeo.com"];
      let hostname;
      try {
        hostname = new URL(src, "https://exe-local.invalid").hostname.toLowerCase();
      } catch {
        return false;
      }
      return PROVIDER_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
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

  // src/shared/export/utils/jsonPropertyContent.ts
  var JSON_PROPERTY_LIBRARY_EXCLUSIONS = /* @__PURE__ */ new Set([
    "exe_math",
    "exe_math_datagame",
    "exe_math_mathml"
  ]);
  function* iterateJsonPropertyStrings(value) {
    if (typeof value === "string") {
      yield value;
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        yield* iterateJsonPropertyStrings(item);
      }
      return;
    }
    if (value && typeof value === "object") {
      for (const item of Object.values(value)) {
        yield* iterateJsonPropertyStrings(item);
      }
    }
  }

  // src/shared/export/renderers/PageRenderer.ts
  var NAMED_ANCHOR_RE = /<a\s+(?=[^>]*(?:\bid\b|\bname\b)=)(?![^>]*\bhref\b=)[^>]*>/gi;
  var ID_NAME_ATTR_RE = /\b(id|name)="([^"]+)"/gi;
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
        version,
        // xAPI runtime config (always-on emitter)
        xapi
      } = options;
      const pageTitle = this.buildDocumentTitle(page, projectTitle, isIndex);
      const detectedLibraries = providedDetectedLibraries ?? this.detectLibrariesForPage(page);
      const pageContent = this.renderPageContent(
        page,
        basePath,
        projectTitle,
        assetExportPathMap,
        {
          author: options.author,
          description: options.description,
          license: options.license,
          language: options.language,
          translatedLicense: options.navLabels?.license
        },
        allPages,
        options.pageFilenameMap
      );
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
${this.renderHead({ pageTitle, basePath, usedIdevices, customStyles, extraHeadScripts, isScorm, scormVersion, description, licenseUrl, addAccessibilityToolbar, addMathJax, extraHeadContent, addSearchBox, detectedLibraries, themeFiles, faviconPath: options.faviconPath, faviconType: options.faviconType, version, xapi })}
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
        xapi,
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
      if (xapi) {
        head += `<script>window.exeXapi=${this.serializeForScript(xapi)};<\/script>`;
      }
      head += `<script src="${basePath}libs/xapi/exe_xapi.js"> <\/script>`;
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
      const ctx = this.buildNavRenderContext(allPages, currentPageId);
      const rootPages = ctx.childrenByParent.get(null) ?? [];
      let html = '<nav id="siteNav">\n<ul>\n';
      for (const page of rootPages) {
        html += this.renderNavItemFast(page, allPages, currentPageId, basePath, pageFilenameMap, ctx);
      }
      html += "</ul>\n</nav>";
      return html;
    }
    /**
     * Build the per-render navigation index: an id→page map, a parentId→children
     * map (preserving page array order; root pages keyed under `null`), a
     * memoized visibility cache, and the set of the current page's ancestors.
     * This collapses the repeated O(n) scans in renderNavItem/isPageVisible/
     * isAncestorOf into a single O(n) pass with O(1) lookups thereafter.
     */
    buildNavRenderContext(allPages, currentPageId) {
      const idIndex = /* @__PURE__ */ new Map();
      const childrenByParent = /* @__PURE__ */ new Map();
      const rootId = allPages[0]?.id;
      for (const page of allPages) {
        idIndex.set(page.id, page);
        const key = page.parentId ?? null;
        const bucket = childrenByParent.get(key);
        if (bucket) {
          bucket.push(page);
        } else {
          childrenByParent.set(key, [page]);
        }
      }
      const visibleCache = /* @__PURE__ */ new Map();
      const isVisible = (page) => {
        const cached = visibleCache.get(page.id);
        if (cached !== void 0) return cached;
        let result;
        if (page.id === rootId) {
          result = true;
        } else if (this.isFalsyProperty(page.properties?.visibility)) {
          result = false;
        } else if (page.parentId) {
          const parent = idIndex.get(page.parentId);
          result = parent ? isVisible(parent) : true;
        } else {
          result = true;
        }
        visibleCache.set(page.id, result);
        return result;
      };
      const ancestorsOfCurrent = /* @__PURE__ */ new Set();
      let cursor = idIndex.get(currentPageId);
      while (cursor?.parentId && !ancestorsOfCurrent.has(cursor.parentId)) {
        ancestorsOfCurrent.add(cursor.parentId);
        cursor = idIndex.get(cursor.parentId);
      }
      return { idIndex, childrenByParent, isVisible, ancestorsOfCurrent };
    }
    /**
     * Optimized counterpart to renderNavItem that uses the precomputed
     * NavRenderContext. Output is byte-for-byte identical to renderNavItem;
     * only the lookups differ (O(1) map access instead of O(n) array scans).
     */
    renderNavItemFast(page, allPages, currentPageId, basePath, pageFilenameMap, ctx) {
      if (!ctx.isVisible(page)) {
        return "";
      }
      const children = (ctx.childrenByParent.get(page.id) ?? []).filter((child) => ctx.isVisible(child));
      const isCurrent = page.id === currentPageId;
      const hasChildren = children.length > 0;
      const isAncestor = ctx.ancestorsOfCurrent.has(page.id);
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
          html += this.renderNavItemFast(child, allPages, currentPageId, basePath, pageFilenameMap, ctx);
        }
        html += "</ul>\n";
      }
      html += "</li>\n";
      return html;
    }
    /**
     * Render a single navigation item (recursive for children).
     *
     * Public entry point kept for backward compatibility; it builds a
     * NavRenderContext on demand and delegates to the optimized renderer so
     * there is a single source of truth for the markup. Callers rendering a
     * whole tree should prefer renderNavigation, which builds the context once
     * and reuses it across every node.
     *
     * @param page - Page to render
     * @param allPages - All pages
     * @param currentPageId - Current page ID
     * @param basePath - Base path
     * @param pageFilenameMap - Map of page IDs to unique filenames (optional)
     * @returns Navigation item HTML
     */
    renderNavItem(page, allPages, currentPageId, basePath, pageFilenameMap) {
      const ctx = this.buildNavRenderContext(allPages, currentPageId);
      return this.renderNavItemFast(page, allPages, currentPageId, basePath, pageFilenameMap, ctx);
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
    renderPageContent(page, basePath, projectTitle, assetExportPathMap, metadata, allPages, pageFilenameMap) {
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
      if (allPages && allPages.length > 0) {
        html = this.replaceInternalLinks(html, allPages, basePath, pageFilenameMap);
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
     * Collect string values nested in JSON iDevice properties.
     * Rich text fields can appear at different depths depending on the iDevice.
     */
    collectPagePropertyContent(page) {
      const parts = [];
      for (const block of page.blocks || []) {
        for (const component of block.components || []) {
          for (const value of iterateJsonPropertyStrings(component.properties)) {
            parts.push(value);
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
     * Rewrite exe-node: internal links to their static export paths at render time.
     *
     * Reuses getPageLink() — the same helper that builds navigation links — so internal
     * links and nav links stay consistent (single source of truth). basePath already
     * encodes from-subpage relativity ('' on index, '../' on subpages). The #anchor
     * fragment, if any, is preserved. Unknown targets are left untouched (external link
     * or stale reference) so nothing is silently dropped.
     *
     * Kept out of preprocessPagesForExport so the source HTML that feeds content.xml
     * keeps the exe-node: protocol and survives an export → re-import round trip (#1927).
     *
     * @param content - Rendered page HTML
     * @param allPages - All export pages (used to resolve the target and its filename)
     * @param basePath - Base path of the current page ('' for index, '../' for subpages)
     * @param pageFilenameMap - Collision-safe page id → filename map
     * @returns HTML with exe-node: links replaced by static export paths
     */
    replaceInternalLinks(content, allPages, basePath, pageFilenameMap) {
      if (!content || !content.includes("exe-node:")) {
        return content;
      }
      return content.replace(/href=["']exe-node:([^"']+)["']/gi, (match, pageIdWithAnchor) => {
        const hashIdx = pageIdWithAnchor.indexOf("#");
        const pageId = hashIdx !== -1 ? pageIdWithAnchor.substring(0, hashIdx) : pageIdWithAnchor;
        const anchorFragment = hashIdx !== -1 ? pageIdWithAnchor.substring(hashIdx) : "";
        const target = allPages.find((p) => p.id === pageId);
        if (!target) {
          console.warn(`[PageRenderer] Internal link target not found: ${pageId}`);
          return match;
        }
        const url = this.getPageLink(target, allPages, basePath, pageFilenameMap);
        return `href="${url}${anchorFragment}"`;
      });
    }
    /**
     * Prefix id/name attributes on named anchors (<a> without href) with the page id.
     * Single-page export merges every page into one document, so anchor ids like "intro"
     * on different pages would collide; e.g. <a id="intro"> on page "page-2" becomes
     * <a id="page-2--intro">. Applied at render time so content.xml keeps the raw ids.
     *
     * @param content - Rendered page HTML
     * @param pageId - Id of the page the content belongs to
     * @returns HTML with named-anchor ids/names namespaced
     */
    namespaceSinglePageAnchors(content, pageId) {
      if (!content) return content;
      return content.replace(
        NAMED_ANCHOR_RE,
        (match) => match.replace(ID_NAME_ATTR_RE, (_, attr, value) => `${attr}="${pageId}--${value}"`)
      );
    }
    /**
     * Rewrite exe-node: internal links to in-page anchors for single-page export.
     * A link carrying its own anchor (exe-node:pageId#anchor) resolves to the namespaced
     * anchor (#pageId--anchor, matching namespaceSinglePageAnchors); without an anchor it
     * resolves to the page section (#section-pageId). Unknown targets are left untouched.
     * Applied at render time so content.xml keeps the raw exe-node: references (#1927).
     *
     * @param content - Rendered page HTML
     * @param allPages - All export pages (used to validate the target id)
     * @returns HTML with exe-node: links replaced by in-page anchors
     */
    replaceSinglePageInternalLinks(content, allPages) {
      if (!content || !content.includes("exe-node:")) {
        return content;
      }
      const pageIds = new Set(allPages.map((p) => p.id));
      return content.replace(/href=["']exe-node:([^"']+)["']/gi, (match, pageIdWithAnchor) => {
        const hashIdx = pageIdWithAnchor.indexOf("#");
        const pageId = hashIdx !== -1 ? pageIdWithAnchor.substring(0, hashIdx) : pageIdWithAnchor;
        const anchor = hashIdx !== -1 ? pageIdWithAnchor.substring(hashIdx + 1) : "";
        if (!pageIds.has(pageId)) {
          console.warn(`[PageRenderer] Internal link target not found: ${pageId}`);
          return match;
        }
        return anchor ? `href="#${pageId}--${anchor}"` : `href="#section-${pageId}"`;
      });
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
      if (hasUserFooterContent(userFooterContent)) {
        userFooterHtml = `<div id="siteUserFooter"> <div>${userFooterContent}</div>
</div>`;
      }
      if (!shouldShowLicenseFooter(license)) {
        const emptyClass = hasSiteFooterContent(license, userFooterContent) ? "" : ' class="siteFooter-empty"';
        return `<footer id="siteFooter"${emptyClass}><div id="siteFooterContent">${userFooterHtml}</div></footer>`;
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
        xapi,
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
        let sectionContent = this.renderPageContent(page, "", projectTitle, void 0, {
          author: options.author,
          description: options.description,
          license: options.license,
          language: options.language,
          translatedLicense: navLabels?.license
        });
        sectionContent = this.namespaceSinglePageAnchors(sectionContent, page.id);
        sectionContent = this.replaceSinglePageInternalLinks(sectionContent, allPages);
        contentHtml += `<section id="section-${page.id}">
<header class="main-header">
<div class="page-header">
<h1 class="${pageTitleClass}">${this.escapeHtml(effectiveTitle)}</h1>
</div>
</header>
<div class="page-content">
${sectionContent}
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
${xapi ? `<script>window.exeXapi=${this.serializeForScript(xapi)};<\/script>
` : ""}<script src="libs/xapi/exe_xapi.js"> <\/script>
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
    detectContentLibraries(html, excludedLibraries = /* @__PURE__ */ new Set()) {
      const detectedLibs = /* @__PURE__ */ new Set();
      for (const lib of LIBRARY_PATTERNS) {
        if (excludedLibraries.has(lib.name)) {
          continue;
        }
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
    detectLibrariesForPage(page) {
      const detectedLibs = new Set(this.detectContentLibraries(this.collectPageContent(page)));
      const propertyContent = this.collectPagePropertyContent(page);
      for (const libName of this.detectContentLibraries(propertyContent, JSON_PROPERTY_LIBRARY_EXCLUSIONS)) {
        detectedLibs.add(libName);
      }
      return Array.from(detectedLibs);
    }
    detectContentLibrariesForPages(pages) {
      const detectedLibs = /* @__PURE__ */ new Set();
      for (const page of pages) {
        for (const libName of this.detectLibrariesForPage(page)) {
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
     * Serialize a value to JSON for safe embedding inside an inline `<script>` element.
     *
     * `JSON.stringify` alone does NOT escape `<\/script>` (or `<!--`), so a value such as
     * `<\/script><script>alert(1)<\/script>` would close the inline script and inject markup
     * (XSS). It also leaves the U+2028 / U+2029 line separators raw, which are valid JSON
     * but illegal in a JavaScript string literal and break parsing. We neutralize all of
     * them by escaping `<` as `<` and the line separators as `\u2028` / `\u2029`. The
     * result is still valid JSON (and valid JS) but can never break out of the script tag.
     *
     * @param value - Value to serialize (typically the xAPI config object)
     * @returns A JSON string safe to embed verbatim inside `<script>...<\/script>`
     */
    serializeForScript(value) {
      return JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
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
    /**
     * Detect libraries across groups of fragments with group-specific exclusions.
     * This allows nested JSON rich text to participate in HTML library detection
     * without bypassing dedicated processing such as selective MathJax handling.
     */
    detectLibrariesFromFragmentGroups(groups, options = {}) {
      this.resetDetection();
      for (const group of groups) {
        const excludedLibraries = new Set(group.excludedLibraries || []);
        for (const html of group.fragments) {
          this.scanHtmlFragment(html, options, excludedLibraries);
        }
      }
      return this.finalizeDetection(options);
    }
    scanHtmlFragment(html, options, excludedLibraries = /* @__PURE__ */ new Set()) {
      if (!html || typeof html !== "string") {
        return;
      }
      for (const lib of LIBRARY_PATTERNS) {
        if (excludedLibraries.has(lib.name)) {
          continue;
        }
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
    /**
     * Get required files from fragment groups with group-specific exclusions.
     */
    getAllRequiredFilesWithPatternsFromFragmentGroups(groups, options = {}) {
      const detected = this.detectLibrariesFromFragmentGroups(groups, options);
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

  // src/shared/utils/srt-to-vtt.ts
  var BOM = "\uFEFF";
  var CUE_TIMESTAMP_RE = /^(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})(.*)$/;
  var CUE_INDEX_RE = /^\d+$/;
  function isWebVtt(content) {
    if (!content) return false;
    const stripped = content.startsWith(BOM) ? content.slice(1) : content;
    return /^WEBVTT(\s|$)/.test(stripped.trimStart());
  }
  function stripBom(content) {
    return content.startsWith(BOM) ? content.slice(1) : content;
  }
  function normalizeTimestamp(timestamp) {
    return timestamp.replace(",", ".");
  }
  function convertSrtToVtt(content) {
    try {
      const withoutBom = stripBom(typeof content === "string" ? content : "");
      if (isWebVtt(withoutBom)) {
        return { vtt: withoutBom, converted: false };
      }
      const normalized = withoutBom.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      const blocks = normalized.split(/\n\s*\n/);
      const cues = [];
      for (const rawBlock of blocks) {
        const lines = rawBlock.split("\n").map((line) => line.trim());
        let timestampIndex = -1;
        for (let i = 0; i < lines.length; i++) {
          if (CUE_TIMESTAMP_RE.test(lines[i])) {
            timestampIndex = i;
            break;
          }
        }
        if (timestampIndex === -1) continue;
        const match = lines[timestampIndex].match(CUE_TIMESTAMP_RE);
        if (!match) continue;
        const start = normalizeTimestamp(match[1]);
        const end = normalizeTimestamp(match[2]);
        const settings = match[3] ? match[3].trim() : "";
        const timestampLine = settings ? `${start} --> ${end} ${settings}` : `${start} --> ${end}`;
        const indexLine = timestampIndex > 0 && CUE_INDEX_RE.test(lines[0]) ? lines[0] : null;
        const text = lines.slice(timestampIndex + 1).join("\n").trim();
        const cueParts = [indexLine, timestampLine, text].filter((part) => !!part);
        cues.push(cueParts.join("\n"));
      }
      if (cues.length === 0) {
        return {
          vtt: "WEBVTT\n",
          converted: true,
          error: "No subtitle cues could be parsed from the input"
        };
      }
      return { vtt: `WEBVTT

${cues.join("\n\n")}
`, converted: true };
    } catch (e) {
      return {
        vtt: "WEBVTT\n",
        converted: true,
        error: e instanceof Error ? e.message : String(e)
      };
    }
  }

  // src/shared/export/exporters/BaseExporter.ts
  var BaseExporter = class _BaseExporter {
    constructor(document2, resources, assets, zip2) {
      // Cache for asset filename lookups
      this.assetFilenameMap = null;
      // Cache for asset export path lookups (folderPath-based)
      this.assetExportPathMap = null;
      // UUID-format asset references that could not be resolved to a bundled file.
      // These produce a dangling `content/resources/<uuid>` URL with no binary behind
      // it (the collaborative image-loss bug). Collected so the save/export flow can
      // surface the loss instead of degrading silently.
      this.unresolvedAssetRefs = /* @__PURE__ */ new Set();
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
      const sanitized = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").substring(0, 50);
      return sanitized || "page";
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
          await this.writeAssetToZip(zipPath, asset, trackingList);
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
    static {
      // =========================================================================
      // Subtitle Track Conversion (issue #2034)
      // =========================================================================
      /** MIME types used for raw SubRip (`.srt`) subtitle files. */
      this.SRT_MIME_TYPES = /* @__PURE__ */ new Set(["application/x-subrip", "application/srt", "text/srt"]);
    }
    /**
     * Whether an asset is a raw SubRip (`.srt`) subtitle file, detected from
     * its filename extension or MIME type. Native `<video><track>` only
     * understands WebVTT, so these assets must be converted before they are
     * written into an export or preview file set (see
     * {@link resolveAssetExportData} and {@link buildAssetExportPathMap}).
     */
    isSrtSubtitleAsset(filename, mime) {
      const normalizedFilename = (filename || "").toLowerCase();
      const normalizedMime = (mime || "").toLowerCase();
      return normalizedFilename.endsWith(".srt") || _BaseExporter.SRT_MIME_TYPES.has(normalizedMime);
    }
    /**
     * Decode asset binary data (Uint8Array or Blob) to text. Subtitle files
     * are usually UTF-8, but `.srt` files in the wild are very frequently
     * Windows-1252/Latin-1 (accented characters). A non-fatal UTF-8 decode
     * would silently replace every high byte with U+FFFD, so we decode UTF-8
     * strictly first and fall back to Windows-1252 when that fails -- keeping
     * accented captions readable instead of garbled.
     */
    async readAssetDataAsText(data) {
      const bytes = typeof Blob !== "undefined" && data instanceof Blob ? new Uint8Array(await data.arrayBuffer()) : data;
      try {
        return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      } catch {
        return new TextDecoder("windows-1252").decode(bytes);
      }
    }
    /**
     * Resolve the data that should actually be written for an asset in the
     * export/preview file set. `.srt` subtitle assets are converted to
     * WebVTT text on the fly (their export path is renamed `.srt` -> `.vtt`
     * by {@link buildAssetExportPathMap}, so the written bytes must match).
     * Every other asset passes through unchanged.
     *
     * Shared by {@link addAssetsToZipWithResourcePath} (real exports) and
     * `Html5Exporter.addAssetsToPreviewFiles` (Preview panel), so the same
     * conversion always applies regardless of which surface is rendering.
     */
    async resolveAssetExportData(asset) {
      if (!this.isSrtSubtitleAsset(asset.filename, asset.mime)) {
        return asset.data;
      }
      try {
        const text = await this.readAssetDataAsText(asset.data);
        const { vtt, error } = convertSrtToVtt(text);
        if (error) {
          console.warn(
            `[BaseExporter] SRT->WebVTT conversion produced no cues for subtitle asset "${asset.filename ?? ""}": ${error}`
          );
        }
        return vtt;
      } catch (e) {
        console.warn("[BaseExporter] Failed to convert .srt subtitle asset to WebVTT:", e);
        return "WEBVTT\n";
      }
    }
    /**
     * Write a single asset into the export ZIP at `zipPath`, applying the
     * shared `.srt` -> WebVTT subtitle conversion via
     * {@link resolveAssetExportData}.
     *
     * ALL exporters (full, filtered page/branch, component, EPUB) must route
     * their ZIP asset writes through here. {@link buildAssetExportPathMap}
     * renames `.srt` -> `.vtt` globally, so any writer that bypasses this and
     * stores the raw asset bytes would emit a `.vtt` file containing SubRip
     * text -- zero cues, i.e. the exact issue #2034 bug, on that surface.
     * Single source of truth (AGENTS.md).
     */
    async writeAssetToZip(zipPath, asset, trackingList) {
      const data = await this.resolveAssetExportData(asset);
      this.zip.addFile(zipPath, data);
      if (trackingList) trackingList.push(zipPath);
    }
    /**
     * Force a `.vtt` extension on a subtitle asset's export filename. SRT
     * assets are always emitted as WebVTT (see {@link resolveAssetExportData}),
     * and this keeps the ZIP entry name and every `<track src>` reference in
     * sync even when the asset arrived with a non-canonical MIME (e.g.
     * `text/srt`) or without a `.srt` extension at all. Already-`.vtt` names
     * pass through unchanged.
     */
    toWebVttExportFilename(filename) {
      if (/\.vtt$/i.test(filename)) return filename;
      if (/\.srt$/i.test(filename)) return filename.replace(/\.srt$/i, ".vtt");
      return `${filename}.vtt`;
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
          const rawFilename = item.filename && item.filename !== "unknown" ? item.filename : this._deriveFilenameFromMime(item.id, item.mime);
          let filename = this._ensureFilenameExtension(rawFilename, item.mime);
          if (this.isSrtSubtitleAsset(filename, item.mime)) {
            filename = this.toWebVttExportFilename(filename);
          }
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
     * Ensure a filename carries a file extension. When it lacks one, append the
     * extension derived from the MIME type — but only a meaningful one, never
     * the generic `.bin` fallback (we leave truly-unknown binaries unchanged).
     */
    _ensureFilenameExtension(filename, mime) {
      if (/\.[a-z0-9]{1,8}$/i.test(filename)) return filename;
      const ext = getExtensionFromMimeType(mime, true);
      if (!ext || ext === ".bin") return filename;
      return `${filename}${ext}`;
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
        this.unresolvedAssetRefs.add(uuid);
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
        const asIs = this.isSrtSubtitleAsset(assetPath, void 0) ? this.toWebVttExportFilename(assetPath) : assetPath;
        return `{{context_path}}/content/resources/${asIs}`;
      });
      result = result.replace(/content\/resources\/([^/"]+)\/\1(?=["'\s>])/g, "content/resources/$1");
      return result;
    }
    /**
     * UUID-format asset references encountered during export that could not be
     * resolved to a bundled file. A non-empty result means the package ships
     * dangling image/resource URLs (data loss) and callers should surface it.
     */
    getUnresolvedAssetRefs() {
      return [...this.unresolvedAssetRefs];
    }
    /**
     * Pre-process pages to add filenames to asset URLs in all component content.
     *
     * This only performs XML-safe rewrites: asset URLs become {{context_path}}/... which
     * is reversed on import, so the persisted content.xml stays re-importable.
     *
     * Note: exe-node: internal links and the exe-package:elp protocol are NOT rewritten
     * here. Both are transformed at render time (PageRenderer.renderPageContent /
     * renderSinglePage) so the XML keeps the original references and survives an
     * export → re-import round trip (#1927).
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
      for (const page of clonedPages) {
        for (const block of page.blocks || []) {
          for (const component of block.components || []) {
            if (component.content) {
              component.content = await this.addFilenamesToAssetUrls(component.content);
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
            while (usedFilenames.has(filename)) {
              filename = `${base}${counter}.html`;
              counter++;
            }
          } else {
            let counter = 2;
            while (usedFilenames.has(filename)) {
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
    // Note: exe-node: internal links are no longer rewritten here. The rewrite moved to
    // render time (PageRenderer.replaceInternalLinks / replaceSinglePageInternalLinks), so
    // the source HTML that feeds content.xml keeps the original exe-node: references and
    // survives an export → re-import round trip (#1927).
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
      return [...this.iteratePageContentFragments(pages), ...this.iteratePagePropertyFragments(pages)].join("\n");
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
     * Yield rich text and other string fragments nested in JSON iDevice properties.
     */
    *iteratePagePropertyFragments(pages) {
      for (const page of pages) {
        for (const block of page.blocks || []) {
          for (const component of block.components || []) {
            yield* iterateJsonPropertyStrings(component.properties);
          }
        }
      }
    }
    /**
     * Detect required libraries across all page fragments incrementally.
     */
    getRequiredLibraryFilesForPages(pages, options = {}) {
      return this.libraryDetector.getAllRequiredFilesWithPatternsFromFragmentGroups(
        [
          { fragments: this.iteratePageContentFragments(pages) },
          {
            fragments: this.iteratePagePropertyFragments(pages),
            excludedLibraries: JSON_PROPERTY_LIBRARY_EXCLUSIONS
          }
        ],
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
    css += `
#packageLicense,
#packageLicense * {
    font-family: var(--exe-license-font, Arial, Verdana, Helvetica, sans-serif) !important;
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
     * Pre-render LaTeX in a page's HTML to SVG+MathML so the export can drop the
     * MathJax engine. Encrypted DataGame data is processed first, then the visible
     * body (which also covers recursive JSON iDevices like adaptative-quiz and
     * trueorfalse). Hooks come from `options` (server/CLI) or, as a fallback, from
     * the browser-global LatexPreRenderer.
     *
     * The caller decides *whether* pre-rendering applies (typically only when
     * MathJax is not bundled). Keeping this the single source of truth ensures the
     * HTML5, single-page (PAGE) and ELPX exports render LaTeX identically.
     *
     * @returns the (possibly updated) HTML and whether any LaTeX was rendered.
     */
    async preRenderHtmlLatex(html, options) {
      let latexRendered = false;
      const preRenderDataGameLatex = options?.preRenderDataGameLatex || this.getBrowserLatexPreRenderer()?.preRenderDataGameLatex;
      if (preRenderDataGameLatex) {
        try {
          const result = await preRenderDataGameLatex(html);
          if (result.count > 0) {
            html = result.html;
            latexRendered = true;
          }
        } catch (error) {
          console.warn("[Html5Exporter] DataGame LaTeX pre-render failed:", error);
        }
      }
      const preRenderLatex = options?.preRenderLatex || this.getBrowserLatexPreRenderer()?.preRender;
      if (preRenderLatex) {
        try {
          const result = await preRenderLatex(html);
          if (result.latexRendered) {
            html = result.html;
            latexRendered = true;
          }
        } catch (error) {
          console.warn("[Html5Exporter] LaTeX pre-render failed:", error);
        }
      }
      return { html, latexRendered };
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
            const latexResult = await this.preRenderHtmlLatex(html, options);
            html = latexResult.html;
            if (latexResult.latexRendered) {
              latexWasRendered = true;
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
        this.addEditableContentXml(pages, meta, addFile);
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
        addMathJax: meta.addMathJax === true,
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
        // xAPI runtime config for the always-on emitter (stable IRIs from odeId)
        xapi: { odeId: meta.odeIdentifier || "", packageTitle: meta.title || "", language: meta.language || "en" },
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
      return PRERENDERED_LATEX_CSS;
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
     * Add the re-editable ODE `content.xml` to the package, unless the author
     * opted out of shipping the source (`exportSource === false`).
     *
     * Single source of truth shared by the HTML5 ZIP export and the Service
     * Worker preview so both decide identically whether the output stays
     * re-importable. During preview the file is registered through `addFile`,
     * so it is automatically listed in `libs/elpx-manifest.js` when a
     * download-source-file iDevice is present.
     */
    addEditableContentXml(pages, meta, addFile) {
      if (meta.exportSource === false) {
        return;
      }
      addFile("content.xml", this.generateContentXml(pages));
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
            const latexResult = await this.preRenderHtmlLatex(html, options);
            html = latexResult.html;
            if (latexResult.latexRendered) {
              latexWasRendered = true;
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
        this.addEditableContentXml(pages, meta, addFile);
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
          const data = await this.resolveAssetExportData(asset);
          files.set(filePath, await this.toPreviewAssetBuffer(data));
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
        const includeMathJax = meta.addMathJax === true;
        let latexWasRendered = false;
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
        const html = this.generateSinglePageHtml(
          pages,
          meta,
          usedIdevices,
          faviconInfo,
          [],
          includeMathJax,
          navLabels
        );
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
          includeMathJax
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
        let singlePageHtml = await this.generateSinglePageHtml(
          pages,
          meta,
          usedIdevices,
          faviconInfo,
          patterns.map((p) => p.name),
          includeMathJax,
          navLabels
        );
        if (!includeMathJax) {
          const latexResult = await this.preRenderHtmlLatex(singlePageHtml, options);
          singlePageHtml = latexResult.html;
          latexWasRendered = latexResult.latexRendered;
        }
        this.zip.addFile(options?.filename || "index.html", singlePageHtml);
        if (latexWasRendered) {
          const decoder = new TextDecoder();
          const encoder = new TextEncoder();
          const baseCssText = decoder.decode(baseCss) + "\n" + this.getPreRenderedLatexCss();
          this.zip.addFile("content/css/base.css", encoder.encode(baseCssText));
        }
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
        // xAPI runtime config for the always-on emitter (stable IRIs from odeId)
        xapi: { odeId: meta.odeIdentifier || "", packageTitle: meta.title || "", language: meta.language || "en" },
        detectedLibraries,
        linkToElp: meta.exportSource !== false,
        addMathJax,
        addExeLink: meta.addExeLink ?? true,
        // Pre-translated nav labels (resolved from XLF at export time)
        navLabels
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
        addMathJax: meta.addMathJax === true,
        // Accessibility toolbar (exe_atools) when enabled in project properties (#1978)
        addAccessibilityToolbar: meta.addAccessibilityToolbar ?? false,
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
        addMathJax: meta.addMathJax === true,
        // Accessibility toolbar (exe_atools) when enabled in project properties (#1978)
        addAccessibilityToolbar: meta.addAccessibilityToolbar ?? false,
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
        const allPagesForContentXml = pages;
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
        const contentXml = generateOdeXml(meta, allPagesForContentXml);
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
        addMathJax: meta.addMathJax === true,
        // Accessibility toolbar (exe_atools) when enabled in project properties (#1978)
        addAccessibilityToolbar: meta.addAccessibilityToolbar ?? false,
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
  var import_xmldom = __toESM(require_lib());
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
    ".vtt": "text/vtt",
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
        const internalPageTargets = this.buildInternalPageTargets(pageFilenameMap);
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
            navLabels,
            internalPageTargets
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
     * @param internalPageTargets - Set of internal page filenames (.html basenames) to rewrite to .xhtml
     */
    generatePageXhtml(page, allPages, meta, isIndex, pageIndex, themeFiles, faviconInfo, navLabels, internalPageTargets) {
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
        // Accessibility toolbar (exe_atools) when enabled in project properties (#1978)
        addAccessibilityToolbar: meta.addAccessibilityToolbar ?? false,
        totalPages: allPages.length,
        currentPageIndex: pageIndex,
        // Pre-translated labels (resolved from XLF at export time)
        navLabels,
        // Application version for generator meta tag
        version: meta.exelearningVersion,
        // EPUB-specific: load guard script for duplicate execution protection
        isEpub: true
      });
      return this.htmlToXhtml(pageHtml, lang, internalPageTargets);
    }
    /**
     * Build the set of internal page filenames (lowercased `.html` basenames) that the
     * exporter itself generated for this project.
     *
     * Only links resolving to one of these targets are rewritten from `.html` to `.xhtml`;
     * external URLs and prose mentioning ".html" are never touched. The map stores the
     * canonical `index.html` and `{sanitized-title}.html` filenames produced by
     * {@link BaseExporter.buildPageFilenameMap}.
     */
    buildInternalPageTargets(pageFilenameMap) {
      const targets = /* @__PURE__ */ new Set();
      for (const filename of pageFilenameMap.values()) {
        targets.add(filename.toLowerCase());
      }
      return targets;
    }
    /**
     * Rewrite an internal page link attribute (`href`/`src`) from `.html` to `.xhtml`.
     *
     * Only rewrites when the attribute resolves to a known internal page filename
     * (from {@link buildInternalPageTargets}). Leaves external URLs (any value with a
     * URI scheme such as `http:`, `https:`, `mailto:`, `data:`) and non-page links
     * untouched. Preserves any `?query` and `#fragment` suffixes.
     */
    rewriteInternalLinkAttribute(value, internalPageTargets) {
      const hashIndex = value.indexOf("#");
      const fragment = hashIndex !== -1 ? value.slice(hashIndex) : "";
      const beforeHash = hashIndex !== -1 ? value.slice(0, hashIndex) : value;
      const queryIndex = beforeHash.indexOf("?");
      const query = queryIndex !== -1 ? beforeHash.slice(queryIndex) : "";
      const pathPart = queryIndex !== -1 ? beforeHash.slice(0, queryIndex) : beforeHash;
      if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(pathPart)) {
        return value;
      }
      if (!pathPart.toLowerCase().endsWith(".html")) {
        return value;
      }
      const basename = pathPart.split("/").pop() || "";
      if (!internalPageTargets.has(basename.toLowerCase())) {
        return value;
      }
      const newPath = `${pathPart.slice(0, -".html".length)}.xhtml`;
      return `${newPath}${query}${fragment}`;
    }
    /**
     * Convert HTML to XHTML for EPUB3.
     *
     * Parses the page with `@xmldom/xmldom` (the cross-runtime DOM implementation already
     * used by the import pipeline; works in both the browser and Bun) and re-serializes it
     * as XHTML. This correctly self-closes void elements even when their attributes contain
     * `>` (e.g. `<input value="a > b">`), escapes attribute values, and preserves
     * `<script>`/`<style>` contents without mangling.
     *
     * Internal page links (`.html` references the exporter generated) are rewritten to
     * `.xhtml` on the parsed DOM, so external URLs and prose mentioning ".html" are never
     * altered.
     *
     * If the document cannot be parsed (only on truly malformed, non-recoverable input),
     * falls back to a conservative regex-based conversion that still scopes link rewriting
     * to internal targets.
     */
    htmlToXhtml(html, lang, internalPageTargets) {
      const targets = internalPageTargets ?? /* @__PURE__ */ new Set();
      let prepared = html;
      if (!prepared.startsWith("<?xml")) {
        prepared = `<?xml version="1.0" encoding="UTF-8"?>
${prepared}`;
      }
      if (!prepared.includes("<!DOCTYPE")) {
        prepared = prepared.replace(
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html>'
        );
      }
      prepared = prepared.replace(/<html([^>]*)>/i, (_match, attrs) => {
        const cleanAttrs = attrs.replace(/\s+xml:lang=["'][^"']*["']/gi, "").replace(/\s+lang=["'][^"']*["']/gi, "");
        return `<html xmlns="${EPUB3_NAMESPACES.XHTML}" xml:lang="${lang}" lang="${lang}"${cleanAttrs}>`;
      });
      try {
        const parser = new import_xmldom.DOMParser({
          onError: (level, message) => {
            if (level === "fatalError") {
              throw new Error(message);
            }
          }
        });
        const doc = parser.parseFromString(prepared, "text/html");
        for (const element of Array.from(doc.getElementsByTagName("*"))) {
          for (const attr of ["href", "src"]) {
            const value = element.getAttribute(attr);
            if (value) {
              const rewritten = this.rewriteInternalLinkAttribute(value, targets);
              if (rewritten !== value) {
                element.setAttribute(attr, rewritten);
              }
            }
          }
        }
        let xhtml = new import_xmldom.XMLSerializer().serializeToString(doc);
        xhtml = xhtml.replace(/\s+style=["']\s*["']/g, "");
        return xhtml;
      } catch {
        return this.htmlToXhtmlFallback(prepared, targets);
      }
    }
    /**
     * Conservative regex-based HTML→XHTML conversion used only when DOM parsing fails on
     * unrecoverable input. Self-closes void elements (tolerating quoted attributes that
     * contain `>`) and rewrites only internal page links.
     */
    htmlToXhtmlFallback(html, internalPageTargets) {
      let xhtml = html;
      const voidPattern = new RegExp(`<(${VOID_ELEMENTS.join("|")})\\b((?:"[^"]*"|'[^']*'|[^>"'])*?)\\s*/?>`, "gi");
      xhtml = xhtml.replace(voidPattern, (_match, tag, attrs) => `<${tag}${attrs.replace(/\s+$/, "")} />`);
      const linkPattern = /\b(href|src)=("([^"]*)"|'([^']*)')/gi;
      xhtml = xhtml.replace(linkPattern, (match, attr, _quoted, dq, sq) => {
        const quote = dq !== void 0 ? '"' : "'";
        const value = dq !== void 0 ? dq : sq;
        const rewritten = this.rewriteInternalLinkAttribute(value, internalPageTargets);
        return rewritten === value ? match : `${attr}=${quote}${rewritten}${quote}`;
      });
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
          await this.writeAssetToZip(`EPUB/${zipPath}`, asset);
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
      return PRERENDERED_LATEX_CSS;
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
        let latexWasRendered = false;
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
          if (!meta.addMathJax) {
            const latexResult = await this.preRenderHtmlLatex(html, options);
            html = latexResult.html;
            if (latexResult.latexRendered) {
              latexWasRendered = true;
            }
          }
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
          includeAccessibilityToolbar: meta.addAccessibilityToolbar === true,
          includeMathJax: meta.addMathJax === true,
          skipMathJax: latexWasRendered && !meta.addMathJax
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
        if (needsElpxDownload) {
          const manifestPath = "libs/elpx-manifest.js";
          const manifestFiles = this.zip.getFilePaths().filter((path) => path !== manifestPath);
          manifestFiles.push(manifestPath);
          const manifestJs = this.generateElpxManifestFile(manifestFiles);
          this.zip.addFile(manifestPath, manifestJs);
        }
        this.logElpxExportDebugPhase("exporter:zip-generate:start", {
          zipFiles: this.zip.getFilePaths?.().length ?? fileList?.length ?? null
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
      xml += `        <odeComponentsProperties>
`;
      xml += this.generateComponentPropertiesXml(comp);
      xml += `        </odeComponentsProperties>
`;
      xml += "      </odeComponent>\n";
      return xml;
    }
    /**
     * Generate the <odeComponentsProperty> entries for an iDevice's structure
     * properties (visibility, teacherOnly, cssClass).
     *
     * Mirrors OdeXmlGenerator.generateOdeComponentXml() so a single-block or
     * single-iDevice export keeps the same component metadata as a full-page
     * ELPX export (issue #1991). Previously this block was emitted empty, so
     * "Visible in export", "Teacher only" and custom CSS classes were dropped
     * when a .block/.idevice was exported and re-imported.
     *
     * When a component has no structureProperties we still emit visibility=true,
     * matching COMPONENT_PROPERTY_DEFAULTS applied on import.
     *
     * @param comp - Component data (structureProperties carry the values)
     */
    generateComponentPropertiesXml(comp) {
      const entry = (key, value) => `          <odeComponentsProperty>
            <key>${this.escapeXml(key)}</key>
            <value>${this.escapeXml(value)}</value>
          </odeComponentsProperty>
`;
      const props = comp.structureProperties;
      if (props) {
        let xml = "";
        const componentPropKeys = ["visibility", "teacherOnly", "cssClass"];
        for (const key of componentPropKeys) {
          if (props[key] !== void 0) {
            xml += entry(key, String(props[key]));
          }
        }
        return xml;
      }
      return entry("visibility", "true");
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
              await this.writeAssetToZip(zipPath, asset);
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
              await this.writeAssetToZip(zipPath, asset, trackingList);
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
