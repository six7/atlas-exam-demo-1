/**
 * Atlas prototype feedback overlay.
 *
 * Served from the production deployment and loaded by every prototype,
 * whatever branch it was built from. That is the point: a prototype merged
 * months ago picks up improvements here without being rebuilt.
 *
 * Consequences of that decision, which shape everything below:
 *
 *   - No framework, no build step. This file ships as-is, so it cannot depend
 *     on the React version — or any dependency — of the page hosting it.
 *   - The UI lives in a shadow root, so a prototype's CSS cannot leak in and
 *     this cannot leak out.
 *   - Requests go to the origin that served this script, not the page's own
 *     origin, so a preview deployment needs no Supabase configuration.
 *
 * Loaded by src/components/Feedback/FeedbackLoader.tsx as:
 *   <script src="{production}/feedback.js" data-atlas-feedback data-slug="…">
 */
(function () {
  "use strict";

  var tag = document.currentScript ||
    document.querySelector("script[data-atlas-feedback]");
  if (!tag) return;

  var SLUG = tag.getAttribute("data-slug") || "";
  if (!SLUG) return;

  // Where this script came from is where the API lives.
  var API = new URL(tag.getAttribute("src"), location.href).origin;

  if (window.__atlasFeedbackMounted) return;
  window.__atlasFeedbackMounted = true;

  var NAME_KEY = "atlas.feedback.display-name";
  var Z = 2147483000;

  /* ---------------------------------------------------------------- */
  /* state                                                             */
  /* ---------------------------------------------------------------- */

  var comments = [];
  var status = "idle"; // idle | loading | ready | unavailable
  var statusMessage = "";
  var panelOpen = false;
  var picking = false;
  var draft = null; // { selector, x, y, label }
  var activeSelector = null; // filter the panel to one pin
  var posting = false;

  function displayName() {
    try {
      var v = localStorage.getItem(NAME_KEY);
      return v && v.trim() ? v.trim() : null;
    } catch (e) {
      return null;
    }
  }
  function setDisplayName(v) {
    try {
      localStorage.setItem(NAME_KEY, v.trim().slice(0, 80));
    } catch (e) {
      /* storage disabled — the name applies for this session only */
    }
  }

  /* ---------------------------------------------------------------- */
  /* element identity                                                  */
  /* ---------------------------------------------------------------- */

  /**
   * A selector for `el`, good enough to find it again on a later build.
   *
   * Deliberately shallow and structural: prototypes are edited constantly, so
   * a long brittle path buys nothing. An explicit data-feedback-id wins, then
   * an id, then a short nth-of-type path. When it stops resolving the comment
   * is shown unanchored rather than dropped.
   */
  function selectorFor(el) {
    if (el.getAttribute && el.getAttribute("data-feedback-id")) {
      return '[data-feedback-id="' + el.getAttribute("data-feedback-id") + '"]';
    }
    if (el.id && /^[A-Za-z][\w-]*$/.test(el.id)) return "#" + el.id;

    var parts = [];
    var node = el;
    // 32 is a safety valve against pathological trees, not a realistic cap —
    // component libraries routinely wrap a nav item in 8-10 divs, so a short
    // cap was cutting the walk off before it reached <body>.
    while (node && node.nodeType === 1 && node !== document.body && parts.length < 32) {
      var part = node.tagName.toLowerCase();
      var parent = node.parentElement;
      if (parent) {
        var same = [];
        for (var i = 0; i < parent.children.length; i++) {
          if (parent.children[i].tagName === node.tagName) same.push(parent.children[i]);
        }
        if (same.length > 1) {
          part += ":nth-of-type(" + (same.indexOf(node) + 1) + ")";
        }
      }
      parts.unshift(part);
      node = node.parentElement;
    }
    // Only claim the "body >" anchor when the walk actually reached <body>.
    // Asserting it after an early stop describes a parent/child relationship
    // that doesn't exist, so the selector would never match anything.
    return (node === document.body ? "body > " : "") + parts.join(" > ");
  }

  /** Human-readable fallback for when the selector stops matching. */
  function labelFor(el) {
    var tagName = el.tagName.toLowerCase();
    var text = (el.textContent || "").replace(/\s+/g, " ").trim();
    return text ? tagName + " · " + text.slice(0, 40) : tagName;
  }

  function resolve(selector) {
    if (!selector) return null;
    try {
      return document.querySelector(selector);
    } catch (e) {
      return null; // stored selector is no longer valid syntax
    }
  }

  /* ---------------------------------------------------------------- */
  /* shadow root                                                       */
  /* ---------------------------------------------------------------- */

  var host = document.createElement("div");
  host.setAttribute("data-atlas-feedback-root", "");
  // Marks this as chrome so CI screenshots exclude it.
  host.setAttribute("data-screenshot-hide", "");
  host.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:" + Z + ";";
  var root = host.attachShadow({ mode: "open" });

  var style = document.createElement("style");
  style.textContent = [
    ":host{all:initial}",
    "*{box-sizing:border-box;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif}",
    ".pe{pointer-events:auto}",

    /* trigger */
    ".btn{position:fixed;bottom:20px;right:20px;display:flex;align-items:center;gap:8px;height:42px;padding:0 16px;",
    "border:0;border-radius:999px;background:#73BF33;color:#fff;font-size:13px;font-weight:600;cursor:pointer;",
    "box-shadow:0 8px 24px rgba(22,47,2,.28)}",
    ".btn:hover{background:#5B9428}",
    ".btn .count{display:inline-flex;align-items:center;justify-content:center;min-width:19px;height:19px;",
    "padding:0 5px;border-radius:999px;background:rgba(255,255,255,.26);font-size:11px}",
    ".btn kbd{font:inherit;font-size:10px;opacity:.75;border:1px solid rgba(255,255,255,.45);",
    "border-radius:3px;padding:0 4px;margin-left:2px}",

    /* panel */
    ".panel{position:fixed;bottom:74px;right:20px;width:min(340px,calc(100vw - 40px));",
    "max-height:min(30rem,calc(100vh - 120px));display:flex;flex-direction:column;overflow:hidden;",
    "background:#fff;color:#162F02;border:1px solid #DDE5D1;border-radius:14px;",
    "box-shadow:0 16px 40px rgba(22,47,2,.18)}",
    ".ph{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px;border-bottom:1px solid #DDE5D1}",
    ".ph h2{margin:0;font-size:13px;font-weight:600}",
    ".ph p{margin:2px 0 0;font-size:11px;color:#4F5E41}",
    ".x{border:0;background:none;cursor:pointer;color:#4F5E41;font-size:16px;line-height:1;padding:4px}",
    ".body{flex:1;overflow-y:auto;padding:12px 14px;display:flex;flex-direction:column;gap:12px}",
    ".empty{margin:0;font-size:12px;color:#4F5E41;line-height:1.55}",

    /* comment */
    ".c{display:flex;gap:9px}",
    ".av{flex:none;width:22px;height:22px;border-radius:999px;background:#F5FDEB;color:#5B9428;",
    "display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700}",
    ".c .m{min-width:0;flex:1}",
    ".c .who{font-size:11.5px;font-weight:600}",
    ".c .when{font-size:10.5px;color:#4F5E41;margin-left:6px;font-weight:400}",
    ".c .txt{margin:2px 0 0;font-size:12px;line-height:1.55;color:#39462D;white-space:pre-wrap;word-break:break-word}",
    ".anchor{display:inline-flex;align-items:center;gap:4px;margin-top:4px;padding:1px 6px;border-radius:4px;",
    "background:#EEF2E7;color:#4F5E41;font-size:10px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer}",
    ".anchor.gone{background:#FBEEEB;color:#A63B29;cursor:default}",

    /* composer */
    ".foot{border-top:1px solid #DDE5D1;padding:10px 12px;display:flex;flex-direction:column;gap:8px}",
    ".target{display:flex;align-items:center;gap:6px;font-size:11px;color:#4F5E41}",
    ".target b{color:#162F02;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    "textarea,input{width:100%;border:1px solid #DDE5D1;border-radius:8px;padding:7px 9px;font-size:12px;",
    "color:#162F02;background:#fff;outline:none;resize:none}",
    "textarea:focus,input:focus{border-color:#73BF33}",
    ".row{display:flex;align-items:center;justify-content:space-between;gap:8px}",
    ".go{border:0;border-radius:7px;background:#73BF33;color:#fff;font-size:12px;font-weight:600;",
    "padding:6px 12px;cursor:pointer}",
    ".go:disabled{opacity:.5;cursor:default}",
    ".ghost{border:1px solid #DDE5D1;background:#fff;color:#39462D;border-radius:7px;font-size:11px;padding:5px 9px;cursor:pointer}",
    ".hint{margin:0;font-size:10.5px;color:#4F5E41;line-height:1.5}",
    ".err{margin:0;font-size:11px;color:#A63B29}",

    /* picking */
    ".ring{position:fixed;border:2px solid #73BF33;border-radius:4px;background:rgba(115,191,51,.10);",
    "pointer-events:none;transition:all .06s linear}",
    ".tip{position:fixed;top:16px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:10px;",
    "background:#162F02;color:#fff;font-size:12px;padding:8px 14px;border-radius:999px;",
    "box-shadow:0 8px 24px rgba(0,0,0,.3)}",
    ".tip kbd{font:inherit;font-size:10px;border:1px solid rgba(255,255,255,.4);border-radius:3px;padding:0 4px}",

    /* pins */
    ".pin{position:fixed;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:999px 999px 999px 2px;",
    "background:#73BF33;color:#fff;border:2px solid #fff;display:flex;align-items:center;justify-content:center;",
    "font-size:10px;font-weight:700;cursor:pointer;box-shadow:0 3px 10px rgba(22,47,2,.35)}",
    ".pin:hover{background:#5B9428}",
    ".pin.on{outline:2px solid #162F02;outline-offset:2px}",

    "@media (prefers-color-scheme:dark){",
    ".panel{background:#16240C;color:#E9F1E0;border-color:#2A3D1B}",
    ".ph{border-color:#2A3D1B}.foot{border-color:#2A3D1B}",
    ".ph p,.empty,.c .when,.target,.hint{color:#97A889}",
    ".c .txt{color:#C3D2B4}",
    ".av{background:#18280D;color:#A8E072}",
    ".anchor{background:#1D2E11;color:#97A889}",
    "textarea,input{background:#0E1706;border-color:#2A3D1B;color:#E9F1E0}",
    ".ghost{background:#0E1706;border-color:#2A3D1B;color:#C3D2B4}",
    "}",
  ].join("");
  root.appendChild(style);

  var ui = document.createElement("div");
  root.appendChild(ui);

  /* ---------------------------------------------------------------- */
  /* helpers                                                           */
  /* ---------------------------------------------------------------- */

  function h(tagName, attrs, children) {
    var el = document.createElement(tagName);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "class") el.className = attrs[k];
        else if (k === "text") el.textContent = attrs[k];
        else if (k.slice(0, 2) === "on") el[k.toLowerCase()] = attrs[k];
        else if (attrs[k] != null) el.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (c) el.appendChild(c);
    });
    return el;
  }

  function initials(name) {
    var parts = String(name || "?").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function ago(iso) {
    var ms = Date.now() - new Date(iso).getTime();
    if (!(ms >= 0)) return "just now";
    var m = Math.floor(ms / 60000);
    if (m < 1) return "just now";
    if (m < 60) return m + "m ago";
    var hr = Math.floor(m / 60);
    if (hr < 24) return hr + "h ago";
    var d = Math.floor(hr / 24);
    if (d < 7) return d + "d ago";
    return new Date(iso).toLocaleDateString();
  }

  /* ---------------------------------------------------------------- */
  /* data                                                              */
  /* ---------------------------------------------------------------- */

  function load() {
    status = "loading";
    render();
    fetch(API + "/api/feedback?slug=" + encodeURIComponent(SLUG), {
      cache: "no-store",
    })
      .then(function (r) {
        return r.json().then(function (b) {
          return { ok: r.ok, body: b };
        });
      })
      .then(function (res) {
        if (!res.ok) {
          status = "unavailable";
          statusMessage = (res.body && res.body.error) || "Feedback is unavailable.";
        } else {
          comments = res.body.feedback || [];
          status = "ready";
        }
        render();
      })
      .catch(function () {
        status = "unavailable";
        statusMessage = "Could not reach the feedback service.";
        render();
      });
  }

  function post(text) {
    posting = true;
    render();
    var payload = {
      slug: SLUG,
      body: text,
      authorName: displayName() || "Anonymous",
    };
    if (draft) {
      payload.selector = draft.selector;
      payload.anchorX = draft.x;
      payload.anchorY = draft.y;
      payload.anchorLabel = draft.label;
    }
    return fetch(API + "/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (r) {
        return r.json().then(function (b) {
          return { ok: r.ok, body: b };
        });
      })
      .then(function (res) {
        posting = false;
        if (!res.ok) {
          statusMessage = (res.body && res.body.error) || "Could not post.";
        } else {
          comments.push(res.body.feedback);
          draft = null;
          statusMessage = "";
        }
        render();
        return res.ok;
      })
      .catch(function () {
        posting = false;
        statusMessage = "Could not reach the feedback service.";
        render();
        return false;
      });
  }

  /* ---------------------------------------------------------------- */
  /* element picking                                                   */
  /* ---------------------------------------------------------------- */

  var ring = null;
  var hovered = null;

  function startPicking() {
    if (picking) return;
    picking = true;
    activeSelector = null;
    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("click", onPick, true);
    document.addEventListener("keydown", onPickKey, true);
    render();
  }

  function stopPicking() {
    if (!picking) return;
    picking = false;
    hovered = null;
    document.removeEventListener("mousemove", onMove, true);
    document.removeEventListener("click", onPick, true);
    document.removeEventListener("keydown", onPickKey, true);
    render();
  }

  function onMove(e) {
    var el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || host.contains(el) || el === document.documentElement) return;
    hovered = el;
    positionRing();
  }

  function positionRing() {
    if (!ring || !hovered) return;
    var r = hovered.getBoundingClientRect();
    ring.style.left = r.left + "px";
    ring.style.top = r.top + "px";
    ring.style.width = r.width + "px";
    ring.style.height = r.height + "px";
  }

  function onPick(e) {
    var el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || host.contains(el)) return;
    e.preventDefault();
    e.stopPropagation();

    var r = el.getBoundingClientRect();
    draft = {
      selector: selectorFor(el),
      // Normalised inside the box so the pin survives a resize.
      x: r.width ? Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) : 0.5,
      y: r.height ? Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) : 0.5,
      label: labelFor(el),
    };
    stopPicking();
    panelOpen = true;
    render();
    var box = root.querySelector("textarea");
    if (box) box.focus();
  }

  function onPickKey(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      stopPicking();
    }
  }

  /* ---------------------------------------------------------------- */
  /* pins                                                              */
  /* ---------------------------------------------------------------- */

  var pinLayer = null;

  /** Comments grouped by the element they point at, anchored ones only. */
  function pinGroups() {
    var groups = {};
    comments.forEach(function (c) {
      if (!c.selector) return;
      (groups[c.selector] = groups[c.selector] || []).push(c);
    });
    return groups;
  }

  function renderPins() {
    if (!pinLayer) return;
    pinLayer.textContent = "";
    if (picking) return;

    var groups = pinGroups();
    Object.keys(groups).forEach(function (selector) {
      var el = resolve(selector);
      if (!el) return; // element is gone; the comment still shows in the panel
      var r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;

      var group = groups[selector];
      var first = group[0];
      var pin = h("button", {
        class: "pin pe" + (activeSelector === selector ? " on" : ""),
        title: group.length + " comment" + (group.length === 1 ? "" : "s"),
        text: group.length > 1 ? String(group.length) : initials(first.author_name),
        onclick: function (e) {
          e.stopPropagation();
          activeSelector = activeSelector === selector ? null : selector;
          panelOpen = true;
          render();
        },
      });
      pin.style.left = r.left + (first.anchor_x != null ? first.anchor_x : 0.5) * r.width + "px";
      pin.style.top = r.top + (first.anchor_y != null ? first.anchor_y : 0.5) * r.height + "px";
      pinLayer.appendChild(pin);
    });
  }

  var frame = null;
  function schedulePins() {
    if (frame) return;
    frame = requestAnimationFrame(function () {
      frame = null;
      renderPins();
      positionRing();
    });
  }
  addEventListener("scroll", schedulePins, true);
  addEventListener("resize", schedulePins);

  /* ---------------------------------------------------------------- */
  /* render                                                            */
  /* ---------------------------------------------------------------- */

  function visibleComments() {
    if (!activeSelector) return comments;
    return comments.filter(function (c) {
      return c.selector === activeSelector;
    });
  }

  function commentNode(c) {
    var anchor = null;
    if (c.selector) {
      var alive = !!resolve(c.selector);
      anchor = h("span", {
        class: "anchor" + (alive ? " pe" : " gone"),
        text: alive ? c.anchor_label || "on this element" : (c.anchor_label || "element") + " (gone)",
        title: alive ? "Show this element" : "This element is no longer on the page",
        onclick: alive
          ? function () {
              var el = resolve(c.selector);
              if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
              activeSelector = c.selector;
              render();
            }
          : null,
      });
    }
    return h("div", { class: "c" }, [
      h("span", { class: "av", text: initials(c.author_name) }),
      h("div", { class: "m" }, [
        h("div", {}, [
          h("span", { class: "who", text: c.author_name }),
          h("span", { class: "when", text: ago(c.created_at) }),
        ]),
        h("p", { class: "txt", text: c.body }),
        anchor,
      ]),
    ]);
  }

  function composer() {
    var name = displayName();

    if (!name) {
      var nameInput = h("input", { placeholder: "Sam Wilson", maxlength: "80" });
      var save = function () {
        if (!nameInput.value.trim()) return;
        setDisplayName(nameInput.value);
        render();
        var t = root.querySelector("textarea");
        if (t) t.focus();
      };
      nameInput.onkeydown = function (e) {
        if (e.key === "Enter") save();
      };
      return h("div", { class: "foot pe" }, [
        h("p", { class: "hint", text: "What should we call you?" }),
        h("div", { class: "row" }, [
          nameInput,
          h("button", { class: "go", text: "Save", onclick: save }),
        ]),
        h("p", {
          class: "hint",
          text: "Stored in this browser only. You will not be asked again.",
        }),
      ]);
    }

    var area = h("textarea", {
      rows: "2",
      maxlength: "4000",
      placeholder: draft ? "Comment on " + draft.label : "Comment on this page…",
    });
    var send = function () {
      var v = area.value.trim();
      if (!v || posting) return;
      post(v);
    };
    area.onkeydown = function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") send();
    };

    return h("div", { class: "foot pe" }, [
      draft
        ? h("div", { class: "target" }, [
            h("span", { text: "◉" }),
            h("b", { text: draft.label }),
            h("button", {
              class: "ghost",
              text: "Clear",
              onclick: function () {
                draft = null;
                render();
              },
            }),
          ])
        : h("button", {
            class: "ghost",
            text: "◎  Attach to an element",
            onclick: startPicking,
          }),
      area,
      statusMessage && status === "ready"
        ? h("p", { class: "err", text: statusMessage })
        : null,
      h("div", { class: "row" }, [
        h("span", { class: "hint", text: "as " + name }),
        h("button", {
          class: "go",
          text: posting ? "Posting…" : "Post",
          disabled: posting ? "" : null,
          onclick: send,
        }),
      ]),
    ]);
  }

  function render() {
    ui.textContent = "";

    // Pins sit behind the panel but above the page.
    pinLayer = h("div", {});
    ui.appendChild(pinLayer);

    if (picking) {
      ring = h("div", { class: "ring" });
      ui.appendChild(ring);
      ui.appendChild(
        h("div", { class: "tip" }, [
          h("span", { text: "Click an element to comment on it" }),
          h("kbd", { text: "Esc" }),
        ])
      );
      positionRing();
    } else {
      ring = null;
    }

    if (panelOpen) {
      var list = visibleComments();
      var body;
      if (status === "loading") {
        body = h("p", { class: "empty", text: "Loading…" });
      } else if (status === "unavailable") {
        body = h("p", { class: "empty", text: statusMessage });
      } else if (!list.length) {
        body = h("p", {
          class: "empty",
          text: activeSelector
            ? "No comments on this element yet."
            : "No feedback yet. Press C, or use the button below, to point at something.",
        });
      } else {
        body = h(
          "div",
          { class: "body" },
          list.map(commentNode)
        );
      }
      if (body.className !== "body") {
        body = h("div", { class: "body" }, [body]);
      }

      ui.appendChild(
        h("div", { class: "panel pe" }, [
          h("div", { class: "ph" }, [
            h("div", {}, [
              h("h2", { text: activeSelector ? "This element" : "Feedback" }),
              h("p", { text: activeSelector ? "Filtered · click the pin again to clear" : SLUG }),
            ]),
            h("button", {
              class: "x",
              text: "✕",
              title: "Close",
              onclick: function () {
                panelOpen = false;
                activeSelector = null;
                render();
              },
            }),
          ]),
          body,
          status === "ready" ? composer() : null,
        ])
      );
    }

    var anchored = comments.filter(function (c) {
      return c.selector;
    }).length;
    ui.appendChild(
      h("button", { class: "btn pe", onclick: toggle }, [
        h("span", { text: panelOpen ? "✕" : "◎" }),
        h("span", { text: "Feedback" }),
        comments.length && !panelOpen
          ? h("span", { class: "count", text: String(comments.length) })
          : null,
        !panelOpen && !comments.length ? h("kbd", { text: "C" }) : null,
      ])
    );

    renderPins();
    void anchored;
  }

  function toggle() {
    panelOpen = !panelOpen;
    if (panelOpen && status === "idle") load();
    if (!panelOpen) {
      activeSelector = null;
      stopPicking();
    }
    render();
  }

  /* ---------------------------------------------------------------- */
  /* keyboard                                                          */
  /* ---------------------------------------------------------------- */

  function typing(el) {
    if (!el) return false;
    var t = el.tagName;
    return t === "INPUT" || t === "TEXTAREA" || t === "SELECT" || el.isContentEditable;
  }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "c" && e.key !== "C") return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (typing(e.target) || typing(root.activeElement)) return;
    e.preventDefault();
    if (status === "idle") load();
    if (picking) stopPicking();
    else startPicking();
  });

  /* ---------------------------------------------------------------- */

  function mount() {
    document.body.appendChild(host);
    render();
    // Pins should appear without opening the panel first.
    load();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
