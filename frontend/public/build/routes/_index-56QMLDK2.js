import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation
} from "/build/_shared/chunk-LZS3KBGS.js";
import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-XGOTYLZ5.js";
import "/build/_shared/chunk-U4FRFQSK.js";
import "/build/_shared/chunk-7M6SC7J5.js";
import {
  createHotContext
} from "/build/_shared/chunk-MCH5QMAS.js";
import "/build/_shared/chunk-UWV35TSL.js";
import {
  __commonJS,
  __toESM
} from "/build/_shared/chunk-PNG5AS42.js";

// empty-module:@remix-run/node
var require_node = __commonJS({
  "empty-module:@remix-run/node"(exports, module) {
    module.exports = {};
  }
});

// app/routes/_index.tsx
var import_node = __toESM(require_node(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/_index.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/_index.tsx"
  );
  import.meta.hot.lastModified = "1749120173595.7266";
}
function Index() {
  _s();
  const data = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
    fontFamily: "system-ui, sans-serif",
    lineHeight: "1.4",
    padding: "20px"
  }, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", { children: "Pokemon Battle" }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 97,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", { children: [
      "Choisissez vos Pok\xE9mon - ",
      data.pokemon?.length,
      " disponibles"
    ] }, void 0, true, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 98,
      columnNumber: 7
    }, this),
    actionData?.message && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
      padding: "10px",
      marginBottom: "20px",
      borderRadius: "5px",
      backgroundColor: actionData.success ? "#d4edda" : "#f8d7da",
      color: actionData.success ? "#155724" : "#721c24",
      border: `1px solid ${actionData.success ? "#c3e6cb" : "#f5c6cb"}`
    }, children: actionData.message }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 100,
      columnNumber: 31
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
      gap: "15px"
    }, children: data.pokemon?.map((pokemon) => {
      const hp = pokemon.stats.find((s) => s.stat.name === "hp")?.base_stat || 100;
      const attack = pokemon.stats.find((s) => s.stat.name === "attack")?.base_stat || 50;
      const defense = pokemon.stats.find((s) => s.stat.name === "defense")?.base_stat || 50;
      const speed = pokemon.stats.find((s) => s.stat.name === "speed")?.base_stat || 50;
      return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "15px",
        backgroundColor: "#f9f9f9",
        transition: "transform 0.2s"
      }, children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
          textAlign: "center"
        }, children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("img", { src: pokemon.sprites.front_default, alt: pokemon.name, style: {
            width: "120px",
            height: "120px"
          } }, void 0, false, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 131,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", { style: {
            textTransform: "capitalize",
            margin: "10px 0",
            color: "#333"
          }, children: [
            "#",
            pokemon.id.toString().padStart(3, "0"),
            " ",
            pokemon.name
          ] }, void 0, true, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 135,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 128,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
          fontSize: "14px",
          marginBottom: "10px"
        }, children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("strong", { children: "Types:" }, void 0, false, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 148,
              columnNumber: 20
            }, this),
            " ",
            pokemon.types.map((t) => t.type.name).join(", ")
          ] }, void 0, true, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 148,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("strong", { children: "Taille:" }, void 0, false, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 149,
              columnNumber: 20
            }, this),
            " ",
            pokemon.height / 10,
            " m | ",
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("strong", { children: "Poids:" }, void 0, false, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 149,
              columnNumber: 71
            }, this),
            " ",
            pokemon.weight / 10,
            " kg"
          ] }, void 0, true, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 149,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 144,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "5px",
          fontSize: "12px",
          marginBottom: "15px"
        }, children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
            backgroundColor: "#e0e0e0",
            padding: "3px 6px",
            borderRadius: "4px"
          }, children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("strong", { children: "HP:" }, void 0, false, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 164,
              columnNumber: 19
            }, this),
            " ",
            hp
          ] }, void 0, true, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 159,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
            backgroundColor: "#e0e0e0",
            padding: "3px 6px",
            borderRadius: "4px"
          }, children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("strong", { children: "Attaque:" }, void 0, false, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 171,
              columnNumber: 19
            }, this),
            " ",
            attack
          ] }, void 0, true, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 166,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
            backgroundColor: "#e0e0e0",
            padding: "3px 6px",
            borderRadius: "4px"
          }, children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("strong", { children: "D\xE9fense:" }, void 0, false, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 178,
              columnNumber: 19
            }, this),
            " ",
            defense
          ] }, void 0, true, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 173,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
            backgroundColor: "#e0e0e0",
            padding: "3px 6px",
            borderRadius: "4px"
          }, children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("strong", { children: "Vitesse:" }, void 0, false, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 185,
              columnNumber: 19
            }, this),
            " ",
            speed
          ] }, void 0, true, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 180,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 152,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Form, { method: "post", style: {
          textAlign: "center"
        }, children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { type: "hidden", name: "id", value: pokemon.id }, void 0, false, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 192,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { type: "hidden", name: "name", value: pokemon.name }, void 0, false, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 193,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { type: "hidden", name: "type", value: pokemon.types.map((t) => t.type.name).join("/") }, void 0, false, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 194,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { type: "hidden", name: "hp", value: hp }, void 0, false, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 195,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { type: "hidden", name: "attack", value: attack }, void 0, false, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 196,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { type: "hidden", name: "defense", value: defense }, void 0, false, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 197,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { type: "hidden", name: "speed", value: speed }, void 0, false, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 198,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { type: "hidden", name: "height", value: pokemon.height }, void 0, false, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 199,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { type: "hidden", name: "weight", value: pokemon.weight }, void 0, false, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 200,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { type: "hidden", name: "sprite_url", value: pokemon.sprites.front_default }, void 0, false, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 201,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { type: "submit", disabled: navigation.state === "submitting", style: {
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            opacity: navigation.state === "submitting" ? 0.6 : 1
          }, children: navigation.state === "submitting" ? "Ajout en cours..." : "Ajouter \xE0 mon \xE9quipe" }, void 0, false, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 203,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 189,
          columnNumber: 15
        }, this)
      ] }, pokemon.id, true, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 121,
        columnNumber: 16
      }, this);
    }) }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 111,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/_index.tsx",
    lineNumber: 92,
    columnNumber: 10
  }, this);
}
_s(Index, "Q6YH5PvE3iyz5kH/ldDGbLeChh4=", false, function() {
  return [useLoaderData, useActionData, useNavigation];
});
_c = Index;
var _c;
$RefreshReg$(_c, "Index");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  Index as default
};
//# sourceMappingURL=/build/routes/_index-56QMLDK2.js.map
