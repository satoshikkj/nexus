import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    setDoc,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";

    // ==============================
    // ELEMENTOS
    // ==============================

    const loginScreen = document.getElementById("loginScreen");
    const registerScreen = document.getElementById("registerScreen");


    // ==============================
    // ELEMENTOS
    // ==============================

    const loginScreen = document.getElementById("loginScreen");
    const registerScreen = document.getElementById("registerScreen");

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    const loginEmail = document.getElementById("loginEmail");
    const loginPassword = document.getElementById("loginPassword");

    const registerName = document.getElementById("registerName");
    const companyName = document.getElementById("companyName");
    const registerEmail = document.getElementById("registerEmail");
    const registerPassword = document.getElementById("registerPassword");
    const confirmPassword = document.getElementById("confirmPassword");
    const terms = document.getElementById("terms");

    const loginMessage = document.getElementById("loginMessage");
    const registerMessage = document.getElementById("registerMessage");

    const loginButton = document.getElementById("loginButton");
    const registerButton = document.getElementById("registerButton");

    const registerLink = document.getElementById("registerLink");
    const backToLogin = document.getElementById("backToLogin");

    const forgotPassword = document.getElementById("forgotPassword");

    const toggleLoginPassword =
        document.getElementById("toggleLoginPassword");

    const toggleRegisterPassword =
        document.getElementById("toggleRegisterPassword");

    const termsLink =
        document.getElementById("termsLink");

    const year = document.getElementById("year");

    if (year) {
        year.textContent = new Date().getFullYear();
    }

    // ==============================
    // VALIDAÇÃO DE E-MAIL
    // ==============================

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    }

    // ==============================
    // MENSAGENS
    // ==============================

    function showLoginMessage(message, type = "error") {

        if (!loginMessage) return;

        loginMessage.textContent = message;
        loginMessage.className = `form-message ${type}`;
    }

    function clearLoginMessage() {

        if (!loginMessage) return;

        loginMessage.textContent = "";
        loginMessage.className = "form-message";
    }

    function showRegisterMessage(message, type = "error") {

        if (!registerMessage) return;

        registerMessage.textContent = message;
        registerMessage.className = `form-message ${type}`;
    }

    function clearRegisterMessage() {

        if (!registerMessage) return;

        registerMessage.textContent = "";
        registerMessage.className = "form-message";
    }

    // ==============================
    // TROCAR TELA
    // ==============================

    function showRegisterScreen() {

        clearLoginMessage();
        clearRegisterMessage();

        loginScreen.hidden = true;
        registerScreen.hidden = false;

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        if (registerName) {
            setTimeout(() => registerName.focus(), 200);
        }
    }

    function showLoginScreen() {

        clearLoginMessage();
        clearRegisterMessage();

        registerScreen.hidden = true;
        loginScreen.hidden = false;

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        if (loginEmail) {
            setTimeout(() => loginEmail.focus(), 200);
        }
    }

    // ==============================
    // ABRIR CADASTRO
    // ==============================

    if (registerLink) {

        registerLink.addEventListener("click", (event) => {

            event.preventDefault();

            showRegisterScreen();

        });

    }

    // ==============================
    // VOLTAR PARA LOGIN
    // ==============================

    if (backToLogin) {

        backToLogin.addEventListener("click", (event) => {

            event.preventDefault();

            showLoginScreen();

        });

    }

    // ==============================
    // MOSTRAR / OCULTAR SENHA LOGIN
    // ==============================

    if (toggleLoginPassword) {

        toggleLoginPassword.addEventListener("click", () => {

            const isPassword =
                loginPassword.type === "password";

            loginPassword.type =
                isPassword ? "text" : "password";

            toggleLoginPassword.textContent =
                isPassword ? "Ocultar" : "Mostrar";

        });

    }

    // ==============================
    // MOSTRAR / OCULTAR SENHA CADASTRO
    // ==============================

    if (toggleRegisterPassword) {

        toggleRegisterPassword.addEventListener("click", () => {

            const isPassword =
                registerPassword.type === "password";

            registerPassword.type =
                isPassword ? "text" : "password";

            toggleRegisterPassword.textContent =
                isPassword ? "Ocultar" : "Mostrar";

        });

    }

    // ==============================
    // LOGIN FIREBASE
    // ==============================

    if (loginForm) {

        loginForm.addEventListener("submit", async (event) => {

            event.preventDefault();

            clearLoginMessage();

            const email =
                loginEmail.value.trim();

            const password =
                loginPassword.value;

            // Validação

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

            if (!password) {

                showLoginMessage(
                    "Digite sua senha."
                );

                loginPassword.focus();

                return;
            }

            if (password.length < 6) {

                showLoginMessage(
                    "A senha deve ter pelo menos 6 caracteres."
                );

                loginPassword.focus();

                return;
            }

            // Loading

            loginButton.disabled = true;

            const originalText =
                loginButton.textContent;

            loginButton.textContent =
                "ENTRANDO...";

            try {

                const userCredential =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );

                const user =
                    userCredential.user;

                console.log(
                    "Usuário autenticado:",
                    user.uid
                );

                showLoginMessage(
                    "Login realizado com sucesso.",
                    "success"
                );

                /*
                 * Por enquanto vamos apenas confirmar
                 * a autenticação.
                 *
                 * Na próxima etapa:
                 * usuário → Dashboard
                 */

                setTimeout(() => {

                    console.log(
                        "Preparando abertura do Dashboard..."
                    );

                }, 800);

            } catch (error) {

                console.error(
                    "Erro no login:",
                    error
                );

                switch (error.code) {

                    case "auth/invalid-credential":

                        showLoginMessage(
                            "E-mail ou senha incorretos."
                        );

                        break;

                    case "auth/user-not-found":

                        showLoginMessage(
                            "Não existe uma conta com este e-mail."
                        );

                        break;

                    case "auth/wrong-password":

                        showLoginMessage(
                            "Senha incorreta."
                        );

                        break;

                    case "auth/too-many-requests":

                        showLoginMessage(
                            "Muitas tentativas. Tente novamente mais tarde."
                        );

                        break;

                    case "auth/network-request-failed":

                        showLoginMessage(
                            "Erro de conexão. Verifique sua internet."
                        );

                        break;

                    default:

                        showLoginMessage(
                            "Não foi possível realizar o login."
                        );

                }

            } finally {

                loginButton.disabled = false;

                loginButton.textContent =
                    originalText;

            }

        });

    }

    // ==============================
    // CADASTRO FIREBASE
    // ==============================

    if (registerForm) {

        registerForm.addEventListener("submit", async (event) => {

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

            // ==========================
            // VALIDAÇÕES
            // ==========================

            if (!name) {

                showRegisterMessage(
                    "Digite seu nome."
                );

                registerName.focus();

                return;
            }

            if (name.length < 3) {

                showRegisterMessage(
                    "Digite seu nome completo."
                );

                registerName.focus();

                return;
            }

            if (!company) {

                showRegisterMessage(
                    "Digite o nome da sua empresa."
                );

                companyName.focus();

                return;
            }

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

            if (!password) {

                showRegisterMessage(
                    "Crie uma senha."
                );

                registerPassword.focus();

                return;
            }

            if (password.length < 6) {

                showRegisterMessage(
                    "A senha deve ter pelo menos 6 caracteres."
                );

                registerPassword.focus();

                return;
            }

            if (password !== confirmation) {

                showRegisterMessage(
                    "As senhas não são iguais."
                );

                confirmPassword.focus();

                return;
            }

            if (!terms.checked) {

                showRegisterMessage(
                    "Você precisa aceitar os termos."
                );

                return;
            }

            // ==========================
            // CRIAR CONTA
            // ==========================

            registerButton.disabled = true;

            const originalText =
                registerButton.textContent;

            registerButton.textContent =
                "CRIANDO CONTA...";

            try {

                const userCredential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );

                const user =
                    userCredential.user;

                console.log(
                    "Conta criada:",
                    user.uid
                );

                showRegisterMessage(
                    "Conta criada com sucesso!",
                    "success"
                );

                /*
                 * A conta já existe no Firebase Authentication.
                 *
                 * Na próxima etapa vamos criar:
                 *
                 * empresas/{empresaId}
                 *
                 * users/{uid}
                 *
                 * e relacionar os dois.
                 */

                registerForm.reset();

                setTimeout(() => {

                    showLoginScreen();

                    loginEmail.value =
                        email;

                    showLoginMessage(
                        "Sua conta foi criada. Faça login para continuar.",
                        "success"
                    );

                }, 1200);

            } catch (error) {

                console.error(
                    "Erro no cadastro:",
                    error
                );

                switch (error.code) {

                    case "auth/email-already-in-use":

                        showRegisterMessage(
                            "Este e-mail já possui uma conta."
                        );

                        break;

                    case "auth/invalid-email":

                        showRegisterMessage(
                            "O e-mail informado é inválido."
                        );

                        break;

                    case "auth/weak-password":

                        showRegisterMessage(
                            "A senha é muito fraca."
                        );

                        break;

                    case "auth/network-request-failed":

                        showRegisterMessage(
                            "Erro de conexão. Verifique sua internet."
                        );

                        break;

                    default:

                        showRegisterMessage(
                            "Não foi possível criar sua conta."
                        );

                }

            } finally {

                registerButton.disabled = false;

                registerButton.textContent =
                    originalText;

            }

        });

    }

    // ==============================
    // RECUPERAR SENHA
    // ==============================

    if (forgotPassword) {

        forgotPassword.addEventListener("click", async (event) => {

            event.preventDefault();

            clearLoginMessage();

            const email =
                loginEmail.value.trim();

            if (!email) {

                showLoginMessage(
                    "Digite seu e-mail primeiro para recuperar a senha."
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

            try {

                await sendPasswordResetEmail(
                    auth,
                    email
                );

                showLoginMessage(
                    "Se existir uma conta com esse e-mail, você receberá as instruções para redefinir sua senha.",
                    "success"
                );

            } catch (error) {

                console.error(
                    "Erro ao recuperar senha:",
                    error
                );

                showLoginMessage(
                    "Não foi possível enviar o e-mail de recuperação."
                );

            }

        });

    }

    // ==============================
    // TERMOS
    // ==============================

    if (termsLink) {

        termsLink.addEventListener("click", (event) => {

            event.preventDefault();

            alert(
                "Os Termos de Uso do NEXUS serão disponibilizados nesta seção."
            );

        });

    }

    // ==============================
    // LIMPAR MENSAGENS AO DIGITAR
    // ==============================

    const loginInputs = [
        loginEmail,
        loginPassword
    ];

    loginInputs.forEach((input) => {

        if (input) {

            input.addEventListener(
                "input",
                clearLoginMessage
            );

        }

    });

    const registerInputs = [
        registerName,
        companyName,
        registerEmail,
        registerPassword,
        confirmPassword
    ];

    registerInputs.forEach((input) => {

        if (input) {

            input.addEventListener(
                "input",
                clearRegisterMessage
            );

        }

    });

    // ==============================
    // OBSERVAR AUTENTICAÇÃO
    // ==============================

    onAuthStateChanged(auth, (user) => {

        if (user) {

            console.log(
                "Firebase: usuário autenticado.",
                user.uid
            );

        } else {

            console.log(
                "Firebase: nenhum usuário autenticado."
            );

        }

    });

});
