import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    collection,
    getDocs,
    getDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase.js";


// =========================================
// DOM
// =========================================

const sidebar =
    document.getElementById("sidebar");

const userAvatar =
    document.getElementById("userAvatar");

const sidebarUserName =
    document.getElementById("sidebarUserName");

const sidebarUserRole =
    document.getElementById("sidebarUserRole");

const logoutButton =
    document.getElementById("logoutButton");

const mobileMenu =
    document.getElementById("mobileMenu");

const companyName =
    document.getElementById("companyName");

const topbarAvatar =
    document.getElementById("topbarAvatar");

const totalRevenue =
    document.getElementById("totalRevenue");

const completedOrders =
    document.getElementById("completedOrders");

const averageTicket =
    document.getElementById("averageTicket");

const cancelledOrders =
    document.getElementById("cancelledOrders");

const searchFinance =
    document.getElementById("searchFinance");

const financePeriod =
    document.getElementById("financePeriod");

const financeTableBody =
    document.getElementById("financeTableBody");

const financeEmpty =
    document.getElementById("financeEmpty");

const transactionCount =
    document.getElementById("transactionCount");

const sideRevenue =
    document.getElementById("sideRevenue");

const sideOrders =
    document.getElementById("sideOrders");

const sideCancelled =
    document.getElementById("sideCancelled");

const revenueProgress =
    document.getElementById("revenueProgress");

const ordersProgress =
    document.getElementById("ordersProgress");

const cancelProgress =
    document.getElementById("cancelProgress");


// =========================================
// STATE
// =========================================

let currentEmpresaId = null;

let orders = [];


// =========================================
// FORMATTERS
// =========================================

function formatCurrency(value) {

    const number =
        Number(value) || 0;

    return number.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}


function formatDate(timestamp) {

    if (!timestamp) {
        return "—";
    }

    let date;

    if (
        typeof timestamp.toDate === "function"
    ) {
        date = timestamp.toDate();
    }
    else if (
        timestamp instanceof Date
    ) {
        date = timestamp;
    }
    else {
        return "—";
    }

    return date.toLocaleDateString(
        "pt-BR"
    );
}


function formatOrderNumber(id, index) {

    if (!id) {
        return `#${String(index + 1).padStart(4, "0")}`;
    }

    return `#${id.slice(-6).toUpperCase()}`;
}


function getInitials(name) {

    if (!name) {
        return "N";
    }

    const parts =
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (parts.length === 1) {
        return parts[0]
            .slice(0, 2)
            .toUpperCase();
    }

    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();
}


function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// =========================================
// USER / COMPANY
// =========================================

async function loadUserData(user) {

    try {

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );

        const userSnapshot =
            await getDoc(userRef);

        if (!userSnapshot.exists()) {
            throw new Error(
                "Perfil do usuário não encontrado."
            );
        }

        const userData =
            userSnapshot.data();

        currentEmpresaId =
            userData.empresaId;

        if (!currentEmpresaId) {
            throw new Error(
                "Empresa do usuário não encontrada."
            );
        }

        const name =
            userData.nome ||
            user.displayName ||
            "Usuário";

        const role =
            userData.role ||
            "usuário";

        sidebarUserName.textContent =
            name;

        sidebarUserRole.textContent =
            translateRole(role);

        const initials =
            getInitials(name);

        userAvatar.textContent =
            initials;

        topbarAvatar.textContent =
            initials;


        const empresaRef =
            doc(
                db,
                "empresas",
                currentEmpresaId
            );

        const empresaSnapshot =
            await getDoc(empresaRef);

        if (empresaSnapshot.exists()) {

            const empresaData =
                empresaSnapshot.data();

            companyName.textContent =
                empresaData.nome ||
                "Minha empresa";
        }
        else {

            companyName.textContent =
                "Minha empresa";
        }

        await loadOrders();

    }
    catch (error) {

        console.error(
            "Erro ao carregar usuário:",
            error
        );

        companyName.textContent =
            "NEXUS";

    }
}


function translateRole(role) {

    const roles = {
        owner: "Proprietário",
        admin: "Administrador",
        manager: "Gerente",
        employee: "Funcionário",
        usuário: "Usuário"
    };

    return (
        roles[role] ||
        "Usuário"
    );
}


// =========================================
// LOAD ORDERS
// =========================================

async function loadOrders() {

    if (!currentEmpresaId) {
        return;
    }

    try {

        const ordersRef =
            collection(
                db,
                "empresas",
                currentEmpresaId,
                "pedidos"
            );

        const snapshot =
            await getDocs(ordersRef);

        orders =
            snapshot.docs.map(
                orderDoc => {

                    const data =
                        orderDoc.data();

                    return {
                        id: orderDoc.id,
                        ...data
                    };
                }
            );


        orders.sort(
            (a, b) => {

                const dateA =
                    getTimestampMillis(
                        a.criadoEm
                    );

                const dateB =
                    getTimestampMillis(
                        b.criadoEm
                    );

                return dateB - dateA;
            }
        );


        renderFinance();

    }
    catch (error) {

        console.error(
            "Erro ao carregar pedidos:",
            error
        );

        orders = [];

        renderFinance();

    }
}


// =========================================
// TIMESTAMP
// =========================================

function getTimestampMillis(timestamp) {

    if (!timestamp) {
        return 0;
    }

    if (
        typeof timestamp.toMillis === "function"
    ) {
        return timestamp.toMillis();
    }

    if (
        typeof timestamp.toDate === "function"
    ) {
        return timestamp.toDate().getTime();
    }

    if (
        timestamp instanceof Date
    ) {
        return timestamp.getTime();
    }

    return 0;
}


// =========================================
// DATE FILTER
// =========================================

function isWithinSelectedPeriod(order) {

    const period =
        financePeriod.value;

    if (period === "all") {
        return true;
    }

    const timestamp =
        getTimestampMillis(
            order.criadoEm
        );

    if (!timestamp) {
        return false;
    }

    const now =
        new Date();

    const date =
        new Date(timestamp);

    now.setHours(
        23,
        59,
        59,
        999
    );

    date.setHours(
        0,
        0,
        0,
        0
    );

    if (period === "today") {

        const today =
            new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );

        return date >= today;
    }


    const days =
        Number(period);

    if (!Number.isFinite(days)) {
        return true;
    }

    const start =
        new Date();

    start.setHours(
        0,
        0,
        0,
        0
    );

    start.setDate(
        start.getDate() - (days - 1)
    );

    return date >= start;
}


// =========================================
// FILTER
// =========================================

function getFilteredOrders() {

    const search =
        searchFinance.value
            .trim()
            .toLowerCase();


    return orders.filter(
        order => {

            if (
                !isWithinSelectedPeriod(order)
            ) {
                return false;
            }


            if (!search) {
                return true;
            }


            const orderId =
                String(order.id || "")
                    .toLowerCase();

            const clientName =
                String(
                    order.clienteNome ||
                    order.cliente ||
                    ""
                ).toLowerCase();

            const status =
                String(
                    order.status || ""
                ).toLowerCase();


            return (
                orderId.includes(search) ||
                clientName.includes(search) ||
                status.includes(search)
            );
        }
    );
}


// =========================================
// RENDER FINANCE
// =========================================

function renderFinance() {

    const filteredOrders =
        getFilteredOrders();


    updateSummary(
        filteredOrders
    );


    renderTable(
        filteredOrders
    );
}


// =========================================
// SUMMARY
// =========================================

function updateSummary(list) {

    const completed =
        list.filter(
            order =>
                normalizeStatus(order.status)
                === "concluido"
        );


    const cancelled =
        list.filter(
            order =>
                normalizeStatus(order.status)
                === "cancelado"
        );


    const revenue =
        completed.reduce(
            (total, order) => {

                return (
                    total +
                    getOrderTotal(order)
                );

            },
            0
        );


    const average =
        completed.length > 0
            ? revenue / completed.length
            : 0;


    totalRevenue.textContent =
        formatCurrency(revenue);

    completedOrders.textContent =
        completed.length;

    averageTicket.textContent =
        formatCurrency(average);

    cancelledOrders.textContent =
        cancelled.length;


    sideRevenue.textContent =
        formatCurrency(revenue);

    sideOrders.textContent =
        completed.length;

    sideCancelled.textContent =
        cancelled.length;


    transactionCount.textContent =
        `${completed.length} ${
            completed.length === 1
                ? "venda"
                : "vendas"
        }`;


    updateProgress(
        completed.length,
        cancelled.length
    );
}


// =========================================
// PROGRESS
// =========================================

function updateProgress(
    completed,
    cancelled
) {

    const total =
        completed + cancelled;


    if (total <= 0) {

        revenueProgress.style.width =
            "0%";

        ordersProgress.style.width =
            "0%";

        cancelProgress.style.width =
            "0%";

        return;
    }


    const completedPercentage =
        Math.min(
            (completed / total) * 100,
            100
        );


    const cancelledPercentage =
        Math.min(
            (cancelled / total) * 100,
            100
        );


    revenueProgress.style.width =
        `${completedPercentage}%`;

    ordersProgress.style.width =
        `${completedPercentage}%`;

    cancelProgress.style.width =
        `${cancelledPercentage}%`;
}


// =========================================
// RENDER TABLE
// =========================================

function renderTable(list) {

    financeTableBody.innerHTML = "";


    const completed =
        list.filter(
            order =>
                normalizeStatus(order.status)
                === "concluido"
        );


    const cancelled =
        list.filter(
            order =>
                normalizeStatus(order.status)
                === "cancelado"
        );


    const financialOrders =
        [
            ...completed,
            ...cancelled
        ].sort(
            (a, b) => {

                return (
                    getTimestampMillis(
                        b.criadoEm
                    ) -
                    getTimestampMillis(
                        a.criadoEm
                    )
                );
            }
        );


    if (financialOrders.length === 0) {

        financeEmpty.classList.add(
            "visible"
        );

        return;
    }


    financeEmpty.classList.remove(
        "visible"
    );


    financialOrders.forEach(
        (order, index) => {

            const tr =
                document.createElement("tr");


            const clientName =
                getClientName(order);


            const initials =
                getInitials(clientName);


            const itemsCount =
                getItemsCount(order);


            const status =
                normalizeStatus(
                    order.status
                );


            const statusLabel =
                status === "concluido"
                    ? "Concluído"
                    : "Cancelado";


            const orderTotal =
                getOrderTotal(order);


            tr.innerHTML = `

                <td>
                    <span class="finance-order">
                        ${escapeHTML(
                            formatOrderNumber(
                                order.id,
                                index
                            )
                        )}
                    </span>
                </td>


                <td>

                    <div class="finance-client">

                        <span class="finance-client-avatar">
                            ${escapeHTML(initials)}
                        </span>

                        <span class="finance-client-name">
                            ${escapeHTML(clientName)}
                        </span>

                    </div>

                </td>


                <td>
                    <span class="finance-items">
                        ${itemsCount}
                        ${
                            itemsCount === 1
                                ? "item"
                                : "itens"
                        }
                    </span>
                </td>


                <td>
                    <span class="finance-date">
                        ${escapeHTML(
                            formatDate(
                                order.criadoEm
                            )
                        )}
                    </span>
                </td>


                <td>

                    <span
                        class="finance-status ${status}"
                    >
                        ${statusLabel}
                    </span>

                </td>


                <td>
                    <span class="finance-price">
                        ${formatCurrency(orderTotal)}
                    </span>
                </td>

            `;


            financeTableBody.appendChild(
                tr
            );

        }
    );
}


// =========================================
// STATUS
// =========================================

function normalizeStatus(status) {

    const value =
        String(
            status || "pendente"
        )
            .trim()
            .toLowerCase();


    if (
        value === "concluído" ||
        value === "concluido"
    ) {
        return "concluido";
    }


    if (
        value === "cancelado" ||
        value === "cancelada"
    ) {
        return "cancelado";
    }


    if (
        value === "andamento" ||
        value === "em andamento" ||
        value === "em processo"
    ) {
        return "andamento";
    }


    return value;
}


// =========================================
// ORDER TOTAL
// =========================================

function getOrderTotal(order) {

    if (
        typeof order.total === "number"
    ) {
        return order.total;
    }


    if (
        typeof order.valorTotal === "number"
    ) {
        return order.valorTotal;
    }


    if (
        typeof order.total === "string"
    ) {

        const parsed =
            Number(
                order.total
                    .replace("R$", "")
                    .replace(/\./g, "")
                    .replace(",", ".")
                    .trim()
            );

        if (
            Number.isFinite(parsed)
        ) {
            return parsed;
        }
    }


    if (
        typeof order.valorTotal === "string"
    ) {

        const parsed =
            Number(
                order.valorTotal
                    .replace("R$", "")
                    .replace(/\./g, "")
                    .replace(",", ".")
                    .trim()
            );

        if (
            Number.isFinite(parsed)
        ) {
            return parsed;
        }
    }


    if (
        Array.isArray(order.itens)
    ) {

        return order.itens.reduce(
            (total, item) => {

                const quantity =
                    Number(
                        item.quantidade
                    ) || 0;

                const price =
                    Number(
                        item.preco
                    ) || 0;

                return (
                    total +
                    quantity * price
                );

            },
            0
        );
    }


    return 0;
}


// =========================================
// CLIENT NAME
// =========================================

function getClientName(order) {

    return (
        order.clienteNome ||
        order.cliente ||
        order.nomeCliente ||
        "Cliente não informado"
    );
}


// =========================================
// ITEMS COUNT
// =========================================

function getItemsCount(order) {

    if (
        !Array.isArray(order.itens)
    ) {
        return 0;
    }


    return order.itens.reduce(
        (total, item) => {

            return (
                total +
                (
                    Number(
                        item.quantidade
                    ) || 0
                )
            );

        },
        0
    );
}


// =========================================
// SEARCH
// =========================================

searchFinance.addEventListener(
    "input",
    () => {

        renderFinance();

    }
);


// =========================================
// PERIOD
// =========================================

financePeriod.addEventListener(
    "change",
    () => {

        renderFinance();

    }
);


// =========================================
// LOGOUT
// =========================================

logoutButton.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

            window.location.href =
                "index.html";

        }
        catch (error) {

            console.error(
                "Erro ao sair:",
                error
            );

        }

    }
);


// =========================================
// MOBILE MENU
// =========================================

mobileMenu.addEventListener(
    "click",
    () => {

        sidebar.classList.toggle(
            "open"
        );

    }
);


// =========================================
// CLOSE MOBILE MENU
// =========================================

document.addEventListener(
    "click",
    event => {

        if (
            window.innerWidth > 900
        ) {
            return;
        }


        const clickedInsideSidebar =
            sidebar.contains(
                event.target
            );

        const clickedMenu =
            mobileMenu.contains(
                event.target
            );


        if (
            !clickedInsideSidebar &&
            !clickedMenu
        ) {

            sidebar.classList.remove(
                "open"
            );

        }

    }
);


// =========================================
// AUTH
// =========================================

onAuthStateChanged(
    auth,
    async user => {

        if (!user) {

            window.location.href =
                "index.html";

            return;
        }


        await loadUserData(
            user
        );

    }
);
