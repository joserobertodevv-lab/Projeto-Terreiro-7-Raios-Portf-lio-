const express = require("express");
const path = require("path");

const port = process.env.PORT || 3000;

// Caminhos base
const frontendPath = path.join(__dirname, "..", "frontend");
const publicPath = path.join(frontendPath, "public");
const lojinhaPath = path.join(frontendPath, "lojinha");

const app = express();

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Arquivos estáticos gerais (css, imagens, js globais)
app.use(express.static(publicPath));

// 🔥 ARQUIVOS ESTÁTICOS DA LOJINHA (ESSENCIAL)
app.use("/lojinha", express.static(lojinhaPath));

/* ======================================================
   ROTAS PÚBLICAS – SITE
====================================================== */

app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(frontendPath, "login.html"));
});

app.get("/fotos", (req, res) => {
    res.sendFile(path.join(frontendPath, "fotos.html"));
});

app.get("/historia", (req, res) => {
    res.sendFile(path.join(frontendPath, "historia.html"));
});

app.get("/orixas", (req, res) => {
    res.sendFile(path.join(frontendPath, "orixas.html"));
});

app.get("/calendario", (req, res) => {
    res.sendFile(path.join(frontendPath, "calendario.html"));
});

app.get("/pontos-linhas", (req, res) => {
    res.sendFile(path.join(frontendPath, "pontos-linhas.html"));
});

app.get("/pontos-orixas", (req, res) => {
    res.sendFile(path.join(frontendPath, "pontos-orixas.html"));
});

app.get("/palestras", (req, res) => {
    res.sendFile(path.join(frontendPath, "palestras.html"));
});

/* ======================================================
   ÁREA INTERNA
====================================================== */

app.get("/interno/area-interna", (req, res) => {
    res.sendFile(path.join(frontendPath, "interno/area-interna.html"));
});

app.get("/interno/dashboard", (req, res) => {
    res.sendFile(path.join(frontendPath, "interno/dashboard-interno.html"));
});

app.get("/interno/pontos-interno", (req, res) => {
    res.sendFile(path.join(frontendPath, "interno/pontos-interno.html"));
});

/* ======================================================
   LOJINHA
====================================================== */

app.get("/lojinha/login-lojinha", (req, res) => {
    res.sendFile(path.join(lojinhaPath, "/lojinha/login-lojinha.html"));
});

app.get("/lojinha/vendas-lojinha", (req, res) => {
    res.sendFile(path.join(lojinhaPath, "/lojinha/vendas-lojinha.html"));
});

app.get("/lojinha/dashboard-lojinha", (req, res) => {
    res.sendFile(path.join(lojinhaPath, "/lojinha/dashboard-lojinha.html"));
});

app.get("/lojinha/painel-lojinha", (req, res) => {
    res.sendFile(path.join(lojinhaPath, "/lojinha/painel-lojinha.html"));
});

app.get("/lojinha/usuarios-lojinha", (req, res) => {
    res.sendFile(path.join(lojinhaPath, "/lojinha/usuarios-lojinha.html"));
});

/* ======================================================
   FALLBACK 404
====================================================== */

app.use((req, res) => {
    res.status(404).send("<h1>404 - Página não encontrada</h1>");
});

/* ======================================================
   SERVER
====================================================== */

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
