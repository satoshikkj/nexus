// =========================================
// NEXUS — PEDIDOS
// =========================================

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase.js";


// =========================================
// DOM
// =========================================

const companyName = document.getElementById("companyName");
const sidebarUserName = document.getElementById("sidebarUserName");
const sidebarUserRole = document.getElementById("sidebarUserRole");
const userAvatar = document.getElementById("userAvatar");
const topbarAvatar = document.getElementById("topbarAvatar");
const logoutButton = document.getElementById("logoutButton");
const mobileMenu = document.getElementById("mobileMenu");
const sidebar = document.getElementById("sidebar");

const newOrderButton = document.getElementById("newOrderButton");

const searchOrder = document.getElementById("searchOrder");
const orderStatusFilter = document.getElementById("orderStatusFilter");
const ordersTableBody = document.getElementById("ordersTableBody");

const totalOrders = document.getElementById("totalOrders");
const pendingOrders = document.getElementById("pendingOrders");
const completedOrders = document.getElementById("completedOrders");
const ordersTotalValue = document.getElementById("ordersTotalValue");

const orderModal = document.getElementById("orderModal");
const closeOrderModal = document.getElementById("closeOrderModal");
const cancelOrderButton = document.getElementById("cancelOrderButton");

const orderForm = document.getElementById("orderForm");
const orderId = document.getElementById("orderId");
const orderClient = document.getElementById("orderClient");
const orderProduct = document.getElementById("orderProduct");
const orderQuantity = document.getElementById("orderQuantity");
const addOrderItemButton = document.getElementById("addOrderItemButton");

const orderItemsList = document.getElementById("orderItemsList");
const orderItemsCount = document.getElementById("orderItemsCount");
const orderTotal = document.getElementById("orderTotal");

const orderStatus = document.getElementById("orderStatus");
const orderNotes = document.getElementById("orderNotes");

const orderMessage = document.getElementById("orderMessage");
const saveOrderButton = document.getElementById("saveOrderButton");
const modalTitle = document.getElementById("modalTitle");


// =========================================
// ESTADO
// =========================================

let currentEmpresaId = null;

let clients = [];
let products = [];
let orders = [];

let orderItems = [];


// =========================================
// UTILITÁRIOS
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

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatCurrency(value) {

    return Number(value || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}


function formatDate(timestamp) {

    if (!timestamp) {
        return "-";
    }

    try {

        return timestamp
            .toDate()
            .toLocaleDateString("pt-BR");

    } catch {

        return "-";
    }
}


function getStatusLabel(status) {

    const labels = {
        pendente: "Pendente",
        andamento: "Em andamento",
        concluido: "Concluído",
        cancelado: "Cancelado"
    };

    return labels[status] || "Pendente";
}


function getStatusClass(status) {

    return `status-${status || "pendente"}`;
}


// =========================================
// CARREGAR CLIENTES
// =========================================

async function loadClients() {

    const clientsRef = collection(
        db,
        "empresas",
        currentEmpresaId,
        "clientes"
    );

    const snapshot =
        await getDocs(clientsRef);

    clients = snapshot.docs.map(item => ({
        id: item.id,
        ...item.data()
    }));

    clients.sort((a, b) =>
        (a.nome || "").localeCompare(
            b.nome || "",
            "pt-BR"
        )
    );

    populateClientSelect();

    console.log(
        "Clientes carregados:",
        clients.length
    );
}


// =========================================
// SELECT DE CLIENTES
// =========================================

function populateClientSelect() {

    if (!orderClient) return;

    orderClient.innerHTML = `
        <option value="">
            Selecione um cliente
        </option>
    `;

    clients.forEach(client => {

        const option =
            document.createElement("option");

        option.value = client.id;

        option.textContent =
            client.nome || "Cliente sem nome";

        orderClient.appendChild(option);
    });
}


// =========================================
// CARREGAR PRODUTOS
// =========================================

async function loadProducts() {

    const productsRef = collection(
        db,
        "empresas",
        currentEmpresaId,
        "produtos"
    );

    const snapshot =
        await getDocs(productsRef);

    products = snapshot.docs.map(item => ({
        id: item.id,
        ...item.data()
    }));

    products.sort((a, b) =>
        (a.nome || "").localeCompare(
            b.nome || "",
            "pt-BR"
        )
    );

    populateProductSelect();

    console.log(
        "Produtos carregados:",
        products.length
    );
}


// =========================================
// SELECT DE PRODUTOS
// =========================================

function populateProductSelect() {

    if (!orderProduct) return;

    orderProduct.innerHTML = `
        <option value="">
            Selecione um produto
        </option>
    `;

    products.forEach(product => {

        const option =
            document.createElement("option");

        option.value = product.id;

        const stock =
            Number(product.estoque) || 0;

        option.textContent =
            `${product.nome} — ${formatCurrency(product.preco)} (${stock} em estoque)`;

        orderProduct.appendChild(option);
    });
}


// =========================================
// CALCULAR TOTAL
// =========================================

function calculateOrderTotal() {

    return orderItems.reduce(
        (total, item) => {

            return total +
                (Number(item.preco) *
                 Number(item.quantidade));

        },
        0
    );
}


// =========================================
// RENDERIZAR ITENS
// =========================================

function renderOrderItems() {

    if (!orderItemsList) return;

    if (orderItems.length === 0) {

        orderItemsList.innerHTML = `
            <div class="order-items-empty">
                Nenhum produto adicionado.
            </div>
        `;

    } else {

        orderItemsList.innerHTML =
            orderItems.map((item, index) => {

                const subtotal =
                    Number(item.preco) *
                    Number(item.quantidade);

                return `
                    <div class="order-item">

                        <div class="order-item-info">

                            <span class="order-item-name">
                                ${escapeHTML(item.nome)}
                            </span>

                            <span class="order-item-details">
                                ${item.quantidade} ×
                                ${formatCurrency(item.preco)}
                            </span>

                        </div>

                        <div class="order-item-right">

                            <span class="order-item-price">
                                ${formatCurrency(subtotal)}
                            </span>

                            <button
                                type="button"
                                class="remove-order-item"
                                data-index="${index}"
                                title="Remover"
                            >
                                ×
                            </button>

                        </div>

                    </div>
                `;

            }).join("");
    }


    const quantity =
        orderItems.reduce(
            (total, item) =>
                total + Number(item.quantidade),
            0
        );


    if (orderItemsCount) {

        orderItemsCount.textContent =
            `${quantity} ${quantity === 1 ? "item" : "itens"}`;

    }


    if (orderTotal) {

        orderTotal.textContent =
            formatCurrency(
                calculateOrderTotal()
            );

    }
}


// =========================================
// ADICIONAR ITEM
// =========================================

function addOrderItem() {

    const productId =
        orderProduct.value;

    const quantity =
        Number(orderQuantity.value);


    if (!productId) {

        orderMessage.textContent =
            "Selecione um produto.";

        orderMessage.className =
            "form-message error";

        return;
    }


    if (
        !Number.isInteger(quantity) ||
        quantity < 1
    ) {

        orderMessage.textContent =
            "Informe uma quantidade válida.";

        orderMessage.className =
            "form-message error";

        return;
    }


    const product =
        products.find(
            item => item.id === productId
        );


    if (!product) {

        orderMessage.textContent =
            "Produto não encontrado.";

        orderMessage.className =
            "form-message error";

        return;
    }


    const stock =
        Number(product.estoque) || 0;


    const existingItem =
        orderItems.find(
            item => item.produtoId === productId
        );


    const currentQuantity =
        existingItem
            ? Number(existingItem.quantidade)
            : 0;


    if (
        currentQuantity + quantity > stock
    ) {

        orderMessage.textContent =
            `Estoque insuficiente. Disponível: ${stock}.`;

        orderMessage.className =
            "form-message error";

        return;
    }


    if (existingItem) {

        existingItem.quantidade =
            currentQuantity + quantity;

    } else {

        orderItems.push({

            produtoId: product.id,

            nome: product.nome,

            preco: Number(product.preco) || 0,

            quantidade: quantity

        });

    }


    orderProduct.value = "";

    orderQuantity.value = "1";

    orderMessage.textContent = "";

    orderMessage.className =
        "form-message";

    renderOrderItems();
}


// =========================================
// REMOVER ITEM
// =========================================

if (orderItemsList) {

    orderItemsList.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".remove-order-item"
                );

            if (!button) return;

            const index =
                Number(button.dataset.index);

            orderItems.splice(index, 1);

            renderOrderItems();
        }
    );
}


// =========================================
// MODAL
// =========================================

function openOrderModal(order = null) {

    if (!orderModal) return;

    orderForm.reset();

    orderMessage.textContent = "";
    orderMessage.className =
        "form-message";

    orderItems = [];


    if (order) {

        modalTitle.textContent =
            "Editar pedido";

        orderId.value =
            order.id;

        orderClient.value =
            order.clienteId || "";

        orderStatus.value =
            order.status || "pendente";

        orderNotes.value =
            order.observacoes || "";

        orderItems =
            Array.isArray(order.itens)
                ? order.itens.map(item => ({
                    ...item,
                    preco: Number(item.preco) || 0,
                    quantidade:
                        Number(item.quantidade) || 1
                }))
                : [];

    } else {

        modalTitle.textContent =
            "Novo pedido";

        orderId.value = "";

        orderStatus.value =
            "pendente";
    }


    renderOrderItems();

    orderModal.classList.add("active");
}


function closeModal() {

    if (!orderModal) return;

    orderModal.classList.remove("active");

    orderForm.reset();

    orderId.value = "";

    orderItems = [];

    renderOrderItems();

    orderMessage.textContent = "";
}

// =========================================
// ATUALIZAR ESTOQUE DO PEDIDO
// =========================================

async function updateStockForOrderChange(orderIdValue, newStatus, newItems) {

    await runTransaction(db, async (transaction) => {

        const orderRef = doc(
            db,
            "empresas",
            currentEmpresaId,
            "pedidos",
            orderIdValue
        );

        const oldOrderSnapshot =
            await transaction.get(orderRef);

        if (!oldOrderSnapshot.exists()) {
            throw new Error("Pedido não encontrado.");
        }

        const oldOrder =
            oldOrderSnapshot.data();

        const oldStatus =
            oldOrder.status || "pendente";

        const oldItems =
            Array.isArray(oldOrder.itens)
                ? oldOrder.itens
                : [];


        // =====================================
        // QUANTIDADES ANTIGAS
        // =====================================

        const oldQuantities = {};

        oldItems.forEach(item => {

            const productId =
                item.produtoId;

            const quantity =
                Number(item.quantidade) || 0;

            oldQuantities[productId] =
                (oldQuantities[productId] || 0) +
                quantity;
        });


        // =====================================
        // QUANTIDADES NOVAS
        // =====================================

        const newQuantities = {};

        newItems.forEach(item => {

            const productId =
                item.produtoId;

            const quantity =
                Number(item.quantidade) || 0;

            newQuantities[productId] =
                (newQuantities[productId] || 0) +
                quantity;
        });


        const productIds = new Set([
            ...Object.keys(oldQuantities),
            ...Object.keys(newQuantities)
        ]);


        // =====================================
        // PEDIDO NOVO
        // =====================================

        if (!orderIdValue) {
            return;
        }


        // =====================================
        // CALCULAR ALTERAÇÕES
        // =====================================

        const changes = [];


        productIds.forEach(productId => {

            const oldQuantity =
                oldQuantities[productId] || 0;

            const newQuantity =
                newQuantities[productId] || 0;


            let difference = 0;


            // Pedido antigo não consumia estoque
            // e novo pedido passou a consumir
            if (
                oldStatus !== "concluido" &&
                newStatus === "concluido"
            ) {

                difference =
                    newQuantity;

            }


            // Pedido antigo consumia estoque
            // e deixou de ser concluído
            else if (
                oldStatus === "concluido" &&
                newStatus !== "concluido"
            ) {

                difference =
                    -oldQuantity;

            }


            // Continua concluído
            // Ajustar apenas a diferença
            else if (
                oldStatus === "concluido" &&
                newStatus === "concluido"
            ) {

                difference =
                    newQuantity - oldQuantity;

            }


            if (difference !== 0) {

                changes.push({
                    productId,
                    difference
                });

            }

        });


        if (changes.length === 0) {
            return;
        }


        // =====================================
        // LER PRODUTOS
        // =====================================

        const productSnapshots = new Map();


        for (const change of changes) {

            const productRef = doc(
                db,
                "empresas",
                currentEmpresaId,
                "produtos",
                change.productId
            );

            const snapshot =
                await transaction.get(productRef);

            if (!snapshot.exists()) {

                throw new Error(
                    "Um dos produtos do pedido não foi encontrado."
                );

            }

            productSnapshots.set(
                change.productId,
                {
                    ref: productRef,
                    data: snapshot.data()
                }
            );

        }


        // =====================================
        // VALIDAR E ATUALIZAR ESTOQUE
        // =====================================

        for (const change of changes) {

            const product =
                productSnapshots.get(
                    change.productId
                );

            const currentStock =
                Number(product.data.estoque) || 0;

            const newStock =
                currentStock - change.difference;


            if (newStock < 0) {

                throw new Error(
                    `Estoque insuficiente para "${product.data.nome || "produto"}". Disponível: ${currentStock}.`
                );

            }


            transaction.update(
                product.ref,
                {
                    estoque: newStock,
                    atualizadoEm: serverTimestamp()
                }
            );

        }

    });
}
                    
// =========================================
// SALVAR PEDIDO
// =========================================

async function saveOrder(event) {

    event.preventDefault();


    if (!currentEmpresaId) {

        alert(
            "Empresa não identificada."
        );

        return;
    }


    const clienteId =
        orderClient.value;


    if (!clienteId) {

        orderMessage.textContent =
            "Selecione um cliente.";

        orderMessage.className =
            "form-message error";

        return;
    }


    if (orderItems.length === 0) {

        orderMessage.textContent =
            "Adicione pelo menos um produto.";

        orderMessage.className =
            "form-message error";

        return;
    }


    const client =
        clients.find(
            item => item.id === clienteId
        );


    if (!client) {

        orderMessage.textContent =
            "Cliente não encontrado.";

        orderMessage.className =
            "form-message error";

        return;
    }


    try {

        saveOrderButton.disabled =
            true;

        saveOrderButton.textContent =
            "Salvando...";


        const data = {

            clienteId: clienteId,

            clienteNome:
                client.nome || "Cliente",

            itens: orderItems.map(item => ({
                produtoId: item.produtoId,
                nome: item.nome,
                preco: Number(item.preco) || 0,
                quantidade: Number(item.quantidade) || 0
            })),

            total:
                calculateOrderTotal(),

            status:
                orderStatus.value,

            observacoes:
                orderNotes.value.trim(),

            atualizadoEm:
                serverTimestamp()

        };


        // =====================================
        // EDITAR PEDIDO
        // =====================================

        if (orderId.value) {

            const orderRef =
                doc(
                    db,
                    "empresas",
                    currentEmpresaId,
                    "pedidos",
                    orderId.value
                );


            await runTransaction(
                db,
                async transaction => {

                    const oldOrderSnapshot =
                        await transaction.get(
                            orderRef
                        );


                    if (
                        !oldOrderSnapshot.exists()
                    ) {

                        throw new Error(
                            "Pedido não encontrado."
                        );

                    }


                    const oldOrder =
                        oldOrderSnapshot.data();


                    const oldStatus =
                        oldOrder.status ||
                        "pendente";


                    const oldItems =
                        Array.isArray(
                            oldOrder.itens
                        )
                            ? oldOrder.itens
                            : [];


                    // =================================
                    // QUANTIDADES ANTIGAS
                    // =================================

                    const oldQuantities = {};


                    oldItems.forEach(item => {

                        const productId =
                            item.produtoId;


                        const quantity =
                            Number(
                                item.quantidade
                            ) || 0;


                        oldQuantities[productId] =
                            (
                                oldQuantities[productId] ||
                                0
                            ) + quantity;

                    });


                    // =================================
                    // QUANTIDADES NOVAS
                    // =================================

                    const newQuantities = {};


                    data.itens.forEach(item => {

                        const productId =
                            item.produtoId;


                        const quantity =
                            Number(
                                item.quantidade
                            ) || 0;


                        newQuantities[productId] =
                            (
                                newQuantities[productId] ||
                                0
                            ) + quantity;

                    });


                    // =================================
                    // PRODUTOS ENVOLVIDOS
                    // =================================

                    const productIds =
                        new Set([
                            ...Object.keys(
                                oldQuantities
                            ),
                            ...Object.keys(
                                newQuantities
                            )
                        ]);


                    const changes = [];


                    productIds.forEach(
                        productId => {

                            const oldQuantity =
                                oldQuantities[
                                    productId
                                ] || 0;


                            const newQuantity =
                                newQuantities[
                                    productId
                                ] || 0;


                            let difference = 0;


                            // NÃO CONCLUÍDO → CONCLUÍDO
                            if (
                                oldStatus !==
                                    "concluido" &&
                                data.status ===
                                    "concluido"
                            ) {

                                difference =
                                    newQuantity;

                            }


                            // CONCLUÍDO → NÃO CONCLUÍDO
                            else if (
                                oldStatus ===
                                    "concluido" &&
                                data.status !==
                                    "concluido"
                            ) {

                                difference =
                                    -oldQuantity;

                            }


                            // CONCLUÍDO → CONCLUÍDO
                            else if (
                                oldStatus ===
                                    "concluido" &&
                                data.status ===
                                    "concluido"
                            ) {

                                difference =
                                    newQuantity -
                                    oldQuantity;

                            }


                            if (
                                difference !== 0
                            ) {

                                changes.push({
                                    productId,
                                    difference
                                });

                            }

                        }
                    );


                    // =================================
                    // LER PRODUTOS
                    // =================================

                    const productSnapshots =
                        new Map();


                    for (
                        const change
                        of changes
                    ) {

                        const productRef =
                            doc(
                                db,
                                "empresas",
                                currentEmpresaId,
                                "produtos",
                                change.productId
                            );


                        const snapshot =
                            await transaction.get(
                                productRef
                            );


                        if (
                            !snapshot.exists()
                        ) {

                            throw new Error(
                                "Um dos produtos do pedido não foi encontrado."
                            );

                        }


                        productSnapshots.set(
                            change.productId,
                            {
                                ref: productRef,
                                data:
                                    snapshot.data()
                            }
                        );

                    }


                    // =================================
                    // ATUALIZAR ESTOQUE
                    // =================================

                    for (
                        const change
                        of changes
                    ) {

                        const product =
                            productSnapshots.get(
                                change.productId
                            );


                        const currentStock =
                            Number(
                                product.data.estoque
                            ) || 0;


                        const newStock =
                            currentStock -
                            change.difference;


                        if (
                            newStock < 0
                        ) {

                            throw new Error(
                                `Estoque insuficiente para "${product.data.nome || "produto"}". Disponível: ${currentStock}.`
                            );

                        }


                        transaction.update(
                            product.ref,
                            {
                                estoque:
                                    newStock,

                                atualizadoEm:
                                    serverTimestamp()
                            }
                        );

                    }


                    // =================================
                    // ATUALIZAR PEDIDO
                    // =================================

                    transaction.update(
                        orderRef,
                        data
                    );

                }
            );


            console.log(
                "Pedido atualizado:",
                orderId.value
            );

        }


        // =====================================
        // NOVO PEDIDO
        // =====================================

        else {

            const newOrderRef =
                doc(
                    collection(
                        db,
                        "empresas",
                        currentEmpresaId,
                        "pedidos"
                    )
                );


            await runTransaction(
                db,
                async transaction => {

                    const productSnapshots =
                        new Map();


                    // =================================
                    // LER PRODUTOS
                    // =================================

                    for (
                        const item
                        of data.itens
                    ) {

                        const productRef =
                            doc(
                                db,
                                "empresas",
                                currentEmpresaId,
                                "produtos",
                                item.produtoId
                            );


                        const snapshot =
                            await transaction.get(
                                productRef
                            );


                        if (
                            !snapshot.exists()
                        ) {

                            throw new Error(
                                `Produto "${item.nome}" não foi encontrado.`
                            );

                        }


                        productSnapshots.set(
                            item.produtoId,
                            {
                                ref: productRef,
                                data:
                                    snapshot.data()
                            }
                        );

                    }


                    // =================================
                    // BAIXAR ESTOQUE
                    // =================================

                    if (
                        data.status ===
                        "concluido"
                    ) {

                        for (
                            const item
                            of data.itens
                        ) {

                            const product =
                                productSnapshots.get(
                                    item.produtoId
                                );


                            const stock =
                                Number(
                                    product.data.estoque
                                ) || 0;


                            const quantity =
                                Number(
                                    item.quantidade
                                ) || 0;


                            if (
                                stock < quantity
                            ) {

                                throw new Error(
                                    `Estoque insuficiente para "${item.nome}". Disponível: ${stock}.`
                                );

                            }


                            transaction.update(
                                product.ref,
                                {
                                    estoque:
                                        stock -
                                        quantity,

                                    atualizadoEm:
                                        serverTimestamp()
                                }
                            );

                        }

                    }


                    // =================================
                    // CRIAR PEDIDO
                    // =================================

                    transaction.set(
                        newOrderRef,
                        {
                            ...data,

                            criadoEm:
                                serverTimestamp()
                        }
                    );

                }
            );


            console.log(
                "Pedido criado."
            );

        }


        // =====================================
        // SUCESSO
        // =====================================

        closeModal();

        await loadProducts();

        await loadOrders();


    } catch (error) {

        console.error(
            "Erro ao salvar pedido:",
            error
        );


        orderMessage.textContent =
            error.message ||
            "Não foi possível salvar o pedido.";

        orderMessage.className =
            "form-message error";

    } finally {

        saveOrderButton.disabled =
            false;

        saveOrderButton.textContent =
            "Salvar pedido";

    }
                }

// =========================================
// CARREGAR PEDIDOS
// =========================================

async function loadOrders() {

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
            snapshot.docs.map(item => ({
                id: item.id,
                ...item.data()
            }));


        orders.sort((a, b) => {

            const dateA =
                a.criadoEm?.toDate?.() || 0;

            const dateB =
                b.criadoEm?.toDate?.() || 0;

            return dateB - dateA;
        });


        updateSummary();

        renderOrders();


        console.log(
            "Pedidos carregados:",
            orders.length
        );

    } catch (error) {

        console.error(
            "Erro ao carregar pedidos:",
            error
        );

        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="table-empty">
                        <h3>
                            Erro ao carregar pedidos
                        </h3>

                        <p>
                            Verifique as regras do Firestore.
                        </p>
                    </div>
                </td>
            </tr>
        `;
    }
}


// =========================================
// RESUMO
// =========================================

function updateSummary() {

    const total =
        orders.length;


    const pending =
        orders.filter(
            order =>
                order.status === "pendente"
        ).length;


    const completed =
        orders.filter(
            order =>
                order.status === "concluido"
        ).length;


    const value =
        orders.reduce(
            (sum, order) =>
                sum + (Number(order.total) || 0),
            0
        );


    if (totalOrders) {
        totalOrders.textContent = total;
    }


    if (pendingOrders) {
        pendingOrders.textContent = pending;
    }


    if (completedOrders) {
        completedOrders.textContent = completed;
    }


    if (ordersTotalValue) {

        ordersTotalValue.textContent =
            formatCurrency(value);

    }
}


// =========================================
// RENDER PEDIDOS
// =========================================

function renderOrders() {

    const search =
        searchOrder
            ? searchOrder.value
                .trim()
                .toLowerCase()
            : "";


    const status =
        orderStatusFilter
            ? orderStatusFilter.value
            : "all";


    const filtered =
        orders.filter(order => {

            const searchMatch =
                !search ||
                String(order.id)
                    .toLowerCase()
                    .includes(search) ||
                String(order.clienteNome || "")
                    .toLowerCase()
                    .includes(search);


            const statusMatch =
                status === "all" ||
                order.status === status;


            return (
                searchMatch &&
                statusMatch
            );

        });


    if (filtered.length === 0) {

        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="7">

                    <div class="table-empty">

                        <div class="empty-icon">
                            ▣
                        </div>

                        <h3>
                            Nenhum pedido encontrado
                        </h3>

                        <p>
                            Crie seu primeiro pedido
                            para começar.
                        </p>

                    </div>

                </td>
            </tr>
        `;

        return;
    }


    ordersTableBody.innerHTML =
        filtered.map((order, index) => {

            const clientInitial =
                getInitial(
                    order.clienteNome
                );


            const itemCount =
                Array.isArray(order.itens)
                    ? order.itens.reduce(
                        (sum, item) =>
                            sum +
                            Number(item.quantidade || 0),
                        0
                    )
                    : 0;


            const shortId =
                order.id
                    ? order.id
                        .substring(0, 6)
                        .toUpperCase()
                    : "------";


            return `
                <tr>

                    <td>

                        <span class="order-number">
                            #${escapeHTML(shortId)}
                        </span>

                        <span class="order-subtext">
                            Pedido ${index + 1}
                        </span>

                    </td>


                    <td>

                        <div class="order-client">

                            <div class="order-client-avatar">
                                ${escapeHTML(clientInitial)}
                            </div>

                            <span class="order-client-name">
                                ${escapeHTML(
                                    order.clienteNome ||
                                    "Cliente"
                                )}
                            </span>

                        </div>

                    </td>


                    <td>
                        ${itemCount}
                        ${itemCount === 1 ? "item" : "itens"}
                    </td>


                    <td>

                        <span class="order-value">
                            ${formatCurrency(order.total)}
                        </span>

                    </td>


                    <td>

                        <span
                            class="order-status ${getStatusClass(order.status)}"
                        >
                            ${getStatusLabel(order.status)}
                        </span>

                    </td>


                    <td>
                        ${formatDate(order.criadoEm)}
                    </td>


                    <td>

                        <div class="order-actions">

                            <button
                                type="button"
                                class="order-action"
                                data-action="edit"
                                data-id="${escapeHTML(order.id)}"
                                title="Editar"
                            >
                                ✎
                            </button>


                            <button
                                type="button"
                                class="order-action"
                                data-action="delete"
                                data-id="${escapeHTML(order.id)}"
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
// EDITAR
// =========================================

function editOrder(id) {

    const order =
        orders.find(
            item => item.id === id
        );


    if (!order) return;

    openOrderModal(order);
}


// =========================================
// EXCLUIR
// =========================================

async function deleteOrder(id) {

    const order =
        orders.find(
            item => item.id === id
        );


    if (!order) return;


    const confirmed =
        confirm(
            `Deseja excluir o pedido de "${order.clienteNome}"?`
        );


    if (!confirmed) return;


    try {

        const orderRef =
            doc(
                db,
                "empresas",
                currentEmpresaId,
                "pedidos",
                id
            );


        await deleteDoc(orderRef);

        await loadOrders();


    } catch (error) {

        console.error(
            "Erro ao excluir pedido:",
            error
        );

        alert(
            "Não foi possível excluir o pedido."
        );
    }
}


// =========================================
// AÇÕES DA TABELA
// =========================================

if (ordersTableBody) {

    ordersTableBody.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".order-action"
                );


            if (!button) return;


            const id =
                button.dataset.id;


            if (
                button.dataset.action ===
                "edit"
            ) {

                editOrder(id);

            }


            if (
                button.dataset.action ===
                "delete"
            ) {

                deleteOrder(id);

            }

        }
    );
}


// =========================================
// NOVO PEDIDO
// =========================================

if (newOrderButton) {

    newOrderButton.addEventListener(
        "click",
        () => {

            openOrderModal();

        }
    );
}


// =========================================
// ADICIONAR ITEM
// =========================================

if (addOrderItemButton) {

    addOrderItemButton.addEventListener(
        "click",
        addOrderItem
    );
}


// =========================================
// FORMULÁRIO
// =========================================

if (orderForm) {

    orderForm.addEventListener(
        "submit",
        saveOrder
    );
}


// =========================================
// FECHAR MODAL
// =========================================

if (closeOrderModal) {

    closeOrderModal.addEventListener(
        "click",
        closeModal
    );
}


if (cancelOrderButton) {

    cancelOrderButton.addEventListener(
        "click",
        closeModal
    );
}


if (orderModal) {

    orderModal.addEventListener(
        "click",
        event => {

            if (
                event.target === orderModal
            ) {

                closeModal();

            }

        }
    );
}


document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {

            closeModal();

        }

    }
);


// =========================================
// FILTROS
// =========================================

if (searchOrder) {

    searchOrder.addEventListener(
        "input",
        renderOrders
    );
}


if (orderStatusFilter) {

    orderStatusFilter.addEventListener(
        "change",
        renderOrders
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


document
    .querySelectorAll(".nav-item")
    .forEach(item => {

        item.addEventListener(
            "click",
            () => {

                if (
                    window.innerWidth <= 760
                ) {

                    sidebar.classList.remove(
                        "open"
                    );

                }

            }
        );

    });


// =========================================
// CARREGAR USUÁRIO
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

            alert(
                "Perfil do usuário não encontrado."
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


        currentEmpresaId =
            userData.empresaId;


        if (!currentEmpresaId) {

            alert(
                "Sua conta não está vinculada a uma empresa."
            );

            await signOut(auth);

            window.location.href =
                "index.html";

            return;
        }


        // =====================================
        // EMPRESA
        // =====================================

        const empresaRef =
            doc(
                db,
                "empresas",
                currentEmpresaId
            );


        const empresaSnapshot =
            await getDoc(
                empresaRef
            );


        if (!empresaSnapshot.exists()) {

            alert(
                "Empresa não encontrada."
            );

            await signOut(auth);

            window.location.href =
                "index.html";

            return;
        }


        const empresaData =
            empresaSnapshot.data();


        // =====================================
        // INTERFACE
        // =====================================

        if (companyName) {

            companyName.textContent =
                empresaData.nome ||
                "Minha Empresa";

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


        // =====================================
        // DADOS
        // =====================================

        await Promise.all([
            loadClients(),
            loadProducts(),
            loadOrders()
        ]);


        console.log(
            "NEXUS — Pedidos inicializado."
        );

    } catch (error) {

        console.error(
            "Erro ao inicializar pedidos:",
            error
        );

        alert(
            "Ocorreu um erro ao carregar os pedidos."
        );
    }
}


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


        await loadUserData(user);

    }
);
