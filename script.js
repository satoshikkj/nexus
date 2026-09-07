/* =========================================================
   NEXUS — SMART BUSINESS SYSTEM
   Application Logic
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTOS — LOGIN
    ===================================================== */

    const loginScreen = document.getElementById("loginScreen");
    const registerScreen = document.getElementById("registerScreen");

    const loginForm = document.getElementById("loginForm");
    const loginEmail = document.getElementById("loginEmail");
    const loginPassword = document.getElementById("loginPassword");

    const loginButton = document.getElementById("loginButton");
    const loginMessage = document.getElementById("loginMessage");

    const toggleLoginPassword =
        document.getElementById("toggleLoginPassword");

    const forgotPassword =
        document.getElementById("forgotPassword");

    const registerLink =
        document.getElementById("registerLink");


    /* =====================================================
       ELEMENTOS — CADASTRO
    ===================================================== */

    const registerForm =
        document.getElementById("registerForm");

    const registerName =
        document.getElementById("registerName");

    const companyName =
        document.getElementById("companyName");

    const registerEmail =
        document.getElementById("registerEmail");

    const registerPassword =
        document.getElementById("registerPassword");

    const confirmPassword =
        document.getElementById("confirmPassword");

    const terms =
        document.getElementById("terms");

    const registerButton =
        document.getElementById("registerButton");

    const registerMessage =
        document.getElementById("registerMessage");

    const toggleRegisterPassword =
        document.getElementById("toggleRegisterPassword");

    const backToLogin =
        document.getElementById("backToLogin");

    const termsLink =
        document.getElementById("termsLink");


    /* =====================================================
       FOOTER
    ===================================================== */

    const yearElement =
        document.getElementById("year");

    if (yearElement) {
        yearElement.textContent =
            new Date().getFullYear();
    }


    /* =====================================================
       FUNÇÕES DE MENSAGEM
    ===================================================== */

    function showLoginMessage(message, type = "error") {

        if (!loginMessage) return;

        loginMessage.textContent = message;

        loginMessage.className =
            `form-message ${type}`;

    }


    function clearLoginMessage() {

        if (!loginMessage) return;

        loginMessage.textContent = "";

        loginMessage.className =
            "form-message";

    }


    function showRegisterMessage(message, type = "error") {

        if (!registerMessage) return;

        registerMessage.textContent = message;

        registerMessage.className =
            `form-message ${type}`;

    }


    function clearRegisterMessage() {

        if (!registerMessage) return;

        registerMessage.textContent = "";

        registerMessage.className =
            "form-message";

    }


    /* =====================================================
       VALIDAÇÃO DE E-MAIL
    ===================================================== */

    function isValidEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

    }


    /* =====================================================
       TROCAR PARA CADASTRO
    ===================================================== */

    function showRegisterScreen() {

        clearLoginMessage();
        clearRegisterMessage();

        if (loginScreen) {
            loginScreen.hidden = true;
        }

        if (registerScreen) {
            registerScreen.hidden = false;
        }

        if (registerName) {
            setTimeout(() => {
                registerName.focus();
            }, 100);
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    /* =====================================================
       VOLTAR PARA LOGIN
    ===================================================== */

    function showLoginScreen() {

        clearLoginMessage();
        clearRegisterMessage();

        if (registerScreen) {
            registerScreen.hidden = true;
        }

        if (loginScreen) {
            loginScreen.hidden = false;
        }

        if (loginEmail) {
            setTimeout(() => {
                loginEmail.focus();
            }, 100);
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    /* =====================================================
       BOTÃO — CRIAR CONTA
    ===================================================== */

    if (registerLink) {

        registerLink.addEventListener("click", (event) => {

            event.preventDefault();

            showRegisterScreen();

        });

    }


    /* =====================================================
       BOTÃO — VOLTAR PARA LOGIN
    ===================================================== */

    if (backToLogin) {

        backToLogin.addEventListener("click", (event) => {

            event.preventDefault();

            showLoginScreen();

        });

    }


    /* =====================================================
       MOSTRAR / OCULTAR SENHA — LOGIN
    ===================================================== */

    if (
        toggleLoginPassword &&
        loginPassword
    ) {

        toggleLoginPassword.addEventListener(
            "click",
            () => {

                const isHidden =
                    loginPassword.type === "password";

                loginPassword.type =
                    isHidden
                        ? "text"
                        : "password";

                toggleLoginPassword.textContent =
                    isHidden
                        ? "◌"
                        : "◉";

                toggleLoginPassword.setAttribute(
                    "aria-label",
                    isHidden
                        ? "Ocultar senha"
                        : "Mostrar senha"
                );

            }
        );

    }


    /* =====================================================
       MOSTRAR / OCULTAR SENHA — CADASTRO
    ===================================================== */

    if (
        toggleRegisterPassword &&
        registerPassword
    ) {

        toggleRegisterPassword.addEventListener(
            "click",
            () => {

                const isHidden =
                    registerPassword.type === "password";

                registerPassword.type =
                    isHidden
                        ? "text"
                        : "password";

                toggleRegisterPassword.textContent =
                    isHidden
                        ? "◌"
                        : "◉";

                toggleRegisterPassword.setAttribute(
                    "aria-label",
                    isHidden
                        ? "Ocultar senha"
                        : "Mostrar senha"
                );

            }
        );

    }


    /* =====================================================
       LOGIN
    ===================================================== */

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();

                clearLoginMessage();

                const email =
                    loginEmail.value.trim();

                const password =
                    loginPassword.value;


                /* -------------------------
                   E-MAIL
                ------------------------- */

                if (!email) {

                    showLoginMessage(
                        "Digite seu e-mail."
                    );

                    loginEmail.focus();

                    return;
                }


                if (!isValidEmail(email)) {

                    showLoginMessage(
                        "Digite um e-mail válido."
                    );

                    loginEmail.focus();

                    return;
                }


                /* -------------------------
                   SENHA
                ------------------------- */

                if (!password) {

                    showLoginMessage(
                        "Digite sua senha."
                    );

                    loginPassword.focus();

                    return;
                }


                if (password.length < 6) {

                    showLoginMessage(
                        "A senha precisa ter pelo menos 6 caracteres."
                    );

                    loginPassword.focus();

                    return;
                }


                /* -------------------------
                   CARREGAMENTO
                ------------------------- */

                const originalContent =
                    loginButton.innerHTML;

                loginButton.disabled = true;

                loginButton.style.opacity = "0.7";

                loginButton.innerHTML = `
                    <span>Verificando...</span>
                    <span class="button-arrow">...</span>
                `;


                /*
                 * Firebase Authentication
                 * será conectado posteriormente.
                 */

                setTimeout(() => {

                    loginButton.disabled = false;

                    loginButton.style.opacity = "1";

                    loginButton.innerHTML =
                        originalContent;

                    showLoginMessage(
                        "Firebase ainda não conectado. O login real será configurado em breve."
                    );

                }, 1000);

            }
        );

    }


    /* =====================================================
       CADASTRO
    ===================================================== */

    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();

                clearRegisterMessage();

                const name =
                    registerName.value.trim();

                const company =
                    companyName.value.trim();

                const email =
                    registerEmail.value.trim();

                const password =
                    registerPassword.value;

                const confirmation =
                    confirmPassword.value;


                /* -------------------------
                   NOME
                ------------------------- */

                if (!name) {

                    showRegisterMessage(
                        "Digite seu nome completo."
                    );

                    registerName.focus();

                    return;
                }


                if (name.length < 3) {

                    showRegisterMessage(
                        "Digite um nome válido."
                    );

                    registerName.focus();

                    return;
                }


                /* -------------------------
                   EMPRESA
                ------------------------- */

                if (!company) {

                    showRegisterMessage(
                        "Digite o nome da sua empresa."
                    );

                    companyName.focus();

                    return;
                }


                /* -------------------------
                   E-MAIL
                ------------------------- */

                if (!email) {

                    showRegisterMessage(
                        "Digite seu e-mail."
                    );

                    registerEmail.focus();

                    return;
                }


                if (!isValidEmail(email)) {

                    showRegisterMessage(
                        "Digite um e-mail válido."
                    );

                    registerEmail.focus();

                    return;
                }


                /* -------------------------
                   SENHA
                ------------------------- */

                if (!password) {

                    showRegisterMessage(
                        "Crie uma senha."
                    );

                    registerPassword.focus();

                    return;
                }


                if (password.length < 6) {

                    showRegisterMessage(
                        "A senha precisa ter pelo menos 6 caracteres."
                    );

                    registerPassword.focus();

                    return;
                }


                /* -------------------------
                   CONFIRMAÇÃO
                ------------------------- */

                if (!confirmation) {

                    showRegisterMessage(
                        "Confirme sua senha."
                    );

                    confirmPassword.focus();

                    return;
                }


                if (password !== confirmation) {

                    showRegisterMessage(
                        "As senhas não coincidem."
                    );

                    confirmPassword.focus();

                    return;
                }


                /* -------------------------
                   TERMOS
                ------------------------- */

                if (!terms.checked) {

                    showRegisterMessage(
                        "Você precisa aceitar os termos de uso."
                    );

                    return;
                }


                /* -------------------------
                   CARREGAMENTO
                ------------------------- */

                const originalContent =
                    registerButton.innerHTML;

                registerButton.disabled = true;

                registerButton.style.opacity = "0.7";

                registerButton.innerHTML = `
                    <span>Criando conta...</span>
                    <span class="button-arrow">...</span>
                `;


                /*
                 * Firebase Authentication
                 * será conectado posteriormente.
                 */

                setTimeout(() => {

                    registerButton.disabled = false;

                    registerButton.style.opacity = "1";

                    registerButton.innerHTML =
                        originalContent;

                    showRegisterMessage(
                        "Formulário validado. O Firebase será conectado na próxima etapa.",
                        "success"
                    );

                }, 1000);

            }
        );

    }


    /* =====================================================
       ESQUECI A SENHA
    ===================================================== */

    if (forgotPassword) {

        forgotPassword.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                showLoginMessage(
                    "A recuperação de senha será ativada com o Firebase."
                );

            }
        );

    }


    /* =====================================================
       TERMOS DE USO
    ===================================================== */

    if (termsLink) {

        termsLink.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                showRegisterMessage(
                    "Os termos de uso serão adicionados posteriormente.",
                    "success"
                );

            }
        );

    }


    /* =====================================================
       LIMPAR MENSAGENS AO DIGITAR
    ===================================================== */

    const loginInputs = [
        loginEmail,
        loginPassword
    ];

    loginInputs.forEach((input) => {

        if (!input) return;

        input.addEventListener(
            "input",
            clearLoginMessage
        );

    });


    const registerInputs = [
        registerName,
        companyName,
        registerEmail,
        registerPassword,
        confirmPassword
    ];

    registerInputs.forEach((input) => {

        if (!input) return;

        input.addEventListener(
            "input",
            clearRegisterMessage
        );

    });


    /* =====================================================
       INICIALIZAÇÃO
    ===================================================== */

    console.log(
        "%c NEXUS ",
        "background:#526ff1;color:#fff;font-weight:800;padding:6px 10px;border-radius:6px;"
    );

    console.log(
        "Smart Business System iniciado."
    );

    console.log(
        "Authentication: aguardando Firebase."
    );

});
