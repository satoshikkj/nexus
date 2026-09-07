/* =========================================================
   NEXUS — SMART BUSINESS SYSTEM
   Frontend Logic
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       ELEMENTOS
    ========================== */

    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const togglePassword =
        document.getElementById("togglePassword");

    const loginButton =
        document.getElementById("loginButton");

    const formMessage =
        document.getElementById("formMessage");

    const forgotPassword =
        document.getElementById("forgotPassword");

    const registerLink =
        document.getElementById("registerLink");

    const yearElement =
        document.getElementById("year");


    /* =========================
       ANO
    ========================== */

    if (yearElement) {
        yearElement.textContent =
            new Date().getFullYear();
    }


    /* =========================
       MENSAGENS
    ========================== */

    function clearMessage() {

        if (!formMessage) return;

        formMessage.textContent = "";
        formMessage.className = "form-message";

    }


    function showMessage(message, type = "error") {

        if (!formMessage) return;

        formMessage.textContent = message;

        formMessage.className =
            `form-message ${type}`;

    }


    /* =========================
       EMAIL
    ========================== */

    function isValidEmail(email) {

        /*
         * Exemplo válido:
         *
         * usuario@gmail.com
         * usuario@hotmail.com
         * contato@empresa.com.br
         *
         * Exemplo inválido:
         *
         * kak@191727
         * teste@
         * teste.com
         */

        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

    }


    /* =========================
       MOSTRAR / OCULTAR SENHA
    ========================== */

    if (togglePassword && passwordInput) {

        togglePassword.addEventListener("click", () => {

            const showingPassword =
                passwordInput.type === "text";

            if (showingPassword) {

                passwordInput.type = "password";

                togglePassword.textContent = "◉";

                togglePassword.setAttribute(
                    "aria-label",
                    "Mostrar senha"
                );

            } else {

                passwordInput.type = "text";

                togglePassword.textContent = "◌";

                togglePassword.setAttribute(
                    "aria-label",
                    "Ocultar senha"
                );

            }

        });

    }


    /* =========================
       LOGIN
    ========================== */

    if (loginForm) {

        loginForm.addEventListener("submit", (event) => {

            event.preventDefault();

            clearMessage();

            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;


            /* -------------------------
               EMAIL VAZIO
            ------------------------- */

            if (!email) {

                showMessage(
                    "Digite seu e-mail."
                );

                emailInput.focus();

                return;
            }


            /* -------------------------
               EMAIL INVÁLIDO
            ------------------------- */

            if (!isValidEmail(email)) {

                showMessage(
                    "Digite um e-mail válido, como usuario@gmail.com."
                );

                emailInput.focus();

                return;
            }


            /* -------------------------
               SENHA VAZIA
            ------------------------- */

            if (!password) {

                showMessage(
                    "Digite sua senha."
                );

                passwordInput.focus();

                return;
            }


            /* -------------------------
               SENHA CURTA
            ------------------------- */

            if (password.length < 6) {

                showMessage(
                    "A senha precisa ter pelo menos 6 caracteres."
                );

                passwordInput.focus();

                return;
            }


            /* -------------------------
               CARREGANDO
            ------------------------- */

            const originalContent =
                loginButton.innerHTML;

            loginButton.disabled = true;

            loginButton.style.opacity = "0.7";

            loginButton.innerHTML = `
                <span>Verificando...</span>
                <span class="button-arrow">...</span>
            `;


            /* -------------------------
               SIMULAÇÃO TEMPORÁRIA
            ------------------------- */

            setTimeout(() => {

                loginButton.disabled = false;

                loginButton.style.opacity = "1";

                loginButton.innerHTML =
                    originalContent;

                showMessage(
                    "Firebase ainda não conectado. O login real será configurado na próxima etapa."
                );

            }, 1000);

        });

    }


    /* =========================
       LIMPAR ERRO AO DIGITAR
    ========================== */

    if (emailInput) {

        emailInput.addEventListener(
            "input",
            clearMessage
        );

    }


    if (passwordInput) {

        passwordInput.addEventListener(
            "input",
            clearMessage
        );

    }


    /* =========================
       ESQUECI A SENHA
    ========================== */

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
    ========================== */

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
       CONSOLE
    ========================== */

    console.log(
        "%c NEXUS ",
        "background:#526ff1;color:#fff;font-weight:800;padding:6px 10px;border-radius:6px;"
    );

    console.log(
        "NEXUS iniciado com sucesso."
    );

});
