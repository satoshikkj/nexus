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
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase.js";


// ===============================
// ELEMENTOS
// ===============================

const productModal = document.getElementById("productModal");
const productForm = document.getElementById("productForm");

const newProductButton =
    document.getElementById("newProductButton");

const emptyNewProductButton =
    document.getElementById("emptyNewProductButton");

const closeModal =
    document.getElementById("closeModal");

const cancelButton =
    document.getElementById("cancelButton");

const productsTableBody =
    document.getElementById("productsTableBody");

const productCount =
    document.getElementById("productCount");

const searchInput =
    document.getElementById("searchInput");

const categoryFilter =
    document.getElementById("categoryFilter");

const formMessage =
    document.getElementById("formMessage");

const modalTitle =
    document.getElementById("modalTitle");

const saveProductButton =
    document.getElementById("saveProductButton");


// FORM
const productId =
    document.getElementById("productId");

const productName =
    document.getElementById("productName");

const productPrice =
    document.getElementById("productPrice");

const productStock =
    document.getElementById("productStock");

const productCategory =
    document.getElementById("productCategory");

const productDescription =
    document.getElementById("productDescription");

const productStatus =
    document.getElementById("productStatus");


// USER
const companyName =
    document.getElementById("companyName");

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


// MOBILE
const mobileMenu =
    document.getElementById("mobileMenu");

const sidebar =
    document.getElementById("sidebar");


// ===============================
// ESTADO
// ===============================

let currentUser = null;
let empresaId = null;
let products = [];


// ===============================
// UTILITÁRIOS
// ===============================

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


function formatPrice(value) {

    return Number(value || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}


function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ===============================
// MODAL
// ===============================

function openModal(product = null) {

    productForm.reset();

    formMessage.textContent = "";
    formMessage.className = "form-message";

    if (product) {

        modalTitle.textContent = "Editar produto";

        saveProductButton.textContent =
            "Salvar alterações";

        productId.value = product.id;

        productName.value =
            product.nome || "";

        productPrice.value =
            product.preco ?? "";

        productStock.value =
            product.estoque ?? "";

        productCategory.value =
            product.categoria || "";

        productDescription.value =
            product.descricao || "";

        productStatus.value =
            product.status || "ativo";

    } else {

        modalTitle.textContent =
            "Novo produto";

        saveProductButton.textContent =
            "Salvar produto";

        productId.value = "";

        productStatus.value = "ativo";
    }

    productModal.classList.add("open");

    setTimeout(() => {
        productName.focus();
    }, 100);
}


function closeProductModal() {

    productModal.classList.remove("open");

    productForm.reset();

    formMessage.textContent = "";
    formMessage.className = "form-message";
}


// ===============================
// CARREGAR PRODUTOS
// ===============================

async function loadProducts() {

    if (!empresaId) return;

    try {

        productsTableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <p>Carregando produtos...</p>
                    </div>
                </td>
            </tr>
        `;

        const productsRef = collection(
            db,
            "empresas",
            empresaId,
            "produtos"
        );

        const snapshot =
            await getDocs(productsRef);

        products = snapshot.docs.map(
            document => ({
                id: document.id,
                ...document.data()
            })
        );

        products.sort((a, b) => {

            const dateA =
                a.criadoEm?.seconds || 0;

            const dateB =
                b.criadoEm?.seconds || 0;

            return dateB - dateA;
        });

        updateCategories();

        renderProducts();

        console.log(
            "Produtos carregados:",
            products.length
        );

    } catch (error) {

        console.error(
            "Erro ao carregar produtos:",
            error
        );

        productsTableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <h3>Erro ao carregar produtos</h3>
                        <p>${escapeHTML(error.message)}</p>
                    </div>
                </td>
            </tr>
        `;
    }
}


// ===============================
// CATEGORIAS
// ===============================

function updateCategories() {

    const categories = [
        ...new Set(
            products
                .map(product => product.categoria)
                .filter(Boolean)
        )
    ].sort();

    categoryFilter.innerHTML =
        `<option value="">Todas as categorias</option>`;

    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category;
        option.textContent = category;

        categoryFilter.appendChild(option);
    });
}


// ===============================
// RENDER
// ===============================

function renderProducts() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();

    const category =
        categoryFilter.value;

    const filtered =
        products.filter(product => {

            const matchesSearch =
                !search ||
                product.nome
                    ?.toLowerCase()
                    .includes(search) ||
                product.categoria
                    ?.toLowerCase()
                    .includes(search);

            const matchesCategory =
                !category ||
                product.categoria === category;

            return (
                matchesSearch &&
                matchesCategory
            );
        });


    productCount.textContent =
        `${filtered.length} ${
            filtered.length === 1
                ? "produto"
                : "produtos"
        }`;


    if (filtered.length === 0) {

        productsTableBody.innerHTML = `
            <tr>
                <td colspan="6">

                    <div class="empty-state">

                        <div class="empty-icon">
                            □
                        </div>

                        <h3>
                            ${
                                products.length
                                    ? "Nenhum produto encontrado"
                                    : "Nenhum produto cadastrado"
                            }
                        </h3>

                        <p>
                            ${
                                products.length
                                    ? "Tente alterar sua pesquisa ou filtro."
                                    : "Comece adicionando o primeiro produto da sua empresa."
                            }
                        </p>

                        ${
                            !products.length
                                ? `
                                    <button
                                        class="secondary-button"
                                        id="emptyNewProductButton"
                                    >
                                        Adicionar produto
                                    </button>
                                `
                                : ""
                        }

                    </div>

                </td>
            </tr>
        `;

        const emptyButton =
            document.getElementById(
                "emptyNewProductButton"
            );

        if (emptyButton) {
            emptyButton.addEventListener(
                "click",
                () => openModal()
            );
        }

        return;
    }


    productsTableBody.innerHTML =
        filtered.map(product => {

            const status =
                product.status === "inativo"
                    ? "inativo"
                    : "ativo";

            return `
                <tr>

                    <td>

                        <span class="product-name">
                            ${escapeHTML(product.nome)}
                        </span>

                        ${
                            product.descricao
                                ? `
                                    <span class="product-description">
                                        ${escapeHTML(product.descricao)}
                                    </span>
                                `
                                : ""
                        }

                    </td>

                    <td>
                        ${escapeHTML(product.categoria || "—")}
                    </td>

                    <td class="price">
                        ${formatPrice(product.preco)}
                    </td>

                    <td class="stock">
                        ${Number(product.estoque || 0)}
                    </td>

                    <td>

                        <span class="status ${status}">
                            ${
                                status === "ativo"
                                    ? "Ativo"
                                    : "Inativo"
                            }
                        </span>

                    </td>

                    <td>

                        <div class="actions">

                            <button
                                class="action-button"
                                data-action="edit"
                                data-id="${product.id}"
                                title="Editar"
                            >
                                ✎
                            </button>

                            <button
                                class="action-button delete"
                                data-action="delete"
                                data-id="${product.id}"
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


// ===============================
// SALVAR PRODUTO
// ===============================

productForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        if (!empresaId) return;


        const name =
            productName.value.trim();

        const price =
            Number(productPrice.value);

        const stock =
            Number(productStock.value);

        const category =
            productCategory.value.trim();

        const description =
            productDescription.value.trim();

        const status =
            productStatus.value;


        if (!name) {

            showFormMessage(
                "Informe o nome do produto.",
                "error"
            );

            return;
        }


        if (price < 0 || Number.isNaN(price)) {

            showFormMessage(
                "Informe um preço válido.",
                "error"
            );

            return;
        }


        if (
            stock < 0 ||
            Number.isNaN(stock)
        ) {

            showFormMessage(
                "Informe um estoque válido.",
                "error"
            );

            return;
        }


        saveProductButton.disabled = true;

        saveProductButton.textContent =
            "Salvando...";


        const data = {

            nome: name,

            preco: price,

            estoque: stock,

            categoria: category,

            descricao: description,

            status: status

        };


        try {

            if (productId.value) {

                const productRef =
                    doc(
                        db,
                        "empresas",
                        empresaId,
                        "produtos",
                        productId.value
                    );

                await updateDoc(
                    productRef,
                    data
                );

                showFormMessage(
                    "Produto atualizado com sucesso!",
                    "success"
                );

            } else {

                data.criadoEm =
                    serverTimestamp();

                data.atualizadoEm =
                    serverTimestamp();

                const productsRef =
                    collection(
                        db,
                        "empresas",
                        empresaId,
                        "produtos"
                    );

                await addDoc(
                    productsRef,
                    data
                );

                showFormMessage(
                    "Produto criado com sucesso!",
                    "success"
                );
            }


            await loadProducts();


            setTimeout(() => {

                closeProductModal();

            }, 500);


        } catch (error) {

            console.error(
                "Erro ao salvar produto:",
                error
            );

            showFormMessage(
                "Não foi possível salvar o produto.",
                "error"
            );

        } finally {

            saveProductButton.disabled = false;

            saveProductButton.textContent =
                productId.value
                    ? "Salvar alterações"
                    : "Salvar produto";
        }

    }
);


// ===============================
// MENSAGEM
// ===============================

function showFormMessage(
    message,
    type
) {

    formMessage.textContent = message;

    formMessage.className =
        `form-message ${type}`;
}


// ===============================
// EDITAR / EXCLUIR
// ===============================

productsTableBody.addEventListener(
    "click",
    async event => {

        const button =
            event.target.closest(
                ".action-button"
            );

        if (!button) return;

        const id =
            button.dataset.id;

        const action =
            button.dataset.action;


        const product =
            products.find(
                item => item.id === id
            );

        if (!product) return;


        if (action === "edit") {

            openModal(product);

            return;
        }


        if (action === "delete") {

            const confirmed =
                confirm(
                    `Excluir o produto "${product.nome}"?`
                );

            if (!confirmed) return;


            try {

                await deleteDoc(
                    doc(
                        db,
                        "empresas",
                        empresaId,
                        "produtos",
                        id
                    )
                );

                await loadProducts();

            } catch (error) {

                console.error(
                    "Erro ao excluir:",
                    error
                );

                alert(
                    "Não foi possível excluir o produto."
                );
            }
        }

    }
);


// ===============================
// EVENTOS
// ===============================

newProductButton.addEventListener(
    "click",
    () => openModal()
);

emptyNewProductButton?.addEventListener(
    "click",
    () => openModal()
);

closeModal.addEventListener(
    "click",
    closeProductModal
);

cancelButton.addEventListener(
    "click",
    closeProductModal
);

productModal.addEventListener(
    "click",
    event => {

        if (
            event.target === productModal
        ) {
            closeProductModal();
        }

    }
);

searchInput.addEventListener(
    "input",
    renderProducts
);

categoryFilter.addEventListener(
    "change",
    renderProducts
);


// ===============================
// MOBILE
// ===============================

mobileMenu.addEventListener(
    "click",
    () => {

        sidebar.classList.toggle("open");

    }
);


// ===============================
// LOGOUT
// ===============================

logoutButton.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

            window.location.href =
                "index.html";

        } catch (error) {

            console.error(
                "Erro ao sair:",
                error
            );

        }

    }
);


// ===============================
// AUTENTICAÇÃO
// ===============================

onAuthStateChanged(
    auth,
    async user => {

        if (!user) {

            window.location.href =
                "index.html";

            return;
        }


        currentUser = user;


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


            empresaId =
                userData.empresaId;


            if (!empresaId) {

                alert(
                    "Empresa do usuário não encontrada."
                );

                await signOut(auth);

                window.location.href =
                    "index.html";

                return;
            }


            const empresaRef =
                doc(
                    db,
                    "empresas",
                    empresaId
                );

            const empresaSnapshot =
                await getDoc(empresaRef);


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


            const name =
                userData.nome ||
                user.email ||
                "Usuário";


            companyName.textContent =
                empresaData.nome ||
                "NEXUS";


            sidebarUserName.textContent =
                name;


            sidebarUserRole.textContent =
                formatRole(
                    userData.role
                );


            const initial =
                getInitial(name);


            userAvatar.textContent =
                initial;

            topbarAvatar.textContent =
                initial;


            await loadProducts();


            console.log(
                "NEXUS Produtos iniciado."
            );

        } catch (error) {

            console.error(
                "Erro ao iniciar módulo:",
                error
            );

            alert(
                "Não foi possível carregar o módulo de produtos."
            );
        }

    }
);
