// ======================================================
// TOYCYCLE - PAGE FAVORIS
// PHP + MYSQL
// ======================================================

const API_ANNONCES = "php/annonces.php";
const API_FAVORIS = "php/favoris.php";


// ======================================================
// AFFICHER LES FAVORIS
// ======================================================

async function afficherFavoris() {

    const container =
        document.getElementById("favorisContainer");

    if (!container) {
        return;
    }


    // ======================================================
    // RÉCUPÉRER LES ANNONCES + LES FAVORIS EN PARALLÈLE
    // ======================================================

    let resAnnonces;
    let resFavoris;

    try {

        [resAnnonces, resFavoris] = await Promise.all([
            fetch(API_ANNONCES).then(r => r.json()),
            fetch(API_FAVORIS).then(r => r.json())
        ]);

    } catch (erreur) {

        console.error(
            "Erreur lors de la récupération des favoris :",
            erreur
        );

        container.innerHTML = `
            <div class="col-12">
                <p class="text-center">
                    Une erreur est survenue lors du chargement
                    de vos favoris.
                </p>
            </div>
        `;

        return;
    }


    // ======================================================
    // GESTION UTILISATEUR NON CONNECTÉ
    // ======================================================

    if (!resFavoris.success) {

        container.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <i
                        class="fa-regular fa-heart"
                        style="font-size: 50px;">
                    </i>
                    <h4 class="mt-3">
                        Connectez-vous pour voir vos favoris
                    </h4>
                    <p>
                        Vous devez être connecté pour accéder
                        à vos jouets favoris.
                    </p>
                    <a
                        href="login.html"
                        class="voirBtn">
                        Se connecter
                    </a>
                </div>
            </div>
        `;

        return;
    }


    const annonces =
        resAnnonces.success
            ? resAnnonces.annonces
            : [];

    const favorisIds =
        resFavoris.favoris.map(Number);


    // ======================================================
    // FILTRER LES ANNONCES FAVORITES
    // ======================================================

    const annoncesFavorites =
        annonces.filter(function (annonce) {

            return favorisIds.includes(
                Number(annonce.id_annonce)
            );

        });


    // ======================================================
    // VIDER LE CONTENEUR
    // ======================================================

    container.innerHTML = "";


    // ======================================================
    // AUCUN FAVORI
    // ======================================================

    if (annoncesFavorites.length === 0) {

        container.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <i
                        class="fa-regular fa-heart"
                        style="font-size: 50px;">
                    </i>
                    <h4 class="mt-3">
                        Aucun favori
                    </h4>
                    <p>
                        Vous n'avez pas encore ajouté
                        de jouet à vos favoris.
                    </p>
                    <a href="annonces.html"
                        class="voirBtn">
                        Voir les annonces
                    </a>
                </div>
            </div>
        `;

        return;
    }


    // ======================================================
    // CRÉER LES CARTES
    // ======================================================

    annoncesFavorites.forEach(function (annonce) {

        const col = document.createElement("div");

        col.classList.add(
            "col-lg-3",
            "col-md-6",
            "col-12"
        );


        // ------------------------------------------------
        // IMAGE
        // ------------------------------------------------

        let image = "images/default.jpg";

        if (
            Array.isArray(annonce.images) &&
            annonce.images.length > 0 &&
            annonce.images[0].chemin
        ) {
            image = annonce.images[0].chemin;
        }


        // ------------------------------------------------
        // PRIX
        // ------------------------------------------------

        let prix = annonce.prix;

        if (
            prix === null ||
            prix === undefined
        ) {

            prix =
                annonce.mode === "Échange"
                    ? "Échange"
                    : "Gratuit";

        } else {

            prix = prix + " DH";
        }


        // ------------------------------------------------
        // HTML DE LA CARTE
        // ------------------------------------------------

        col.innerHTML = `

            <div class="favoriCard">

                <!-- BOUTON FAVORI -->

                <button
                    type="button"
                    class="removeFavorite"
                    data-id="${annonce.id_annonce}"
                    aria-label="Retirer des favoris">

                    <i class="fa-solid fa-heart"></i>

                </button>


                <!-- IMAGE -->

                <img
                    src="${image}"
                    alt="${annonce.titre || "Annonce"}"
                    class="favoriImage"
                    onerror="this.src='images/default.jpg'">


                <!-- CONTENU -->

                <div class="favoriBody">

                    <h5>
                        ${annonce.titre || ""}
                    </h5>

                    <p class="price">
                        ${prix}
                    </p>

                    <p class="city">
                        ${annonce.ville || ""}
                    </p>

                    <a
                        href="detail_annonces.html?id=${annonce.id_annonce}"
                        class="voirBtn">

                        Voir

                    </a>
                </div>

            </div>
        `;

        container.appendChild(col);
    });


    // ======================================================
    // AJOUTER LES ÉVÉNEMENTS
    // ======================================================

    ajouterEvenementsFavoris();
}


// ======================================================
// SUPPRIMER UN FAVORI
// ======================================================

async function supprimerFavori(id, carteElement) {

    // Désactiver le bouton le temps de la requête, pour éviter
    // les doubles clics pendant que la suppression est en cours.
    const bouton = carteElement
        ? carteElement.querySelector(".removeFavorite")
        : null;

    if (bouton) {
        bouton.disabled = true;
    }

    try {

        const response = await fetch(
            `${API_FAVORIS}?id_annonce=${id}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!data.success) {

            console.error(
                "Erreur lors de la suppression du favori :",
                data.message
            );

            if (bouton) {
                bouton.disabled = false;
            }

            return;
        }

    } catch (erreur) {

        console.error(
            "Erreur lors de la suppression du favori :",
            erreur
        );

        if (bouton) {
            bouton.disabled = false;
        }

        return;
    }


    // Retirer directement la carte de l'affichage (plus rapide
    // que de tout recharger), puis vérifier s'il reste des favoris.

    if (carteElement) {

        carteElement.remove();

        const container = document.getElementById("favorisContainer");

        if (container && container.children.length === 0) {
            afficherFavoris();
        }

    } else {

        afficherFavoris();
    }
}


// ======================================================
// ÉVÉNEMENTS DES CŒURS
// ======================================================

function ajouterEvenementsFavoris() {

    const boutons =
        document.querySelectorAll(".removeFavorite");


    boutons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const id =
                    Number(this.dataset.id);

                const carteElement =
                    this.closest(".col-lg-3, .col-md-6, .col-12");

                supprimerFavori(id, carteElement);

            }
        );

    });
}


// ======================================================
// INITIALISATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {
        afficherFavoris();
    }
);
