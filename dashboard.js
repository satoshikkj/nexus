// =========================================
// NEXUS — DASHBOARD
// =========================================


// =========================================
// FIREBASE AUTH
// =========================================

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


// =========================================
// FIRESTORE
// =========================================

import {
    doc,
    getDoc,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

// =========================================
// FIREBASE CONFIG
// =========================================

import {
    auth,
    db
} from "./firebase.js";


// =========================================
// ELEMENTOS DO DOM
// =========================================

const companyName =
    document.getElementById("companyName");

const welcomeName =
    document.getElementById("welcomeName");

const sidebarUserName =
    document.getElementById("sidebarUserName");

const sidebarUserRole =
    document.getElementById("sidebarUserRole");

const userAvatar =
    document.getElementById("userAvatar");

const topbarAvatar =
    document.getElementById("topbarAvatar");

const logoutButton =
    document.getElementById("logoutButton");

const currentDate =
    document.getElementById("currentDate");

const mobileMenu =
    document.getElementById("mobileMenu");

const sidebar =
    document.getElementById("sidebar");


// =========================================
// FUNÇÃO — PRIMEIRA LETRA
// =========================================

function getInitial(name) {

    if (!name) {
        return "U";
    }

    return name
        .trim()
        .charAt(0)
        .toUpperCase();
}


// =========================================
// FUNÇÃO — DATA ATUAL
// =========================================

function updateCurrentDate() {

    const now = new Date();

    const formattedDate =
        now.toLocaleDateString(
            "pt-BR",
            {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

    if (currentDate) {
        currentDate.textContent =
            formattedDate;
    }
}

// =========================================
// FUNÇÃO — PRODUTOS E ESTOQUE
// =========================================

async function loadProductsCount(empresaId) {

    try {

        const productsRef =
            collection(
                db,
                "empresas",
                empresaId,
                "produtos"
            );

        const productsSnapshot =
            await getDocs(productsRef);


        // =====================================
        // QUANTIDADE DE PRODUTOS
        // =====================================

        const productsCount =
            document.getElementById("productsCount");


        if (productsCount) {

            productsCount.textContent =
                productsSnapshot.size;
        }


        // =====================================
        // CALCULAR ESTOQUE TOTAL
        // =====================================

        let totalStock = 0;


        productsSnapshot.forEach(
            (product) => {

                const data =
                    product.data();

                const estoque =
                    Number(data.estoque) || 0;

                totalStock += estoque;
            }
        );


        // =====================================
        // MOSTRAR ESTOQUE NO DASHBOARD
        // =====================================

        const totalStockElement =
            document.getElementById("totalStock");


        if (totalStockElement) {

            totalStockElement.textContent =
                `${totalStock} unidades em estoque`;
        }


        console.log(
            "Produtos encontrados:",
            productsSnapshot.size
        );

        console.log(
            "Estoque total:",
            totalStock
        );


    } catch (error) {

        console.error(
            "Erro ao carregar produtos e estoque:",
            error
        );
    }
}

// =========================================
// FUNÇÃO — CARREGAR DADOS
// =========================================

async function loadDashboard(user) {

    try {

        console.log(
            "Usuário autenticado:",
            user.uid
        );


        // =====================================
        // BUSCAR PERFIL DO USUÁRIO
        // =====================================

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );

        const userSnapshot =
            await getDoc(userRef);


        if (!userSnapshot.exists()) {

            console.error(
                "Perfil do usuário não encontrado."
            );

            alert(
                "Não foi possível encontrar o perfil da sua conta."
            );

            await signOut(auth);

            window.location.href =
                "index.html";

            return;
        }


        const userData =
            userSnapshot.data();


        console.log(
            "Dados do usuário:",
            userData
        );


        // =====================================
        // DADOS DO USUÁRIO
        // =====================================

        const name =
            userData.nome || "Usuário";

        const role =
            userData.role || "Usuário";

        const empresaId =
            userData.empresaId;


        // =====================================
        // VERIFICAR EMPRESA
        // =====================================

        if (!empresaId) {

            console.error(
                "empresaId não encontrado."
            );

            alert(
                "Sua conta não está vinculada a uma empresa."
            );

            await signOut(auth);

            window.location.href =
                "index.html";

            return;
        }

        await loadProductsCount(empresaId);


        // =====================================
        // BUSCAR EMPRESA
        // =====================================

        const empresaRef =
            doc(
                db,
                "empresas",
                empresaId
            );

        const empresaSnapshot =
            await getDoc(empresaRef);


        if (!empresaSnapshot.exists()) {

            console.error(
                "Empresa não encontrada:",
                empresaId
            );

            alert(
                "A empresa vinculada à sua conta não foi encontrada."
            );

            await signOut(auth);

            window.location.href =
                "index.html";

            return;
        }


        const empresaData =
            empresaSnapshot.data();


        console.log(
            "Dados da empresa:",
            empresaData
        );


        // =====================================
        // NOME DA EMPRESA
        // =====================================

        const empresa =
            empresaData.nome ||
            "Minha Empresa";


        // =====================================
        // ATUALIZAR DASHBOARD
        // =====================================

        if (companyName) {

            companyName.textContent =
                empresa;
        }


        if (welcomeName) {

            welcomeName.textContent =
                name;
        }


        if (sidebarUserName) {

            sidebarUserName.textContent =
                name;
        }


        if (sidebarUserRole) {

            sidebarUserRole.textContent =
                formatRole(role);
        }


        // =====================================
        // AVATAR
        // =====================================

        const initial =
            getInitial(name);


        if (userAvatar) {

            userAvatar.textContent =
                initial;
        }


        if (topbarAvatar) {

            topbarAvatar.textContent =
                initial;
        }


        // =====================================
        // DATA
        // =====================================

        updateCurrentDate();


        console.log(
            "Dashboard carregado com sucesso."
        );

    } catch (error) {

        console.error(
            "Erro ao carregar Dashboard:",
            error
        );

        alert(
            "Ocorreu um erro ao carregar o Dashboard."
        );
    }
}


// =========================================
// FORMATAR ROLE
// =========================================

function formatRole(role) {

    const roles = {

        owner: "Proprietário",

        admin: "Administrador",

        manager: "Gerente",

        employee: "Funcionário",

        user: "Usuário"
    };


    return roles[role] || "Usuário";
}


// =========================================
// OBSERVAR AUTENTICAÇÃO
// =========================================

onAuthStateChanged(
    auth,
    async (user) => {

        // =====================================
        // NÃO AUTENTICADO
        // =====================================

        if (!user) {

            console.log(
                "Nenhum usuário autenticado."
            );

            window.location.href =
                "index.html";

            return;
        }


        // =====================================
        // USUÁRIO AUTENTICADO
        // =====================================

        await loadDashboard(user);
    }
);


// =========================================
// LOGOUT
// =========================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            try {

                logoutButton.disabled = true;

                logoutButton.textContent =
                    "...";


                await signOut(auth);


                console.log(
                    "Usuário desconectado."
                );


                window.location.href =
                    "index.html";

            } catch (error) {

                console.error(
                    "Erro ao fazer logout:",
                    error
                );


                alert(
                    "Não foi possível sair da conta."
                );


                logoutButton.disabled = false;

                logoutButton.textContent =
                    "↪";
            }
        }
    );
}


// =========================================
// MENU MOBILE
// =========================================

if (mobileMenu && sidebar) {

    mobileMenu.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "open"
            );
        }
    );
}


// =========================================
// FECHAR MENU MOBILE AO CLICAR
// =========================================

const navItems =
    document.querySelectorAll(
        ".nav-item"
    );


navItems.forEach(
    (item) => {

        item.addEventListener(
            "click",
            () => {

                if (
                    window.innerWidth <= 760 &&
                    sidebar
                ) {

                    sidebar.classList.remove(
                        "open"
                    );
                }
            }
        );
    }
);


// =========================================
// AÇÕES RÁPIDAS
// =========================================

const quickActions =
    document.querySelectorAll(
        ".quick-action"
    );


quickActions.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                const action =
                    button.dataset.action;


                console.log(
                    "Ação selecionada:",
                    action
                );


                // Os módulos serão
                // implementados depois.

                if (action === "new-order") {

                    alert(
                        "Módulo de pedidos será implementado em breve."
                    );
                }


                if (action === "new-product") {

    window.location.href = "produtos.html";
}


                if (action === "new-client") {

                    alert(
                        "Módulo de clientes será implementado em breve."
                    );
                }


                if (action === "finance") {

                    alert(
                        "Módulo financeiro será implementado em breve."
                    );
                }
            }
        );
    }
);


// =========================================
// DATA INICIAL
// =========================================

updateCurrentDate();
