var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: !0 });
};

// app/entry.server.tsx
var entry_server_exports = {};
__export(entry_server_exports, {
  default: () => handleRequest
});
import { PassThrough } from "stream";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { renderToPipeableStream } from "react-dom/server";
import { jsxDEV } from "react/jsx-dev-runtime";
function handleRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let didError = !1, { pipe } = renderToPipeableStream(
      /* @__PURE__ */ jsxDEV(RemixServer, { context: remixContext, url: request.url }, void 0, !1, {
        fileName: "app/entry.server.tsx",
        lineNumber: 16,
        columnNumber: 7
      }, this),
      {
        onShellReady() {
          responseHeaders.set("Content-Type", "text/html");
          let body = new PassThrough();
          resolve(
            new Response(createReadableStreamFromReadable(body), {
              status: responseStatusCode,
              headers: responseHeaders
            })
          ), pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          didError = !0, console.error(error);
        }
      }
    );
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

// app/routes/dashboard.tsx
var dashboard_exports = {};
__export(dashboard_exports, {
  default: () => Dashboard,
  loader: () => loader
});
import { useLoaderData, Link } from "@remix-run/react";
import { json } from "@remix-run/node";
import { jsxDEV as jsxDEV3 } from "react/jsx-dev-runtime";
var loader = async ({ request }) => json({
  user: {
    username: "Dresseur Pok\xE9mon",
    level: 25,
    badges: 3
  },
  stats: {
    pokemonCaught: 15,
    battlesWon: 8,
    totalBattles: 12
  }
});
function Dashboard() {
  let { user, stats } = useLoaderData();
  return /* @__PURE__ */ jsxDEV3("div", { style: styles.container, children: [
    /* @__PURE__ */ jsxDEV3("header", { style: styles.header, children: [
      /* @__PURE__ */ jsxDEV3("h1", { style: styles.title, children: "Tableau de Bord Pokemon Battle" }, void 0, !1, {
        fileName: "app/routes/dashboard.tsx",
        lineNumber: 29,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV3("p", { style: styles.subtitle, children: [
        "Bienvenue, ",
        user.username,
        "!"
      ] }, void 0, !0, {
        fileName: "app/routes/dashboard.tsx",
        lineNumber: 30,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/dashboard.tsx",
      lineNumber: 28,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV3("div", { style: styles.statsGrid, children: [
      /* @__PURE__ */ jsxDEV3("div", { style: styles.statCard, children: [
        /* @__PURE__ */ jsxDEV3("div", { style: styles.statIcon, children: "\u{1F3AF}" }, void 0, !1, {
          fileName: "app/routes/dashboard.tsx",
          lineNumber: 35,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV3("div", { style: styles.statContent, children: [
          /* @__PURE__ */ jsxDEV3("h3", { style: styles.statTitle, children: "Niveau" }, void 0, !1, {
            fileName: "app/routes/dashboard.tsx",
            lineNumber: 37,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV3("p", { style: styles.statValue, children: user.level }, void 0, !1, {
            fileName: "app/routes/dashboard.tsx",
            lineNumber: 38,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/dashboard.tsx",
          lineNumber: 36,
          columnNumber: 11
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/dashboard.tsx",
        lineNumber: 34,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV3("div", { style: styles.statCard, children: [
        /* @__PURE__ */ jsxDEV3("div", { style: styles.statIcon, children: "\u{1F3C6}" }, void 0, !1, {
          fileName: "app/routes/dashboard.tsx",
          lineNumber: 43,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV3("div", { style: styles.statContent, children: [
          /* @__PURE__ */ jsxDEV3("h3", { style: styles.statTitle, children: "Badges" }, void 0, !1, {
            fileName: "app/routes/dashboard.tsx",
            lineNumber: 45,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV3("p", { style: styles.statValue, children: [
            user.badges,
            "/8"
          ] }, void 0, !0, {
            fileName: "app/routes/dashboard.tsx",
            lineNumber: 46,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/dashboard.tsx",
          lineNumber: 44,
          columnNumber: 11
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/dashboard.tsx",
        lineNumber: 42,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV3("div", { style: styles.statCard, children: [
        /* @__PURE__ */ jsxDEV3("div", { style: styles.statIcon, children: "\u2694\uFE0F" }, void 0, !1, {
          fileName: "app/routes/dashboard.tsx",
          lineNumber: 51,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV3("div", { style: styles.statContent, children: [
          /* @__PURE__ */ jsxDEV3("h3", { style: styles.statTitle, children: "Combats Gagn\xE9s" }, void 0, !1, {
            fileName: "app/routes/dashboard.tsx",
            lineNumber: 53,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV3("p", { style: styles.statValue, children: [
            stats.battlesWon,
            "/",
            stats.totalBattles
          ] }, void 0, !0, {
            fileName: "app/routes/dashboard.tsx",
            lineNumber: 54,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/dashboard.tsx",
          lineNumber: 52,
          columnNumber: 11
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/dashboard.tsx",
        lineNumber: 50,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV3("div", { style: styles.statCard, children: [
        /* @__PURE__ */ jsxDEV3("div", { style: styles.statIcon, children: "\u{1F3AA}" }, void 0, !1, {
          fileName: "app/routes/dashboard.tsx",
          lineNumber: 59,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV3("div", { style: styles.statContent, children: [
          /* @__PURE__ */ jsxDEV3("h3", { style: styles.statTitle, children: "Pok\xE9mon Captur\xE9s" }, void 0, !1, {
            fileName: "app/routes/dashboard.tsx",
            lineNumber: 61,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV3("p", { style: styles.statValue, children: stats.pokemonCaught }, void 0, !1, {
            fileName: "app/routes/dashboard.tsx",
            lineNumber: 62,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/dashboard.tsx",
          lineNumber: 60,
          columnNumber: 11
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/dashboard.tsx",
        lineNumber: 58,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/dashboard.tsx",
      lineNumber: 33,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV3("div", { style: styles.actionsGrid, children: [
      /* @__PURE__ */ jsxDEV3(Link, { to: "/pokemon", style: styles.actionCard, children: [
        /* @__PURE__ */ jsxDEV3("div", { style: styles.actionIcon, children: "\u{1F50D}" }, void 0, !1, {
          fileName: "app/routes/dashboard.tsx",
          lineNumber: 69,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV3("h3", { style: styles.actionTitle, children: "Explorer les Pok\xE9mon" }, void 0, !1, {
          fileName: "app/routes/dashboard.tsx",
          lineNumber: 70,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV3("p", { style: styles.actionDescription, children: "D\xE9couvrez et capturez de nouveaux Pok\xE9mon" }, void 0, !1, {
          fileName: "app/routes/dashboard.tsx",
          lineNumber: 71,
          columnNumber: 11
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/dashboard.tsx",
        lineNumber: 68,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV3(Link, { to: "/battles", style: styles.actionCard, children: [
        /* @__PURE__ */ jsxDEV3("div", { style: styles.actionIcon, children: "\u2694\uFE0F" }, void 0, !1, {
          fileName: "app/routes/dashboard.tsx",
          lineNumber: 75,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV3("h3", { style: styles.actionTitle, children: "Commencer un Combat" }, void 0, !1, {
          fileName: "app/routes/dashboard.tsx",
          lineNumber: 76,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV3("p", { style: styles.actionDescription, children: "D\xE9fiez d'autres dresseurs" }, void 0, !1, {
          fileName: "app/routes/dashboard.tsx",
          lineNumber: 77,
          columnNumber: 11
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/dashboard.tsx",
        lineNumber: 74,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV3(Link, { to: "/collection", style: styles.actionCard, children: [
        /* @__PURE__ */ jsxDEV3("div", { style: styles.actionIcon, children: "\u{1F4DA}" }, void 0, !1, {
          fileName: "app/routes/dashboard.tsx",
          lineNumber: 81,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV3("h3", { style: styles.actionTitle, children: "Ma Collection" }, void 0, !1, {
          fileName: "app/routes/dashboard.tsx",
          lineNumber: 82,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV3("p", { style: styles.actionDescription, children: "G\xE9rez vos Pok\xE9mon" }, void 0, !1, {
          fileName: "app/routes/dashboard.tsx",
          lineNumber: 83,
          columnNumber: 11
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/dashboard.tsx",
        lineNumber: 80,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV3(Link, { to: "/profile", style: styles.actionCard, children: [
        /* @__PURE__ */ jsxDEV3("div", { style: styles.actionIcon, children: "\u{1F464}" }, void 0, !1, {
          fileName: "app/routes/dashboard.tsx",
          lineNumber: 87,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV3("h3", { style: styles.actionTitle, children: "Mon Profil" }, void 0, !1, {
          fileName: "app/routes/dashboard.tsx",
          lineNumber: 88,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV3("p", { style: styles.actionDescription, children: "Param\xE8tres et statistiques" }, void 0, !1, {
          fileName: "app/routes/dashboard.tsx",
          lineNumber: 89,
          columnNumber: 11
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/dashboard.tsx",
        lineNumber: 86,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/dashboard.tsx",
      lineNumber: 67,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV3("div", { style: styles.footer, children: /* @__PURE__ */ jsxDEV3(Link, { to: "/logout", style: styles.logoutLink, children: "Se d\xE9connecter" }, void 0, !1, {
      fileName: "app/routes/dashboard.tsx",
      lineNumber: 94,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/routes/dashboard.tsx",
      lineNumber: 93,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/dashboard.tsx",
    lineNumber: 27,
    columnNumber: 5
  }, this);
}
var styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "2rem"
  },
  header: {
    textAlign: "center",
    marginBottom: "3rem",
    color: "white"
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    margin: "0 0 0.5rem 0",
    textShadow: "0 2px 4px rgba(0,0,0,0.3)"
  },
  subtitle: {
    fontSize: "1.2rem",
    margin: 0,
    opacity: 0.9
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1.5rem",
    marginBottom: "3rem",
    maxWidth: "800px",
    margin: "0 auto 3rem auto"
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
  },
  statIcon: {
    fontSize: "2rem",
    padding: "0.5rem",
    backgroundColor: "#f0f9ff",
    borderRadius: "50%",
    width: "60px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  statContent: {
    flex: 1
  },
  statTitle: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#6b7280",
    margin: "0 0 0.25rem 0",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  statValue: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#1f2937",
    margin: 0
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "2rem",
    maxWidth: "1000px",
    margin: "0 auto"
  },
  actionCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "2rem",
    textDecoration: "none",
    color: "inherit",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    cursor: "pointer"
  },
  actionIcon: {
    fontSize: "3rem",
    marginBottom: "1rem"
  },
  actionTitle: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "#1f2937",
    margin: "0 0 0.5rem 0"
  },
  actionDescription: {
    color: "#6b7280",
    fontSize: "0.9rem",
    margin: 0,
    lineHeight: 1.5
  },
  footer: {
    textAlign: "center",
    marginTop: "3rem"
  },
  logoutLink: {
    color: "white",
    textDecoration: "none",
    fontSize: "1rem",
    opacity: 0.8,
    transition: "opacity 0.2s"
  }
};

// app/routes/_index.tsx
var index_exports = {};
__export(index_exports, {
  action: () => action,
  default: () => LoginPage
});
import { useActionData } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { jsxDEV as jsxDEV4 } from "react/jsx-dev-runtime";
var action = async ({ request }) => redirect("/login");
function LoginPage() {
  let actionData = useActionData();
  return /* @__PURE__ */ jsxDEV4("div", { style: styles2.container, children: [
    /* @__PURE__ */ jsxDEV4("h1", { children: "Connexion" }, void 0, !1, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 31,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV4(Form, { method: "post", style: styles2.form, children: [
      /* @__PURE__ */ jsxDEV4(
        "input",
        {
          type: "text",
          name: "username",
          placeholder: "Nom d'utilisateur",
          style: styles2.input,
          required: !0
        },
        void 0,
        !1,
        {
          fileName: "app/routes/_index.tsx",
          lineNumber: 33,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ jsxDEV4(
        "input",
        {
          type: "password",
          name: "password",
          placeholder: "Mot de passe",
          style: styles2.input,
          required: !0
        },
        void 0,
        !1,
        {
          fileName: "app/routes/_index.tsx",
          lineNumber: 40,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ jsxDEV4("button", { type: "submit", style: styles2.button, children: "Jouer \xE0 Pok\xE9mon" }, void 0, !1, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 47,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 32,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/_index.tsx",
    lineNumber: 30,
    columnNumber: 5
  }, this);
}
var styles2 = {
  container: {
    maxWidth: "400px",
    margin: "100px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    textAlign: "center",
    fontFamily: "Arial, sans-serif"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  input: {
    padding: "10px",
    fontSize: "16px"
  },
  button: {
    padding: "10px",
    backgroundColor: "#ffcb05",
    border: "none",
    borderRadius: "4px",
    fontWeight: "bold",
    cursor: "pointer"
  }
};

// app/routes/signup.tsx
var signup_exports = {};
__export(signup_exports, {
  action: () => action2,
  default: () => Signup,
  loader: () => loader2
});
import { useState } from "react";
import { Form as Form2, useActionData as useActionData2, useNavigation, Link as Link2 } from "@remix-run/react";
import { json as json2, redirect as redirect2 } from "@remix-run/node";
import { jsxDEV as jsxDEV5 } from "react/jsx-dev-runtime";
var action2 = async ({ request }) => {
  let formData = await request.formData(), email = formData.get("email"), username = formData.get("username"), password = formData.get("password"), confirmPassword = formData.get("confirmPassword");
  if (!email || !username || !password || !confirmPassword)
    return json2({ error: "Tous les champs sont requis" }, { status: 400 });
  if (password !== confirmPassword)
    return json2({ error: "Les mots de passe ne correspondent pas" }, { status: 400 });
  try {
    let response = await fetch("http://pokemon-backend:3001/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, username, password })
    }), data = await response.json();
    return response.ok ? redirect2("/login?message=Inscription r\xE9ussie ! Vous pouvez maintenant vous connecter.") : json2({ error: data.message || "Erreur lors de l'inscription" }, { status: response.status });
  } catch {
    return json2({ error: "Erreur de connexion au serveur" }, { status: 500 });
  }
}, loader2 = async ({ request }) => json2({});
function Signup() {
  let actionData = useActionData2(), navigation = useNavigation(), [showPassword, setShowPassword] = useState(!1), [showConfirmPassword, setShowConfirmPassword] = useState(!1), isSubmitting = navigation.state === "submitting";
  return /* @__PURE__ */ jsxDEV5("div", { style: styles3.container, children: /* @__PURE__ */ jsxDEV5("div", { style: styles3.signupCard, children: [
    /* @__PURE__ */ jsxDEV5("div", { style: styles3.header, children: [
      /* @__PURE__ */ jsxDEV5("h1", { style: styles3.title, children: "Cr\xE9er un compte" }, void 0, !1, {
        fileName: "app/routes/signup.tsx",
        lineNumber: 65,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV5("p", { style: styles3.subtitle, children: "Rejoignez Pokemon Battle" }, void 0, !1, {
        fileName: "app/routes/signup.tsx",
        lineNumber: 66,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/signup.tsx",
      lineNumber: 64,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV5(Form2, { method: "post", style: styles3.form, children: [
      /* @__PURE__ */ jsxDEV5("div", { style: styles3.inputGroup, children: [
        /* @__PURE__ */ jsxDEV5("label", { htmlFor: "email", style: styles3.label, children: "Email" }, void 0, !1, {
          fileName: "app/routes/signup.tsx",
          lineNumber: 71,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV5(
          "input",
          {
            type: "email",
            id: "email",
            name: "email",
            required: !0,
            style: styles3.input,
            placeholder: "votre@email.com",
            autoComplete: "email"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/signup.tsx",
            lineNumber: 74,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/signup.tsx",
        lineNumber: 70,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV5("div", { style: styles3.inputGroup, children: [
        /* @__PURE__ */ jsxDEV5("label", { htmlFor: "username", style: styles3.label, children: "Nom d'utilisateur" }, void 0, !1, {
          fileName: "app/routes/signup.tsx",
          lineNumber: 86,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV5(
          "input",
          {
            type: "text",
            id: "username",
            name: "username",
            required: !0,
            style: styles3.input,
            placeholder: "votre_nom_utilisateur",
            autoComplete: "username"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/signup.tsx",
            lineNumber: 89,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/signup.tsx",
        lineNumber: 85,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV5("div", { style: styles3.inputGroup, children: [
        /* @__PURE__ */ jsxDEV5("label", { htmlFor: "password", style: styles3.label, children: "Mot de passe" }, void 0, !1, {
          fileName: "app/routes/signup.tsx",
          lineNumber: 101,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV5("div", { style: styles3.passwordContainer, children: [
          /* @__PURE__ */ jsxDEV5(
            "input",
            {
              type: showPassword ? "text" : "password",
              id: "password",
              name: "password",
              required: !0,
              style: styles3.input,
              placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
              autoComplete: "new-password"
            },
            void 0,
            !1,
            {
              fileName: "app/routes/signup.tsx",
              lineNumber: 105,
              columnNumber: 15
            },
            this
          ),
          /* @__PURE__ */ jsxDEV5(
            "button",
            {
              type: "button",
              style: styles3.passwordToggle,
              onClick: () => setShowPassword(!showPassword),
              children: showPassword ? "\u{1F441}\uFE0F\u200D\u{1F5E8}\uFE0F" : "\u{1F441}\uFE0F"
            },
            void 0,
            !1,
            {
              fileName: "app/routes/signup.tsx",
              lineNumber: 114,
              columnNumber: 15
            },
            this
          )
        ] }, void 0, !0, {
          fileName: "app/routes/signup.tsx",
          lineNumber: 104,
          columnNumber: 13
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/signup.tsx",
        lineNumber: 100,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV5("div", { style: styles3.inputGroup, children: [
        /* @__PURE__ */ jsxDEV5("label", { htmlFor: "confirmPassword", style: styles3.label, children: "Confirmer le mot de passe" }, void 0, !1, {
          fileName: "app/routes/signup.tsx",
          lineNumber: 125,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV5("div", { style: styles3.passwordContainer, children: [
          /* @__PURE__ */ jsxDEV5(
            "input",
            {
              type: showConfirmPassword ? "text" : "password",
              id: "confirmPassword",
              name: "confirmPassword",
              required: !0,
              style: styles3.input,
              placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
              autoComplete: "new-password"
            },
            void 0,
            !1,
            {
              fileName: "app/routes/signup.tsx",
              lineNumber: 129,
              columnNumber: 15
            },
            this
          ),
          /* @__PURE__ */ jsxDEV5(
            "button",
            {
              type: "button",
              style: styles3.passwordToggle,
              onClick: () => setShowConfirmPassword(!showConfirmPassword),
              children: showConfirmPassword ? "\u{1F441}\uFE0F\u200D\u{1F5E8}\uFE0F" : "\u{1F441}\uFE0F"
            },
            void 0,
            !1,
            {
              fileName: "app/routes/signup.tsx",
              lineNumber: 138,
              columnNumber: 15
            },
            this
          )
        ] }, void 0, !0, {
          fileName: "app/routes/signup.tsx",
          lineNumber: 128,
          columnNumber: 13
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/signup.tsx",
        lineNumber: 124,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV5("div", { style: styles3.passwordRequirements, children: [
        /* @__PURE__ */ jsxDEV5("p", { style: styles3.requirementsTitle, children: "Le mot de passe doit contenir :" }, void 0, !1, {
          fileName: "app/routes/signup.tsx",
          lineNumber: 149,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV5("ul", { style: styles3.requirementsList, children: [
          /* @__PURE__ */ jsxDEV5("li", { children: "Au moins 8 caract\xE8res" }, void 0, !1, {
            fileName: "app/routes/signup.tsx",
            lineNumber: 151,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV5("li", { children: "Une majuscule et une minuscule" }, void 0, !1, {
            fileName: "app/routes/signup.tsx",
            lineNumber: 152,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV5("li", { children: "Un chiffre" }, void 0, !1, {
            fileName: "app/routes/signup.tsx",
            lineNumber: 153,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV5("li", { children: "Un caract\xE8re sp\xE9cial" }, void 0, !1, {
            fileName: "app/routes/signup.tsx",
            lineNumber: 154,
            columnNumber: 15
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/signup.tsx",
          lineNumber: 150,
          columnNumber: 13
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/signup.tsx",
        lineNumber: 148,
        columnNumber: 11
      }, this),
      actionData?.error && /* @__PURE__ */ jsxDEV5("div", { style: styles3.errorMessage, children: actionData.error }, void 0, !1, {
        fileName: "app/routes/signup.tsx",
        lineNumber: 159,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV5(
        "button",
        {
          type: "submit",
          disabled: isSubmitting,
          style: {
            ...styles3.submitButton,
            ...isSubmitting ? styles3.submitButtonDisabled : {}
          },
          children: isSubmitting ? "Cr\xE9ation..." : "Cr\xE9er mon compte"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/signup.tsx",
          lineNumber: 164,
          columnNumber: 11
        },
        this
      )
    ] }, void 0, !0, {
      fileName: "app/routes/signup.tsx",
      lineNumber: 69,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV5("div", { style: styles3.footer, children: /* @__PURE__ */ jsxDEV5("p", { style: styles3.footerText, children: [
      "D\xE9j\xE0 un compte ?",
      " ",
      /* @__PURE__ */ jsxDEV5(Link2, { to: "/login", style: styles3.link, children: "Se connecter" }, void 0, !1, {
        fileName: "app/routes/signup.tsx",
        lineNumber: 179,
        columnNumber: 13
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/signup.tsx",
      lineNumber: 177,
      columnNumber: 11
    }, this) }, void 0, !1, {
      fileName: "app/routes/signup.tsx",
      lineNumber: 176,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/signup.tsx",
    lineNumber: 63,
    columnNumber: 7
  }, this) }, void 0, !1, {
    fileName: "app/routes/signup.tsx",
    lineNumber: 62,
    columnNumber: 5
  }, this);
}
var styles3 = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "1rem"
  },
  signupCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    padding: "2rem",
    width: "100%",
    maxWidth: "450px"
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem"
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: "0.5rem",
    margin: 0
  },
  subtitle: {
    color: "#6b7280",
    fontSize: "1rem",
    margin: 0
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem"
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151"
  },
  input: {
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "1rem",
    transition: "all 0.2s",
    outline: "none",
    backgroundColor: "white"
  },
  passwordContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center"
  },
  passwordToggle: {
    position: "absolute",
    right: "0.75rem",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0.25rem",
    fontSize: "1rem"
  },
  passwordRequirements: {
    backgroundColor: "#f8fafc",
    padding: "1rem",
    borderRadius: "8px",
    border: "1px solid #e2e8f0"
  },
  requirementsTitle: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151",
    margin: "0 0 0.5rem 0"
  },
  requirementsList: {
    fontSize: "0.8rem",
    color: "#6b7280",
    margin: 0,
    paddingLeft: "1.25rem"
  },
  errorMessage: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    padding: "0.75rem",
    borderRadius: "8px",
    fontSize: "0.875rem",
    border: "1px solid #fecaca"
  },
  submitButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    padding: "0.75rem 1.5rem",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
    marginTop: "0.5rem"
  },
  submitButtonDisabled: {
    backgroundColor: "#9ca3af",
    cursor: "not-allowed"
  },
  footer: {
    textAlign: "center",
    marginTop: "2rem",
    paddingTop: "1.5rem",
    borderTop: "1px solid #e5e7eb"
  },
  footerText: {
    color: "#6b7280",
    fontSize: "0.875rem",
    margin: 0,
    textAlign: "center"
  },
  link: {
    color: "#3b82f6",
    textDecoration: "none",
    fontWeight: "500"
  }
};

// app/routes/login.tsx
var login_exports = {};
__export(login_exports, {
  action: () => action3,
  default: () => Login,
  loader: () => loader3
});
import { useState as useState2 } from "react";
import { Form as Form3, useActionData as useActionData3, useNavigation as useNavigation2, Link as Link3 } from "@remix-run/react";
import { json as json3, redirect as redirect3 } from "@remix-run/node";
import { jsxDEV as jsxDEV6 } from "react/jsx-dev-runtime";
var action3 = async ({ request }) => {
  let formData = await request.formData(), email = formData.get("email"), password = formData.get("password");
  if (!email || !password)
    return json3({ error: "Email et mot de passe sont requis" }, { status: 400 });
  try {
    let response = await fetch("http://pokemon-backend:3001/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    }), data = await response.json();
    return response.ok ? redirect3("/dashboard") : json3({ error: data.message || "Erreur de connexion" }, { status: response.status });
  } catch {
    return json3({ error: "Erreur de connexion au serveur" }, { status: 500 });
  }
}, loader3 = async ({ request }) => json3({});
function Login() {
  let actionData = useActionData3(), navigation = useNavigation2(), [showPassword, setShowPassword] = useState2(!1), isSubmitting = navigation.state === "submitting";
  return /* @__PURE__ */ jsxDEV6("div", { style: styles4.container, children: /* @__PURE__ */ jsxDEV6("div", { style: styles4.loginCard, children: [
    /* @__PURE__ */ jsxDEV6("div", { style: styles4.header, children: [
      /* @__PURE__ */ jsxDEV6("h1", { style: styles4.title, children: "Connexion" }, void 0, !1, {
        fileName: "app/routes/login.tsx",
        lineNumber: 59,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV6("p", { style: styles4.subtitle, children: "Connectez-vous \xE0 Pokemon Battle" }, void 0, !1, {
        fileName: "app/routes/login.tsx",
        lineNumber: 60,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/login.tsx",
      lineNumber: 58,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV6(Form3, { method: "post", style: styles4.form, children: [
      /* @__PURE__ */ jsxDEV6("div", { style: styles4.inputGroup, children: [
        /* @__PURE__ */ jsxDEV6("label", { htmlFor: "email", style: styles4.label, children: "Email" }, void 0, !1, {
          fileName: "app/routes/login.tsx",
          lineNumber: 65,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV6(
          "input",
          {
            type: "email",
            id: "email",
            name: "email",
            required: !0,
            style: styles4.input,
            placeholder: "votre@email.com",
            autoComplete: "email"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/login.tsx",
            lineNumber: 68,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/login.tsx",
        lineNumber: 64,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV6("div", { style: styles4.inputGroup, children: [
        /* @__PURE__ */ jsxDEV6("label", { htmlFor: "password", style: styles4.label, children: "Mot de passe" }, void 0, !1, {
          fileName: "app/routes/login.tsx",
          lineNumber: 80,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV6("div", { style: styles4.passwordContainer, children: [
          /* @__PURE__ */ jsxDEV6(
            "input",
            {
              type: showPassword ? "text" : "password",
              id: "password",
              name: "password",
              required: !0,
              style: styles4.input,
              placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
              autoComplete: "current-password"
            },
            void 0,
            !1,
            {
              fileName: "app/routes/login.tsx",
              lineNumber: 84,
              columnNumber: 15
            },
            this
          ),
          /* @__PURE__ */ jsxDEV6(
            "button",
            {
              type: "button",
              style: styles4.passwordToggle,
              onClick: () => setShowPassword(!showPassword),
              children: showPassword ? "\u{1F441}\uFE0F\u200D\u{1F5E8}\uFE0F" : "\u{1F441}\uFE0F"
            },
            void 0,
            !1,
            {
              fileName: "app/routes/login.tsx",
              lineNumber: 93,
              columnNumber: 15
            },
            this
          )
        ] }, void 0, !0, {
          fileName: "app/routes/login.tsx",
          lineNumber: 83,
          columnNumber: 13
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/login.tsx",
        lineNumber: 79,
        columnNumber: 11
      }, this),
      actionData?.error && /* @__PURE__ */ jsxDEV6("div", { style: styles4.errorMessage, children: actionData.error }, void 0, !1, {
        fileName: "app/routes/login.tsx",
        lineNumber: 104,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV6(
        "button",
        {
          type: "submit",
          disabled: isSubmitting,
          style: {
            ...styles4.submitButton,
            ...isSubmitting ? styles4.submitButtonDisabled : {}
          },
          children: isSubmitting ? "Connexion..." : "Se connecter"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/login.tsx",
          lineNumber: 109,
          columnNumber: 11
        },
        this
      )
    ] }, void 0, !0, {
      fileName: "app/routes/login.tsx",
      lineNumber: 63,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV6("div", { style: styles4.footer, children: /* @__PURE__ */ jsxDEV6("p", { style: styles4.footerText, children: [
      "Pas encore de compte ?",
      " ",
      /* @__PURE__ */ jsxDEV6(Link3, { to: "/signup", style: styles4.link, children: "Cr\xE9er un compte" }, void 0, !1, {
        fileName: "app/routes/login.tsx",
        lineNumber: 124,
        columnNumber: 13
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/login.tsx",
      lineNumber: 122,
      columnNumber: 11
    }, this) }, void 0, !1, {
      fileName: "app/routes/login.tsx",
      lineNumber: 121,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/login.tsx",
    lineNumber: 57,
    columnNumber: 7
  }, this) }, void 0, !1, {
    fileName: "app/routes/login.tsx",
    lineNumber: 56,
    columnNumber: 5
  }, this);
}
var styles4 = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "1rem"
  },
  loginCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    padding: "2rem",
    width: "100%",
    maxWidth: "400px"
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem"
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: "0.5rem",
    margin: 0
  },
  subtitle: {
    color: "#6b7280",
    fontSize: "1rem",
    margin: 0
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem"
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151"
  },
  input: {
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "1rem",
    transition: "all 0.2s",
    outline: "none",
    backgroundColor: "white"
  },
  passwordContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center"
  },
  passwordToggle: {
    position: "absolute",
    right: "0.75rem",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0.25rem",
    fontSize: "1rem"
  },
  errorMessage: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    padding: "0.75rem",
    borderRadius: "8px",
    fontSize: "0.875rem",
    border: "1px solid #fecaca"
  },
  submitButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    padding: "0.75rem 1.5rem",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
    marginTop: "0.5rem"
  },
  submitButtonDisabled: {
    backgroundColor: "#9ca3af",
    cursor: "not-allowed"
  },
  footer: {
    textAlign: "center",
    marginTop: "2rem",
    paddingTop: "1.5rem",
    borderTop: "1px solid #e5e7eb"
  },
  footerText: {
    color: "#6b7280",
    fontSize: "0.875rem",
    margin: 0,
    textAlign: "center"
  },
  link: {
    color: "#3b82f6",
    textDecoration: "none",
    fontWeight: "500"
  }
};

// server-assets-manifest:@remix-run/dev/assets-manifest
var assets_manifest_default = { entry: { module: "/build/entry.client-AF6KZRJQ.js", imports: ["/build/_shared/chunk-TLQUE6MN.js", "/build/_shared/chunk-MCH5QMAS.js", "/build/_shared/chunk-XGOTYLZ5.js", "/build/_shared/chunk-U4FRFQSK.js", "/build/_shared/chunk-7M6SC7J5.js", "/build/_shared/chunk-UWV35TSL.js", "/build/_shared/chunk-PNG5AS42.js"] }, routes: { root: { id: "root", parentId: void 0, path: "", index: void 0, caseSensitive: void 0, module: "/build/root-7TLLCTCC.js", imports: void 0, hasAction: !1, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !0 }, "routes/_index": { id: "routes/_index", parentId: "root", path: void 0, index: !0, caseSensitive: void 0, module: "/build/routes/_index-L6ZHLAZE.js", imports: ["/build/_shared/chunk-G7CHZRZX.js"], hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/dashboard": { id: "routes/dashboard", parentId: "root", path: "dashboard", index: void 0, caseSensitive: void 0, module: "/build/routes/dashboard-MFBVR6E5.js", imports: ["/build/_shared/chunk-G7CHZRZX.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/login": { id: "routes/login", parentId: "root", path: "login", index: void 0, caseSensitive: void 0, module: "/build/routes/login-64MBRB4R.js", imports: ["/build/_shared/chunk-G7CHZRZX.js"], hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/signup": { id: "routes/signup", parentId: "root", path: "signup", index: void 0, caseSensitive: void 0, module: "/build/routes/signup-7AT7AICU.js", imports: ["/build/_shared/chunk-G7CHZRZX.js"], hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 } }, version: "06bd42bf", hmr: { runtime: "/build/_shared/chunk-MCH5QMAS.js", timestamp: 1749314441321 }, url: "/build/manifest-06BD42BF.js" };

// server-entry-module:@remix-run/dev/server-build
var mode = "development", assetsBuildDirectory = "public/build", future = { v3_fetcherPersist: !1, v3_relativeSplatPath: !1, v3_throwAbortReason: !1, v3_routeConfig: !1, v3_singleFetch: !1, v3_lazyRouteDiscovery: !1, unstable_optimizeDeps: !1 }, publicPath = "/build/", entry = { module: entry_server_exports }, routes = {
  root: {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: root_exports
  },
  "routes/dashboard": {
    id: "routes/dashboard",
    parentId: "root",
    path: "dashboard",
    index: void 0,
    caseSensitive: void 0,
    module: dashboard_exports
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: !0,
    caseSensitive: void 0,
    module: index_exports
  },
  "routes/signup": {
    id: "routes/signup",
    parentId: "root",
    path: "signup",
    index: void 0,
    caseSensitive: void 0,
    module: signup_exports
  },
  "routes/login": {
    id: "routes/login",
    parentId: "root",
    path: "login",
    index: void 0,
    caseSensitive: void 0,
    module: login_exports
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
