var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: !0 });
};

// node_modules/@remix-run/dev/dist/config/defaults/entry.server.node.tsx
var entry_server_node_exports = {};
__export(entry_server_node_exports, {
  default: () => handleRequest
});
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import * as isbotModule from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { jsxDEV } from "react/jsx-dev-runtime";
var ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  return isBotRequest(request.headers.get("user-agent")) || remixContext.isSpaMode ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function isBotRequest(userAgent) {
  return userAgent ? "isbot" in isbotModule && typeof isbotModule.isbot == "function" ? isbotModule.isbot(userAgent) : "default" in isbotModule && typeof isbotModule.default == "function" ? isbotModule.default(userAgent) : !1 : !1;
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = !1, { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsxDEV(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        },
        void 0,
        !1,
        {
          fileName: "node_modules/@remix-run/dev/dist/config/defaults/entry.server.node.tsx",
          lineNumber: 66,
          columnNumber: 7
        },
        this
      ),
      {
        onAllReady() {
          shellRendered = !0;
          let body = new PassThrough(), stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html"), resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          ), pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500, shellRendered && console.error(error);
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = !1, { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsxDEV(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        },
        void 0,
        !1,
        {
          fileName: "node_modules/@remix-run/dev/dist/config/defaults/entry.server.node.tsx",
          lineNumber: 116,
          columnNumber: 7
        },
        this
      ),
      {
        onShellReady() {
          shellRendered = !0;
          let body = new PassThrough(), stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html"), resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          ), pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500, shellRendered && console.error(error);
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}

// app/root.tsx
var root_exports = {};
__export(root_exports, {
  ErrorBoundary: () => ErrorBoundary,
  default: () => App
});
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from "@remix-run/react";
import { jsxDEV as jsxDEV2 } from "react/jsx-dev-runtime";
function App() {
  return /* @__PURE__ */ jsxDEV2("html", { lang: "en", children: [
    /* @__PURE__ */ jsxDEV2("head", { children: [
      /* @__PURE__ */ jsxDEV2("meta", { charSet: "utf-8" }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 14,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV2("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 15,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV2(Meta, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 16,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV2(Links, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 17,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/root.tsx",
      lineNumber: 13,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV2("body", { children: [
      /* @__PURE__ */ jsxDEV2(Outlet, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 20,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV2(ScrollRestoration, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 21,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV2(Scripts, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 22,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV2(LiveReload, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 23,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/root.tsx",
      lineNumber: 19,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/root.tsx",
    lineNumber: 12,
    columnNumber: 5
  }, this);
}
function ErrorBoundary() {
  return /* @__PURE__ */ jsxDEV2("html", { children: [
    /* @__PURE__ */ jsxDEV2("head", { children: [
      /* @__PURE__ */ jsxDEV2("title", { children: "Oh no!" }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 33,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV2(Meta, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 34,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV2(Links, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 35,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/root.tsx",
      lineNumber: 32,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV2("body", { children: [
      /* @__PURE__ */ jsxDEV2("h1", { children: "Something went wrong" }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 38,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV2(Scripts, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 39,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/root.tsx",
      lineNumber: 37,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/root.tsx",
    lineNumber: 31,
    columnNumber: 5
  }, this);
}

// app/routes/_index.tsx
var index_exports = {};
__export(index_exports, {
  action: () => action,
  default: () => Index,
  loader: () => loader
});
import { json } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useNavigation } from "@remix-run/react";
import { jsxDEV as jsxDEV3 } from "react/jsx-dev-runtime";
async function loader() {
  try {
    let pokemonList = await (await fetch("https://pokeapi.co/api/v2/pokemon?limit=151")).json(), pokemonPromises = pokemonList.results.map(
      (pokemon) => fetch(pokemon.url).then((res) => res.json())
    ), pokemonDetails = await Promise.all(pokemonPromises);
    return json({
      pokemon: pokemonDetails,
      totalCount: pokemonList.count
    });
  } catch (error) {
    return console.error("Error fetching Pokemon:", error), json({ pokemon: [], totalCount: 0 });
  }
}
async function action({ request }) {
  let formData = await request.formData(), pokemonData = {
    id: parseInt(formData.get("id")),
    name: formData.get("name"),
    type: formData.get("type"),
    level: 1,
    hp: parseInt(formData.get("hp")),
    attack: parseInt(formData.get("attack")),
    defense: parseInt(formData.get("defense")),
    speed: parseInt(formData.get("speed")),
    height: parseInt(formData.get("height")),
    weight: parseInt(formData.get("weight")),
    sprite_url: formData.get("sprite_url")
  };
  try {
    let response = await fetch(`${process.env.API_URL || "http://localhost:3001"}/api/pokemon`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(pokemonData)
    });
    if (response.ok)
      return json({ success: !0, message: `${pokemonData.name} enregistr\xE9 avec succ\xE8s!` });
    {
      let error = await response.json();
      return json({ success: !1, message: error.message || "Erreur lors de l'enregistrement" });
    }
  } catch {
    return json({ success: !1, message: "Erreur de connexion au serveur" });
  }
}
function Index() {
  let data = useLoaderData(), actionData = useActionData(), navigation = useNavigation();
  return /* @__PURE__ */ jsxDEV3("div", { style: { fontFamily: "system-ui, sans-serif", lineHeight: "1.4", padding: "20px" }, children: [
    /* @__PURE__ */ jsxDEV3("h1", { children: "Pokemon Battle" }, void 0, !1, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 95,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV3("h2", { children: [
      "Choisissez vos Pok\xE9mon - ",
      data.pokemon?.length,
      " disponibles"
    ] }, void 0, !0, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 96,
      columnNumber: 7
    }, this),
    actionData?.message && /* @__PURE__ */ jsxDEV3("div", { style: {
      padding: "10px",
      marginBottom: "20px",
      borderRadius: "5px",
      backgroundColor: actionData.success ? "#d4edda" : "#f8d7da",
      color: actionData.success ? "#155724" : "#721c24",
      border: `1px solid ${actionData.success ? "#c3e6cb" : "#f5c6cb"}`
    }, children: actionData.message }, void 0, !1, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 99,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV3("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "15px" }, children: data.pokemon?.map((pokemon) => {
      let hp = pokemon.stats.find((s) => s.stat.name === "hp")?.base_stat || 100, attack = pokemon.stats.find((s) => s.stat.name === "attack")?.base_stat || 50, defense = pokemon.stats.find((s) => s.stat.name === "defense")?.base_stat || 50, speed = pokemon.stats.find((s) => s.stat.name === "speed")?.base_stat || 50;
      return /* @__PURE__ */ jsxDEV3("div", { style: {
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "15px",
        backgroundColor: "#f9f9f9",
        transition: "transform 0.2s"
      }, children: [
        /* @__PURE__ */ jsxDEV3("div", { style: { textAlign: "center" }, children: [
          /* @__PURE__ */ jsxDEV3(
            "img",
            {
              src: pokemon.sprites.front_default,
              alt: pokemon.name,
              style: { width: "120px", height: "120px" }
            },
            void 0,
            !1,
            {
              fileName: "app/routes/_index.tsx",
              lineNumber: 127,
              columnNumber: 17
            },
            this
          ),
          /* @__PURE__ */ jsxDEV3("h3", { style: { textTransform: "capitalize", margin: "10px 0", color: "#333" }, children: [
            "#",
            pokemon.id.toString().padStart(3, "0"),
            " ",
            pokemon.name
          ] }, void 0, !0, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 132,
            columnNumber: 17
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 126,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV3("div", { style: { fontSize: "14px", marginBottom: "10px" }, children: [
          /* @__PURE__ */ jsxDEV3("p", { children: [
            /* @__PURE__ */ jsxDEV3("strong", { children: "Types:" }, void 0, !1, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 138,
              columnNumber: 20
            }, this),
            " ",
            pokemon.types.map((t) => t.type.name).join(", ")
          ] }, void 0, !0, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 138,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV3("p", { children: [
            /* @__PURE__ */ jsxDEV3("strong", { children: "Taille:" }, void 0, !1, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 139,
              columnNumber: 20
            }, this),
            " ",
            pokemon.height / 10,
            " m | ",
            /* @__PURE__ */ jsxDEV3("strong", { children: "Poids:" }, void 0, !1, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 139,
              columnNumber: 71
            }, this),
            " ",
            pokemon.weight / 10,
            " kg"
          ] }, void 0, !0, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 139,
            columnNumber: 17
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 137,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV3("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px", fontSize: "12px", marginBottom: "15px" }, children: [
          /* @__PURE__ */ jsxDEV3("div", { style: { backgroundColor: "#e0e0e0", padding: "3px 6px", borderRadius: "4px" }, children: [
            /* @__PURE__ */ jsxDEV3("strong", { children: "HP:" }, void 0, !1, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 144,
              columnNumber: 19
            }, this),
            " ",
            hp
          ] }, void 0, !0, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 143,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV3("div", { style: { backgroundColor: "#e0e0e0", padding: "3px 6px", borderRadius: "4px" }, children: [
            /* @__PURE__ */ jsxDEV3("strong", { children: "Attaque:" }, void 0, !1, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 147,
              columnNumber: 19
            }, this),
            " ",
            attack
          ] }, void 0, !0, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 146,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV3("div", { style: { backgroundColor: "#e0e0e0", padding: "3px 6px", borderRadius: "4px" }, children: [
            /* @__PURE__ */ jsxDEV3("strong", { children: "D\xE9fense:" }, void 0, !1, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 150,
              columnNumber: 19
            }, this),
            " ",
            defense
          ] }, void 0, !0, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 149,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV3("div", { style: { backgroundColor: "#e0e0e0", padding: "3px 6px", borderRadius: "4px" }, children: [
            /* @__PURE__ */ jsxDEV3("strong", { children: "Vitesse:" }, void 0, !1, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 153,
              columnNumber: 19
            }, this),
            " ",
            speed
          ] }, void 0, !0, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 152,
            columnNumber: 17
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 142,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV3(Form, { method: "post", style: { textAlign: "center" }, children: [
          /* @__PURE__ */ jsxDEV3("input", { type: "hidden", name: "id", value: pokemon.id }, void 0, !1, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 158,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV3("input", { type: "hidden", name: "name", value: pokemon.name }, void 0, !1, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 159,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV3("input", { type: "hidden", name: "type", value: pokemon.types.map((t) => t.type.name).join("/") }, void 0, !1, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 160,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV3("input", { type: "hidden", name: "hp", value: hp }, void 0, !1, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 161,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV3("input", { type: "hidden", name: "attack", value: attack }, void 0, !1, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 162,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV3("input", { type: "hidden", name: "defense", value: defense }, void 0, !1, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 163,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV3("input", { type: "hidden", name: "speed", value: speed }, void 0, !1, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 164,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV3("input", { type: "hidden", name: "height", value: pokemon.height }, void 0, !1, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 165,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV3("input", { type: "hidden", name: "weight", value: pokemon.weight }, void 0, !1, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 166,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV3("input", { type: "hidden", name: "sprite_url", value: pokemon.sprites.front_default }, void 0, !1, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 167,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV3(
            "button",
            {
              type: "submit",
              disabled: navigation.state === "submitting",
              style: {
                backgroundColor: "#4CAF50",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
                opacity: navigation.state === "submitting" ? 0.6 : 1
              },
              children: navigation.state === "submitting" ? "Ajout en cours..." : "Ajouter \xE0 mon \xE9quipe"
            },
            void 0,
            !1,
            {
              fileName: "app/routes/_index.tsx",
              lineNumber: 169,
              columnNumber: 17
            },
            this
          )
        ] }, void 0, !0, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 157,
          columnNumber: 15
        }, this)
      ] }, pokemon.id, !0, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 119,
        columnNumber: 13
      }, this);
    }) }, void 0, !1, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 111,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/_index.tsx",
    lineNumber: 94,
    columnNumber: 5
  }, this);
}

// server-assets-manifest:@remix-run/dev/assets-manifest
var assets_manifest_default = { entry: { module: "/build/entry.client-AFMU2ZCG.js", imports: ["/build/_shared/chunk-O4BRYNJ4.js", "/build/_shared/chunk-LZS3KBGS.js", "/build/_shared/chunk-XGOTYLZ5.js", "/build/_shared/chunk-U4FRFQSK.js", "/build/_shared/chunk-7M6SC7J5.js", "/build/_shared/chunk-MCH5QMAS.js", "/build/_shared/chunk-UWV35TSL.js", "/build/_shared/chunk-PNG5AS42.js"] }, routes: { root: { id: "root", parentId: void 0, path: "", index: void 0, caseSensitive: void 0, module: "/build/root-YSWXMSG5.js", imports: void 0, hasAction: !1, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !0 }, "routes/_index": { id: "routes/_index", parentId: "root", path: void 0, index: !0, caseSensitive: void 0, module: "/build/routes/_index-56QMLDK2.js", imports: void 0, hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 } }, version: "b2b65f54", hmr: { runtime: "/build/_shared/chunk-MCH5QMAS.js", timestamp: 1749124900174 }, url: "/build/manifest-B2B65F54.js" };

// server-entry-module:@remix-run/dev/server-build
var mode = "development", assetsBuildDirectory = "public/build", future = { v3_fetcherPersist: !1, v3_relativeSplatPath: !1, v3_throwAbortReason: !1, v3_routeConfig: !1, v3_singleFetch: !1, v3_lazyRouteDiscovery: !1, unstable_optimizeDeps: !1 }, publicPath = "/build/", entry = { module: entry_server_node_exports }, routes = {
  root: {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: root_exports
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: !0,
    caseSensitive: void 0,
    module: index_exports
  }
};
export {
  assets_manifest_default as assets,
  assetsBuildDirectory,
  entry,
  future,
  mode,
  publicPath,
  routes
};
//# sourceMappingURL=index.js.map
