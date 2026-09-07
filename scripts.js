/* =========================================================
   NEXUS — SMART BUSINESS SYSTEM
   Frontend Logic
========================================================= */


/* =========================
   ELEMENTOS
========================= */

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const togglePassword = document.getElementById("togglePassword");
const loginButton = document.getElementById("loginButton");

const formMessage = document.getElementById("formMessage");

const forgotPassword = document.getElementById("forgotPassword");
const registerLink = document.getElementById("registerLink");

const yearElement = document.getElementById("year");


/* =========================
   ANO AUTOMÁTICO
========================= */

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


/* =========================
   MOSTRAR / OCULTAR SENHA
========================= */

if (togglePassword && passwordInput) {

    togglePassword.addEventListener("click", () => {

        const isPassword =
            passwordInput.type === "password";

        passwordInput.type =
            isPassword ? "text" : "password";

        togglePassword.textContent =
            isPassword ? "◉" : "◌";

        togglePassword.setAttribute(
            "aria-label",
            isPassword
                ? "Ocultar senha"
                : "Mostrar senha"
        );

    });

}


/* =========================
   LIMPAR MENSAGEM
========================= */

function clearMessage() {

    if (!formMessage) return;

    formMessage.textContent = "";
    formMessage.className = "form-message";

}


/* =========================
   MOSTRAR MENSAGEM
========================= */

function showMessage(message, type = "error") {

    if (!formMessage) return;

    formMessage.textContent = message;

    formMessage.className =
        `form-message ${type}`;

}


/* =========================
   VALIDAÇÃO DE EMAIL
========================= */

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}


/* =========================
   LOGIN
========================= */

if (loginForm) {

    loginForm.addEventListener("submit", (event) => {

        event.preventDefault();

        clearMessage();

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        /* -------------------------
           VALIDAÇÕES
        ------------------------- */

        if (!email) {

            showMessage(
                "Digite seu e-mail."
            );

            emailInput.focus();

            return;
        }


        if (!isValidEmail(email)) {

            showMessage(
                "Digite um e-mail válido."
            );

            emailInput.focus();

            return;
        }


        if (!password) {

            showMessage(
                "Digite sua senha."
            );

            passwordInput.focus();

            return;
        }


        if (password.length < 6) {

            showMessage(
                "A senha deve possuir pelo menos 6 caracteres."
            );

            passwordInput.focus();

            return;
        }


        /* -------------------------
           ESTADO DE CARREGAMENTO
        ------------------------- */

        const originalContent =
            loginButton.innerHTML;

        loginButton.disabled = true;

        loginButton.innerHTML = `
            <span>Verificando...</span>
            <span class="button-arrow">...</span>
        `;


        /*
         * IMPORTANTE:
         *
         * Aqui futuramente entraremos
         * com o Firebase Authentication.
         *
         * Por enquanto não existe
         * autenticação real.
         */

        setTimeout(() => {

            loginButton.disabled = false;

            loginButton.innerHTML =
                originalContent;

            showMessage(
                "Autenticação ainda não configurada. Conectaremos o Firebase na próxima etapa."
            );

        }, 1000);

    });

}


/* =========================
   CAMPO DE EMAIL
========================= */

if (emailInput) {

    emailInput.addEventListener(
        "input",
        clearMessage
    );

}


/* =========================
   CAMPO DE SENHA
========================= */

if (passwordInput) {

    passwordInput.addEventListener(
        "input",
        clearMessage
    );

}


/* =========================
   ESQUECI MINHA SENHA
========================= */

if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            showMessage(
                "A recuperação de senha será ativada com o Firebase."
            );

        }
    );

}


/* =========================
   CRIAR CONTA
========================= */

if (registerLink) {

    registerLink.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            showMessage(
                "A tela de cadastro será criada na próxima etapa."
            );

        }
    );

}


/* =========================
   ATALHO ENTER
========================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter" &&
            document.activeElement === passwordInput
        ) {

            loginForm?.requestSubmit();

        }

    }
);


/* =========================
   CONSOLE
========================= */

console.log(
    "%c NEXUS ",
    "background:#526ff1;color:#fff;font-weight:800;padding:6px 10px;border-radius:6px;"
);

console.log(
    "Smart Business System inicializado."
);

console.log(
    "Firebase Authentication: aguardando configuração."
);
