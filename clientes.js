// =========================================
// NEXUS — CLIENTES
// =========================================

// FIREBASE AUTH
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

// FIRESTORE
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

// FIREBASE CONFIG
import {
    auth,
    db
} from "./firebase.js";


// =========================================
// DOM
// =========================================

const companyName = document.getElementById("companyName");

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

const mobileMenu =
    document.getElementById("mobileMenu");

const sidebar =
    document.getElementById("sidebar");

const newClientButton =
    document.getElementById("newClientButton");

const searchClient =
    document.getElementById("searchClient");

const clientsTableBody =
    document.getElementById("clientsTableBody");

const clientModal =
    document.getElementById("clientModal");

const closeClientModal =
    document.getElementById("closeClientModal");

const cancelClientButton =
    document.getElementById("cancelClientButton");

const clientForm =
    document.getElementById("clientForm");

const clientId =
    document.getElementById("clientId");

const clientName =
    document.getElementById("clientName");

const clientWhatsapp =
    document.getElementById("clientWhatsapp");

const clientEmail =
    document.getElementById("clientEmail");

const clientCpf =
    document.getElementById("clientCpf");

const clientNotes =
    document.getElementById("clientNotes");

const clientMessage =
    document.getElementById("clientMessage");

const saveClientButton =
    document.getElementById("saveClientButton");

const modalTitle =
    document.getElementById("modalTitle");


// =========================================
// ESTADO
// =========================================

let currentUser = null;
let currentEmpresaId = null;
let clients = [];


// =========================================
// UTILITÁRIOS
// =========================================

function getInitial(name) {
    if (!name) return "U";

    return name
        .trim()
        .charAt(0)
        .toUpperCase();
}


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


function escapeHTML(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatDate(timestamp) {
    if (!timestamp) {
        return "-";
    }

    try {
        const date = timestamp.toDate();

        return date.toLocaleDateString("pt-BR");
    } catch (error) {
        return "-";
    }
}


// =========================================
// MODAL
// =========================================

function openClientModal(client = null) {

    if (!clientModal) return;

    clientForm.reset();

    clientMessage.textContent = "";
    clientMessage.className = "form-message";

    if (client) {

        modalTitle.textContent = "Editar cliente";

        clientId.value = client.id;

        clientName.value =
            client.nome || "";

        clientWhatsapp.value =
            client.whatsapp || "";

        clientEmail.value =
            client.email || "";

        clientCpf.value =
            client.cpf || "";

        clientNotes.value =
            client.observacoes || "";

    } else {

        modalTitle.textContent = "Novo cliente";

        clientId.value = "";

    }

    clientModal.classList.add("active");

    setTimeout(() => {
        clientName.focus();
    }, 100);
}


function closeModal() {

    if (!clientModal) return;

    clientModal.classList.remove("active");

    clientForm.reset();

    clientId.value = "";

    clientMessage.textContent = "";
    clientMessage.className = "form-message";
}


// =========================================
// RENDER CLIENTES
// =========================================

function renderClients(list = clients) {

    if (!clientsTableBody) return;

    if (list.length === 0) {

        clientsTableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="table-empty">
                        <div class="empty-icon">♙</div>
                        <h3>Nenhum cliente encontrado</h3>
                        <p>
                            Cadastre seu primeiro cliente para começar.
                        </p>
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    clientsTableBody.innerHTML = list.map(client => {

        const initial =
            getInitial(client.nome);

        return `
            <tr>

                <td>
                    <div class="client-name">

                        <div class="client-avatar">
                            ${escapeHTML(initial)}
                        </div>

                        <div>
                            <strong>
                                ${escapeHTML(client.nome)}
                            </strong>

                            <small>
                                Cliente
                            </small>
                        </div>

                    </div>
                </td>


                <td>
                    ${escapeHTML(client.whatsapp || "-")}
                </td>


                <td>
                    ${escapeHTML(client.email || "-")}
                </td>


                <td>
                    ${escapeHTML(client.cpf || "-")}
                </td>


                <td>
                    ${formatDate(client.criadoEm)}
                </td>


                <td>

                    <div class="client-actions">

                        <button
                            type="button"
                            class="client-action"
                            data-action="edit"
                            data-id="${escapeHTML(client.id)}"
                            title="Editar"
                        >
                            ✎
                        </button>


                        <button
                            type="button"
                            class="client-action"
                            data-action="delete"
                            data-id="${escapeHTML(client.id)}"
                            title="Excluir"
                        >
                            ×
                        </button>

                    </div>

                </td>

            </tr>
        `;

    }).join("");
}


// =========================================
// CARREGAR CLIENTES
// =========================================

async function loadClients() {

    if (!currentEmpresaId) return;

    try {

        console.log(
            "Carregando clientes da empresa:",
            currentEmpresaId
        );

        const clientsRef =
            collection(
                db,
                "empresas",
                currentEmpresaId,
                "clientes"
            );


        const snapshot =
            await getDocs(clientsRef);


        clients = snapshot.docs.map(document => {

            return {
                id: document.id,
                ...document.data()
            };

        });


        // Ordenar por nome
        clients.sort((a, b) => {

            return (a.nome || "")
                .localeCompare(
                    b.nome || "",
                    "pt-BR",
                    {
                        sensitivity: "base"
                    }
                );

        });


        renderClients();

        console.log(
            "Clientes carregados:",
            clients.length
        );

    } catch (error) {

        console.error(
            "Erro ao carregar clientes:",
            error
        );

        clientsTableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="table-empty">
                        <h3>Erro ao carregar clientes</h3>
                        <p>
                            Verifique sua conexão e tente novamente.
                        </p>
                    </div>
                </td>
            </tr>
        `;
    }
}


// =========================================
// SALVAR CLIENTE
// =========================================

async function saveClient(event) {

    event.preventDefault();

    if (!currentEmpresaId) {
        alert("Empresa não identificada.");
        return;
    }


    const name =
        clientName.value.trim();

    const whatsapp =
        clientWhatsapp.value.trim();

    const email =
        clientEmail.value.trim();

    const cpf =
        clientCpf.value.trim();

    const observacoes =
        clientNotes.value.trim();

    if (!name) {

        clientMessage.textContent =
            "Digite o nome do cliente.";

        clientMessage.className =
            "form-message error";

        clientName.focus();

        return;
    }


    try {

        saveClientButton.disabled = true;

        saveClientButton.textContent =
            "Salvando...";


        const data = {

            nome: name,

            whatsapp: whatsapp,

            email: email,

            cpf: cpf,

            observacoes: observacoes,

            atualizadoEm:
                serverTimestamp()

        };


        // EDITAR
        if (clientId.value) {

            const clientRef =
                doc(
                    db,
                    "empresas",
                    currentEmpresaId,
                    "clientes",
                    clientId.value
                );


            await updateDoc(
                clientRef,
                data
            );


            console.log(
                "Cliente atualizado."
            );


        }

        // NOVO CLIENTE
        else {

            data.criadoEm =
                serverTimestamp();


            await addDoc(

                collection(
                    db,
                    "empresas",
                    currentEmpresaId,
                    "clientes"
                ),

                data

            );


            console.log(
                "Cliente criado."
            );
        }


        closeModal();

        await loadClients();


    } catch (error) {

        console.error(
            "Erro ao salvar cliente:",
            error
        );


        clientMessage.textContent =
            "Não foi possível salvar o cliente.";

        clientMessage.className =
            "form-message error";


    } finally {

        saveClientButton.disabled =
            false;

        saveClientButton.textContent =
            "Salvar cliente";

    }
}


// =========================================
// EDITAR CLIENTE
// =========================================

function editClient(id) {

    const client =
        clients.find(
            item => item.id === id
        );


    if (!client) {

        console.error(
            "Cliente não encontrado:",
            id
        );

        return;
    }


    openClientModal(client);
}


// =========================================
// EXCLUIR CLIENTE
// =========================================

async function deleteClient(id) {

    const client =
        clients.find(
            item => item.id === id
        );


    if (!client) return;


    const confirmed =
        confirm(
            `Deseja realmente excluir o cliente "${client.nome}"?`
        );


    if (!confirmed) return;


    try {

        const clientRef =
            doc(
                db,
                "empresas",
                currentEmpresaId,
                "clientes",
                id
            );


        await deleteDoc(clientRef);


        console.log(
            "Cliente excluído:",
            id
        );


        await loadClients();


    } catch (error) {

        console.error(
            "Erro ao excluir cliente:",
            error
        );


        alert(
            "Não foi possível excluir o cliente."
        );
    }
}


// =========================================
// PESQUISA
// =========================================

function filterClients() {

    const search =
        searchClient.value
            .trim()
            .toLowerCase();


    if (!search) {

        renderClients();

        return;
    }


    const filtered =
        clients.filter(client => {

            const name =
                (client.nome || "")
                    .toLowerCase();

            const whatsapp =
                (client.whatsapp || "")
                    .toLowerCase();

            const email =
                (client.email || "")
                    .toLowerCase();

            const cpf =
                (client.cpf || "")
                    .toLowerCase();


            return (
                name.includes(search) ||
                whatsapp.includes(search) ||
                email.includes(search) ||
                cpf.includes(search)
            );

        });


    renderClients(filtered);
}


// =========================================
// BOTÕES DA TABELA
// =========================================

if (clientsTableBody) {

    clientsTableBody.addEventListener(
        "click",
        (event) => {

            const button =
                event.target.closest(
                    ".client-action"
                );


            if (!button) return;


            const id =
                button.dataset.id;

            const action =
                button.dataset.action;


            if (action === "edit") {

                editClient(id);

            }


            if (action === "delete") {

                deleteClient(id);

            }

        }
    );
}


// =========================================
// NOVO CLIENTE
// =========================================

if (newClientButton) {

    newClientButton.addEventListener(
        "click",
        () => {

            openClientModal();

        }
    );
}


// =========================================
// FECHAR MODAL
// =========================================

if (closeClientModal) {

    closeClientModal.addEventListener(
        "click",
        closeModal
    );
}


if (cancelClientButton) {

    cancelClientButton.addEventListener(
        "click",
        closeModal
    );
}


// Fechar clicando fora do modal
if (clientModal) {

    clientModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target === clientModal
            ) {

                closeModal();

            }

        }
    );
}


// Tecla ESC
document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {

            closeModal();

        }

    }
);


// =========================================
// FORMULÁRIO
// =========================================

if (clientForm) {

    clientForm.addEventListener(
        "submit",
        saveClient
    );
}


// =========================================
// PESQUISA
// =========================================

if (searchClient) {

    searchClient.addEventListener(
        "input",
        filterClients
    );
}


// =========================================
// LOGOUT
// =========================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            try {

                logoutButton.disabled =
                    true;

                logoutButton.textContent =
                    "...";


                await signOut(auth);


                window.location.href =
                    "index.html";


            } catch (error) {

                console.error(
                    "Erro ao sair:",
                    error
                );


                alert(
                    "Não foi possível sair da conta."
                );


                logoutButton.disabled =
                    false;

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


const navItems =
    document.querySelectorAll(
        ".nav-item"
    );


navItems.forEach(item => {

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

});


// =========================================
// AUTENTICAÇÃO + EMPRESA
// =========================================

async function loadUserData(user) {

    try {

        console.log(
            "Usuário autenticado:",
            user.uid
        );


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


        const name =
            userData.nome || "Usuário";


        const role =
            userData.role || "user";


        const empresaId =
            userData.empresaId;


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


        currentUser =
            user;

        currentEmpresaId =
            empresaId;


        // =========================================
        // DADOS DA EMPRESA
        // =========================================

        const empresaRef =
            doc(
                db,
                "empresas",
                empresaId
            );


        const empresaSnapshot =
            await getDoc(
                empresaRef
            );


        if (!empresaSnapshot.exists()) {

            console.error(
                "Empresa não encontrada."
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


        const empresa =
            empresaData.nome ||
            "Minha Empresa";


        // =========================================
        // PREENCHER INTERFACE
        // =========================================

        if (companyName) {

            companyName.textContent =
                empresa;

        }


        if (sidebarUserName) {

            sidebarUserName.textContent =
                name;

        }


        if (sidebarUserRole) {

            sidebarUserRole.textContent =
                formatRole(role);

        }


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


        // =========================================
        // CARREGAR CLIENTES
        // =========================================

        await loadClients();


        console.log(
            "Página de clientes carregada com sucesso."
        );


    } catch (error) {

        console.error(
            "Erro ao carregar página de clientes:",
            error
        );


        alert(
            "Ocorreu um erro ao carregar os clientes."
        );

    }
}


// =========================================
// AUTH STATE
// =========================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            console.log(
                "Nenhum usuário autenticado."
            );


            window.location.href =
                "index.html";

            return;
        }


        await loadUserData(user);

    }
);
