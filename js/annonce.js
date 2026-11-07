// ======================================================
// TOYCYCLE - ANNONCES
// PHP + MYSQL
// ======================================================

const API_ANNONCES = "php/annonces.php";
const API_FAVORIS = "php/favoris.php";


// ======================================================
// VARIABLES
// ======================================================

let annonces = [];

let annoncesFiltrees = [];

const annoncesParPage = 6;

let pageActuelle = 1;

let favorisIds = [];


// ======================================================
// RÉCUPÉRER LES ANNONCES DE MYSQL
// ======================================================

async function obtenirAnnonces() {

    try {

        const response = await fetch(
            API_ANNONCES,
            {
                method: "GET"
            }
        );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Impossible de récupérer les annonces."
            );
        }


        return Array.isArray(data.annonces)
            ? data.annonces
            : [];


    } catch (erreur) {

        console.error(
            "Erreur récupération annonces :",
            erreur
        );


        return [];
    }
}


// ======================================================
// FAVORIS (MySQL)
// ======================================================

async function chargerFavoris() {

    try {

        const response =
            await fetch(API_FAVORIS, {
                method: "GET"
            });

        const data =
            await response.json();

        favorisIds =
            (data.success && Array.isArray(data.favoris))
                ? data.favoris.map(id => Number(id))
                : [];

    } catch (erreur) {

        console.error(
            "Erreur chargement favoris :",
            erreur
        );

        favorisIds = [];
    }
}


function estFavori(id) {

    return favorisIds.includes(
        Number(id)
    );
}


async function toggleFavori(id) {

    id = Number(id);

    const dejaFavori =
        estFavori(id);

    try {

        if (dejaFavori) {

            const response = await fetch(
                `${API_FAVORIS}?id_annonce=${id}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (!data.success) {

                console.error(
                    "Erreur suppression favori :",
                    data.message
                );

                return;
            }

            favorisIds =
                favorisIds.filter(
                    favId => favId !== id
                );

        } else {

            const response = await fetch(
                API_FAVORIS,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id_annonce: id
                    })
                }
            );

            const data = await response.json();

            if (!data.success) {

                console.error(
                    "Erreur ajout favori :",
                    data.message
                );

                return;
            }

            favorisIds.push(id);
        }

    } catch (erreur) {

        console.error(
            "Erreur mise à jour favori :",
            erreur
        );
    }
}


function ajouterEvenementsFavoris() {

    const boutons =
        document.querySelectorAll(
            ".removeFavorite"
        );


    boutons.forEach(
        button => {

            const id =
                Number(
                    button.dataset.id
                );

            const icon =
                button.querySelector("i");


            button.addEventListener(
                "click",
                async function () {

                    await toggleFavori(id);


                    if (estFavori(id)) {

                        icon.classList.remove(
                            "fa-regular"
                        );

                        icon.classList.add(
                            "fa-solid"
                        );

                    } else {

                        icon.classList.remove(
                            "fa-solid"
                        );

                        icon.classList.add(
                            "fa-regular"
                        );
                    }
                }
            );
        }
    );
}


// ======================================================
// IMAGE PRINCIPALE
// ======================================================

function obtenirImagePrincipale(
    annonce
) {

    if (
        !Array.isArray(
            annonce.images
        ) ||
        annonce.images.length === 0
    ) {

        return "images/default.jpg";
    }


    const principale =
        annonce.images.find(
            image =>
                image.principale === true
        );


    if (principale) {

        return principale.chemin;
    }


    return annonce.images[0].chemin;
}


// ======================================================
// AFFICHER LES ANNONCES
// ======================================================

function afficherAnnonces(liste) {

    const container =
        document.getElementById(
            "annoncesContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (liste.length === 0) {

        container.innerHTML = `
            <div class="col-12">

                <p class="text-center">
                    Aucune annonce trouvée.
                </p>

            </div>
        `;

        return;
    }


    liste.forEach(
        annonce => {

            const col =
                document.createElement("div");


            col.classList.add(
                "col-lg-4",
                "col-md-6",
                "col-12"
            );


            const favori =
                estFavori(
                    annonce.id_annonce
                );


            const classeCoeur =
                favori
                    ? "fa-solid"
                    : "fa-regular";


            const imageAnnonce =
                obtenirImagePrincipale(
                    annonce
                );


            col.innerHTML = `

                <div class="card">

                    <button
                        type="button"
                        class="removeFavorite"
                        data-id="${annonce.id_annonce}">

                        <i class="${classeCoeur} fa-heart"></i>

                    </button>


                    <img
                        src="${imageAnnonce}"
                        class="cardImage"
                        alt="${annonce.titre}">


                    <div class="bodycard">

                        <h5>
                            ${annonce.titre}
                        </h5>


                        <p class="price">

                            ${
                                annonce.prix !== null &&
                                annonce.prix !== undefined

                                ? annonce.prix + " DH"

                                : "Échange"
                            }

                        </p>


                        <p class="city">
                            ${annonce.ville}
                        </p>


                        <a
                            href="detail_annonces.html?id=${annonce.id_annonce}"
                            class="voirBtn">

                            Voir

                        </a>

                    </div>

                </div>
            `;


            container.appendChild(
                col
            );
        }
    );


    ajouterEvenementsFavoris();
}


// ======================================================
// PRIX
// ======================================================

function obtenirPrix(prix) {

    if (
        prix === null ||
        prix === undefined ||
        prix === ""
    ) {

        return 0;
    }


    if (
        typeof prix === "number"
    ) {

        return prix;
    }


    return Number(
        String(prix)
            .replace("DH", "")
            .trim()
    );
}


// ======================================================
// COMPTEUR
// ======================================================

function mettreAJourResultats(
    nombre
) {

    const titreResultat =
        document.getElementById(
            "titreResultat"
        );


    const nombreAnnonces =
        document.getElementById(
            "nombreAnnonces"
        );


    if (!nombreAnnonces) {
        return;
    }


    if (nombre === 0) {

        nombreAnnonces.textContent =
            "0 annonce";

    } else if (nombre === 1) {

        nombreAnnonces.textContent =
            "1 annonce";

    } else {

        nombreAnnonces.textContent =
            `${nombre} annonces`;
    }


    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const recherche =
        searchInput
            ? searchInput.value.trim()
            : "";


    if (recherche !== "") {

        titreResultat.textContent =
            "Résultats de recherche";

    } else if (
        nombre === annonces.length
    ) {

        titreResultat.textContent =
            "Toutes les annonces";

    } else {

        titreResultat.textContent =
            "Annonces filtrées";
    }
}


// ======================================================
// FILTRER
// ======================================================

function filtrerAnnonces() {

    const categorie =
        document.getElementById(
            "categorie"
        ).value;


    const mode =
        document.getElementById(
            "mode"
        ).value;


    const etat =
        document.getElementById(
            "etat"
        ).value;


    const age =
        document.getElementById(
            "age"
        ).value;


    const ville =
        document.getElementById(
            "ville"
        ).value;


    const prixMin =
        document.getElementById(
            "prix-min"
        ).value;


    const prixMax =
        document.getElementById(
            "prix-max"
        ).value;


    const recherche =
        document.getElementById(
            "searchInput"
        ).value
        .trim()
        .toLowerCase();


    annoncesFiltrees =
        annonces.filter(
            annonce => {

                const categorieOK =
                    categorie === "" ||
                    annonce.categorie === categorie;


                const modeOK =
                    mode === "" ||
                    annonce.mode === mode;


                const etatOK =
                    etat === "" ||
                    annonce.etat === etat;


                const ageOK =
                    age === "" ||
                    annonce.age === age;


                const villeOK =
                    ville === "" ||
                    annonce.ville === ville;


                const prixAnnonce =
                    obtenirPrix(
                        annonce.prix
                    );


                /*
                 * Pour une annonce Échange,
                 * le prix est NULL.
                 *
                 * On ne l'affiche pas
                 * dans une recherche par prix.
                 */

                const prixMinOK =
                    prixMin === "" ||
                    (
                        annonce.prix !== null &&
                        prixAnnonce >= Number(prixMin)
                    );


                const prixMaxOK =
                    prixMax === "" ||
                    (
                        annonce.prix !== null &&
                        prixAnnonce <= Number(prixMax)
                    );


                const rechercheOK =
                    recherche === "" ||
                    String(
                        annonce.titre
                    )
                    .toLowerCase()
                    .includes(recherche);


                return (
                    categorieOK &&
                    modeOK &&
                    etatOK &&
                    ageOK &&
                    villeOK &&
                    prixMinOK &&
                    prixMaxOK &&
                    rechercheOK
                );
            }
        );


    pageActuelle = 1;


    afficherPage();


    mettreAJourResultats(
        annoncesFiltrees.length
    );
}


// ======================================================
// RECHERCHE
// ======================================================

function rechercherAnnonce() {

    filtrerAnnonces();
}


// ======================================================
// RÉINITIALISER
// ======================================================

function reinitialiserFiltres() {

    document.getElementById(
        "categorie"
    ).selectedIndex = 0;


    document.getElementById(
        "mode"
    ).selectedIndex = 0;


    document.getElementById(
        "etat"
    ).selectedIndex = 0;


    document.getElementById(
        "age"
    ).selectedIndex = 0;


    document.getElementById(
        "ville"
    ).selectedIndex = 0;


    document.getElementById(
        "prix-min"
    ).value = "";


    document.getElementById(
        "prix-max"
    ).value = "";


    document.getElementById(
        "searchInput"
    ).value = "";


    annoncesFiltrees =
        [...annonces];


    pageActuelle = 1;


    afficherPage();


    mettreAJourResultats(
        annoncesFiltrees.length
    );
}


// ======================================================
// PAGINATION
// ======================================================

function afficherPage() {

    const nombrePages =
        Math.ceil(
            annoncesFiltrees.length /
            annoncesParPage
        );


    if (nombrePages === 0) {

        pageActuelle = 1;

        afficherAnnonces([]);

        document.getElementById(
            "page-number"
        ).textContent =
            "Page 0 / 0";


        document.getElementById(
            "prev"
        ).disabled = true;


        document.getElementById(
            "next"
        ).disabled = true;


        return;
    }


    if (
        pageActuelle < 1
    ) {

        pageActuelle = 1;
    }


    if (
        pageActuelle > nombrePages
    ) {

        pageActuelle =
            nombrePages;
    }


    const debut =
        (pageActuelle - 1) *
        annoncesParPage;


    const fin =
        debut +
        annoncesParPage;


    const annoncesDeLaPage =
        annoncesFiltrees.slice(
            debut,
            fin
        );


    afficherAnnonces(
        annoncesDeLaPage
    );


    document.getElementById(
        "page-number"
    ).textContent =
        `Page ${pageActuelle} / ${nombrePages}`;


    document.getElementById(
        "prev"
    ).disabled =
        pageActuelle <= 1;


    document.getElementById(
        "next"
    ).disabled =
        pageActuelle >= nombrePages;
}


// ======================================================
// RECHERCHE DEPUIS URL
// ======================================================

function recupererRechercheURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const rechercheURL =
        params.get(
            "recherche"
        );


    if (
        rechercheURL !== null
    ) {

        const input =
            document.getElementById(
                "searchInput"
            );


        if (input) {

            input.value =
                rechercheURL;
        }


        return rechercheURL;
    }


    return "";
}


// ======================================================
// CATÉGORIE DEPUIS URL
// ======================================================

function recupererCategorieURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const categorieURL =
        params.get(
            "categorie"
        );


    if (
        categorieURL !== null
    ) {

        const categorie =
            document.getElementById(
                "categorie"
            );


        if (categorie) {

            categorie.value =
                categorieURL;
        }


        return categorieURL;
    }


    return "";
}


// ======================================================
// INITIALISATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        // ------------------------------------------
        // CHARGER LES FAVORIS (MySQL)
        // ------------------------------------------

        await chargerFavoris();


        // ------------------------------------------
        // RÉCUPÉRER LES ANNONCES MYSQL
        // ------------------------------------------

        annonces =
            await obtenirAnnonces();


        annoncesFiltrees =
            [...annonces];


        pageActuelle = 1;


        // ------------------------------------------
        // URL
        // ------------------------------------------

        const rechercheURL =
            recupererRechercheURL();


        const categorieURL =
            recupererCategorieURL();


        // ------------------------------------------
        // AFFICHAGE
        // ------------------------------------------

        if (
            rechercheURL !== "" ||
            categorieURL !== ""
        ) {

            filtrerAnnonces();

        } else {

            afficherPage();

            mettreAJourResultats(
                annoncesFiltrees.length
            );
        }


        // ------------------------------------------
        // FILTRE
        // ------------------------------------------

        const filterBtn =
            document.getElementById(
                "filterBtn"
            );


        if (filterBtn) {

            filterBtn.addEventListener(
                "click",
                filtrerAnnonces
            );
        }


        // ------------------------------------------
        // RECHERCHE
        // ------------------------------------------

        const searchBtn =
            document.getElementById(
                "search"
            );


        if (searchBtn) {

            searchBtn.addEventListener(
                "click",
                rechercherAnnonce
            );
        }


        // ------------------------------------------
        // ENTER
        // ------------------------------------------

        const searchInput =
            document.getElementById(
                "searchInput"
            );


        if (searchInput) {

            searchInput.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        rechercherAnnonce();
                    }
                }
            );
        }


        // ------------------------------------------
        // RESET
        // ------------------------------------------

        const resetBtn =
            document.getElementById(
                "resetBtn"
            );


        if (resetBtn) {

            resetBtn.addEventListener(
                "click",
                reinitialiserFiltres
            );
        }


        // ------------------------------------------
        // PRÉCÉDENT
        // ------------------------------------------

        const prev =
            document.getElementById(
                "prev"
            );


        if (prev) {

            prev.addEventListener(
                "click",
                function () {

                    if (
                        pageActuelle > 1
                    ) {

                        pageActuelle--;

                        afficherPage();
                    }
                }
            );
        }


        // ------------------------------------------
        // SUIVANT
        // ------------------------------------------

        const next =
            document.getElementById(
                "next"
            );


        if (next) {

            next.addEventListener(
                "click",
                function () {

                    const nombrePages =
                        Math.ceil(
                            annoncesFiltrees.length /
                            annoncesParPage
                        );


                    if (
                        pageActuelle < nombrePages
                    ) {

                        pageActuelle++;

                        afficherPage();
                    }
                });
        }

    });